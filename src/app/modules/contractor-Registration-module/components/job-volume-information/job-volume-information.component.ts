import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, OnInit, AfterViewInit, ViewContainerRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Text, Layout, geometry } from '@progress/kendo-drawing';
import { DialogService } from '@progress/kendo-angular-dialog';
import { AddJobVolumeDialogComponent } from '../../dialogs/add-job-volume-dialog/add-job-volume-dialog.component';
import { Router } from '@angular/router';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { orderBy, SortDescriptor, filterBy, CompositeFilterDescriptor, distinct } from '@progress/kendo-data-query';
import { ApiService } from 'src/app/core/services/http-service';
import { SelectApplicationModel } from '../../models/data-model';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { LegendLabelsContentArgs } from '@progress/kendo-angular-charts';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { JobVolumeInformationService } from './job-volume-information.service';
import { ApprovalJobVolumeData, BarData, GridData, JobVolumeInfo, PieData } from './model';
import { CorrectionRequestComments, DeviceObj, InternalLogin, LoginUser, PageObj } from 'src/app/core/models/user.model';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';

@Component({
    selector: 'app-job-volume-information',
    templateUrl: './job-volume-information.component.html',
    styleUrls: ['./job-volume-information.component.scss'],
})
export class JobVolumeInformationComponent implements OnInit, AfterViewInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    public saveNext: string = 'Save & Next'; // default
    public gridData: GridData[] = [];
    public pieData: PieData[] = [];
    public barData: BarData[] = [];

    // mobile grid code
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo = {};
    public deviceResObj: DeviceObj;

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
    public multiple: boolean = false;

    public allowUnsort: boolean = true;
    public selectedItem: GridData;
    public jobData: JobVolumeInfo;
    public forwardedData: JobVolumeInfo;
    public serviceData;
    public objProgram = new SelectApplicationModel();
    public resourceId: number;
    public companyOpeningDate: string;
    public diffYears: number = 0;
    public openingYear: number | string;
    public currentYear: number | string;
    public pageContent: any;

    public largestSingleJob: number = 180;
    public avgJobAmount: number = 180;
    private directToFinancial: boolean = false;

    public dataForApproval: ApprovalJobVolumeData[] = [];
    public approvalJsonJobVolume: ApprovalJobVolumeData[] = [];
    public dataForApprovalContractor: ApprovalJobVolumeData[] = [];
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public pageSizes: boolean = true;
    public previousNext: boolean = true;
    private isFinalSaveButton: boolean = false;
    public loggedInUserType: string;
    public ContrID: number = 0;
    public disableInternalAccess: boolean = false;
    public hidePage: boolean = false;
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid = filterBy(this.gridData, this.filter);
    public crComments: CorrectionRequestComments[];
    public loginDetailsInternal: SessionUser;

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.gridData, filter);
    }
    public distinctPrimitive(fieldName: string): any {
        return distinct(this.gridData, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        private _srvContractorRegistration: ContractorRegistrationService,
        private apiService: ApiService,
        private _dialog: DialogService,
        private _router: Router,
        private _deviceService: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        public _srvAuthentication: AuthenticationService,
        private _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _changeDetector: ChangeDetectorRef,
        private _srvJobVolume: JobVolumeInformationService,
        private renderer: Renderer2
    ) {
        // const langResponse = this._srvLanguage.onLanguageSelect(this._srvAuthentication.Language === 1 ? 'en' : 'fr');
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.saveNext = this.pageContent.Job_Volume_Info.Job_Volume_Informations_Save_Next;
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
        this.loginDetailsInternal = this._srvAuthentication.ProfileInternal;
        this.crComments = await this._srvContractorData.getPageComments('Job Volume Information');
        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this._deviceService.getDeviceInfo();
        this.isMobile = this._deviceService.isMobile();
        this.isTab = this._deviceService.isTablet();
        this.isDesktop = this._deviceService.isDesktop();

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

        // extract job volume page information from the json of all pages
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        if (this.loggedInUserType === 'Internal') {
            this.saveNext = this.pageContent.Job_Volume_Info.Next;
        }
        this.getJSON();
        this.checkPrivilegeForUser();

        if (this._srvAuthentication.Language > 0) {
            this.largestSingleJob = 230;
            this.avgJobAmount = 230;
        }
    }
    checkPrivilegeForUser() {
        // for user access Privilege
        if (this.ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Job Volume Information');
            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.disableInternalAccess = true;
                } else {
                    this.hidePage = true;
                    const dialogRef = this._dialog.open({
                        content: DialogAlertsComponent,
                        appendTo: this.containerRef,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = ` <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Job_Volume_Info.Access_Denied}</h2>
                    <p>${this.pageContent.Job_Volume_Info.Permission}</p>
                   </div>`;
                    dialogRef.result.subscribe((val) => {
                        // // to show selected jump to value
                        // // end
                        this._router.navigate(['contractorRegistration/company-information']);
                    });
                }
            }
        }
    }
    public getCompanyOpeningDate() {
        const date = new Date(this.companyOpeningDate).getFullYear();
        const currentYear = new Date().getFullYear();
        this.diffYears = currentYear - date;
        this.openingYear = date;
        this.currentYear = currentYear;
    }

    public diff_years(currentDate, date) {
        let diff = (currentDate.getTime() - date.getTime()) / 1000;
        diff /= 60 * 60 * 24;
        return Math.floor(diff / 365.25);
    }

    // this function gets the data which we have already sent for approval
    public async getJsonForApprovalData() {
        const param = {
            contrID: this.loginDetails[0].ContrID,
            resourceID: this.resourceId,
            pageName: 'Job Volume Information Page',
            CCOpsId: this.loginDetails[0].CCOpsID,
            EventName: this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName,
        };
        const res = await this._srvJobVolume.getContractorApprovalData(param);
        this.dataForApproval =
            res.length > 0 && JSON.parse(res[0].CCOpsData) && JSON.parse(res[0].CCOpsData).ContractorData.JobVolumeInformation ? JSON.parse(res[0].CCOpsData).ContractorData.JobVolumeInformation : [];
        this.approvalJsonJobVolume = JSON.parse(JSON.stringify(this.dataForApproval));
        this.loadGridData();
    }

    async getJSON() {
        this.loginDetails = Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.ContrID = this.loginDetails[0].ContrID;
        }
        if (this.loggedInUserType === 'Internal') {
            const loginDetailsInternal = this._srvAuthentication.ProfileInternal;
            this.resourceId = loginDetailsInternal.ResourceID;
        }
        let res;
        // this code is used to get data from json or from db
        if (this.ContrID > 0) {
            res = await this._srvJobVolume.GetJobVolumeData({ contrID: this.ContrID, pageName: 'Job Volume Information Page', resourceID: this.resourceId });
        } else {
            res = await this._srvJobVolume.getJobVolumeInfo({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
            const companyDetail = await this._srvJobVolume.GetCompanyDetails({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
            const CompleteApplicationDetail = await this._srvJobVolume.GetCompleteApplicationDetails({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
            const FinancialInformation = await this._srvJobVolume.GetFinancialDetails({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });

            res = { ...res, ...companyDetail, ...FinancialInformation, ...CompleteApplicationDetail };
            // if loggedin user in internal employee and wants to see the data of prospective contractor
            this._srvContractorRegistration.funcInternalUserGoDirectlyToContractorPage(res.JobVolumeInformation, 'JobVolumeInformation');
            if (this.loggedInUserType === 'Internal' && res.JobVolumeInformation === null) return;
        }
        this.forwardedData = res;
        if (this.forwardedData.hasOwnProperty('JobVolumeInformation')) {
            if (this.forwardedData.JobVolumeInformation !== null) {
                this.jobData = this.forwardedData;
                this.getDataForChartsAndGrid(JSON.stringify(this.jobData));
            }
        }
        if (this.forwardedData.hasOwnProperty('CompanyDetails')) {
            this.companyOpeningDate = this.forwardedData.CompanyDetails.ContractorOpeningDate;
            this.getCompanyOpeningDate();
        }
        if (this.forwardedData.hasOwnProperty('CompleteApplication')) {
            this.directToFinancial =
                this.forwardedData.CompleteApplication !== null && this.forwardedData.CompleteApplication && this.forwardedData.CompleteApplication.FinancialDeferralGuidelines !== null ? true : false;
        }
    }

    public loadGridData(): void {
        const dataArr = [];
        // convert all text fields in integer for sorting purpose
        if (this.gridData === null) return;
        this.gridData.forEach((element) => {
            const obj = {
                serial_no: element.serial_no,
                Year: element.Year,
                JobVolumeNumber: element.JobVolumeNumber,
                ResidentialInsuranceRestorationInPercentage: element.ResidentialInsuranceRestorationInPercentage,
                CommercialInsuranceRestorationInPercentage: element.CommercialInsuranceRestorationInPercentage,
                ResidentialRemodellingInPercentage: element.ResidentialRemodellingInPercentage,
                CommercialRemodellingInPercentage: element.CommercialRemodellingInPercentage,
                LargestSingleJobInYear: element.LargestSingleJobInYear,
                AverageJobAmountInYear: element.AverageJobAmountInYear,

                // increase these parameters to show the visual cues on the columns
                isYear: false,
                isResInsRestoPer: false,
                isComInsResPer: false,
                isResRemodelPer: false,
                isComRemodelPer: false,
                isLargestSingle: false,
                isAverageJob: false,
            };
            dataArr.push(obj);
        });

        this.gridData = dataArr;

        this.matchJsonObjectToshowVisualCue();

        this.gridView = {
            data: orderBy(this.gridData, this.sort),
            total: this.gridData.length,
        };

        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }

    // if there is some data is pending for approval match with the old json data
    // if data is not same means data is not approved yet
    public matchJsonObjectToshowVisualCue() {
        if (this.dataForApproval !== undefined) {
            this.dataForApproval.forEach((element) => {
                for (const key of Object.keys(element)) {
                    const ind = this.gridData.findIndex((x) => x.Year === element.Year);
                    if (ind !== -1) {
                        const objGrid = this.gridData[ind];
                        for (const appKey of Object.keys(objGrid)) {
                            const visualKey =
                                key === 'ResidentialInsuranceRestorationInPercentage'
                                    ? 'isResInsRestoPer'
                                    : key === 'CommercialInsuranceRestorationInPercentage'
                                        ? 'isComInsResPer'
                                        : key === 'ResidentialRemodellingInPercentage'
                                            ? 'isResRemodelPer'
                                            : key === 'CommercialRemodellingInPercentage'
                                                ? 'isComRemodelPer'
                                                : key === 'LargestSingleJobInYear'
                                                    ? 'isLargestSingle'
                                                    : key === 'AverageJobAmountInYear'
                                                        ? 'isAverageJob'
                                                        : '';
                            if (appKey !== 'serial_no' && appKey === key) {
                                objGrid[appKey] = element[key];
                                if (appKey !== 'Year') {
                                    objGrid[visualKey] = true;
                                }
                            }
                        }
                    } else {
                        // this code is used when we send complete row for approval
                        const obj = {
                            serial_no: this.gridData.length + 1,
                            Year: element.Year,
                            JobVolumeNumber: element.JobVolumeNumber,
                            ResidentialInsuranceRestorationInPercentage: element.ResidentialInsuranceRestorationInPercentage,
                            CommercialInsuranceRestorationInPercentage: element.CommercialInsuranceRestorationInPercentage,
                            ResidentialRemodellingInPercentage: element.ResidentialRemodellingInPercentage,
                            CommercialRemodellingInPercentage: element.CommercialRemodellingInPercentage,
                            LargestSingleJobInYear: element.LargestSingleJobInYear,
                            AverageJobAmountInYear: element.AverageJobAmountInYear,

                            isYear: true,
                            isResInsRestoPer: true,
                            isComInsResPer: true,
                            isResRemodelPer: true,
                            isComRemodelPer: true,
                            isLargestSingle: true,
                            isAverageJob: true,
                        };
                        this.gridData.push(obj);
                    }
                }
            });
        }
    }

    public onPageChange(state: any): void {
        this.pageSize = state.take;
        this._changeDetector.detectChanges();
    }

    public labelVisual(e: any): any {
        const visual = e.createVisual();
        const text = new Text(e.category, [0, 0], {
            fill: {
                color: 'red',
            },
        });
        const layout = new Layout(new geometry.Rect(visual.bbox().origin, [0, 1000]), {
            orientation: 'vertical',
            alignItems: 'start',
        });

        layout.append(visual, text);
        layout.reflow();

        return layout;
    }

    // create grid data and charts data in the required format from the given json
    public getDataForChartsAndGrid(text) {
        const tempArrayForPie = [];
        const tempArrayForBar = [];
        const data = JSON.parse(text);

        if (this.ContrID > 0) {
            this.gridData = data.JobVolumeInformation;
            this.getJsonForApprovalData();
        } else {
            this.gridData = data.JobVolumeInformation;
            this.loadGridData();
        }
        const arrayYear = new Array();
        for (const row of this.gridData) {
            arrayYear.push(row.Year);
        }
        const maxYear = arrayYear.reduce((a, b) => Math.max(a, b));
        for (const val of this.gridData) {
            if (val.Year === maxYear) {
                const maxYearDataForChart = val;
                Object.keys(maxYearDataForChart).forEach((key) => {
                    const index = Object.keys(maxYearDataForChart).indexOf(key);
                    let keyNameForChart;
                    if (
                        key === 'ResidentialInsuranceRestorationInPercentage' ||
                        key === 'CommercialInsuranceRestorationInPercentage' ||
                        key === 'ResidentialRemodellingInPercentage' ||
                        key === 'CommercialRemodellingInPercentage'
                    ) {
                        keyNameForChart =
                            key === 'ResidentialInsuranceRestorationInPercentage' && maxYearDataForChart[key] !== 0
                                ? `${this.pageContent.Job_Volume_Info.Insurance_R}`
                                : key === 'CommercialInsuranceRestorationInPercentage' && maxYearDataForChart[key] !== 0
                                    ? `${this.pageContent.Job_Volume_Info.Insurance_C}`
                                    : key === 'ResidentialRemodellingInPercentage' && maxYearDataForChart[key] !== 0
                                        ? `${this.pageContent.Job_Volume_Info.Remodeling_R}`
                                        : maxYearDataForChart[key] !== 0
                                            ? `${this.pageContent.Job_Volume_Info.Remodeling_C}`
                                            : '';

                        const json = {
                            key: keyNameForChart,
                            value: maxYearDataForChart[key] === 0 ? '' : maxYearDataForChart[key],
                        };
                        tempArrayForPie.push(json);
                    }
                    if (key === 'AverageJobAmountInYear' || key === 'LargestSingleJobInYear') {
                        keyNameForChart = key === 'AverageJobAmountInYear' ? 'Avg. job Amount' : 'Largest Single job';
                        const json = {
                            key: keyNameForChart,
                            value: maxYearDataForChart[key],
                        };
                        tempArrayForBar.push(json);
                    }
                });
                break;
            }
        }
        this.pieData = tempArrayForPie;
        this.labelContent = this.labelContent.bind(this);
        this.barData = tempArrayForBar;
    }

    public labelContent(args: LegendLabelsContentArgs): string {
        return `${args.dataItem.value} %`;
    }

    // add edit data result used in function openAddJobVolumeDialog()
    jobVolumeResult(data, option) {
        const formdata = data;
        const obj = {
            JobVolumeNumber: option === 'edit' ? formdata.JobVolumeNumber : null,
            serial_no: option === 'edit' ? formdata.serial_no : this.gridData.length + 1,
            Year: parseInt(formdata.year, 10),
            ResidentialInsuranceRestorationInPercentage: parseInt(formdata.residentialInsurance, 10),
            CommercialInsuranceRestorationInPercentage: parseInt(formdata.commercialInsurance, 10),
            ResidentialRemodellingInPercentage: parseInt(formdata.residentialRemodeling, 10),
            CommercialRemodellingInPercentage: parseInt(formdata.commercialRemodeling, 10),
            LargestSingleJobInYear: parseInt(formdata.largetSingleJob, 10),
            AverageJobAmountInYear: parseInt(formdata.avgJobAmount, 10),
        };
        const index = this.gridData.findIndex((e) => e.Year === obj.Year);
        if (index === -1) {
            this.gridData.push(obj);
            if (this.ContrID > 0) {
                this.matchJsonObjects('', obj, obj.Year);
            }
        } else {
            obj.serial_no = this.gridData[index].serial_no;
            this.gridData[index] = obj;

            if (this.ContrID > 0) {
                const oldData = this.forwardedData.JobVolumeInformation[index];
                this.matchJsonObjects(oldData, obj, obj.Year);
            }
        }

        if (this.ContrID === 0) {
            const objfinal = {
                JobVolumeInformation: this.gridData,
            };
            this.jobData = objfinal;
            this.saveDataInJsonAndrefreshGrid(objfinal);
        }
    }

    private comparewithDbData(oldData, updatedData) {
        const obj = {};
        if (oldData !== '' && oldData !== undefined) {
            for (const Key in oldData) {
                if (Key !== 'JobVolumeNumber') {
                    if (oldData[Key] !== updatedData[Key] || Key === 'Year') {
                        obj[Key] = updatedData[Key];
                    }
                }
            }
        } else {
            for (const Key in updatedData) {
                if (Key !== 'serial_no' && Key !== 'JobVolumeNumber') {
                    obj[Key] = updatedData[Key];
                }
            }
        }
        return obj;
    }
    public async matchJsonObjects(oldData, updatedData, financialYear) {
        const oldJsonData = JSON.parse(JSON.stringify(this.approvalJsonJobVolume));
        let obj = {};
        if (this.loggedInUserType !== 'Internal') {
            const index = oldJsonData ? oldJsonData.findIndex((e) => e.Year === financialYear) : -1;
            if (index > -1) {
                for (const Key in updatedData) {
                    if (Key !== 'serial_no' && Key !== 'JobVolumeNumber') {
                        if (Key in oldJsonData[index]) {
                            if (oldJsonData[index][Key] !== updatedData[Key]) {
                                obj[Key] = updatedData[Key];
                            }
                        } else {
                            if (oldData[Key] !== updatedData[Key]) {
                                obj[Key] = updatedData[Key];
                            }
                        }
                    }
                }
                obj['Year'] = financialYear;
            } else {
                obj = this.comparewithDbData(oldData, updatedData);
            }
        } else {
            obj = this.comparewithDbData(oldData, updatedData);
        }

        if (this.loggedInUserType !== 'Internal') {
            this.dataForApproval = [];
            if (Object.keys(obj).length === 1 && obj.hasOwnProperty('Year')) {
                obj = {};
            }
            this.dataForApproval.push(obj);
        } else {
            const ind = this.dataForApproval.findIndex((x) => x.Year === obj['Year']);
            if (ind !== -1) {
                if (Object.keys(obj).length === 1 && obj.hasOwnProperty('Year')) {
                    this.dataForApproval.splice(ind, 1);
                } else {
                    this.dataForApproval[ind] = obj;
                }
            } else {
                if (Object.keys(obj).length > 1) {
                    this.dataForApproval.push(obj);
                }
            }
        }
        // this function is used only when logged in user is internal
        // employee and wants to updated the form.
        if (this.loggedInUserType === 'Internal') {
            this.sendJsonInternalEmployee();
        }

        const ccopsData = {
            JobVolumeInformation: this.dataForApproval,
        };
        if (this.loggedInUserType !== 'Internal') {
            this.isFinalSaveButton = true;
            const finalObj = Object.keys(this.dataForApproval[0]).length > 1 ? ccopsData : null;
            await this._srvContractorData.saveContractorData({ currentPage: 'Job Volume Information Page', nextPage: 'job-volume-information' }, finalObj, 'JobVolume/EditJobVolumeEventJsonData');
            this.crComments = await this._srvContractorData.getPageComments('Job Volume Information');
            this.dataForApproval = null;
            this.getJSON();
            return;
        }
        if (this.loggedInUserType === 'Internal') {
            this.objProgram.Contr_ID = this.ContrID;
        }
        if (this.loginDetails) {
            this.objProgram.ResourceId = this.resourceId;
        }
        if (this.dataForApproval.length === 0) {
            return;
        }
        this.objProgram.CCOpsData = JSON.stringify(this.dataForApproval.length > 0 ? ccopsData : null);
        this.objProgram.PageName = 'Job Volume Information Page';
        this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;
        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.ContractorResourceNumber = this.loginDetails[0].ContractorResourceID;
        let url;
        if (this.loggedInUserType === 'Internal') {
            url = 'JSON/EditJsonDataInternal';
            this.objProgram.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
        }
        const res: number = await this._srvJobVolume.saveJobVolumeInternalChanges(this.objProgram);
        if (res === 1) {
            this.dataForApproval = [];
            this.getJSON();
        }
    }

    // this bunch of code is used to make json which is not updated by contractor and different from the master json
    public sendJsonInternalEmployee() {
        // dataForApprovalContractor is used when internal employee log in
        // and wants to updated some value but contractor already have some visual cue
        this.dataForApprovalContractor = JSON.parse(JSON.stringify(this.approvalJsonJobVolume));
        if (this.loggedInUserType === 'Internal') {
            const arrayInternal = [];
            this.dataForApproval.forEach((element) => {
                let index;
                if (this.dataForApprovalContractor != null || this.dataForApprovalContractor !== undefined) {
                    index = this.dataForApprovalContractor.findIndex((x) => x.Year === element.Year);
                } else {
                    index = -1;
                }
                let objInternal = {};
                if (index !== -1) {
                    const oldDataContractor = this.dataForApprovalContractor[index];
                    let lengthApproval = Object.keys(this.dataForApprovalContractor[index]).length;
                    if (this.dataForApprovalContractor[index].hasOwnProperty('IsRowDisable')) {
                        lengthApproval = Object.keys(this.dataForApprovalContractor[index]).length - 1;
                    }
                    if (lengthApproval !== Object.keys(element).length) {
                        for (const Key in element) {
                            if (!oldDataContractor.hasOwnProperty(Key) || Key === 'Year') {
                                objInternal[Key] = element[Key];
                            }
                        }
                        arrayInternal.push(objInternal);
                    }
                } else {
                    objInternal = element;
                    arrayInternal.push(objInternal);
                }

                this.dataForApproval = arrayInternal;
            });
        }
    }

    async saveDataInJsonAndrefreshGrid(objfinal) {
        // this code is write to remobve extra keys from grid which we are using to show visual cue as temporary
        const arrayNew = [];
        this.jobData.JobVolumeInformation.forEach((element) => {
            const obj = {
                serial_no: element.serial_no,
                Year: element.Year,
                JobVolumeNumber: element.JobVolumeNumber !== undefined ? element.JobVolumeNumber : null,
                ResidentialInsuranceRestorationInPercentage: element.ResidentialInsuranceRestorationInPercentage,
                CommercialInsuranceRestorationInPercentage: element.CommercialInsuranceRestorationInPercentage,
                ResidentialRemodellingInPercentage: element.ResidentialRemodellingInPercentage,
                CommercialRemodellingInPercentage: element.CommercialRemodellingInPercentage,
                LargestSingleJobInYear: element.LargestSingleJobInYear,
                AverageJobAmountInYear: element.AverageJobAmountInYear,
            };

            arrayNew.push(obj);
        });

        this.jobData.JobVolumeInformation = arrayNew;
        // end block
        const objProgram = {
            ResourceId: this.resourceId,
            CCopsId: this.loginDetails[0].CCOpsID,
            LastPageVisited: 'job-volume-information',
        };
        const sendData = { JobVolumeInformation: arrayNew, ...objProgram };
        await this._srvJobVolume.saveJobVolume(sendData);
        this.getDataForChartsAndGrid(JSON.stringify(objfinal));
    }
    // used to open dialog of add job volume and get form data
    public openAddJobVolumeDialog(event, option, curData?: any) {
        const dialogRef = this._dialog.open({
            content: AddJobVolumeDialogComponent,
            width: 500,
        });
        if (option === 'ADD') {
            const jobInfo = dialogRef.content.instance;
            jobInfo.openingYear = this.openingYear;
            jobInfo.currentYear = this.currentYear;
            jobInfo.wholeGridData = this.gridData;
            dialogRef.result.subscribe((r) => {
                if (r['status'] !== undefined) {
                    this.jobVolumeResult(r['status'], 'add');
                }
            });
        } else if (option === 'EDIT') {
            this.selectedItem = curData;
            const jobInfo = dialogRef.content.instance;
            jobInfo.incomingData = this.selectedItem;
            jobInfo.openingYear = this.openingYear;
            jobInfo.currentYear = this.currentYear;
            jobInfo.disableInternalAccess = this.disableInternalAccess;
            // region disable functionality
            const indx = this.dataForApproval.findIndex((x) => x.Year === this.selectedItem.Year);
            jobInfo.IsRowDisable = indx > -1 ? this.dataForApproval[indx]['IsRowDisable'] : false;
            // end region

            dialogRef.result.subscribe((r) => {
                if (r['status'] !== undefined) {
                    this.jobVolumeResult(r['status'], 'edit');
                }
            });
        }
    }

    // this function is used to save last visited page on save & next and back button
    async funcToSaveLastPage(lastPage) {
        if (this.loggedInUserType === 'Internal') {
            this._router.navigate(['/contractorRegistration/contractor-location']);
        } else {
            await this._srvContractorRegistration.saveLastPageVisited(lastPage);
            this._router.navigate(['/contractorRegistration/' + lastPage]);
        }
    }

    async onSaveNext() {
        let page: string;
        if (this._srvAuthentication.Profile.EventName !== 'No Event') {
            if (this.ContrID !== 0) {
                page = 'financial-information';
            } else {
                page = this.directToFinancial === true ? 'financial-information' : 'reference-information';
            }
            await this._srvContractorData.saveContractorData({ currentPage: 'Job Volume Information Page', nextPage: page }, null, 'JobVolume/EditJobVolumeEventJsonData');
            this._router.navigate([`/contractorRegistration/${page}`]);
            return;
        }
        if (this.loggedInUserType === 'Internal') {
            this._router.navigate(['/contractorRegistration/financial-information']);
        } else {
            this.isFinalSaveButton = true;
            if (this.diffYears > 0) {
                if (this.gridData.length < 1) {
                    const dialogRef = this._dialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                    <div class="modal-alert info-alert">
                        <p>${this.pageContent.Job_Volume_Info.One_Record}</p>
                    </div>
                `;
                    return dialogRef;
                } else if (this.diffYears <= 3 && this.gridData.length <= this.diffYears - 1) {
                    // for two years data
                    const dialogRef = this._dialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                    <div class="modal-alert info-alert">
                        <p>${this.pageContent.Job_Volume_Info.Please_Add} ${this.diffYears} ${this.pageContent.Job_Volume_Info.Year_Data} </p>
                        </div>
                        `;
                    return dialogRef;
                } else if (this.diffYears > 3 && this.gridData.length < 3) {
                    const dialogRef = this._dialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                    <div class="modal-alert info-alert">
                        <p>${this.pageContent.Job_Volume_Info.Three_Data}</p>
                    </div>
                `;
                    return dialogRef;
                } else {
                    if (this.forwardedData.hasOwnProperty('FinancialInformation') && this.forwardedData.FinancialInformation != null) {
                        this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'financial-information' : 'job-volume-information');
                    } else {
                        if (
                            this.forwardedData.CompleteApplication.FinancialDeferralGuidelines !== null &&
                            this.forwardedData.CompleteApplication.FinancialDeferralGuidelines.FinancialDeferralRemoveDate === 'null'
                        ) {
                            this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'financial-information' : 'job-volume-information');
                        } else {
                            this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'reference-information' : 'job-volume-information');
                        }
                        this._srvContractorRegistration.getSelectProgramType(this.serviceData);
                    }
                }
            } else if (this.currentYear === this.openingYear && this.diffYears === 0 && this.gridData.length < 1) {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Job_Volume_Info.One_Current_Year}</p>
                </div>
            `;
                return dialogRef;
            } else {
                if (this.forwardedData.hasOwnProperty('FinancialInformation') && this.forwardedData.FinancialInformation != null) {
                    this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'financial-information' : 'job-volume-information');
                } else {
                    if (
                        this.forwardedData.CompleteApplication.FinancialDeferralGuidelines !== null &&
                        this.forwardedData.CompleteApplication.FinancialDeferralGuidelines.FinancialDeferralRemoveDate === 'null'
                    ) {
                        this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'financial-information' : 'job-volume-information');
                    } else {
                        this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'reference-information' : 'job-volume-information');
                    }
                    this._srvContractorRegistration.getSelectProgramType(this.serviceData);
                }
            }
        }
    }

    async onBack() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData({ currentPage: 'Job Volume Information Page', nextPage: 'contractor-location' }, null, 'JobVolume/EditJobVolumeEventJsonData');
            await this._router.navigate(['/contractorRegistration/contractor-location']);
            return;
        }
        this.funcToSaveLastPage('contractor-location');
    }

    ngAfterViewInit() {
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: any) => {
            this.deviceInfo = this._deviceService.getDeviceInfo();
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
    }
    onLegendItemClick(ev) {
        if (this.loggedInUserType === 'Internal' || this.disableInternalAccess) {
            ev.preventDefault();
        }
    }

    public currencyLabel = (ev: any) => {
        const currencySuffix = '$';
        return currencySuffix + ev.value;
    }

}
