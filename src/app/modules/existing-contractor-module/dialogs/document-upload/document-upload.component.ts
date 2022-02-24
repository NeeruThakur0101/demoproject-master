import { Component, OnInit, Injectable, Input, AfterViewInit } from '@angular/core';
import { FileState, SelectEvent, FileRestrictions, FileInfo } from '@progress/kendo-angular-upload';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { concat } from 'rxjs';
import { ApiService } from 'src/app/core/services/http-service';
import { State, distinct, CompositeFilterDescriptor, filterBy, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DocumentUploadService } from './document-upload.service';
import { ListFiles } from './model-document-upload';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';

@Component({
    selector: 'app-document-upload',
    templateUrl: './document-upload.component.html',
    styleUrls: ['./document-upload.component.scss'],
})
export class DocumentUploadComponent implements OnInit, AfterViewInit {
    @Input() public pageOrigin: string = 'surgeResponse';
    uploadSaveUrl: string; // should represent an actual API endpoint
    uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint
    selectedFiles: any = [];
    public displayUploadData: ListFiles[] = [];

    public loader: boolean = false;

    public type: 'numeric' | 'input' = 'numeric';

    public previousNext: boolean = true;

    public opened: boolean = true;
    public count: number = 0;
    public resourceId: number;
    public CCOpsID: number;
    public countsFolder: Array<{ RepositoryName: string; Count: number }> = [];
    public imageArray = [];
    public repoName: string;
    public loginDetails: Array<SessionUser> = []; //  Array<LoginUser> = [];
    public isContractor: boolean;
    public gridData: ListFiles[] = [];
    public pageContent: any;

    public pageSizes = true;
    // grid code
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    public quickAction: boolean = false;
    public sort: SortDescriptor[];
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: any;
    public editRecertDatePvlg: boolean = false;

    public step: string = '';
    public pageHeight: number = 300;
    public pageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public listItems: Array<{
        ContractorDocumentTypeTitle: string;
        ContractorDocumentTypeID: number;
    }>;
    public defaultItem: {
        ContractorDocumentTypeTitle: string;
        ContractorDocumentTypeID: number;
    };

    public state: State = {
        skip: 0,
        take: 5,
    };
    myRestrictions: FileRestrictions = {
        allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png', '.bmp'],
        maxFileSize: 5242880,
    };
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid: ListFiles[] = filterBy(this.gridData, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.gridData, filter);
    }
    public distinctPrimitive(fieldName: string) {
        return distinct(this.gridData, fieldName).map((item) => item[fieldName]);
    }

    constructor(private _srvApi: ApiService, public _dialog: DialogRef, private _srvAuth: AuthenticationService,
        private _srvDevice: DeviceDetectorService,
        private _srvDialog: DialogService,
        private _srvUniversal: UniversalService,
        public _srvLanguage: InternalUserDetailsService,
        public _srvDocumentUpload: DocumentUploadService,
        private _srvAuthentication: AuthenticationService) {
        this.loginDetails = Array(this._srvAuthentication.Profile);

        this.isContractor = false; // dynamic value recive from session
        this.resourceId = this.loginDetails[0].ResourceID;
        this.CCOpsID = this.loginDetails[0].CCOpsID;

        this.loader = true;

        this.pageContent = this._srvLanguage.getPageContentByLanguage();;
    }


    public resetGrid() {
        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this._srvDevice.getDeviceInfo();
        this.isMobile = this._srvDevice.isMobile();
        this.isTab = this._srvDevice.isTablet();
        this.isDesktop = this._srvDevice.isDesktop();
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
        }
        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;
    }
    async ngOnInit() {
        const dataReponse = await this._srvDocumentUpload.getDocumentType(this.loginDetails[0]);

        if (this.pageOrigin === 'surgeResponse') {
            this.listItems = dataReponse.filter((val) => {
                return val.ContractorDocumentTypeID === 1;
            });
        } else if (this.pageOrigin === 'manageSurgeResponse') {
            this.listItems = dataReponse.filter((val) => {
                return val.ContractorDocumentTypeID === 3;
            });
        } else {
            this.listItems = dataReponse;
        }
        this.defaultItem = this.listItems[0];
        this.repoName = this.defaultItem.ContractorDocumentTypeTitle;
        this.getDocumentList(this.repoName);
        this.loader = false;
        this.uploadSaveUrl = environment.api_url + 'UploadDocument/InsertFile/' + this.repoName + '/' + this.resourceId + '/' + this.CCOpsID + '/' + this.loginDetails[0].ContrID;

        setTimeout(() => {
            this.resetGrid();
        }, 100);

    }

    ngAfterViewInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }

    public async getDocumentList(folderName) {
        const countReponse = await this._srvDocumentUpload.getCount(this.loginDetails[0])
        this.countsFolder = countReponse;
        this.listItems.forEach((element) => {
            const index = this.countsFolder.findIndex((x) => x.RepositoryName === element.ContractorDocumentTypeTitle);
            element['Count'] = this.countsFolder[index].Count;
            element['Checked'] = element.ContractorDocumentTypeTitle.toLocaleLowerCase() === folderName.toLocaleLowerCase() ? true : false;
        });

        const listReponse = await this._srvDocumentUpload.getFilesList(this.loginDetails[0], folderName);
        this.displayUploadData = listReponse;
        this.state = { skip: 0, take: 5 };
        this.displayUploadData.forEach((element) => {
            element['folderName'] = folderName;
        });
        this.gridData = this.displayUploadData;
    }

    onClose(status) {
        this._dialog.close({ stat: status });
    }

    public open() {
        this.opened = true;
    }

    valueChange(event) {
        this.repoName = event.ContractorDocumentTypeTitle;
        this.uploadSaveUrl = environment.api_url + 'UploadDocument/InsertFile/' + this.repoName + '/' + this.resourceId + '/' + this.CCOpsID + '/' + this.loginDetails[0].ContrID;
    }

    onClickCancel(status) {
        this._dialog.close({ stat: status });
    }

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

    public async downloadFile(fileName, folder) {
        let param = new HttpParams();
        param = param.append('fileName', fileName);
        param = param.append('repoName', this.repoName);
        param = param.append('CCOpsId', this.loginDetails[0].CCOpsID.toString());
        param = param.append('contrId', this.loginDetails[0].ContrID.toString());
        param = param.append('resourceID', this.loginDetails[0].ResourceID.toString());

        this._srvApi.downloadFile(`UploadDocument/DownloadFile`, param).subscribe((blob) => {
            this.downloadFileInFrm(blob, fileName);
        });
    }

    selectEventHandler(e: SelectEvent) {
        let extensions;
        let restrictionFlag: boolean = false;

        e.files.forEach((file: FileInfo) => {
            if (file.rawFile) {
                extensions = this.myRestrictions.allowedExtensions;

                if (extensions.includes(file.extension.toLowerCase())) {
                    this.readImage(file);
                } else {
                    restrictionFlag = true;
                }
            }
        });

        if (restrictionFlag) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500
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
                }
                else if ((this.result as string).split(';')[0] === 'data:text/plain') {
                    previewImg = 'assets/images/ico-txt.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    (this.result as string).split(';')[0] === 'data:application/vnd.ms-excel') {
                    previewImg = 'assets/images/ico-excel.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    (this.result as string).split(';')[0] === 'data:application/msword') {
                    previewImg = 'assets/images/ico-doc.svg';
                }
                else {
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
