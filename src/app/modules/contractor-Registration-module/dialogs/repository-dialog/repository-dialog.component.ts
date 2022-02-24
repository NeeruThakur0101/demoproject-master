import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, OnInit, Injectable, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { FileState, SelectEvent, FileRestrictions, FileInfo } from '@progress/kendo-angular-upload';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { concat } from 'rxjs';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ApiService } from 'src/app/core/services/http-service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { CompositeFilterDescriptor, distinct, filterBy, process, State } from '@progress/kendo-data-query';
import { environment } from 'src/environments/environment';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';

import { SortDescriptor } from '@progress/kendo-data-query';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { deviceResModel } from '../../components/ownership-information/ownership.model';
import { CompanyService } from '../../components/company-information/company.service';
import { DocumentUploadService } from 'src/app/modules/existing-contractor-module/dialogs/document-upload/document-upload.service';
import { GridData } from '../../components/job-volume-information/model';
import { PageObj } from 'src/app/core/models/user.model';

@Component({
    selector: 'app-repository-dialog',
    templateUrl: './repository-dialog.component.html',
    styleUrls: ['./repository-dialog.component.scss'],
})
export class RepositoryDialogComponent implements OnInit, AfterViewInit {
    // mobile grid code
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: deviceResModel;

    public sort: SortDescriptor[] = [];
    public pageSize: number = 5;
    public skip: number = 0;
    public gridView: GridDataResult;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public gridData: GridData[] = [];
    public uploadSaveUrl: string; // should represent an actual API endpoint
    public uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
    public selectedFiles: any = [];
    public fileRestriction: FileRestrictions = {
        allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png', '.bmp'],
        maxFileSize: 5242880,
    };
    public allowUnsort: boolean = true;
    public multiple = false;
    public displayUploadData: any;
    public loader: boolean = false;
    public info: boolean = true;
    public type: 'numeric' | 'input' = 'numeric';
    public previousNext: boolean = true;
    public opened: boolean = true;
    public count: number = 0;
    public resourceId: number;
    public CCOpsID: number;
    public countsFolder: Array<{ RepositoryName: string; Count: number }> = [];
    public imageArray = [];
    public repoName: string;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public isContractor: boolean;
    public listItems: Array<{ ContractorDocumentTypeTitle: string; ContractorDocumentTypeID: string; ContractorDocumentTypeTitleTranslated: string }>;
    public defaultItem: { ContractorDocumentTypeTitle: string; ContractorDocumentTypeID: string; ContractorDocumentTypeTitleTranslated: string };
    public pageContent: any;
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid = filterBy(this.gridData, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.gridData, filter);
    }
    public distinctPrimitive(fieldName: string): any {
        return distinct(this.gridData, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        private apiService: ApiService,
        private _changeDetector: ChangeDetectorRef,
        public _srvDocumentUpload: DocumentUploadService,
        private dialogService: DialogService,
        public dialog: DialogRef,
        public _srvComp: CompanyService,
        public contSer: ContractorRegistrationService,
        private deviceService: DeviceDetectorService,
        private universal: UniversalService,
        public $language: InternalUserDetailsService,
        private $auth: AuthenticationService
    ) {
        this.loginDetails = Array(this.$auth.Profile);
        this.isContractor = false; // dynamic value recive from session
        this.resourceId = this.loginDetails[0].ResourceID;
        this.CCOpsID = this.loginDetails[0].CCOpsID;

        this.loader = true;
        const currentLangId = this.$auth.currentLanguageID;
        // bind dropdown list data and bind counts of files
        this._srvComp.GetDocumentType(this.loginDetails[0].ResourceID, currentLangId).then((res) => {
            this.listItems = res;
            this.defaultItem = this.listItems[0];
            this.repoName = this.defaultItem.ContractorDocumentTypeTitle;
            this.getDocumentList(this.repoName);
            this.loader = false;
            const ResourceID = this.$auth.LoggedInUserType === 'Internal' ? this.$auth.ProfileInternal.ResourceID : this.$auth.Profile.ResourceID;
            this.uploadSaveUrl = environment.api_url + 'UploadDocument/InsertFile/' + this.repoName + '/' + ResourceID + '/' + this.CCOpsID + '/' + this.loginDetails[0].ContrID;
        });

        this.pageContent = this.$language.getPageContentByLanguage();
    }
    ngOnInit() {
        this.deviceResObj = this.universal.deviceResolution();
        this.deviceInfo = this.deviceService.getDeviceInfo();
        this.isMobile = this.deviceService.isMobile();
        this.isTab = this.deviceService.isTablet();
        this.isDesktop = this.deviceService.isDesktop();
        if (this.isMobile === true) {
            this.pageSize = 1;
            this.pageObj.buttonCount = 1;
        } else if (this.isTab === true) {
            if (window.screen.orientation.type === 'portrait-primary') {
                this.pageSize = 2;
                this.pageObj.buttonCount = 2;
            } else {
                this.pageSize = 5;
                this.pageObj.buttonCount = 5;
            }
        } else if (this.isDesktop === true) {
            this.pageSize = 10;
            this.pageObj.buttonCount = 10;
        }

        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;
        this._changeDetector.detectChanges();
    }

    ngAfterViewInit() {
        // layout data
        this.universal.gridLayout.subscribe((layout: any) => {
            this.deviceInfo = this.deviceService.getDeviceInfo();
            if (Object.keys(layout).length > 0) {
                this.pageSize = layout.pageSize;
                this.pageObj = layout.pageObj;
                this.skip = 0;
                if (this.isTab === true) {
                    if (window.screen.orientation.type === 'portrait-primary') {
                        this.pageSize = 2;
                        this.pageObj.buttonCount = 2;
                    } else {
                        this.pageSize = 5;
                        this.pageObj.buttonCount = 5;
                    }
                }
            }
            this._changeDetector.detectChanges();
        });

        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }

    // Api Call For counts of each folder
    async getDocumentList(folderName) {
        const translatedFolder = this.listItems.find((el) => el.ContractorDocumentTypeTitle === folderName);
        this.valueChange('', folderName);
        this.repoName = folderName;
        // this.defaultItem = this.listItems.find(el => el.ContractorDocumentTypeTitle === folderName);
        this.defaultItem = this.listItems.find((el) => el.ContractorDocumentTypeTitleTranslated === translatedFolder.ContractorDocumentTypeTitleTranslated);
        // this.state.skip = 0;

        const countReponse = await this._srvDocumentUpload.getCount(this.loginDetails[0]);
        this.countsFolder = countReponse;
        // code to merge counts and folder name in a single list
        this.listItems.forEach((element) => {
            const index = this.countsFolder.findIndex((x) => x.RepositoryName === element.ContractorDocumentTypeTitle);
            element['Count'] = this.countsFolder[index].Count;
            element['Checked'] = element.ContractorDocumentTypeTitle.toLocaleLowerCase() === folderName.toLocaleLowerCase() ? true : false;
        });
        // api to get the list of files and bind in grid
        const ResourceID = this.$auth.LoggedInUserType === 'Internal' ? this.$auth.ProfileInternal.ResourceID : this.$auth.Profile.ResourceID;
        const listReponse = await this._srvDocumentUpload.getFilesList(this.loginDetails[0], translatedFolder.ContractorDocumentTypeTitle);
        this.displayUploadData = listReponse;
        this.displayUploadData.forEach((element) => {
            element['folderName'] = folderName;
        });
        this.gridData = this.displayUploadData;
    }

    onClose() {
        this.dialog.close();
    }

    public open() {
        this.opened = true;
    }

    public onPageChange(state: any): void {
        this.pageSize = state.take;
        this._changeDetector.detectChanges();
    }

    // value change function for upload file img,docx,pdf.. etc
    valueChange(event, folderName?) {
        if (folderName !== undefined) {
            const translatedFolder = this.listItems.find((x) => x.ContractorDocumentTypeTitle === folderName);
            this.repoName = translatedFolder.ContractorDocumentTypeTitle;
        } else {
            this.repoName = event.ContractorDocumentTypeTitle;
        }
        const ResourceID = this.$auth.LoggedInUserType === 'Internal' ? this.$auth.ProfileInternal.ResourceID : this.$auth.Profile.ResourceID;
        this.uploadSaveUrl = environment.api_url + 'UploadDocument/InsertFile/' + this.repoName + '/' + ResourceID + '/' + this.CCOpsID + '/' + this.loginDetails[0].ContrID;
    }

    // on click cancel
    onClickCancel() {
        this.dialog.close();
    }

    // on click save
    onClickSave() {}

    downloadFileInFrm(blob, fileName) {
        // const url = window.URL.createObjectURL(blob);

        // const a = document.createElement('a');
        // a.href = url;
        // a.download = fileName;
        // a.click();

        if (window.navigator && window.navigator.msSaveBlob) {
            const data = window.navigator.msSaveBlob(blob, fileName);
        } else {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            a.click();
        }
    }

    // download method
    downloadFile(fileName, folder) {
        let param = new HttpParams();
        param = param.append('fileName', fileName);
        param = param.append('repoName', this.repoName);
        param = param.append('CCOpsId', this.loginDetails[0].CCOpsID.toString());
        param = param.append('contrId', this.loginDetails[0].ContrID.toString());
        param = param.append('resourceID', this.loginDetails[0].ResourceID.toString());

        this.apiService.downloadFile(`UploadDocument/DownloadFile`, param).subscribe((blob) => {
            this.downloadFileInFrm(blob, fileName);
        });
    }

    // selected and read  file
    selectEventHandler(e: SelectEvent) {
        let extensions;
        let restrictionFlag: boolean = false;

        e.files.forEach((file: FileInfo) => {
            if (file.rawFile) {
                extensions = this.fileRestriction.allowedExtensions;

                if (extensions.includes(file.extension.toLowerCase())) {
                    this.readImage(file);
                } else {
                    restrictionFlag = true;
                }
            }
        });

        if (restrictionFlag) {
            const dialogRef = this.dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Company_Info.File_Validation}</p>
            </div>
        `;
        }
    }

    readImage(input) {
        const parentThis = this;
        if (input.rawFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let previewImg;
                if ((this.result as string).split(';')[0] === 'data:application/pdf') {
                    previewImg = 'assets/images/ico-pdf.svg';
                } else if ((this.result as string).split(';')[0] === 'data:text/plain') {
                    previewImg = 'assets/images/ico-txt.svg';
                } else if (
                    (this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    (this.result as string).split(';')[0] === 'data:application/vnd.ms-excel'
                ) {
                    previewImg = 'assets/images/ico-excel.svg';
                } else if (
                    (this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    (this.result as string).split(';')[0] === 'data:application/msword'
                ) {
                    previewImg = 'assets/images/ico-doc.svg';
                } else {
                    previewImg = this.result;
                }
                parentThis.selectedFiles.push({
                    preview: previewImg, // this.result,
                    name: input.name,
                    size: input.size,
                    uid: input.uid,
                });
            };
            reader.readAsDataURL(input.rawFile);
            this.count++;
        }
    }

    public showButton(state: FileState): boolean {
        return state === FileState.Uploaded ? true : false;
    }

    // remove funtionality
    public remove(upload, uid: string) {
        upload.removeFilesByUid(uid);
        this.count--;
    }

    public completeEventHandler() {
        this.getDocumentList(this.repoName);
    }

    removeEventHandler(e) {
        this.selectedFiles = this.selectedFiles.filter((img) => img.uid !== e.files[0].uid);
    }

    clearEventHandler(e) {
        this.selectedFiles = [];
    }

    // ProgressBar Method
    uploadProgressEvent(e) {
        const index = this.selectedFiles.findIndex((element) => element.uid === e.files[0].uid);
        this.selectedFiles[index]['uploadProgress'] = e.percentComplete;
        if (e.percentComplete === 100) {
            this.imageArray.push(this.selectedFiles[index]);
        }
    }
}
@Injectable()
export class UploadInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url === 'saveUrl') {
            const events: Observable<HttpEvent<any>>[] = [0, 10, 30, 60, 100].map((x) =>
                of({
                    type: HttpEventType.UploadProgress,
                    loaded: x,
                    total: 100,
                } as HttpProgressEvent).pipe(delay(1000))
            );
            const success = of(new HttpResponse({ status: 200 })).pipe(delay(1000));
            events.push(success);
            return concat(...events);
        }
        if (req.url === 'removeUrl') {
            return of(new HttpResponse({ status: 200 }));
        }
        return next.handle(req);
    }
}
