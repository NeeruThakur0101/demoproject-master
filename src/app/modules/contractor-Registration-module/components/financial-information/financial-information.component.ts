import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ElementRef, ViewContainerRef, Renderer2 } from '@angular/core';
import { GridDataResult, GridComponent, RowClassArgs } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy, CompositeFilterDescriptor, filterBy, distinct } from '@progress/kendo-data-query';
import { DialogService } from '@progress/kendo-angular-dialog';
import { AddFinancialInfoDialogComponent } from '../../dialogs/add-financial-info-dialog/add-financial-info-dialog.component';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { SelectApplicationModel } from '../../models/data-model';
import { Router } from '@angular/router';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import * as moment from 'moment';
import { FinancialData, FinancialInformation, FinancialInformationApproval, VisualCueObject } from './model_financial';
import { CorrectionRequestComments, DeviceObj, LoginUser, PageObj } from 'src/app/core/models/user.model';
import { FinancialeDataService } from './financial.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-financial-information',
    templateUrl: './financial-information.component.html',
    styleUrls: ['./financial-information.component.scss'],
})
export class FinancialInformationComponent implements OnInit, AfterViewInit {
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
    public pageSize = 5;
    public skip: number = 0;
    public grid: GridComponent;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public resourceId: number;
    public ccopsId: number;
    public checked: boolean = true;
    public forwardedData: FinancialData;
    public unchecked: boolean = false;
    public multiple = false;
    public allowUnsort: boolean = true;

    public financialInformationObj: FinancialInformation;

    public serviceData;
    public selectedItem;
    public gridView: GridDataResult;

    public saveNext: string = 'Save & Next'; // default
    public diffYears: number = 0;
    public openingYear: number;
    public currentYear: number;
    public companyOpeningDate: string = '';
    public isReviewed: boolean = false;
    public objProgram = new SelectApplicationModel();
    public dataArr = [];
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    private isFinalSaveButton: boolean = false;
    public dataForApproval: FinancialInformationApproval[] = [];
    public dataForApprovalContractor: FinancialInformation[] = [];
    public approvalJsonFinancial: FinancialInformation[] = [];
    public loggedInUserType: string;
    public ContrID: number;
    public disableInternalAccess: boolean = false;
    public hidePage: boolean = false;
    public pageContent: any;
    private directToFinancial: boolean;
    public totalRevenueWidths: number = 175;
    public totalExpenses: number = 175;
    public reviewData: any;
    public financialGridHeaderCR: number = 100;
    public crComments: CorrectionRequestComments[];
    public loginDetailsInternal: SessionUser;

    public filter: CompositeFilterDescriptor = null;
    public gridData: FinancialInformation[] = [];

    public gridDataGrid: FinancialInformation[] = filterBy(this.gridData, this.filter);

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.gridData, filter);
    }
    public distinctPrimitive(fieldName: string) {
        return distinct(this.gridData, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private _srvContrRegistration: ContractorRegistrationService,
        private _route: Router,
        private _srvDialog: DialogService,
        private _srvDeviceDetector: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        public _srvAuthentication: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        public _srvFinancialeData: FinancialeDataService,
        private renderer: Renderer2,
        private intlService: IntlService
    ) { }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    async ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.loginDetailsInternal = this._srvAuthentication.ProfileInternal;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.crComments = await this._srvContractorData.getPageComments('Financial Information');
        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
        this.isMobile = this._srvDeviceDetector.isMobile();
        this.isTab = this._srvDeviceDetector.isTablet();
        this.isDesktop = this._srvDeviceDetector.isDesktop();

        if (this._srvAuthentication.Language === 2) {
            this.totalRevenueWidths = 175;
            this.totalExpenses = 170;
            this.financialGridHeaderCR = 130;
        }

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

        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        if (this.loggedInUserType === 'Internal') {
            this.saveNext = this.pageContent.Financial_Information.Global_Button_Next;
        } else {
            this.saveNext = this.pageContent.Financial_Information.Global_Button_SaveAndNext;
        }
        this.loginDetails = await Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.ContrID = this.loginDetails[0].ContrID;
            this.ccopsId = this.loginDetails[0].CCOpsID;
            this.isReviewed = this.loginDetails[0].IsOwnerPrinciple;
        }
        if (this.loggedInUserType === 'Internal') {
            const loginDetailsInternal = this.loginDetailsInternal;
            this.resourceId = loginDetailsInternal.ResourceID;
            this.getReviewFinacialData();
        }
        this.getJson();
        this.checkPrivilegeForUser();
    }

    public onPageChange(state): void {
        this.pageSize = state.take;
    }

    public sliderChange(pageIndex: number): void {
        this.skip = (pageIndex - 1) * this.pageSize;
    }

    private async getReviewFinacialData() {
        this.reviewData = await this._srvFinancialeData.getFinancialReview(this.loginDetails[0]);
    }
    checkPrivilegeForUser() {
        // for user access privilege
        if (this.ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Financial Information');

            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.disableInternalAccess = true;
                } else {
                    this.hidePage = true;
                    const dialogRef = this._srvDialog.open({
                        content: DialogAlertsComponent,
                        appendTo: this.containerRef,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = ` <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Financial_Information.Financial_Alert_Access_Denied}</h2>
                    <p>${this.pageContent.Financial_Information.Financial_Alert_Access_Denied_Stmt}</p>
                   </div>`;
                    dialogRef.result.subscribe((val) => {
                        this._route.navigate(['contractorRegistration/company-information']);
                    });
                }
            }
        }
    }

    // this function gets the data which we have already sent for approval
    async getJsonForApprovalData() {
        const jsonReponse = await this._srvFinancialeData.getEventPageJSON(this.loginDetails[0]);
        this.dataForApproval = Object.keys(jsonReponse).length && jsonReponse[0].CCOpsData !== null ? JSON.parse(jsonReponse[0].CCOpsData).ContractorData.FinancialInformation : [];
        this.approvalJsonFinancial = JSON.parse(JSON.stringify(this.dataForApproval));
        this.loadGridData();
    }

    async getJson() {
        const dbDataResponse = await this._srvFinancialeData.getDbData(this.loginDetails[0]);
        // this condition is used to get data after post submit
        if (this.ContrID > 0) {
            this.forwardedData = dbDataResponse;

            if (this.forwardedData.hasOwnProperty('CompanyDetails')) {
                this.companyOpeningDate = this.forwardedData.CompanyDetails.ContractorOpeningDate;
                this.getCompanyOpeningDate();
            }
            if (this.forwardedData.hasOwnProperty('FinancialInformation') && this.forwardedData.FinancialInformation != null) {
                this.gridData = this.forwardedData.FinancialInformation;
                this.getJsonForApprovalData();
            }
        }
        // this code is used when data is coming from json before submit the application
        else {
            if (dbDataResponse) {
                this.forwardedData = dbDataResponse;
            }

            // if loggedin user in internal employee and wants to see the data of prospective contractor
            this._srvContrRegistration.funcInternalUserGoDirectlyToContractorPage(this.forwardedData.FinancialInformation, 'FinancialInformation');
            if (this.forwardedData.FinancialInformation === null && this.loggedInUserType === 'Internal') return;

            const companyData = await this._srvFinancialeData.getCompanyData(this.loginDetails[0]);
            this.forwardedData.CompanyDetails = companyData.CompanyDetails;

            if (this.forwardedData.hasOwnProperty('CompanyDetails')) {
                this.companyOpeningDate = this.forwardedData.CompanyDetails.ContractorOpeningDate;
                this.getCompanyOpeningDate();
            }
            if (this.forwardedData.hasOwnProperty('FinancialInformation') && this.forwardedData.FinancialInformation != null) {
                this.gridData = this.forwardedData.FinancialInformation;
            }
        }
    }

    public getCompanyOpeningDate() {
        // const date = new Date(this.companyOpeningDate);
        // const currentDate = new Date();
        const date = new Date(this.companyOpeningDate).getFullYear();
        const currentYear = new Date().getFullYear();
        this.diffYears = currentYear - date;
        // this.diffYears = this.diff_years(currentDate, date);
        // this.openingYear = date.getFullYear();
        // this.currentYear = currentDate.getFullYear();
        this.openingYear = date;
        this.currentYear = currentYear;
    }

    public diff_years(currentDate, date) {
        let diff = (currentDate.getTime() - date.getTime()) / 1000;
        diff /= 60 * 60 * 24;
        return Math.floor(diff / 365.25);
    }

    ngAfterViewInit() {
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

    // bind the financial data grid
    public loadGridData(): void {
        this.dataArr = [];
        // convert all text fields in integer for sorting purpose
        this.gridData.forEach((element) => {
            const obj = {
                ROW_NO: element.ROW_NO,
                FinancialYear: element.FinancialYear,
                FiscalYearFlag: element.FiscalYearFlag,
                FiscalYearStartDate: element.FiscalYearStartDate,
                TotalRevenue: element.TotalRevenue,
                TotalExpenses: element.TotalExpenses,
                NetIncome: element.NetIncome,
                TotalCurrentAssets: element.TotalCurrentAssets,
                TotalCurrentLiabilities: element.TotalCurrentLiabilities,
                LongTermDebt: element.LongTermDebt,
                Equity: element.Equity,

                CreditRatio:
                    ((element.TotalCurrentAssets * 100) / element.TotalCurrentLiabilities).toFixed(2) && element.TotalCurrentLiabilities === 0
                        ? 0
                        : ((element.TotalCurrentAssets * 100) / element.TotalCurrentLiabilities).toFixed(2),
                DebtToEquityRatio: ((element.LongTermDebt * 100) / element.Equity).toFixed(2) && element.Equity === 0 ? 0 : ((element.LongTermDebt * 100) / element.Equity).toFixed(2),

                // increase these parameters to show the visual cues on the columns
                isYear: false,
                isFiscalYearFlag: false,
                isFiscalYearStartDate: false,
                isTotalRevenue: false,
                isTotalExpenses: false,
                isNetIncome: false,
                isTotalCurrentAssets: false,
                isTotalCurrentLiabilities: false,
                isLongTermDebt: false,
                isEquity: false,
                isCredit: false,
                isDebtTo: false,
            };
            this.dataArr.push(obj);
        });
        this.gridData = this.dataArr;

        this.matchJsonToShowVisualCue();

        this.gridView = {
            data: orderBy(this.gridData, this.sort),
            total: this.gridData.length,
        };

        // this.heightCalculate();
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }

    // if there is some data is pending for approval match with the old json data
    // if data is not same means data is not approved yet
    public matchJsonToShowVisualCue() {
        if (this.dataForApproval !== undefined) {
            this.dataForApproval.forEach((element) => {
                for (const key of Object.keys(element)) {
                    const ind = this.gridData.findIndex((x) => x.FinancialYear === element.FinancialYear);
                    if (ind !== -1) {
                        const objGrid = this.gridData[ind];
                        for (const appKey in objGrid) {
                            if (appKey !== 'ROW_NO' && appKey === key) {
                                objGrid[appKey] = element[key];
                                if (appKey !== 'FinancialYear') {
                                    objGrid['is' + appKey] = true;
                                }
                                if (key === ('TotalCurrentAssets' || 'TotalCurrentLiabilities')) {
                                    objGrid['isCredit'] = true;
                                }
                                if (key === ('LongTermDebt' || 'Equity')) {
                                    objGrid['isDebtTo'] = true;
                                }
                            }
                        }
                    } else {
                        // this code is used when we send complete row for approval
                        const obj: VisualCueObject = {
                            ROW_NO: this.gridData.length + 1,
                            FinancialYear: element.FinancialYear,
                            FiscalYearFlag: element.FiscalYearFlag,
                            FiscalYearStartDate: element.FiscalYearStartDate,
                            TotalRevenue: element.TotalRevenue,
                            TotalExpenses: element.TotalExpenses,
                            NetIncome: element.NetIncome,
                            TotalCurrentAssets: element.TotalCurrentAssets,
                            TotalCurrentLiabilities: element.TotalCurrentLiabilities,
                            LongTermDebt: element.LongTermDebt,
                            Equity: element.Equity,

                            CreditRatio:
                                (element.TotalCurrentAssets * 100) / element.TotalCurrentLiabilities && element.TotalCurrentLiabilities === 0
                                    ? 0
                                    : (element.TotalCurrentAssets * 100) / element.TotalCurrentLiabilities,
                            DebtToEquityRatio: (element.LongTermDebt * 100) / element.Equity && element.Equity === 0 ? 0 : (element.LongTermDebt * 100) / element.Equity,

                            isYear: true,
                            isFiscalYearFlag: true,
                            isFiscalYearStartDate: true,
                            isTotalRevenue: true,
                            isTotalExpenses: true,
                            isNetIncome: true,
                            isTotalCurrentAssets: true,
                            isTotalCurrentLiabilities: true,
                            isLongTermDebt: true,
                            isEquity: true,
                            isCredit: true,
                            isDebtTo: true,
                        };
                        this.gridData.push(obj);
                    }
                }
            });
        }
    }

    // send and recieve data from financial info dialog and update data
    public openAddFinancialpopup(event, option, curData?) {
        const dialogRef = this._srvDialog.open({
            content: AddFinancialInfoDialogComponent,
            width: 600,
        });
        if (option === 'ADD') {
            const finInfo = dialogRef.content.instance;
            finInfo.openingYear = this.openingYear;
            finInfo.currentYear = this.currentYear;
            finInfo.wholeGridData = this.gridData;
            dialogRef.result.subscribe((r) => {
                const data = r['status'];
                this.financialResult(data, '');
            });
        } else if (option === 'EDIT') {
            this.selectedItem = curData;
            const finInfo = dialogRef.content.instance;
            finInfo.incomingData = this.selectedItem;
            // region disable functionality
            const indx = this.dataForApproval.findIndex((x) => x.FinancialYear === this.selectedItem.FinancialYear);
            finInfo.IsRowDisable = indx > -1 ? this.dataForApproval[indx]['IsRowDisable'] : false;
            // end region
            dialogRef.result.subscribe((r) => {
                const data = r['status'];
                const from = r['from'];
                this.financialResult(data, 'edit', from);
            });
        }
    }

    // this function is used to simplify code and used in openAddFinancialpopup() function
    async financialResult(data, option, from?) {
        if (data === 'cancel' && from === 'save') {
            if (this.loggedInUserType !== 'Internal' && this.ContrID > 0) {
                await this._srvContractorData.saveContractorData(
                    { currentPage: 'Financial Information Page', nextPage: 'financial-information' },
                    null,
                    'FinancialInfo/EditFinancialInfoEventJsonData'
                );
                this.crComments = await this._srvContractorData.getPageComments('Financial Information');
            }
        }
        if (data !== 'cancel') {
            const formData = data;
            const obj: FinancialInformation = {
                ROW_NO: option === 'edit' ? formData.ROW_NO : this.gridData.length + 1,
                FinancialYear: parseInt(formData.FINST_YR_DT, 10),
                FiscalYearFlag: formData.FISCALYEARFLG,
                FiscalYearStartDate: formData.FISCALYEARSTART === 'NaN-NaN-NaN' || formData.FISCALYEARSTART === 'Invalid date' ? null : formData.FISCALYEARSTART,
                TotalRevenue: parseFloat(formData.FINST_TOT_REVN_AM),
                TotalExpenses: parseFloat(formData.FINST_TOT_EXP_AM),
                NetIncome: parseFloat(formData.FINST_NET_INCM_AM),
                TotalCurrentAssets: parseFloat(formData.FINST_CURR_AST_AM),
                TotalCurrentLiabilities: parseFloat(formData.FINST_CURR_LIAB_AM),
                LongTermDebt: parseFloat(formData.FINST_LNG_TRM_DEBT_AM),
                Equity: parseFloat(formData.FINST_TOT_EQTY_AM),
                CreditRatio: formData.CRPercent,
                DebtToEquityRatio: formData.DTEPercent,
            };
            const index = this.gridData.findIndex((e) => e.FinancialYear === obj.FinancialYear);
            this.financialInformationObj = null;
            if (index === -1) {
                this.gridData.push(obj);

                // when insert new entry for approval
                if (this.ContrID > 0) {
                    this.matchJsonObjectsToSendForApproval('', obj, obj.FinancialYear);
                }
            } else {
                obj.ROW_NO = this.gridData[index].ROW_NO;
                // when updated some values for approval
                if (this.ContrID > 0) {
                    const oldData = this.forwardedData.FinancialInformation[index];
                    this.matchJsonObjectsToSendForApproval(oldData, obj, obj.FinancialYear);
                }
            }

            if (this.ContrID === 0) {
                this.financialInformationObj = obj;
                this.saveJsonData();
            }
        }
    }

    private comparewithDbData(oldData, updatedData) {
        const obj = {};
        if (oldData !== '' && oldData !== undefined) {
            for (const Key in updatedData) {
                // earlier was oldData
                if (Key !== 'CreditRatio' && Key !== 'DebtToEquityRatio') {
                    if (oldData[Key] !== updatedData[Key] || Key === 'FinancialYear') {
                        obj[Key] = updatedData[Key];
                    }
                }
            }
        } else {
            for (const Key in updatedData) {
                if (Key !== 'ROW_NO') {
                    obj[Key] = updatedData[Key];
                }
            }
        }
        return obj;
    }

    // this function is used to find updated values and create a json for approval
    public async matchJsonObjectsToSendForApproval(oldData, updatedData, financialYear) {
        // this block of code is used to find only the total updated key of json for
        const oldJsonData = JSON.parse(JSON.stringify(this.approvalJsonFinancial));
        let obj = {};
        if (this.loggedInUserType !== 'Internal') {
            const index = oldJsonData.findIndex((e) => e.FinancialYear === financialYear);
            if (oldData && oldData.hasOwnProperty('FiscalYearStartDate')) {
                oldData['FiscalYearStartDate'] =
                    oldData['FiscalYearStartDate'] === 'NaN-NaN-NaN' ||
                        oldData['FiscalYearStartDate'] === 'Invalid date' ||
                        oldData['FiscalYearStartDate'] == null ||
                        oldData['FiscalYearStartDate'] === ''
                        ? null
                        : moment(oldData['FiscalYearStartDate']).format('MM-DD-YYYY');
            }
            if (index > -1) {
                if (oldJsonData.hasOwnProperty('FiscalYearStartDate')) {
                    oldJsonData[index]['FiscalYearStartDate'] =
                        oldJsonData[index]['FiscalYearStartDate'] === 'NaN-NaN-NaN' ||
                            oldJsonData[index]['FiscalYearStartDate'] === 'Invalid date' ||
                            oldJsonData[index]['FiscalYearStartDate'] == null ||
                            oldJsonData[index]['FiscalYearStartDate'] === ''
                            ? null
                            : moment(oldJsonData[index]['FiscalYearStartDate']).format('MM-DD-YYYY');
                }
                for (const Key in updatedData) {
                    if (Key !== 'CreditRatio' && Key !== 'DebtToEquityRatio' && Key !== 'ROW_NO') {
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
                obj['FinancialYear'] = financialYear;
            } else {
                obj = this.comparewithDbData(oldData, updatedData);
            }
        } else {
            obj = this.comparewithDbData(oldData, updatedData);
        }

        if (this.loggedInUserType !== 'Internal') {
            if (Object.keys(obj).length === 1 && obj.hasOwnProperty('FinancialYear')) {
                obj = null;
            }
            const eventData = {
                FinancialInformation: [obj],
            };
            const finalObj = Object.keys(obj).length > 1 ? eventData : null;
            await this._srvContractorData.saveContractorData(
                { currentPage: 'Financial Information Page', nextPage: 'financial-information' },
                finalObj,
                'FinancialInfo/EditFinancialInfoEventJsonData'
            );
            this.crComments = await this._srvContractorData.getPageComments('Financial Information');
            this.dataForApproval = null;
            this.getJson();
            return;
        } else {
            const ind = this.dataForApproval.findIndex((x) => x.FinancialYear === obj['FinancialYear']);
            if (ind !== -1) {
                if (Object.keys(obj).length === 1 && obj.hasOwnProperty('FinancialYear')) {
                    this.dataForApproval.splice(ind, 1);
                } else {
                    this.dataForApproval[ind] = obj;
                }
            } else {
                this.dataForApproval.push(obj);
            }
        }

        // end of find updated key of json

        // this function is used only when logged in user is internal
        // employee and wants to updated the form.
        if (this.loggedInUserType === 'Internal') {
            this.sendJsonInternalEmployee();
        }

        // this block is common for contractor or internal employee
        const ccopsData = {
            FinancialInformation: this.dataForApproval,
        };
        if (this.loggedInUserType === 'Internal') {
            this.objProgram.Contr_ID = this.ContrID;
        }
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.CCOpsData = JSON.stringify(this.dataForApproval.length > 0 ? ccopsData : null);
        this.objProgram.PageName = 'Financial Information Page';
        this.objProgram.CCOpsID = this.ccopsId;
        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.ContractorResourceNumber = this.loginDetails[0].ContractorResourceID;
        this.objProgram.ContractorResourceID = this.loginDetails[0].ContractorResourceID;
        await this._srvFinancialeData.saveInternalData(this.objProgram);
        this.dataForApproval = [];
        this.getJson();
    }

    // this bunch of code is used to make json which is not updated by contractor and different from the master json
    public sendJsonInternalEmployee() {
        // dataForApprovalContractor is used when internal employee log in
        // and wants to updated some value but contractor already have some visual cue
        this.dataForApprovalContractor = JSON.parse(JSON.stringify(this.approvalJsonFinancial));
        if (this.loggedInUserType === 'Internal') {
            const arrayInternal: FinancialInformationApproval[] = [];
            this.dataForApproval.forEach((element) => {
                let index;
                if (this.dataForApprovalContractor != null || this.dataForApprovalContractor !== undefined) {
                    index = this.dataForApprovalContractor.findIndex((x) => x.FinancialYear === element.FinancialYear);
                } else {
                    index = -1;
                }
                let objInternal: FinancialInformationApproval = {};
                if (index !== -1) {
                    const oldDataContractor: FinancialInformationApproval = this.dataForApprovalContractor[index];
                    if (Object.keys(this.dataForApprovalContractor[index]).length !== Object.keys(element).length) {
                        for (const Key in element) {
                            if (!oldDataContractor.hasOwnProperty(Key) || Key === 'FinancialYear') {
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

    // save Json Data
    async saveJsonData() {
        this.financialInformationObj = {
            ...this.financialInformationObj,
            ResourceId: this.resourceId,
            CCopsId: this.loginDetails[0].CCOpsID,
            LastPageVisited: 'financial-information',
        };

        await this._srvFinancialeData.saveData(this.financialInformationObj);
        this.getJson();
    }

    public onSaveNext() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event') {
            this.saveDataAndMoveNext();
            return;
        }
        if (this.loggedInUserType === 'Internal' || (this.ContrID > 0 && this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal')) {
            this._route.navigate(['/contractorRegistration/reference-information']);
        } else {
            this.saveDataAndMoveNext();
        }
    }

    async saveDataAndMoveNext() {
        this.isFinalSaveButton = true;
        if (this.diffYears > 0) {
            if (this.gridData.length < 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">

                    <p>${this.pageContent.Financial_Information.Financial_Alert_Add_One_Record}</p>
                </div>
            `;
                return dialogRef;
            } else if (this.diffYears <= 3 && this.gridData.length <= this.diffYears - 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Financial_Information.Financial_Alert_Please_Add} ${this.diffYears} ${this.pageContent.Financial_Information.Financial_Alert_Years_Data}</p>
                </div>
            `;

                return dialogRef;
            } else if (this.diffYears > 3 && this.gridData.length < 3) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">

                    <p>${this.pageContent.Financial_Information.Financial_Alert_Three_Years_Data}</p>
                </div>
            `;
                return dialogRef;
            } else {
                if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                    await this._srvContractorData.saveContractorData(
                        { currentPage: 'Financial Information Page', nextPage: 'reference-information' },
                        null,
                        'FinancialInfo/EditFinancialInfoEventJsonData'
                    );
                    this._route.navigate(['/contractorRegistration/reference-information']);
                } else {
                    this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'reference-information' : 'financial-information');
                }
            }
        } else if (this.currentYear === this.openingYear && this.diffYears === 0 && this.gridData.length < 1) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">

                <p>${this.pageContent.Financial_Information.Financial_Alert_Add_Current_Year}</p>
            </div>
        `;
            return dialogRef;
        } else {
            if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                await this._srvContractorData.saveContractorData(
                    { currentPage: 'Financial Information Page', nextPage: 'reference-information' },
                    null,
                    'FinancialInfo/EditFinancialInfoEventJsonData'
                );
                this._route.navigate(['/contractorRegistration/reference-information']);
            } else {
                this.funcToSaveLastPage(this.isFinalSaveButton === true ? 'reference-information' : 'financial-information');
            }
        }
    }

    async funcToSaveLastPage(lastPage) {
        if (this.loggedInUserType === 'Internal') {
            this._route.navigate(['/contractorRegistration/job-volume-information']);
        } else {
            await this._srvContrRegistration.saveLastPageVisited(lastPage);
            this._route.navigate(['/contractorRegistration/' + lastPage]);
        }
    }

    public async onBack() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData({ currentPage: 'Financial Information Page', nextPage: 'job-volume-information' }, null, 'FinancialInfo/EditFinancialInfoEventJsonData');
            this._route.navigate(['/contractorRegistration/job-volume-information']);
            return;
        }
        this.funcToSaveLastPage('job-volume-information');
    }
    public async reviewFinancial() {
        const obj = {
            CONTR_ID: this.ContrID,
            LoggedInResourceID: this.resourceId,
        };
        await this._srvFinancialeData.saveFinancialReview(obj);
        this.getReviewFinacialData();
    }
}
