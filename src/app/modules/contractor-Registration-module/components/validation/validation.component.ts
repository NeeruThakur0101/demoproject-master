import { ContractorDataService } from './../../../../core/services/contractor-data.service';
import { ValidationService } from './validation.service';
import { UniversalService } from './../../../../core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PageAccess, AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { SaveAlertComponent } from './../../../../shared-module/components/save-alert.component';
import { Component, OnInit, AfterViewInit, ViewEncapsulation, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { DialogService, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { OwnershipPageDialogComponent } from '../../dialogs/ownership-page-dialog/ownership-page-dialog.component';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SortDescriptor, orderBy, filterBy, distinct, CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { SelectApplicationModel } from '../../models/data-model';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import * as moment from 'moment';
import {
    CompanyDetails,
    ContactDetails,
    DisableEvent,
    EditObj,
    ModelInfo,
    OwnershipDataObj,
    OwnershipDetails,
    OwnershipInformationList,
    OwnershipInformationListOptional,
    ValidationInfo,
    VeteranMilitaryAffiliationData,
    VisualCue,
} from './model';
import { DeviceObj, LoginUser, PageObj } from 'src/app/core/models/user.model';
import { StorageService } from 'src/app/core/services/storage.service';
import { OwnershipInformationService } from '../ownership-information/ownership-information.service';
import { OwnerRoleStruct } from '../ownership-information/ownership.model';
@Component({
    selector: 'app-validation',
    templateUrl: './validation.component.html',
    styleUrls: ['./validation.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ValidationComponent implements OnInit, AfterViewInit {
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
    public skip = 0;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public info: boolean = true;
    public type: 'numeric';
    public previousNext: boolean = true;
    public data: OwnershipInformationList[] = [];
    public model: ModelInfo = {
        dbaName: '',
        taxId: '',
        cName: '',
        cEmail: '',
        companyName: '',
        cPhone: '',
    };
    public federalMask: string = '00-0000000';
    public mobileNumberMask: string = '000-000-0000';
    public ownershipForm: FormGroup;
    public checked: boolean = true;
    public unchecked: boolean = false;
    public loadData: boolean = false;
    public opened: boolean = false;
    public submitted: boolean = false;
    public showExchangeSymbolSection: boolean = false;
    public forwardedData: ValidationInfo;
    public oldRecord: ValidationInfo;
    public ownershipData: OwnershipDetails;
    public personnelData: OwnershipInformationList[] = [];
    public objProgram = new SelectApplicationModel();
    public allowUnsort: boolean = true;
    public disableAddOwnerPrinciple: boolean = true;

    public selectedItem: OwnershipInformationList;
    public gridView: GridDataResult;
    public ownershipDataObj: OwnershipDataObj;
    public accountId: number;
    public resourceId: number;
    public companyName: string;
    public dataArr: OwnershipInformationList[] = [];
    public dbaName: string = '';
    public taxId: string = '';
    public cName: string = '';
    public cPhone: string = '';
    public cEmail: string = '';
    public taxLabel: string;
    public loginDetails: Array<SessionUser> = []; //  Array<LoginUser> = [];
    public countryId: number;
    public pageContent: any;
    readonlyMode: boolean = false;
    loggedInUserType: string;
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };
    public hidePage: boolean = false;
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid: OwnershipInformationList[] = filterBy(this.dataArr, this.filter);
    public visualProperties: string[];
    public checkVisualCueExists: boolean = false;
    public disableEvent: DisableEvent;
    public visualCue: VisualCue = {
        YearsInCurrentOwnershipCue: false,
        MonthsInCurrentOwnership: false,
        OwnershipStructure: false,
        ExchangeListing: false,
        StockSymbol: false,
        ActiveFlag: false,
        ContactEmailCue: false,
        ContactPhoneCue: false,
        VeteranEmployeeMilitaryAffiliationCue: false,
        SocialSecurityNumberCue: false,
        DrivingLicenseCue: false,
        DateOfBirthCue: false,
        OwnershipPercentageCue: false,
        IsContractorActiveCue: false,
        VeteranFlagCue: false,
        VeteranEmployeeHireDateCue: false,
        LegalIssueFlagCue: false,
        ActiveFlagCue: false,
        OwnershipNameCue: false,
        ContrEmployeeTypeIdCue: false,
    };
    public editedData: OwnershipDetails;
    public properties = [
        'OwnershipNumber',
        'ID',
        'OwnershipName',
        'ContrEmployeeTypeId',
        'ContactEmail',
        'ContactPhone',
        'VeteranEmployeeMilitaryAffiliation',
        'SocialSecurityNumber',
        'DrivingLicense',
        'DateOfBirth',
        'OwnershipPercentage',
        'IsContractorActive',
        'VeteranFlag',
        'VeteranEmployeeHireDate',
        'VeteranMilitaryAffiliationData',
        'LegalIssueFlag',
        'ActiveFlag',
    ];
    mergedData: ValidationInfo;
    keepEditedData: OwnershipDetails;
    ownerRole: OwnerRoleStruct[];
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.dataArr, filter);
    }
    public distinctPrimitive(fieldName: string) {
        return distinct(this.dataArr, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        private _srvContractorRegistration: ContractorRegistrationService,
        private _router: Router,
        public _srvAuthentication: AuthenticationService,
        private _deviceService: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private _language: InternalUserDetailsService,
        private _srvValidation: ValidationService,
        private _srvContractorData: ContractorDataService,
        private _srvStorage: StorageService,
        private renderer: Renderer2,
        private _srvOwnership: OwnershipInformationService
    ) {
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.countryId = this.loginDetails[0].CountryID;

        this.ownershipForm = this._formBuilder.group({
            OwnershipStructure: [null, Validators.required],
            ExchangeListing: [null, Validators.required],
            StockSymbol: [null, Validators.required],
            YearsInCurrentOwnership: [null, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
            MonthsInCurrentOwnership: [null, [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        });

        this.pageContent = this._language.getPageContentByLanguage();
    }

    // page size change
    public sliderChange(pageIndex: number): void {
        this.skip = (pageIndex - 1) * this.pageSize;
    }
    // page change
    public pageChange({ skip, take }: PageChangeEvent): void {
        this.pageSize = take;
    }
    // sort
    public sortChange(sort: SortDescriptor[]): void {
        this.sort = sort;
        this.loadProducts();
    }
    // loading grid data
    private loadProducts(): void {
        this.dataArr = [];
        this.data.forEach((dataElement) => {
            if (dataElement.ContrEmployeeTypeId !== 0) {
                for (const role of this.ownerRole) {
                    if (dataElement.ContrEmployeeTypeId === role.ContrEmployeeTypeID) {
                        dataElement.ContrEmployeeTypeId = role.ContractorEmployeeTypeTranslated;
                    }
                }
                // if (dataElement.ContrEmployeeTypeId === 1) {
                //     dataElement.ContrEmployeeTypeId = 'Principal';
                // } else if (dataElement.ContrEmployeeTypeId === 2) {
                //     dataElement.ContrEmployeeTypeId = 'Owner';
                // } else if (dataElement.ContrEmployeeTypeId === 9) {
                //     dataElement.ContrEmployeeTypeId = 'Primary Owner';
                // }
            }
            if (dataElement.ContrEmployeeTypeId !== 0 && dataElement.IsContractorActive === 'Y') {
                // contrA = 'Y'
                dataElement.OwnershipPercentage = parseInt(dataElement.OwnershipPercentage, 10);
                this.dataArr.push(dataElement);
            }
        });
        this.gridView = {
            data: orderBy(this.dataArr.slice(this.skip, this.skip + this.pageSize), this.sort),
            total: this.dataArr.length,
        };

        this.loadData = false;
    }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    public async ownerData() {
        const ownData = await this._srvOwnership.getOwnData(this.resourceId, this._srvAuthentication.currentLanguageID);
        this.ownerRole = ownData.OwnerRole;
    }

    public ngOnInit() {
        // mobile device
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

        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this.readonlyMode = true;
        }

        // fetch user access privilege
        if (this.loginDetails[0].ContrID > 0) {
            this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Validation');
            if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) {
                this.readonlyMode = true;
            } else {
            }
        }
        this.callMain();
        setTimeout(() => {
            this.heightCalculate();
        }, 1000);
        this.ownerData();
    }

    async callMain() {
        this.loadData = true;
        this.data = [];
        this.personnelData = [];
        let res: ValidationInfo;
        if (this._srvAuthentication.Profile.ContrID > 0) {
            res = await this._srvValidation.getValidationContractorData({ contrID: this._srvAuthentication.Profile.ContrID, pageName: 'Event Validation Page', resourceID: this.resourceId });
            res.OwnershipDetails.OwnershipInformationList.map((el, index) => (el.ID = index + 1));
            this.oldRecord = JSON.parse(JSON.stringify(res));
        } else {
            const CompanyDetail = await this._srvValidation.getCompanyDetails({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
            const ContactDetail = await this._srvValidation.getContactDetails({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
            const OwnershipDetail = await this._srvValidation.getOwnershipDetails({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
            res = { ...CompanyDetail, ...ContactDetail, ...OwnershipDetail };
            this.oldRecord = JSON.parse(JSON.stringify(res));
        }
        this.processPageData(res);
        if (this._srvAuthentication.Profile.ContrID > 0) {
            this.getPendingApprovalData();
        }
    }

    // bind page data from DB
    public processPageData(res) {
        this._srvContractorRegistration.funcInternalUserGoDirectlyToContractorPage(res.OwnershipDetails, 'OwnershipDetails');
        if (this.loggedInUserType === 'Internal' && res.OwnershipDetails === null && this._srvAuthentication.Profile.ContrID <= 0) return;
        this.forwardedData = JSON.parse(JSON.stringify(res));
        this.model.dbaName = this.forwardedData.CompanyDetails.CompanyLegalName;
        this.model.taxId = this.forwardedData.CompanyDetails.ContractorFederalTaxNumber;
        this.model.cName = this.forwardedData.ContactDetails.CrawfordContractorConnectionContactName;
        this.model.cPhone = this.forwardedData.ContactDetails.CrawfordContractorConnectionContactNumber;
        this.model.cEmail = this.forwardedData.ContactDetails.CrawfordContractorConnectionContactEmail;
        this.model.companyName = this.forwardedData.CompanyDetails.CompanyLegalName;

        this._srvContractorRegistration.sendSingleSource(this.forwardedData);
        if (this.forwardedData.hasOwnProperty('OwnershipDetails')) {
            this.ownershipData = this.forwardedData.OwnershipDetails;
            if (this.ownershipData.OwnershipStructure === 2 || this.ownershipData.OwnershipStructure === 1 || this.ownershipData.OwnershipStructure === null) {
                this.showExchangeSymbolSection = true;
            } else {
                this.showExchangeSymbolSection = false;
                this.disableAddOwnerPrinciple = false;
            }
            this.ownershipData.OwnershipInformationList.forEach((value) => {
                value.ContrEmployeeTypeId === -1 || value.ActiveFlag === true ? (value.ActiveFlag = true) : (value.ActiveFlag = false);
                value.VeteranFlag === true || value.VeteranFlag === 'Y' ? (value.VeteranFlag = 'Y') : (value.VeteranFlag = 'N');
                value.LegalIssueFlag === true || value.LegalIssueFlag === 'Y' ? (value.LegalIssueFlag = 'Y') : (value.LegalIssueFlag = 'N');

                this.data.push(value);
                this.personnelData.push(value);
            });
            this.loadProducts();
            this._srvContractorRegistration.ownershipPercentageCalculation(this.personnelData);
            this.ownershipForm.setValue({
                OwnershipStructure: this.ownershipData.OwnershipStructure,
                ExchangeListing: this.ownershipData.ExchangeListing,
                StockSymbol: this.ownershipData.StockSymbol,
                YearsInCurrentOwnership: this.ownershipData.YearsInCurrentOwnership,
                MonthsInCurrentOwnership: this.ownershipData.MonthsInCurrentOwnership,
            });
        }
    }

    // fetch Data that is pending for approval
    public async getPendingApprovalData() {
        this.loadData = true;
        let companyData = await this._srvValidation.getEventPageJSONData('CompanyInfo/GetCompanyEventJson', 'Company Information Page');
        let contactData = await this._srvValidation.getEventPageJSONData('ContactInfo/GetContactEventJson', 'Contact Information Page');
        const ownershipData = await this._srvValidation.getEventPageJSONData('OwnershipInformation/GetOwnershipEventJson', 'Ownership Information Page');
        companyData = companyData.length && companyData[0].CCOpsData ? JSON.parse(companyData[0].CCOpsData).ContractorData : [];
        contactData = contactData.length && contactData[0].CCOpsData ? JSON.parse(contactData[0].CCOpsData).ContractorData : [];
        const ownershipDataDetail = ownershipData.length && ownershipData[0].CCOpsData ? JSON.parse(ownershipData[0].CCOpsData).ContractorData : [];
        this.editedData = ownershipDataDetail.OwnershipDetails ? JSON.parse(JSON.stringify(ownershipDataDetail.OwnershipDetails)) : {};
        this.keepEditedData = ownershipDataDetail.OwnershipDetails ? JSON.parse(JSON.stringify(ownershipDataDetail.OwnershipDetails)) : {};
        this.disableEvent = {
            IsCrawfordContractorConnectionContactNameDisable: contactData.hasOwnProperty('ContactDetails') ? contactData.ContactDetails.IsCrawfordContractorConnectionContactNameDisable : false,
            IsCrawfordContractorConnectionContactNumberDisable: contactData.hasOwnProperty('ContactDetails') ? contactData.ContactDetails.IsCrawfordContractorConnectionContactNumberDisable : false,
            IsCrawfordContractorConnectionContactEmailDisable: contactData.hasOwnProperty('ContactDetails') ? contactData.ContactDetails.IsCrawfordContractorConnectionContactEmailDisable : false,
            IsCompanyNameDisable: companyData.hasOwnProperty('CompanyDetails') ? companyData.CompanyDetails.IsCompanyNameDisable : false,
            IsContractorFederalTaxNumberDisable: companyData.hasOwnProperty('CompanyDetails') ? companyData.CompanyDetails.IsContractorFederalTaxNumberDisable : false,
        };
        this.mergedData = { ...companyData, ...contactData, ...ownershipDataDetail };
        this.visualCueProcess();
    }

    // function to process data and attach visual cue on changed properties
    public visualCueProcess() {
        this.processCompany();
        this.processContact();
        this.processOwnership();
    }

    public processCompany() {
        this.model.dbaNameVC = false;
        this.model.taxIdVC = false;
        if (this.mergedData && this.mergedData.CompanyDetails) {
            if (this.mergedData.CompanyDetails.CompanyLegalName) {
                this.model.dbaName = this.mergedData.CompanyDetails.CompanyLegalName;
                this.model.dbaNameVC = true;
            }
            if (this.mergedData.CompanyDetails.ContractorFederalTaxNumber) {
                this.model.taxId = this.mergedData.CompanyDetails.ContractorFederalTaxNumber;
                this.model.taxIdVC = true;
            }
        }
    }
    public processContact() {
        this.model.cNameVC = false;
        this.model.cPhoneVC = false;
        this.model.cEmailVC = false;
        if (this.mergedData && this.mergedData.ContactDetails) {
            if (this.mergedData.ContactDetails.CrawfordContractorConnectionContactName) {
                this.model.cName = this.mergedData.ContactDetails.CrawfordContractorConnectionContactName;
                this.model.cNameVC = true;
            }
            if (this.mergedData.ContactDetails.CrawfordContractorConnectionContactNumber) {
                this.model.cPhone = this.mergedData.ContactDetails.CrawfordContractorConnectionContactNumber;
                this.model.cPhoneVC = true;
            }
            if (this.mergedData.ContactDetails.CrawfordContractorConnectionContactEmail) {
                this.model.cEmail = this.mergedData.ContactDetails.CrawfordContractorConnectionContactEmail;
                this.model.cEmailVC = true;
            }
        }
    }
    public processOwnership() {
        this.data = [];
        this.personnelData = [];
        this.forwardedData.OwnershipDetails.OwnershipInformationList.map((el, index) => (el.ID = index + 1));
        if (this.mergedData.OwnershipDetails && this.mergedData.OwnershipDetails.OwnershipStructure) {
            const pendingOwnershipData = this.mergedData.OwnershipDetails.OwnershipStructure;
            if (pendingOwnershipData === 2 || pendingOwnershipData === 1 || pendingOwnershipData === null) {
                this.showExchangeSymbolSection = true;
            } else {
                this.showExchangeSymbolSection = false;
                this.disableAddOwnerPrinciple = false;
            }
        }

        if (this.mergedData && this.mergedData.OwnershipDetails && this.mergedData.OwnershipDetails.OwnershipInformationList) {
            this.mergedData.OwnershipDetails.OwnershipInformationList.forEach((t) => {
                for (const [idx, obj] of this.forwardedData.OwnershipDetails.OwnershipInformationList.entries()) {
                    const foundIndex = this.forwardedData.OwnershipDetails.OwnershipInformationList.findIndex((el) => el.ID === t.ID && el.OwnershipNumber === t.OwnershipNumber);
                    if (foundIndex !== -1) {
                        Object.keys(t).map((el) => (t[el + 'Cue'] = true));
                        if (
                            t.VeteranMilitaryAffiliationData &&
                            t.VeteranMilitaryAffiliationData.length &&
                            this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData &&
                            this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData.length
                        ) {
                            // t.VeteranMilitaryAffiliationData.forEach((vele) => {
                            //     Object.keys(vele).map((el) => (vele[el + 'Cue'] = true));
                            //     // tslint:disable-next-line:no-shadowed-variable
                            //     for (const [idx, obj] of this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData.entries()) {
                            //         const foundVIndex = this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData.findIndex(
                            //             (el) => el.MilitaryAffiliationNumber === vele.MilitaryAffiliationNumber && el.ContractorVeteranEmployeeNumber === vele.ContractorVeteranEmployeeNumber
                            //         );
                            //         if (foundVIndex !== -1) {
                            //             this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData[foundVIndex] = {
                            //                 ...this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData[foundVIndex],
                            //                 ...vele,
                            //             };
                            //         } else {
                            //             this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData.push(vele);
                            //         }
                            //     }
                            // });
                            this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData = t.VeteranMilitaryAffiliationData;
                            this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationDataCue = true;
                        } else {
                            if (t.VeteranMilitaryAffiliationData) {
                                t.VeteranMilitaryAffiliationData.forEach((vele) => {
                                    Object.keys(vele).map((el) => (vele[el + 'Cue'] = true));
                                });
                                this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData = t.VeteranMilitaryAffiliationData;
                            }
                        }
                        delete t.VeteranMilitaryAffiliationData;
                        this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex] = { ...this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex], ...t };
                        return;
                    }
                }
                Object.keys(t).map((el) => (t[el + 'Cue'] = true));
                this.forwardedData.OwnershipDetails.OwnershipInformationList.push(t);
            });
        }
        if (this._srvAuthentication.Profile.ContrID > 0) {
            this.visualCue = this._srvContractorRegistration.gridDifferenceCue(this.oldRecord.OwnershipDetails, this.forwardedData.OwnershipDetails);
            if (this.visualCue.OwnershipInformationList.length > 0) {
                this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((elem, index) => {
                    if (elem.IsContractorActive === 'Y' && elem.OwnershipPercentage !== 0 && this.dataArr.length === 1) {
                        // contrA = 'Y'
                        this.visualCue.OwnershipInformationList = this.visualCue.OwnershipInformationList.filter((el) => el.ID === elem.ID);
                    } else if (elem.IsContractorActive === 'Y' && elem.OwnershipPercentage !== 0 && this.dataArr.length > 1) {
                        // contrA = 'Y'
                        this.visualCue.OwnershipInformationList.map((el) => el.ID === elem.ID);
                    }
                });
            }

            this.forwardedData = JSON.parse(JSON.stringify(this.forwardedData));
            if (this.visualCue.OwnershipInformationList.length > 0) {
                this.visualProperties = [
                    'OwnershipNumberCue',
                    'IDCue',
                    'OwnershipNameCue',
                    'ContrEmployeeTypeIdCue',
                    'ContactEmailCue',
                    'ContactPhoneCue',
                    'VeteranEmployeeMilitaryAffiliationCue',
                    'SocialSecurityNumberCue',
                    'DrivingLicenseCue',
                    'DateOfBirthCue',
                    'OwnershipPercentageCue',
                    'IsContractorActiveCue',
                    'VeteranFlagCue',
                    'VeteranEmployeeHireDateCue',
                    'LegalIssueFlagCue',
                    'ActiveFlagCue',
                    'VeteranMilitaryAffiliationDataCue',
                ];

                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < this.visualCue.OwnershipInformationList.length; i++) {
                    const existingKey = this.pick(this.visualCue.OwnershipInformationList[i], this.visualProperties);

                    for (const k in existingKey) {
                        if (existingKey[k] === true) {
                            this.checkVisualCueExists = true;
                            break;
                        } else {
                            this.checkVisualCueExists = false;
                        }
                    }
                }
            }

            this.visualCue.OwnershipInformationList = this.visualCue.OwnershipInformationList.filter(
                (cue) => !cue.hasOwnProperty('OwnershipNameCueCue') && cue.ID !== 1 && cue.IsContractorActive === 'Y'
            ); // contrA = 'Y'
            for (let i = 0; i < this.visualCue.OwnershipInformationList.length; i++) {
                const existingKey = this.pick(this.visualCue.OwnershipInformationList[i], this.visualProperties);
                this.visualCue.OwnershipInformationList[i] = existingKey;
            }
            this.visualCue.OwnershipInformationList.forEach((el, index) => {
                this.dataArr[index] = { ...this.dataArr[index], ...el };
            });
        }
        this.dataArr.forEach((dataElement) => {
            if (dataElement.ContrEmployeeTypeId !== 0) {
                for (const role of this.ownerRole) {
                    if (dataElement.ContrEmployeeTypeId === role.ContrEmployeeTypeID) {
                        dataElement.ContrEmployeeTypeId = role.ContractorEmployeeTypeTranslated;
                    }
                }
                // if (dataElement.ContrEmployeeTypeId === 1) {
                //     dataElement.ContrEmployeeTypeId = 'Principal';
                // } else if (dataElement.ContrEmployeeTypeId === 2) {
                //     dataElement.ContrEmployeeTypeId = 'Owner';
                // } else if (dataElement.ContrEmployeeTypeId === 9) {
                //     dataElement.ContrEmployeeTypeId = 'Primary Owner';
                // }
            }
        });

        this._srvContractorRegistration.sendSingleSource(this.forwardedData);
        if (this.forwardedData.hasOwnProperty('OwnershipDetails')) {
            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((value) => {
                value.ContrEmployeeTypeId === -1 || value.ActiveFlag === true ? (value.ActiveFlag = true) : (value.ActiveFlag = false);
                value.VeteranFlag === true || value.VeteranFlag === 'Y' ? (value.VeteranFlag = 'Y') : (value.VeteranFlag = 'N');
                value.LegalIssueFlag === true || value.LegalIssueFlag === 'Y' ? (value.LegalIssueFlag = 'Y') : (value.LegalIssueFlag = 'N');

                this.data.push(value);
                this.personnelData.push(value);
            });
            this.loadProducts();
            this._srvContractorRegistration.ownershipPercentageCalculation(this.personnelData);
        }
    }

    // back to surge
    async backEvent() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData({ currentPage: 'Company Information Page', nextPage: 'credential' }, null, 'CompanyInfo/EditEventCompanyInfo');
            this._router.navigate(['/existing-contractor/credentialing-info']);
            return;
        }
    }

    // submit event data
    async submitEvent(form) {
        if (!form.valid) {
            return;
        }
        this.loadData = true;
        // company logic
        const companyObj: CompanyDetails = {};
        if (this.mergedData && this.mergedData.CompanyDetails) {
            if (this.mergedData.CompanyDetails.CompanyLegalName && this.mergedData.CompanyDetails.CompanyLegalName !== form.value.dbaName) {
                companyObj.CompanyLegalName = form.value.dbaName;
            } else if (!this.mergedData.CompanyDetails.CompanyLegalName && this.forwardedData.CompanyDetails.CompanyLegalName !== form.value.dbaName) {
                companyObj.CompanyLegalName = form.value.dbaName;
            }
            if (this.mergedData.CompanyDetails.ContractorFederalTaxNumber && this.mergedData.CompanyDetails.ContractorFederalTaxNumber !== form.value.taxId) {
                companyObj.ContractorFederalTaxNumber = form.value.taxId;
            } else if (!this.mergedData.CompanyDetails.ContractorFederalTaxNumber && this.forwardedData.CompanyDetails.ContractorFederalTaxNumber !== form.value.taxId) {
                companyObj.ContractorFederalTaxNumber = form.value.taxId;
            }
        } else {
            if (this.forwardedData.CompanyDetails.CompanyLegalName !== form.value.dbaName) {
                companyObj.CompanyLegalName = form.value.dbaName;
            }
            if (this.forwardedData.CompanyDetails.ContractorFederalTaxNumber !== form.value.taxId) {
                companyObj.ContractorFederalTaxNumber = form.value.taxId;
            }
        }

        // contact logic
        const contactObj: ContactDetails = {};
        if (this.mergedData && this.mergedData.ContactDetails) {
            if (this.mergedData.ContactDetails.CrawfordContractorConnectionContactName && this.mergedData.ContactDetails.CrawfordContractorConnectionContactName !== form.value.cName) {
                contactObj.CrawfordContractorConnectionContactName = form.value.cName;
            } else if (!this.mergedData.ContactDetails.CrawfordContractorConnectionContactName && this.forwardedData.ContactDetails.CrawfordContractorConnectionContactName !== form.value.cName) {
                contactObj.CrawfordContractorConnectionContactName = form.value.cName;
            }

            if (this.mergedData.ContactDetails.CrawfordContractorConnectionContactNumber && this.mergedData.ContactDetails.CrawfordContractorConnectionContactNumber !== form.value.cPhone) {
                contactObj.CrawfordContractorConnectionContactNumber = form.value.cPhone;
            } else if (!this.mergedData.ContactDetails.CrawfordContractorConnectionContactNumber && this.forwardedData.ContactDetails.CrawfordContractorConnectionContactNumber !== form.value.cPhone) {
                contactObj.CrawfordContractorConnectionContactNumber = form.value.cPhone;
            }

            if (this.mergedData.ContactDetails.CrawfordContractorConnectionContactEmail && this.mergedData.ContactDetails.CrawfordContractorConnectionContactEmail !== form.value.cEmail) {
                contactObj.CrawfordContractorConnectionContactEmail = form.value.cEmail;
            } else if (!this.mergedData.ContactDetails.CrawfordContractorConnectionContactEmail && this.forwardedData.ContactDetails.CrawfordContractorConnectionContactEmail !== form.value.cEmail) {
                contactObj.CrawfordContractorConnectionContactEmail = form.value.cEmail;
            }
        } else {
            if (this.forwardedData.ContactDetails.CrawfordContractorConnectionContactName !== form.value.cName) {
                contactObj.CrawfordContractorConnectionContactName = form.value.cName;
            }
            if (this.forwardedData.ContactDetails.CrawfordContractorConnectionContactNumber !== form.value.cPhone) {
                contactObj.CrawfordContractorConnectionContactNumber = form.value.cPhone;
            }
            if (this.forwardedData.ContactDetails.CrawfordContractorConnectionContactEmail !== form.value.cEmail) {
                contactObj.CrawfordContractorConnectionContactEmail = form.value.cEmail;
            }
        }
        if (Object.keys(companyObj).length > 0) {
            await this._srvContractorData.saveContractorData(
                { currentPage: 'Company Information Page', nextPage: 'company-information' },
                { CompanyDetails: companyObj },
                'CompanyInfo/EditEventCompanyInfo'
            );
        }
        if (Object.keys(contactObj).length > 0) {
            await this._srvContractorData.saveContractorData(
                { currentPage: 'Contact Information Page', nextPage: 'company-information' },
                { ContactDetails: contactObj },
                'ContactInfo/EditEventContactInfo'
            );
        }
        await this._srvContractorData.saveContractorData({ currentPage: 'Contact Information Page', nextPage: 'company-information' }, null, 'ContactInfo/EditEventContactInfo');
        const submitResponse = await this._srvContractorData.submitEventData();
        this.messageToUser(submitResponse);
        this.loadData = false;
    }

    public eventName(eventName) {
        if (eventName === 'RECERTIFICATION') return this.pageContent.General_Keys.Recertification;
        if (eventName === 'APP UPDATE') return this.pageContent.General_Keys.App_Update;
        if (eventName === 'APP UPDATE CORRECTION REQUEST') return this.pageContent.General_Keys.App_Update_Correction;
        if (eventName === 'APPLICATION CORRECTION REQUEST') return this.pageContent.General_Keys.Application_Correction_Request;
        if (eventName === 'TERRITORY COORDINATOR CORRECTION REQUEST') return this.pageContent.General_Keys.Territory_Coordinator_Correction_Request;
    }

    // message for success/failure of data saving
    public messageToUser(res: number) {
        const message =
            res === 1
                ? `${this.eventName(this._srvAuthentication.Profile.EventName.toUpperCase())} ${this.pageContent.General_Keys.done_successfully}`
                : `${this.pageContent.General_Keys.something_went_wrong}`;
        const className = res === 1 ? 'modal-alert confirmation-alert' : 'modal-alert info-alert';

        const dialogRef = this._dialogService.open({
            content: DialogAlertsComponent,
            width: 550,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="${className}">
                                    <h2 *ngIf="res==1">${this.pageContent.Validation_Info.Success}</h2>
                                    <p>${message}</p>
                                </div>
                            `;
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && res === 1) {
            dialogRef.result.subscribe(() => {
                this._srvStorage.clearStorage();
                this._router.navigate(['/login']);
            });
        }
    }

    //  getter for easy access to form fields
    get ownershipInfoFormControl() {
        return this.ownershipForm.controls;
    }

    // Submit   Functionality
    async onSubmit() {
        this.forwardedData.OwnershipDetails.OwnershipInformationList.map((roleType) => {
            for (const role of this.ownerRole) {
                if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                    roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                }
            }
            // if (roleType.ContrEmployeeTypeId === 'Principal') {
            //     roleType.ContrEmployeeTypeId = 1;
            // } else if (roleType.ContrEmployeeTypeId === 'Owner') {
            //     roleType.ContrEmployeeTypeId = 2;
            // } else if (roleType.ContrEmployeeTypeId === 'Primary Owner') {
            //     roleType.ContrEmployeeTypeId = 9;
            // }
        });
        const objProgram = {
            OwnershipDetails: this.ownershipDataObj,
            CompanyDetails: {
                CompanyLegalName: this.model.dbaName,
                ContractorFederalTaxNumber: this.model.taxId,
            },
            ContactDetails: {
                CrawfordContractorConnectionContactName: this.model.cName,
                CrawfordContractorConnectionContactNumber: this.model.cPhone,
                CrawfordContractorConnectionContactEmail: this.model.cEmail,
            },
            ResourceId: this.resourceId,
            CCopsId: this.loginDetails[0].CCOpsID,
            LastPageVisited: 'signature-page',
        };
        this.loadData = true;
        await this._srvValidation.saveValidationPerspectiveContractor(objProgram);
        this.loadData = false;
        this._router.navigate(['/contractorRegistration/signature-page']);
    }

    // Edit  functionality
    public openDialogForm(selectedData?) {
        this.selectedItem = JSON.parse(JSON.stringify(selectedData));

        const dialogRef = this._dialogService.open({
            content: OwnershipPageDialogComponent,
            width: 550,
        });

        const contractorInfo = dialogRef.content.instance;
        contractorInfo.title = this.pageContent.Ownership_Info.Edit_Owner_Principal;
        contractorInfo.page = 'Validation';
        contractorInfo.isDeletedRecovered =
            this.selectedItem.IsDeletedFlag === true ||
                (this.selectedItem.hasOwnProperty('IsRecoveredFlag') && this.selectedItem.IsRecoveredFlag === true && this.loggedInUserType === 'Internal') ||
                (this.selectedItem.hasOwnProperty('IsRowDisable') && this.selectedItem.IsRowDisable === true && this.loggedInUserType !== 'Internal')
                ? true
                : false;
        const militaryAffs =
            this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData.length
                ? this.selectedItem.VeteranMilitaryAffiliationData.map((el) => {
                    if (el.RemovedResourceID === null) return el.MilitaryAffiliationNumber;
                })
                : null;
        const empHireDate =
            this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData[0] && this.selectedItem.VeteranMilitaryAffiliationData.length
                ? moment(this.selectedItem.VeteranMilitaryAffiliationData[0].EmployeeHireDate, 'MM-DD-YYYY').format('MM-DD-YYYY')
                : null;
        contractorInfo.incomingData = {
            OwnershipNumber: this.selectedItem.OwnershipNumber,
            ID: this.selectedItem.ID,
            OwnershipName: this.selectedItem.OwnershipName,
            ContrEmployeeTypeId: this.getContrEmp(this.selectedItem, false), //this.selectedItem.ContrEmployeeTypeId === 'Principal' ? 1 : this.selectedItem.ContrEmployeeTypeId === 'Owner' ? 2 : 9,
            ContactEmail: this.selectedItem.ContactEmail,
            ContactPhone: this.selectedItem.ContactPhone,
            SocialSecurityNumber: this.selectedItem.SocialSecurityNumber,
            DrivingLicense: this.selectedItem.DrivingLicense,
            DateOfBirth: this.selectedItem.DateOfBirth,
            OwnershipPercentage: this.selectedItem.OwnershipPercentage,
            ActiveFlag: this.selectedItem.ActiveFlag,
            VeteranFlag: this.selectedItem.VeteranFlag === 'Y' ? true : false,
            VeteranEmployeeMilitaryAffiliation: militaryAffs,
            VeteranEmployeeHireDate: this.selectedItem.VeteranEmployeeHireDate,
            LegalIssueFlag: this.selectedItem.LegalIssueFlag === 'Y' ? true : false,
            VeteranMilitaryAffiliationData: this.selectedItem.VeteranMilitaryAffiliationData,
            IsContractorActive: this.selectedItem.IsContractorActive, // contrA = 'Y'
            OwnershipNameCue: this.selectedItem.OwnershipNameCue,
            ContactEmailCue: this.selectedItem.ContactEmailCue,
            ContrEmployeeTypeIdCue: this.selectedItem.ContrEmployeeTypeIdCue,
            ContactPhoneCue: this.selectedItem.ContactPhoneCue,
            // VeteranEmployeeMilitaryAffiliationCue: this.selectedItem.VeteranMilitaryAffiliationData
            //     ? this.selectedItem.VeteranMilitaryAffiliationData.some((el) => el.MilitaryAffiliationNameCue === true)
            //     : false,
            VeteranEmployeeMilitaryAffiliationCue:
                (this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData.length) > 0 ? this.selectedItem.VeteranMilitaryAffiliationDataCue : false,
            SocialSecurityNumberCue: this.selectedItem.SocialSecurityNumberCue,
            DrivingLicenseCue: this.selectedItem.DrivingLicenseCue,
            DateOfBirthCue: this.selectedItem.DateOfBirthCue,
            OwnershipPercentageCue: this.selectedItem.OwnershipPercentageCue,
            IsContractorActiveCue: this.selectedItem.IsContractorActiveCue,
            VeteranFlagCue: this.selectedItem.VeteranFlagCue,
            VeteranEmployeeHireDateCue: this.selectedItem.VeteranEmployeeHireDateCue,
            LegalIssueFlagCue: this.selectedItem.LegalIssueFlagCue,
            ActiveFlagCue: this.selectedItem.ActiveFlagCue,
        };
        contractorInfo.disableFields = true;
        contractorInfo.ownershipArrayList = this.dataArr;
        dialogRef.result.subscribe((result) => {
            const resultFromDialog = result;
            if (resultFromDialog['button'] === 'SUBMIT') {
                const datafromDialog = resultFromDialog['insertedData'];
                const add: any = {};
                Object.assign(add, {
                    OwnershipNumber: datafromDialog.OwnershipNumber,
                    SocialSecurityNumber: datafromDialog.SocialSecurityNumber,
                    DrivingLicense: datafromDialog.DrivingLicense,
                    DateOfBirth: datafromDialog.DateOfBirth,
                    VeteranEmployeeHireDate: datafromDialog.VeteranEmployeeHireDate,
                    ID: datafromDialog.ID,
                    OwnershipName: datafromDialog.OwnershipName,
                    ContrEmployeeTypeId: this.getContrEmp(datafromDialog, true), //datafromDialog.ContrEmployeeTypeId === 1 ? 'Principal' : datafromDialog.ContrEmployeeTypeId === 2 ? 'Owner' : 'Primary Owner',
                    ContactEmail: datafromDialog.ContactEmail,
                    ContactPhone: datafromDialog.ContactPhone,
                    OwnershipPercentage: datafromDialog.OwnershipPercentage,
                    ActiveFlag: datafromDialog.ActiveFlag,
                    VeteranFlag: datafromDialog.VeteranFlag === true ? 'Y' : 'N',
                    VeteranMilitaryAffiliationData: datafromDialog.VeteranMilitaryAffiliationData,
                    LegalIssueFlag: datafromDialog.LegalIssueFlag === true ? 'Y' : 'N',
                    IsContractorActive: datafromDialog.IsContractorActive,
                });
                const index = this.personnelData.findIndex((e) => e.ID === datafromDialog.ID);

                if (index === -1) {
                    this.data.push(add);
                    this.personnelData.push(datafromDialog);
                } else {
                    add.ContractorLegalIssue = this.data[index].ContractorLegalIssue;
                    datafromDialog.ContractorLegalIssue = this.personnelData[index].ContractorLegalIssue;
                    this.data[index] = { ...this.data[index], ...add };
                    this.personnelData[index] = datafromDialog;
                }
                this.saveOwnersPrinciplesData();
                this.loadProducts();
            }
        });
    }
    getContrEmp(data, flag) {
        if (flag) {
            for (const role of this.ownerRole) {
                if (data.ContrEmployeeTypeId === role.ContrEmployeeTypeID) return role.ContractorEmployeeTypeTranslated;
            }
        } else {
            for (const role of this.ownerRole) {
                if (data.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) return role.ContrEmployeeTypeID;
            }
        }
    }

    // save data after popup is closed
    public async saveOwnersPrinciplesData() {
        const ownerDataArray = JSON.parse(JSON.stringify(this.data));
        ownerDataArray.map((roleType) => {
            for (const role of this.ownerRole) {
                if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                    roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                }
            }
            // if (roleType.ContrEmployeeTypeId === 'Principal') {
            //     roleType.ContrEmployeeTypeId = 1;
            // } else if (roleType.ContrEmployeeTypeId === 'Owner') {
            //     roleType.ContrEmployeeTypeId = 2;
            // } else if (roleType.ContrEmployeeTypeId === 'Primary Owner') {
            //     roleType.ContrEmployeeTypeId = 9;
            // }
        });
        if (this.forwardedData.OwnershipDetails && this.forwardedData.OwnershipDetails.OwnershipInformationList) {
            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((roleType) => {
                for (const role of this.ownerRole) {
                    if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                        roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                    }
                }
                // if (roleType.ContrEmployeeTypeId === 'Principal') {
                //     roleType.ContrEmployeeTypeId = 1;
                // } else if (roleType.ContrEmployeeTypeId === 'Owner') {
                //     roleType.ContrEmployeeTypeId = 2;
                // } else if (roleType.ContrEmployeeTypeId === 'Primary Owner') {
                //     roleType.ContrEmployeeTypeId = 9;
                // }
            });
        }
        this.ownershipDataObj = {
            OwnershipDetails: {
                OwnershipStructure: this.ownershipForm.value['OwnershipStructure'],
                ExchangeListing: this.ownershipForm.value['OwnershipStructure'] === 1 || this.ownershipForm.value['OwnershipStructure'] === 2 ? this.ownershipForm.value['ExchangeListing'] : null,
                StockSymbol: this.ownershipForm.value['OwnershipStructure'] === 1 || this.ownershipForm.value['OwnershipStructure'] === 2 ? this.ownershipForm.value['StockSymbol'] : null,
                YearsInCurrentOwnership: parseInt(this.ownershipForm.value['YearsInCurrentOwnership'], 10),
                MonthsInCurrentOwnership: parseInt(this.ownershipForm.value['MonthsInCurrentOwnership'], 10),
                OwnershipInformationList: ownerDataArray,
            },
        };
        if (this.loginDetails[0].ContrID > 0) {
            const approvalObject: OwnershipDetails = this._srvContractorRegistration.gridDifferenceInternal(this.ownershipDataObj.OwnershipDetails, this.forwardedData.OwnershipDetails);
            if (
                this.forwardedData.OwnershipDetails.OwnershipStructure !== 1 &&
                this.forwardedData.OwnershipDetails.OwnershipStructure !== 2 &&
                Object.keys(approvalObject).length &&
                approvalObject.hasOwnProperty('OwnershipInformationList')
            ) {
                delete approvalObject.OwnershipInformationList[0];
                Object.keys(approvalObject.OwnershipInformationList).map((el, index) => {
                    delete approvalObject.OwnershipInformationList[el].ContractorLegalIssue;
                });

                const myData = Object.keys(approvalObject.OwnershipInformationList)
                    .filter((key) => {
                        return Object.keys(approvalObject.OwnershipInformationList[key]).length > 1;
                    })
                    .map((key) => {
                        return approvalObject.OwnershipInformationList[key];
                    });
                approvalObject.OwnershipInformationList = myData;
            } else {
                delete approvalObject.ExchangeListing;
                delete approvalObject.MonthsInCurrentOwnership;
                delete approvalObject.OwnershipStructure;
                delete approvalObject.StockSymbol;
                delete approvalObject.YearsInCurrentOwnership;
            }
            const apprvObj = JSON.stringify(approvalObject);
            const parsedApprvObj = JSON.parse(apprvObj);
            let masterCombinedObj: OwnershipDetails = {};
            masterCombinedObj = this._srvContractorRegistration.gridDifference(parsedApprvObj, this.oldRecord.OwnershipDetails, this.editedData);
            const ownerList = [];
            parsedApprvObj.OwnershipInformationList = parsedApprvObj.OwnershipInformationList.filter((el: OwnershipInformationList) => {
                if (Object.keys(el).length > 2) {
                    return el;
                }
            });
            parsedApprvObj.OwnershipInformationList.forEach((el, ind) => {
                let ObjectFoundInApproval;
                let ObjectIndexInApproval = -1;
                if (this.editedData.OwnershipInformationList) {
                    ObjectFoundInApproval = this.editedData.OwnershipInformationList.find((pendingEl) => pendingEl.ID === el.ID);

                    ObjectIndexInApproval = this.editedData.OwnershipInformationList.findIndex((pendingEl) => pendingEl.ID === el.ID);
                }
                const parsedIndex = parsedApprvObj.OwnershipInformationList.findIndex((ele) => ele.ID === el.ID);
                const dbIndex = this.oldRecord.OwnershipDetails.OwnershipInformationList.findIndex((dbEl) => dbEl.ID === el.ID);
                if (ObjectFoundInApproval > -1) {
                    if (el.VeteranMilitaryAffiliationData) {
                        el.VeteranMilitaryAffiliationData = el.VeteranMilitaryAffiliationData ? Object.values(el.VeteranMilitaryAffiliationData) : null;
                        parsedApprvObj.OwnershipInformationList[parsedIndex].VeteranMilitaryAffiliationData = el.VeteranMilitaryAffiliationData.filter((ele: VeteranMilitaryAffiliationData) => {
                            if (Object.keys(ele).length > 2) {
                                return el;
                            }
                        });
                    }
                    const objData: any = this._srvContractorRegistration.differenceCompany(
                        parsedApprvObj.OwnershipInformationList[parsedIndex],
                        this.oldRecord.OwnershipDetails.OwnershipInformationList[dbIndex],
                        this.editedData.OwnershipInformationList[ObjectIndexInApproval]
                    );
                    let mData = {};
                    mData = this.militaryDataProcess(
                        parsedApprvObj.OwnershipInformationList[parsedIndex],
                        this.oldRecord.OwnershipDetails.OwnershipInformationList[dbIndex],
                        this.keepEditedData.OwnershipInformationList[ObjectIndexInApproval]
                    );
                    objData.VeteranMilitaryAffiliationData = mData;
                    if (!objData.VeteranMilitaryAffiliationData.length) {
                        delete el.VeteranMilitaryAffiliationData;
                    }
                    if (Object.keys(objData).length) {
                        const keyToContain = { ID: el.ID, OwnershipNumber: el.OwnershipNumber, ...objData };
                        ownerList.push(keyToContain);
                    }
                } else {
                    if (
                        (typeof el.VeteranMilitaryAffiliationData === 'object' && Object.keys(el.VeteranMilitaryAffiliationData).length) ||
                        (typeof el.VeteranMilitaryAffiliationData !== 'object' && el.VeteranMilitaryAffiliationData)
                    ) {
                        let mData = {};
                        el.VeteranMilitaryAffiliationData = Object.values(el.VeteranMilitaryAffiliationData);
                        const mDataArray = [];
                        mData = this.militaryDataProcess(
                            parsedApprvObj.OwnershipInformationList[parsedIndex],
                            this.oldRecord.OwnershipDetails.OwnershipInformationList[dbIndex],
                            ObjectIndexInApproval !== -1 ? this.keepEditedData.OwnershipInformationList[ObjectIndexInApproval] : {}
                        );
                        el.VeteranMilitaryAffiliationData = mData;
                        if (!el.VeteranMilitaryAffiliationData.length) {
                            delete el.VeteranMilitaryAffiliationData;
                        }
                    }
                    ownerList.push(el);
                }
                // if (typeof ownerList[ind].VeteranMilitaryAffiliationData !== 'object') {
                //     ownerList[ind].VeteranMilitaryAffiliationData = ownerList[ind].VeteranMilitaryAffiliationData.filter((milEl) => milEl !== undefined && Object.keys(milEl).length);
                // }
                // if (
                //     (typeof ownerList[ind].VeteranMilitaryAffiliationData === 'object' && !Object.keys(ownerList[ind].VeteranMilitaryAffiliationData).length) ||
                //     (typeof ownerList[ind].VeteranMilitaryAffiliationData !== 'object' && !ownerList[ind].VeteranMilitaryAffiliationData.length)
                // ) {
                //     delete ownerList[ind].VeteranMilitaryAffiliationData;
                // }
                if (ownerList[ind].VeteranMilitaryAffiliationData) {
                    ownerList[ind].VeteranMilitaryAffiliationData = ownerList[ind].VeteranMilitaryAffiliationData.filter((milEl) => milEl !== undefined && Object.keys(milEl).length);
                    if (!ownerList[ind].VeteranMilitaryAffiliationData.length) {
                        delete ownerList[ind].VeteranMilitaryAffiliationData;
                    }
                }
            });
            if (ownerList.length) {
                masterCombinedObj.OwnershipInformationList = ownerList;
            } else if (masterCombinedObj.OwnershipInformationList) {
                delete masterCombinedObj.OwnershipInformationList;
            }

            // remove duplicates
            if (masterCombinedObj && masterCombinedObj.OwnershipInformationList) {
                const result = [];
                masterCombinedObj.OwnershipInformationList.forEach((elem) => {
                    const match = result.find((r) => r.ID === elem.ID);
                    if (match) {
                        Object.assign(match, elem);
                    } else {
                        result.push(elem);
                    }
                });
                masterCombinedObj.OwnershipInformationList = result;
                masterCombinedObj.OwnershipInformationList.map((el, index) => {
                    Object.keys(masterCombinedObj.OwnershipInformationList[index]).map((elem) => {
                        delete masterCombinedObj.OwnershipInformationList[index][elem + 'Cue'];
                    });
                });
            }

            if (masterCombinedObj && masterCombinedObj.OwnershipInformationList && masterCombinedObj.OwnershipInformationList.length > 0) {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < this.visualCue.OwnershipInformationList.length; i++) {
                    const existingKey = this.pick(this.visualCue.OwnershipInformationList[i], this.properties);

                    for (const k in existingKey) {
                        if (existingKey[k] === true) {
                            this.checkVisualCueExists = true;
                            break;
                        }
                    }
                }
            }
            // tslint:disable-next-line:no-shadowed-variable
            const OwnershipInformationList = [];
            if (masterCombinedObj && masterCombinedObj.OwnershipInformationList && masterCombinedObj.OwnershipInformationList.length) {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < masterCombinedObj.OwnershipInformationList.length; i++) {
                    const pendingApprovalObject = this.pick(masterCombinedObj.OwnershipInformationList[i], this.properties);
                    if (Object.keys(pendingApprovalObject).length > 2) {
                        OwnershipInformationList.push(pendingApprovalObject);
                    }
                }
                masterCombinedObj = { ...masterCombinedObj, OwnershipInformationList };
                if (!OwnershipInformationList.length) {
                    delete masterCombinedObj.OwnershipInformationList;
                }
                if (masterCombinedObj.OwnershipInformationList[0].VeteranFlag === 'N' && masterCombinedObj.OwnershipInformationList[0].VeteranEmployeeHireDate === null) {
                    delete masterCombinedObj.OwnershipInformationList[0].VeteranEmployeeHireDate;
                }
            }

            const editObj: EditObj = {};
            editObj.ResourceId = this.resourceId;
            editObj.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
            editObj.CCOpsID = this.loginDetails[0].CCOpsID;
            editObj.CCOpsData = JSON.stringify({ OwnershipDetails: masterCombinedObj });
            editObj.Contr_ID = this._srvAuthentication.Profile.ContrID;
            editObj.PageName = 'Ownership Information Page';
            if (masterCombinedObj && Object.keys(masterCombinedObj).length) {
                const response = await this._srvContractorData.saveContractorData(
                    { currentPage: 'Ownership Information Page', nextPage: 'ownership' },
                    { OwnershipDetails: masterCombinedObj },
                    'OwnershipInformation/EditEventOwnershipInfo'
                );

                if (this._srvAuthentication.Profile.EventName === 'No Event') {
                    if (response === 1) {
                        this.editedData = null;
                        this.callMain();
                    } else {
                        this.unsuccess();
                    }
                } else {
                    if (response === 1) {
                        this.callMain();
                    } else {
                        this.unsuccess();
                    }
                }
                return;
            }

            return;
        }

        if (this.ownershipDataObj && this.ownershipDataObj.OwnershipDetails && this.ownershipDataObj.OwnershipDetails.OwnershipInformationList.length) {
            this.ownershipDataObj.OwnershipDetails.OwnershipInformationList.forEach((ele, ind) => {
                ele['DeletedDateTime'] = ele['DeletedDateTime'] === '' ? null : ele['DeletedDateTime'];
            });
        }

        const objProgram = {
            OwnershipDetails: this.ownershipDataObj.OwnershipDetails,
            ResourceId: this.resourceId,
            CCOpsID: this.loginDetails[0].CCOpsID,
            LastPageVisited: 'validation',
        };
        await this._srvValidation.saveValidationOwnershipPerspectiveContractor(objProgram);
        this.callMain();
    }

    compareMilitary(parsedApprvObj, existingData) {
        for (const element of parsedApprvObj.VeteranMilitaryAffiliationData) {
            const objectsEqual = (o1, o2) => Object.keys(o1).every((p) => o1[p] === o2[p]);
            const ObjectFoundInApproval = existingData.VeteranMilitaryAffiliationData.find((pendingEl) => pendingEl.MilitaryAffiliationNumber === element.MilitaryAffiliationNumber);
            if (ObjectFoundInApproval) {
                const equalObject = objectsEqual(element, ObjectFoundInApproval);
                if (equalObject === false) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }
    public militaryDataProcess(parsedApprvObj, oldData, editedData) {
        let militaryList = [];
        if (oldData === undefined) {
            oldData = {};
        }
        let equalObject;
        if (!parsedApprvObj.VeteranMilitaryAffiliationData.length) {
            return [];
        }
        if (editedData.VeteranMilitaryAffiliationData && editedData.VeteranMilitaryAffiliationData.length) {
            equalObject = this.compareMilitary(parsedApprvObj, editedData);
        } else if (oldData.VeteranMilitaryAffiliationData && oldData.VeteranMilitaryAffiliationData.length) {
            equalObject = this.compareMilitary(parsedApprvObj, oldData);
        } else if (parsedApprvObj.VeteranMilitaryAffiliationData.length) {
            return parsedApprvObj.VeteranMilitaryAffiliationData;
        }
        if (equalObject === false) {
            militaryList = parsedApprvObj.VeteranMilitaryAffiliationData;
        } else {
            militaryList = [];
        }
        // parsedApprvObj.VeteranMilitaryAffiliationData.forEach((el, ind) => {
        //     const property = [
        //         'ContractorVeteranEmployeeNumber',
        //         'MilitaryAffiliationNumber',
        //         'AddedDate',
        //         'AddedResourceID',
        //         'RemovedDate',
        //         'RemovedResourceID',
        //         'MilitaryAffiliationName',
        //         'OwnershipNumber',
        //     ];
        //     parsedApprvObj.VeteranMilitaryAffiliationData[ind] = this.pick(el, property);
        //     let ObjectFoundInApproval = false;
        //     const ObjectFoundInDB = false;
        //     if (editedData.VeteranMilitaryAffiliationData && editedData.VeteranMilitaryAffiliationData.length) {
        //         ObjectFoundInApproval = editedData.VeteranMilitaryAffiliationData.find((pendingEl) => pendingEl.MilitaryAffiliationNumber === el.MilitaryAffiliationNumber);
        //     }

        //     if (ObjectFoundInApproval) {
        //         const ObjectIndexInApproval = editedData.VeteranMilitaryAffiliationData.findIndex((pendingEl) => pendingEl.MilitaryAffiliationNumber === el.MilitaryAffiliationNumber);
        //         const parsedIndex = parsedApprvObj.VeteranMilitaryAffiliationData.findIndex((ele) => ele.MilitaryAffiliationNumber === el.MilitaryAffiliationNumber);
        //         let dbIndex = -1;
        //         if (Object.keys(oldData).length) {
        //             dbIndex = oldData.VeteranMilitaryAffiliationData.findIndex((dbEl) => dbEl.MilitaryAffiliationNumber === el.MilitaryAffiliationNumber);
        //         }

        //         const objData = this._srvContractorRegistration.differenceCompany(
        //             parsedApprvObj.VeteranMilitaryAffiliationData[parsedIndex],
        //             dbIndex > -1 ? oldData.VeteranMilitaryAffiliationData[dbIndex] : {},
        //             editedData.VeteranMilitaryAffiliationData[ObjectIndexInApproval]
        //         );
        //         if (Object.keys(objData).length) {
        //             const keyToContain = {
        //                 OwnershipNumber: el.OwnershipNumber ? el.OwnershipNumber : null,
        //                 ContractorVeteranEmployeeNumber: typeof el.ContractorVeteranEmployeeNumber === 'string' ? parseInt(el.ContractorVeteranEmployeeNumber, 10) : el.ContractorVeteranEmployeeNumber,
        //                 MilitaryAffiliationName: el.MilitaryAffiliationName,
        //                 MilitaryAffiliationNumber: el.MilitaryAffiliationNumber,
        //                 ...objData,
        //             };
        //             militaryList.push(keyToContain);
        //         } else {
        //             militaryList.push({});
        //         }
        //     } else {
        //         parsedApprvObj.VeteranMilitaryAffiliationData = Object.values(parsedApprvObj.VeteranMilitaryAffiliationData);
        //         const parsedIndex = parsedApprvObj.VeteranMilitaryAffiliationData.findIndex((ele) => ele.MilitaryAffiliationNumber === el.MilitaryAffiliationNumber);
        //         const dbIndex = oldData && oldData.VeteranMilitaryAffiliationData ? oldData.VeteranMilitaryAffiliationData.findIndex((dbEl) => dbEl.MilitaryAffiliationNumber === el.MilitaryAffiliationNumber) : -1;
        //         const objData = this._srvContractorRegistration.differenceCompany(
        //             parsedApprvObj.VeteranMilitaryAffiliationData[parsedIndex],
        //             dbIndex !== -1 ? oldData.VeteranMilitaryAffiliationData[dbIndex] : {},
        //             {}
        //         );
        //         if (Object.keys(objData).length) {
        //             const keyToContain = {
        //                 OwnershipNumber: el.OwnershipNumber ? el.OwnershipNumber : null,
        //                 ContractorVeteranEmployeeNumber: typeof el.ContractorVeteranEmployeeNumber === 'string' ? parseInt(el.ContractorVeteranEmployeeNumber, 10) : el.ContractorVeteranEmployeeNumber,
        //                 MilitaryAffiliationName: el.MilitaryAffiliationName,
        //                 MilitaryAffiliationNumber: el.MilitaryAffiliationNumber,
        //                 ...objData,
        //             };
        //             militaryList.push(keyToContain);
        //         } else {
        //             militaryList.push({});
        //         }
        //     }
        // });
        return militaryList;
    }

    public unsuccess() {
        this.loadData = false;
        this.callMain();
        const dialogRef = this._dialogService.open({
            content: DialogAlertsComponent,
            width: 550,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Wrong}</p>
                                </div>
                            `;
    }

    // readonly route
    public nextPage() {
        this._router.navigate(['/contractorRegistration/signature-page']);
    }

    // Back Click
    public onBackClick(form: FormGroup) {
        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this._router.navigate(['/contractorRegistration/coverage-profile-information']);
            return;
        }
        if (form.dirty) {
            const dialogRef = this._dialogService.open({
                content: SaveAlertComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Equip_Info.Global_Alert_Header_Warning;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                <h2>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved} </h2>
                                <p>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved_Stmt}</p>
                                </div>
                                `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    this.onBackClickFunction();
                }
            });
        } else {
            this.onBackClickFunction();
        }
    }
    // extension of back click
    public onBackClickFunction() {
        this._srvContractorRegistration.saveLastPageVisited('coverage-profile-information');
        this._router.navigate(['/contractorRegistration/coverage-profile-information']);
    }
    // numeric character check
    public isNumber(evt) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    public pick(obj, keys) {
        return keys.map((k) => (k in obj ? { [k]: obj[k] } : {})).reduce((res, o) => Object.assign(res, o), {});
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
        });
    }
}
