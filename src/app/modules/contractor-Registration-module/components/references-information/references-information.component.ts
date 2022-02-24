import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, CompositeFilterDescriptor, filterBy, distinct } from '@progress/kendo-data-query';
import { AddReferenceDialogComponent } from '../../dialogs/add-reference-dialog/add-reference-dialog.component';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { Router } from '@angular/router';
import { SelectApplicationModel } from '../../models/data-model';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Subscription } from 'rxjs';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ApplicationAndProgramTypes, ReferenceAndJobType, ReferenceData, ReferenceInformation, ReferenceTypeData, VisualCueReferenceObj } from './model_reference';
import { CorrectionRequestComments, DeviceObj, LoginUser, PageObj } from 'src/app/core/models/user.model';
import { ReferenceDataService } from './reference.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';

@Component({
    selector: 'app-references-information',
    templateUrl: './references-information.component.html',
    styleUrls: ['./references-information.component.scss'],
})
export class ReferencesInformationComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    // mobile grid code
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceObj;
    public sort: SortDescriptor[] = [];
    public pageSize: number = 5;
    public skip: number = 0;
    public referenceProducts: ReferenceInformation[] = [];
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public referenceInformationObj: ReferenceInformation;
    public pageSizes: boolean = true;
    public multiple: boolean = false;
    public allowUnsort: boolean = true;
    public previousNext: boolean = true;
    private currentMessage: Subscription;
    public selectedItem: VisualCueReferenceObj;
    public gridView: GridDataResult;
    public pageContent: any;

    public CompleteApplication: ApplicationAndProgramTypes[] = [];
    public forwardedData: ReferenceData;
    public objProgram = new SelectApplicationModel();
    public resourceId: number;
    public referenceData: ReferenceInformation[] = [];
    public referenceTypeData: ReferenceTypeData[] = [];
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    private isFinalSaveButton: boolean = false;
    private servUnsubscribe: Subscription;
    public approvalData: ReferenceInformation[] = [];
    public approvalJsonReference: ReferenceInformation[] = [];
    public loggedInUserType: string;
    public ContrID: number;
    public selectedTradeIds: string;
    public dataForApprovalContractor: ReferenceInformation[] = [];
    private directToFinancial: boolean = false;
    public saveNext: string;
    public filter: CompositeFilterDescriptor = null;
    public showPage: boolean = false;
    public accessReadonly: boolean = false;
    public referenceProductsGrid: ReferenceInformation[] = filterBy(this.referenceProducts, this.filter);
    public crComments: CorrectionRequestComments[];
    public dropdownData: ReferenceAndJobType;

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.referenceProductsGrid = filterBy(this.referenceProducts, filter);
    }
    public distinctPrimitive(fieldName: string) {
        return distinct(this.referenceProducts, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private _srvContrRegistration: ContractorRegistrationService,
        private _router: Router,
        public _srvAuthentication: AuthenticationService,
        private _srvDialog: DialogService,
        private _srvDeviceDetector: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        public _srvReferenceData: ReferenceDataService,
        private _srvStorage: StorageService,
        private renderer: Renderer2
    ) {
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.ContrID = this.loginDetails[0].ContrID;
        }
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    async ngOnInit() {
        this.crComments = await this._srvContractorData.getPageComments('References');

        // mobile device compatible
        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
        this.isMobile = this._srvDeviceDetector.isMobile();
        this.isTab = this._srvDeviceDetector.isTablet();
        this.isDesktop = this._srvDeviceDetector.isDesktop();

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

        if (this.loggedInUserType === 'Internal') {
            this.saveNext = this.pageContent.Reference_Info.Next;
        } else {
            this.saveNext = this.pageContent.Reference_Info.Ref_Save_Next;
        }

        this.serviceAddNext();
        this.getReferenceJson();
        // this.checkPrivilage();
    }
    public checkPrivilage(): void {
        if (this.ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Reference Information');

            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.accessReadonly = true;
                } else {
                    this.showPage = true;
                    const dialogRef = this._srvDialog.open({
                        appendTo: this.containerRef,
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `<div class="modal-alert info-alert">
              <h2>${this.pageContent.Reference_Info.Ref_Access}</h2>
              <p>${this.pageContent.Reference_Info.Ref_Permission}</p>
             </div>`;
                    dialogRef.result.subscribe((val) => {
                        // to show selected jump to value
                        // end
                        this._router.navigate(['contractorRegistration/company-information']);
                    });
                }
            }
        }
    }

    public ngAfterViewInit() {
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: any) => {
            this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
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
        });
    }

    // service call to add data in grid array
    public serviceAddNext() {
        this.servUnsubscribe = this._srvContrRegistration.sourceFromReferenceDialog.subscribe((result: ReferenceInformation) => {
            if (Object.keys(result).length > 0) {
                result['SrNo'] = this.referenceProducts.length + 1;
                result.ReferenceComment = result.ReferenceComment === '' ? null : result.ReferenceComment;

                if (result.ReferenceCommentNumber === null) {
                    result.ReferenceCommentNumber = result.ReferenceCommentNumber;
                } else {
                    result.ReferenceCommentNumber = result.ReferenceCommentNumber.toString() === '' ? null : result.ReferenceCommentNumber;
                }

                this.referenceInformationObj = result;
                this.saveJsonData();
            }
        });
    }

    // Get Method for Reference JSON
    public async getReferenceJson() {
        this._srvContrRegistration.dataFromSaveNext.next({});

        const dbDataResponse = await this._srvReferenceData.getDbData(this.loginDetails[0]);

        if (this.ContrID > 0) {
            this.forwardedData = dbDataResponse;
            if (this.forwardedData.hasOwnProperty('ReferenceInformation')) {
                this.forwardedData.ReferenceInformation.map((element, index) => {
                    return (element.SrNo = index + 1);
                });
                this.referenceProducts = this.forwardedData.ReferenceInformation;
                this.completeApplicationSelectedTrade(this.forwardedData);
                this.getParticularPageData();
            }

            if (this.forwardedData.hasOwnProperty('CompleteApplication')) {
                this.directToFinancial = this.forwardedData.CompleteApplication !== null && this.forwardedData.CompleteApplication.FinancialDeferralGuidelines !== null ? true : false;
            }
        } else {
            this.forwardedData = dbDataResponse;
            // if loggedin user in internal employee and wants to see the data of prospective contractor
            this._srvContrRegistration.funcInternalUserGoDirectlyToContractorPage(this.forwardedData.ReferenceInformation, 'ReferenceInformation');
            if (this.forwardedData.ReferenceInformation === null && this.loggedInUserType === 'Internal') return;

            const completeAppReponse: ReferenceData = await this._srvReferenceData.getCompleteApplication(this.loginDetails[0]);
            this.forwardedData.CompleteApplication = completeAppReponse.CompleteApplication;

            const financialReponse: ReferenceData = await this._srvReferenceData.getFinancialInfo(this.loginDetails[0]);
            this.forwardedData.FinancialInformation = financialReponse.FinancialInformation;

            this.completeApplicationSelectedTrade(this.forwardedData);

            if (this.forwardedData.hasOwnProperty('ReferenceInformation') && this.forwardedData.ReferenceInformation !== null) {
                this.forwardedData.ReferenceInformation.map((element, index) => {
                    return (element.SrNo = index + 1);
                });
                this.referenceProducts = this.forwardedData.ReferenceInformation;
                // this block of code is used for validation on reference page
                // which depends on the selected trades of complete applicatipn page
                this.loadProducts();
            }
        }
    }

    private updateLanguageforGridData() {
        this.referenceProducts.forEach((ele) => {
            const updateReferenceLangName = this.dropdownData.referenceTypeData.find((obj) => obj.ReferenceTypeCode.toString() === ele.ReferenceTypeCode.toString());
            // const updatFacilityLangeName = this.dropdownData.jobTypeData.find(obj => obj. === ele.ContractorFacilityTypeName)

            if (updateReferenceLangName !== undefined) {
                ele.ReferenceTypeNumber = updateReferenceLangName.ReferenceTypeNameTranslated;
                // ele.ContractorFacilityTypeName = updatFacilityLangeName.ContractorFacilityTypeTitleTranslated;
                // ele.SpaceHoldTypeName = updatSpaceHoldTypeLangeName.SpaceHoldTypeTitle;
                // ele.OfficeOwnedIndicatorName = updatSpaceUseTypeLangeName.SpaceUseTypeTitle;
            }
        });
    }

    private updateLanaguageforSaveaAndNext() {
        this.referenceProducts.forEach((ele) => {
            const updateLocationLangName = this.dropdownData.referenceTypeData.find((obj) => obj.ReferenceTypeCode.toString() === ele.ReferenceTypeCode.toString());
            if (updateLocationLangName !== undefined) ele.ReferenceTypeNumber = updateLocationLangName.ReferenceTypeName;
        });
    }

    // this function is used to find the selected trades from complete application page
    public completeApplicationSelectedTrade(data) {
        if (data.hasOwnProperty('CompleteApplication')) {
            const selectedAppId: ApplicationAndProgramTypes[] = [];
            data.CompleteApplication.ApplicationAndProgramTypes.forEach((element) => {
                if (element.TradeRemovedDate === 'null' || element.TradeRemovedDate === null) {
                    const ind = selectedAppId.findIndex((x) => x === element.ContractorApplicationTypeNumber);
                    if (ind === -1) {
                        selectedAppId.push(element.ContractorApplicationTypeNumber);
                    }
                    this.selectedTradeIds = selectedAppId.toString();
                }
            });
            if (this.ContrID === 0) {
                this.manageCounters();
            }
        }
    }

    public async manageCounters() {
        const refTypeDataReponse = await this._srvReferenceData.getReferenceTypeData(this.loginDetails[0], this.selectedTradeIds);
        this.dropdownData = refTypeDataReponse;
        this.referenceTypeData = refTypeDataReponse.referenceTypeData;
        // counters will be managed at front end untill contractor is a perspective user
        // because data is not saved into db otherwise counters comes from the db
        this.referenceTypeData.forEach((element) => {
            let array: VisualCueReferenceObj[] = [];
            array = this.referenceProducts.filter((x) => x.ReferenceTypeCode.toString() === element.ReferenceTypeCode.toString());
            element.ReferenceCount = this.referenceProducts.filter((x) => x.ReferenceTypeCode.toString() === element.ReferenceTypeCode.toString()).length;
            if (array.length > 0) {
                array.forEach((pro) => {
                    if (
                        pro.isReferenceName === true ||
                        pro.isReferenceTypeNumber === true ||
                        pro.isReferenceCompanyName === true ||
                        pro.isReferencePosition ||
                        pro.isReferencePhoneNumber === true ||
                        pro.isReferenceEmail === true ||
                        pro.isJobType === true ||
                        pro.isAdditionalContactName === true ||
                        pro.isReferenceComment === true
                    ) {
                        element['isVisual'] = true;
                    }
                });
            }
        });

        let val: boolean;
        this.referenceTypeData.forEach((element) => {
            if (element.ReferenceCount < 3) {
                val = true;
            }
        });

        const booleanCounter = val === true ? 'true' : 'false';
        this._srvStorage.setStorage(booleanCounter, 'manageRefCounter');

        this.updateLanguageforGridData();
    }

    /// Current Page Data
    public async getParticularPageData() {
        const jsonResonse = await this._srvReferenceData.getEventPageJSON(this.loginDetails[0]);
        // added null check
        this.approvalData = Object.keys(jsonResonse).length && jsonResonse[0].CCOpsData !== null ? JSON.parse(jsonResonse[0].CCOpsData).ContractorData.ReferenceInformation : [];
        this.approvalJsonReference = JSON.parse(JSON.stringify(this.approvalData));
        this.loadProducts();
    }

    // bind the Reference data grid
    private loadProducts() {
        const dataArry: ReferenceInformation[] = [];
        this.referenceProducts.forEach((element) => {
            const obj: VisualCueReferenceObj = {
                ReferenceNumber: element.ReferenceNumber,
                SrNo: element.SrNo,
                ContractorReferenceTypeNumber: element.ContractorReferenceTypeNumber,
                ReferenceName: element.ReferenceName,
                ReferenceTypeNumber: element.ReferenceTypeNumber,
                ReferenceCompanyName: element.ReferenceCompanyName,
                ReferencePosition: element.ReferencePosition,
                ReferencePhoneNumber: element.ReferencePhoneNumber,
                ReferenceEmail: element.ReferenceEmail,
                JobType: element.JobType,
                JobTypeNumber: element.JobTypeNumber,
                AdditionalContactName: element.AdditionalContactName,
                ReferenceCommentNumber: element.ReferenceCommentNumber,
                ReferenceComment: element.ReferenceComment,
                ReferenceTypeCode: element.ReferenceTypeCode,
                // increase these parameters to show the visual cues on the columns

                isReferenceName: false,
                isReferenceTypeNumber: false,
                isReferenceCompanyName: false,
                isReferencePosition: false,
                isReferencePhoneNumber: false,
                isReferenceEmail: false,
                isJobType: false,
                isAdditionalContactName: false,
                isReferenceComment: false,
            };
            dataArry.push(obj);
        });
        this.referenceProducts = dataArry;
        // call function to show visual cues
        this.matchDataToshowVisualCue();
        this.gridView = {
            data: this.referenceProducts.slice(this.skip, this.skip + this.pageSize),
            total: this.referenceProducts.length,
        };

        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }

    // if data is not same means data is not approved yet
    public matchDataToshowVisualCue() {
        if (this.approvalData !== undefined) {
            this.approvalData.forEach((element) => {
                // tslint:disable-next-line:forin
                for (const key in element) {
                    const ind = this.referenceProducts.findIndex((x) => x.SrNo === element.SrNo);
                    if (ind !== -1) {
                        const objGrid = this.referenceProducts[ind];
                        if (key !== 'SrNo' && objGrid.hasOwnProperty(key)) {
                            objGrid[key] = element[key];
                            objGrid['is' + key] = true;
                        }
                    } else {
                        // this code is used when we send complete row for approval
                        const obj: VisualCueReferenceObj = {
                            ReferenceNumber: null,
                            SrNo: this.referenceProducts.length + 1,
                            ReferenceName: element.ReferenceName,
                            ContractorReferenceTypeNumber: element.ContractorReferenceTypeNumber,
                            ReferenceTypeNumber: element.ReferenceTypeNumber,
                            ReferenceCompanyName: element.ReferenceCompanyName,
                            ReferencePosition: element.ReferencePosition,
                            ReferencePhoneNumber: element.ReferencePhoneNumber,
                            ReferenceEmail: element.ReferenceEmail,
                            JobType: element.JobType,
                            JobTypeNumber: element.JobTypeNumber,
                            AdditionalContactName: element.AdditionalContactName,
                            ReferenceCommentNumber: element.ReferenceCommentNumber,
                            ReferenceComment: element.ReferenceComment,
                            ReferenceTypeCode: element.ReferenceTypeCode,
                            // increase these parameters to show the visual cues on the columns
                            isReferenceName: true,
                            isReferenceTypeNumber: true,
                            isReferenceCompanyName: true,
                            isReferencePosition: true,
                            isReferencePhoneNumber: true,
                            isReferenceEmail: true,
                            isJobType: true,
                            isAdditionalContactName: true,
                            isReferenceComment: true,
                        };
                        this.referenceProducts.push(obj);
                    }
                }
            });
        }

        this.showNAonJobType();

        this.manageCounters();
    }


    private showNAonJobType() {
        this.referenceProducts.forEach(ele => {
            ele.JobType = ele.JobType === null || ele.JobType === '' ? 'N/A' : ele.JobType
        })
    }

    // Pagination
    public f({ skip, take }: PageChangeEvent): void {
        if (this.ContrID === 0) {
            this.skip = skip;
            this.pageSize = take;
            this.loadProducts();
        } else if (this.ContrID > 0) {
            this.skip = skip;
            this.pageSize = take;
            this.loadProducts();
        }
    }

    // used to open dialog of add reference dialog and get form data
    public openAddReferenceDialog(option, curData?) {
        const dialogRef = this._srvDialog.open({
            content: AddReferenceDialogComponent,
            width: 500,
        });

        const refInfo = dialogRef.content.instance;
        refInfo.selectedTradeIds = this.selectedTradeIds;
        if (option === 'ADD') {
            refInfo.maxCount = this.referenceProducts.length;
            refInfo.disableSaveNext = false;
            dialogRef.result.subscribe((r) => {
                const data = r['status'];
                this.isFinalSaveButton = false;
                this.referenceResult(data, '');
            });
        } else if (option === 'EDIT') {
            // this object sends Transalated key name to dialog component
            const obj: any = this.referenceTypeData.find((ele) => ele.ReferenceTypeCode.toString() === curData.ReferenceTypeCode.toString());
            this.selectedItem = curData;
            this.selectedItem = { ...this.selectedItem, ReferenceJobType: obj.ReferenceTypeName };
            this.selectedItem.JobType = this.selectedItem.JobType === 'N/A' ? null : this.selectedItem.JobType;
            const refInfoEdit = dialogRef.content.instance;
            refInfoEdit.disableSaveNext = true;
            refInfoEdit.incomingData = this.selectedItem;

            const indx = this.approvalData.findIndex((x) => x.SrNo === this.selectedItem.SrNo);
            refInfoEdit.IsRowDisable = indx > -1 ? this.approvalData[indx]['IsRowDisable'] : false;

            dialogRef.result.subscribe((r) => {
                const data = r['status'];
                this.isFinalSaveButton = false;
                this.referenceResult(data, 'edit');
            });
        }
    }

    // add edit data result used in function openadd-referencedialog()
    public async referenceResult(data, option) {
        if (data !== 'cancel') {
            const formdata = data;
            const obj = {
                ReferenceNumber: option === 'edit' ? formdata.ReferenceNumber : null,
                SrNo: option === 'edit' ? formdata.SrNo : this.referenceProducts.length + 1,
                ReferenceTypeNumber: formdata.ReferenceTypeNumber,
                ContractorReferenceTypeNumber: formdata.ContractorReferenceTypeNumber,
                ReferenceName: formdata.ReferenceName,
                ReferenceEmail: formdata.ReferenceEmail,
                ReferencePhoneNumber: formdata.ReferencePhoneNumber,
                ReferenceCompanyName: formdata.ReferenceCompanyName,
                ReferencePosition: formdata.ReferencePosition,
                JobType: formdata.JobType,
                JobTypeNumber: formdata.JobTypeNumber,
                ReferenceComment: formdata.ReferenceComment === '' ? null : formdata.ReferenceComment,
                AdditionalContactName: formdata.AdditionalContactName === '' ? null : formdata.AdditionalContactName,
                ReferenceCommentNumber: formdata.ReferenceCommentNumber,
                ReferenceTypeCode: formdata.ReferenceTypeCode,
            };

            this.referenceInformationObj = {} as ReferenceInformation;
            const index = this.referenceProducts.findIndex((e) => e.SrNo === obj.SrNo);
            let approvalObj: ReferenceInformation[] = [];
            if (index === -1) {
                this.referenceProducts.push(obj);
                if (this.ContrID > 0) {
                    if (this.loggedInUserType !== 'Internal') {
                        approvalObj = this.differenceReference(obj, {}, {});
                        this.ContractorSave(approvalObj);
                        return;
                    } else {
                        this.matchJsonObjectsToSendForApproval('', obj);
                    }
                }
            } else {
                if (this.ContrID > 0) {
                    if (this.loggedInUserType !== 'Internal') {
                        const DBData = this.forwardedData.ReferenceInformation[index] === undefined ? {} : this.forwardedData.ReferenceInformation[index];
                        const approvalIndex = this.approvalData.findIndex((e) => e.SrNo === this.referenceProducts[index].SrNo);
                        const approval = this.approvalData[approvalIndex] === undefined ? {} : this.approvalData[approvalIndex];
                        approvalObj = this.differenceReference(obj, DBData, approval);
                        this.ContractorSave(approvalObj);
                        return;
                    } else {
                        const oldData = this.forwardedData.ReferenceInformation[index];
                        this.matchJsonObjectsToSendForApproval(oldData, obj);
                    }
                }
            }
            // this.referenceProducts[index] = obj;
            this.referenceInformationObj = obj;
            if (this.ContrID === 0) {
                this.saveJsonData();
            }
        }
    }

    public async ContractorSave(approvalObj: ReferenceInformation[]) {
        const ccopsData: ReferenceData = {
            ReferenceInformation: approvalObj,
        };
        const finalObj = Object.keys(approvalObj).length > 0 ? ccopsData : null;
        await this._srvContractorData.saveContractorData({ currentPage: 'References Information Page', nextPage: 'reference-information' }, finalObj, 'AddReference/EditReferenceEventJsonData');
        this.crComments = await this._srvContractorData.getPageComments('References');
        this.getReferenceJson();
    }

    // this function is used to find updated values and create a json for approval
    public async matchJsonObjectsToSendForApproval(oldData, updatedData) {
        const obj: ReferenceInformation = {} as ReferenceInformation;
        if (oldData !== '' && oldData !== undefined) {
            for (const Key in oldData) {
                if (oldData[Key] !== updatedData[Key] || Key === 'SrNo' || Key === 'ReferenceNumber') {
                    obj[Key] = updatedData[Key];
                }
            }
        } else {
            // tslint:disable-next-line:forin
            for (const Key in updatedData) {
                obj[Key] = updatedData[Key];
            }
        }

        const ind = this.approvalData.findIndex((x) => x.SrNo === obj['SrNo']);
        if (ind !== -1) {
            if (Object.keys(obj).length <= 2 && obj.hasOwnProperty('SrNo') && obj.hasOwnProperty('ReferenceNumber')) {
                this.approvalData.splice(ind, 1);
            } else {
                this.approvalData[ind] = obj;
            }
        } else {
            this.approvalData.push(obj);
        }

        // // this function is used only when logged in user is internal
        // employee and wants to updated the form.
        if (this.loggedInUserType === 'Internal') {
            this.sendJsonInternalEmployee();
        }

        // this block is common for contractor or internal employee
        const sendData = {
            ReferenceInformation: this.approvalData,
        };

        if (this.loggedInUserType === 'Internal') {
            this.objProgram.Contr_ID = this.ContrID;
        }
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;
        this.objProgram.ContractorResourceNumber = this._srvAuthentication.Profile.ContractorResourceID;
        this.objProgram.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
        this.objProgram.CCOpsData = JSON.stringify(sendData);
        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.PageName = 'References Information Page';
        if (this.loggedInUserType !== 'Internal') {
            this._srvContractorData.saveContractorData({ currentPage: 'References Information Page', nextPage: 'equipment-information' }, sendData, 'AddReference/EditReferenceEventJsonData');
            this.crComments = await this._srvContractorData.getPageComments('References');
            return;
        }

        await this._srvReferenceData.saveInternalData(this.objProgram);
        this.approvalData = [];
        this.getReferenceJson();
    }

    public differenceReference(tgt, src, approvalJSON) {
        if (Array.isArray(tgt)) {
            // if you got array
            return tgt; // just copy it
        }
        let obj: ReferenceInformation[] = [];
        const rst: ReferenceInformation = {} as ReferenceInformation;
        // if you got object
        // tslint:disable-next-line:forin
        for (const k in tgt) {
            // visit all fields
            if (Object.keys(src).length > 0) {
                if (k === 'JobType') {
                    src[k] = src[k] != null ? (src[k].trim() === '' ? null : src[k]) : src[k];
                }
            }
            if (approvalJSON.hasOwnProperty(k)) {
                if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceReference(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (approvalJSON[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            } else {
                if (src[k] !== null && typeof src[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceReference(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (src[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            }

            rst.SrNo = tgt['SrNo'];
            rst.ReferenceNumber = tgt['ReferenceNumber'];
        }

        if (!Object.keys(rst).length) {
            return;
        } else {
            const ind = this.approvalData.findIndex((x) => x.SrNo === rst['SrNo']);
            if (Object.keys(rst).length > 2) {
                if (ind !== -1) {
                    if (Object.keys(rst).length <= 2 && rst.hasOwnProperty('SrNo') && rst.hasOwnProperty('ReferenceNumber')) {
                        obj = [];
                    } else {
                        obj.push(rst);
                    }
                } else {
                    obj.push(rst);
                }
            }
        }
        return obj;
    }

    // this bunch of code is used to make json which is not updated by contractor and different from the master json
    public sendJsonInternalEmployee() {
        // dataForApprovalContractor is used when internal employee log in
        // and wants to updated some value but contractor already have some visual cue
        this.dataForApprovalContractor = JSON.parse(JSON.stringify(this.approvalJsonReference));

        if (this.loggedInUserType === 'Internal') {
            const arrayInternal: ReferenceInformation[] = [];
            this.approvalData.forEach((element) => {
                let index;
                if (this.dataForApprovalContractor != null || this.dataForApprovalContractor !== undefined) {
                    index = this.dataForApprovalContractor.findIndex((x) => x.SrNo === element.SrNo);
                } else {
                    index = -1;
                }
                let objInternal: ReferenceInformation = {} as ReferenceInformation;
                if (index !== -1) {
                    const oldDataContractor: ReferenceInformation = this.dataForApprovalContractor[index];
                    if (Object.keys(this.dataForApprovalContractor[index]).length !== Object.keys(element).length) {
                        for (const Key in element) {
                            if (!oldDataContractor.hasOwnProperty(Key) || Key === 'ReferenceNumber' || Key === 'SrNo') {
                                objInternal[Key] = element[Key];
                            }
                        }
                        arrayInternal.push(objInternal);
                    }
                } else {
                    objInternal = element;
                    arrayInternal.push(objInternal);
                }
                this.approvalData = arrayInternal;
            });
        }
    }

    // save Json Data
    public async saveJsonData() {
        this.referenceInformationObj = {
            ...this.referenceInformationObj,
            ResourceId: this.resourceId,
            CCopsId: this.loginDetails[0].CCOpsID,
            LastPageVisited: 'reference-information',
        };
        const saveReponseNumber = await this._srvReferenceData.saveData(this.referenceInformationObj);
        this._srvContrRegistration.saveReponseNumber.next(saveReponseNumber.body);
        this.getReferenceJson();
    }

    // Validation Check For 5 Mandator in IR and CI  and Insurance non mandatory other 4 mandatory for CH functionality.
    public async checkRefernceTypes() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this._srvAuthentication.Profile.ContrID > 0) {
            const endPoint = this.isFinalSaveButton === true ? 'equipment-information' : 'reference-information';
            await this._srvContractorData.saveContractorData({ currentPage: 'References Information Page', nextPage: endPoint }, null, 'AddReference/EditReferenceEventJsonData');
            this._router.navigate([`/contractorRegistration/${endPoint}`]);
            return;
        }
        const curRefData: ReferenceInformation = {} as ReferenceInformation;
        let zeroCount: number = 0;
        // Making an object with all available reference types
        this.referenceTypeData.forEach((element) => {
            curRefData[element.ReferenceTypeName] = 0;
        });
        this.updateLanaguageforSaveaAndNext();
        // Counting what refernce types are present in the current data set
        this.referenceProducts.forEach((e) => {
            curRefData[e.ReferenceTypeNumber] += 1;
        });

        let isRequirementFullfilled = true;
        if (this.referenceProducts.length === 0) {
            const dialogRefs = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialogs = dialogRefs.content.instance;
            dialogs.alertMessage = `<div class="modal-alert info-alert">
              <p>${this.pageContent.Reference_Info.Please_Complete_Minimum_Three}</p>
             </div>`;
            return dialogRefs;
        }

        this.updateLanguageforGridData();

        // // Checking if all the reference types are present in required quantities or not except insurance
        // // TODO This approach fails as we add more kinds of work in the system. But that is highly unlikely. --Animesh

        for (const elem in curRefData) {
            if (curRefData[elem] < 3) {
                if (curRefData[elem] === 0) {
                    zeroCount++;
                    continue;
                }
                isRequirementFullfilled = false;
                break;
            }
        }
        if (isRequirementFullfilled && (zeroCount === Object.keys(curRefData).length || zeroCount === 0)) {
            return this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'equipment-information' : 'reference-information');
        }

        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
            width: 500,
        });

        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `<div class="modal-alert info-alert">
        <p>${this.pageContent.Reference_Info.Please_Complete_Minimum_Three} </p>
       </div>`;
        return dialogRef;
    }

    // Save and Next  Button Click
    public onSaveNext() {
        if (this.loggedInUserType === 'Internal') {
            this._router.navigate(['/contractorRegistration/equipment-information']);
        } else {
            this.isFinalSaveButton = true;
            this.checkRefernceTypes();
        }
    }

    public async funcToSaveLastPage(lastPage: string) {
        await this._srvContrRegistration.saveLastPageVisited(lastPage);
        this._router.navigate(['/contractorRegistration/' + lastPage]);
    }

    // Back Button Click
    public async onBackClick() {
        let page: string;
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            if (this.ContrID !== 0) {
                page = 'financial-information';
            } else {
                page = this.directToFinancial === true ? 'financial-information' : 'job-volume-information';
            }
            await this._srvContractorData.saveContractorData({ currentPage: 'References Information Page', nextPage: `${page}` }, null, 'AddReference/EditReferenceEventJsonData');
            this._router.navigate([`/contractorRegistration/${page}`]);
            return;
        }
        if (this.loggedInUserType === 'Internal') {
            this._router.navigate(['/contractorRegistration/financial-information']);
        } else {
            if (this.forwardedData.hasOwnProperty('FinancialInformation') && this.forwardedData.FinancialInformation != null) {
                this.funcToSaveLastPage('financial-information');
            } else {
                if (
                    this.forwardedData.CompleteApplication.FinancialDeferralGuidelines !== null &&
                    this.forwardedData.CompleteApplication.FinancialDeferralGuidelines.FinancialDeferralRemoveDate === 'null'
                ) {
                    // if (this.forwardedData.hasOwnProperty('FinancialInformation') && this.forwardedData.FinancialInformation != null) {
                    this.funcToSaveLastPage('financial-information');
                    // } else {
                    //     this.funcToSaveLastPage('job-volume-information');
                    // }
                } else {
                    this.funcToSaveLastPage('job-volume-information');
                }
            }
        }
    }

    // unsubscribe services
    public ngOnDestroy() {
        if (this.currentMessage) {
            this.currentMessage.unsubscribe();
        }
        if (this.servUnsubscribe) {
            this.servUnsubscribe.unsubscribe();
        }
    }
}
