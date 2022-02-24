import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { PageAccess, AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { UniversalService } from './../../../../core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ContactInformationService } from './../../services/contactInfo.service';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Router } from '@angular/router';
import { OwnershipPageDialogComponent } from '../../dialogs/ownership-page-dialog/ownership-page-dialog.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, HostListener, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy, CompositeFilterDescriptor, filterBy, distinct } from '@progress/kendo-data-query';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { ApiService } from 'src/app/core/services/http-service';

import * as moment from 'moment';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { OwnershipInformationService } from './ownership-information.service';
import { CorrectionRequestComments, LoginUser } from 'src/app/core/models/user.model';
import {
    CompanyDataObjModel,
    deviceResModel,
    GridDataModel,
    LastPageVisited,
    LayoutModel,
    OwnershipDetailsObject,
    OwnershipObject,
    pageObjModel,
    PersonnelDataModel,
    SaveOwnershipModel,
    OwnwershipInformationModel,
    OwnershipMockData,
    editObjModel,
    OwnerRoleStruct,
} from './ownership.model';
import { DeleteAlertComponent } from 'src/app/shared-module/components/delete-alert/delete-alert.component';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-ownership-information',
    templateUrl: './ownership-information.component.html',
    styleUrls: ['./ownership-information.component.scss'],
})
export class OwnershipInformationComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('container', { read: ViewContainerRef, static: false })

    // mobile grid code
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: deviceResModel;
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    public containerRef: ViewContainerRef;
    public data: Array<GridDataModel> = [];
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    public type: 'numeric';
    public pageObj: pageObjModel = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };
    public dataArr = [];
    public gridData = [];
    public pageSizes: boolean = true;
    public previousNext: boolean = true;
    public ownershipForm: FormGroup;
    public checked: boolean = true;
    public unchecked: boolean = false;
    public opened: boolean = false;
    public submitted: boolean = false;
    public showExchangeSymbolSection: boolean = false;
    public sectionHide: boolean = false;
    public ownershipResponse: OwnershipObject;
    public forwardedData: OwnershipObject;
    public oldRecord: OwnershipObject;
    public ownershipData: OwnershipDetailsObject;
    public personnelData: Array<PersonnelDataModel> = [];
    public owner: Array<{}> = [];
    public objProgram: SaveOwnershipModel;
    private emailDuplicacyCheck: Subscription;
    private percentageCheck: Subscription;
    private phoneNumberCheck: Subscription;
    public validPhoneNumber: boolean;
    public multiple: boolean = false;
    public allowUnsort: boolean = true;
    public disableAddOwnerPrinciple: boolean = true;
    public duplicacyCheck: boolean = false;
    public companyOwnershipPercentage: number;
    public sort: SortDescriptor[] = [];
    public selectedItem;
    public gridView: GridDataResult;
    public OwnerResult: Array<{}> = [];
    public ownershipDataObj: OwnershipObject;
    public accountId: number;
    public resourceId: number;
    public companyName: string;
    public monthsValue: string;
    public companyOpeningDate: string;
    public ContrID: string | number;
    public pageContent: any;
    public lastPageVisitedObject: LastPageVisited;
    public addOwnerPopupWidth: number = 550;
    public checkDuplicateMail: boolean = false;
    public disableBtnCtr: number = 0;
    @ViewChild('ownershipGrid', { static: false }) public grid: ElementRef;
    public OwnerStructure: Array<{
        OwnerStructureDesc: string;
        OwnerStructureID: number;
        OwnerStructureDescTranslated: string;
    }> = [];
    public OwnerStructureData: Array<{
        OwnerStructureDesc: string;
        OwnerStructureID: number;
        OwnerStructureDescTranslated: string;
    }>;
    public editedData: any = {};
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
        'ActiveFlag',
        'VeteranFlag',
        'VeteranEmployeeHireDate',
        'VeteranMilitaryAffiliationData',
        'LegalIssueFlag',
        'IsContractorActive',
    ];
    @ViewChild('dropdownlist', { static: false }) public dropdownlist: any;
    public defaultItem: {
        OwnerStructureDesc: string;
        OwnerStructureID: number;
        OwnerStructureDescTranslated: string;
    } = {
        OwnerStructureDesc: 'Select Ownership Structure',
        OwnerStructureID: null,
        OwnerStructureDescTranslated: 'Select Ownership Structure',
    };

    public loginDetails: Array<SessionUser> = [];
    url: string;
    public visualCue: any = {
        YearsInCurrentOwnershipCue: false,
        MonthsInCurrentOwnership: false,
        OwnershipStructure: false,
        ExchangeListing: false,
        StockSymbol: false,
        IsContractorActive: 'N',
        ContactEmailCue: false,
        ContactPhoneCue: false,
        VeteranEmployeeMilitaryAffiliationCue: false,
        SocialSecurityNumberCue: false,
        DrivingLicenseCue: false,
        DateOfBirthCue: false,
        OwnershipPercentageCue: false,
        ActiveFlagCue: false,
        VeteranFlagCue: false,
        VeteranEmployeeHireDateCue: false,
        LegalIssueFlagCue: false,
        IsContractorActiveCue: false,
        OwnershipNameCue: false,
        ContrEmployeeTypeIdCue: false,
    };
    public finalOuterData: any;
    public loggedInUserType: string;
    public checkVisualCueExists: boolean = false;
    public readonlyMode: boolean = false;
    public visualProperties: string[];
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid: any[] = filterBy(this.dataArr, this.filter);
    public hidePage: boolean = false;
    public keepEditedData: any;
    public crComments: CorrectionRequestComments[];
    public disableOwnerDropdown: boolean = false;
    deletedEmployeesList: any[] = [];
    private deletedMailDuplicate: Array<string> = [];
    legalChanges: Array<string> = [];
    ownerRole: OwnerRoleStruct[];
    public clonedObject: any;

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.dataArr, filter);
    }
    public distinctPrimitive(fieldName: string): any {
        return distinct(this.dataArr, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        private _formBuilder: FormBuilder,
        private _dialog: DialogService,
        private _srvContactorRegistration: ContractorRegistrationService,
        private _route: Router,
        private _srvApi: ApiService,
        private _srvContactInformation: ContactInformationService,
        private _srvDeviceDetector: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        public _srvAuthentication: AuthenticationService,
        private _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvOwnership: OwnershipInformationService,
        private renderer: Renderer2,
        public intlService: IntlService
    ) {
        this.ownershipForm = this._formBuilder.group({
            OwnershipStructure: [null, Validators.required],
            ExchangeListing: ['', Validators.required],
            StockSymbol: ['', Validators.required],
            YearsInCurrentOwnership: [null, [Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]],
            MonthsInCurrentOwnership: [null, [Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]],
        });

        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.setOwnerStructureIDValidators();
        this._srvContactorRegistration.emailIDRevival.subscribe((revive) => {
            if (revive !== '') {
                this.personnelData.forEach((personnelElement, index) => {
                    if (personnelElement.ContactEmail === revive && (!personnelElement.hasOwnProperty('IsDeletedFlag') || personnelElement.IsDeletedFlag === false)) {
                        this.personnelData[index].IsContractorActive = 'Y';
                    }
                });

                this.data.forEach((dataElement, dataIndex) => {
                    if (dataElement.ContactEmail === revive && (!dataElement.hasOwnProperty('IsDeletedFlag') || dataElement.IsDeletedFlag === false)) {
                        this.data[dataIndex].IsContractorActive = 'Y';
                    }
                });
                this.saveOwnersPrinciplesData();
            }
        });
    }

    @HostListener('mousedown')
    onMousedown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    @HostListener('mouseup')
    onMouseup(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    // grid page change
    public pageChange(state: { skip: number; take: number }): void {
        this.pageSize = state.take;
    }
    ownerStructureCheck(structureId: number): boolean {
        if (structureId !== null) {
            const structure = this.OwnerStructure.find((struc) => struc.OwnerStructureID === structureId);
            return structure.OwnerStructureDesc === 'Publicly Traded' || structure.OwnerStructureDesc === 'Division, Subsidiary, or Affiliate of a Publicly Traded Company';
        }
    }
    negativeStructureCheck(structureId: number) {
        const structure = this.OwnerStructure.find((struc) => struc.OwnerStructureID === structureId);
        return structure.OwnerStructureDesc !== 'Publicly Traded' && structure.OwnerStructureDesc !== 'Division, Subsidiary, or Affiliate of a Publicly Traded Company';
    }
    // dynamic validators according to ownership structure
    public setOwnerStructureIDValidators() {
        let years;
        const listingControl = this.ownershipForm.get('ExchangeListing');
        const symbolControl = this.ownershipForm.get('StockSymbol');
        const MonthsInCurrentOwnershipControl = this.ownershipForm.get('MonthsInCurrentOwnership');
        const YearsInCurrentOwnershipControl = this.ownershipForm.get('YearsInCurrentOwnership');
        this.ownershipForm.get('OwnershipStructure').valueChanges.subscribe((ownerStructureID) => {
            if (this.ownerStructureCheck(ownerStructureID)) {
                this.submitted = false;
                listingControl.setValidators([Validators.required]);
                symbolControl.setValidators([Validators.required]);
                MonthsInCurrentOwnershipControl.setValidators([Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]);
                YearsInCurrentOwnershipControl.setValidators([Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]);
            } else {
                this.submitted = false;
                listingControl.patchValue(null);
                symbolControl.patchValue(null);
                listingControl.setValidators(null);
                symbolControl.setValidators(null);
                MonthsInCurrentOwnershipControl.setValidators([Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]);
                YearsInCurrentOwnershipControl.setValidators([Validators.required, Validators.pattern(/^-?(0|[0-9]\d*)?$/)]);
            }

            if (ownerStructureID === null) {
                this.disableAddOwnerPrinciple = true;
            }
            YearsInCurrentOwnershipControl.updateValueAndValidity();
            MonthsInCurrentOwnershipControl.updateValueAndValidity();
            listingControl.updateValueAndValidity();
            symbolControl.updateValueAndValidity();
        });

        YearsInCurrentOwnershipControl.valueChanges.subscribe((yearValue) => {
            years = yearValue;

            if ((this.monthsValue === '0' || this.monthsValue === '00') && (years === '0' || years === '00' || years === '000')) {
                MonthsInCurrentOwnershipControl.reset();
            }
        });

        this.ownershipForm.get('MonthsInCurrentOwnership').valueChanges.subscribe((months) => {
            this.monthsValue = months;
            if (months > 11) {
                MonthsInCurrentOwnershipControl.setValue(11);
            }
            if ((months === '0' || months === '00') && (years === '0' || years === '00' || years === '000')) {
                MonthsInCurrentOwnershipControl.reset();
            }
        });
    }
    // pagination slider change
    public sliderChange(pageIndex: number): void {
        this.skip = (pageIndex - 1) * this.pageSize;
    }
    // grid sort function
    public sortChange(sort: SortDescriptor[]): void {
        this.sort = sort;
        this.loadProducts();
    }
    // function to load data on grid
    private async loadProducts() {
        this.dataArr = [];
        const deletedMails = [];
        this.data.forEach((dataElement) => {
            if (dataElement.ContrEmployeeTypeId !== 0) {
                for (const role of this.ownerRole) {
                    if (dataElement.ContrEmployeeTypeId === role.ContrEmployeeTypeID) {
                        dataElement.ContrEmployeeTypeId = role.ContractorEmployeeTypeTranslated;
                    }
                }
            }

            if (dataElement.ContrEmployeeTypeId !== 0 && dataElement.IsContractorActive === 'Y') {
                // to be change with IsContractorActive
                dataElement.OwnershipPercentage = parseInt(dataElement.OwnershipPercentage, 10);
                this.dataArr.push(dataElement);
            } else if (this.ContrID > 0 && dataElement.ContrEmployeeTypeId !== 0) {
                this.dataArr.push(dataElement);
            }
            if (dataElement.ContrEmployeeTypeId !== 0 && dataElement.IsDeletedFlag === true) {
                deletedMails.push(dataElement);
            }
        });
        this.deletedMailDuplicate = deletedMails.map((ele) => ele.ContactEmail);
        if (this.loginDetails[0].ContrID === 0) {
            this.dataArr = this.dataArr.filter((ele) => {
                return (ele.hasOwnProperty('IsDeletedFlag') && ele.IsDeletedFlag === false) || !ele.hasOwnProperty('IsDeletedFlag');
            });
        }
        if (this.ContrID > 0) {
            let legalContrChanges = await this._srvOwnership.getContractorLegalChanges(this.loginDetails[0].ContrID, this.resourceId, this.loginDetails[0].CCOpsID);
            legalContrChanges = legalContrChanges.length && legalContrChanges[0].CCOpsData ? JSON.parse(legalContrChanges[0].CCOpsData) : null;
            const legalChange = legalContrChanges ? JSON.parse(JSON.stringify(legalContrChanges.ContractorData.LegalInformationPage.ContractorLegalIssue)) : [];
            this.legalChanges = legalChange.map((ele) => ele.OwnershipNumber);
        }
        if (this.ContrID > 0) {
            this.gridData = this.dataArr.filter((el) => el.IsContractorActive === 'Y' || (el.IsContractorActive === 'N' && el.IsDeletedFlag === true));
        } else {
            this.gridData = JSON.parse(JSON.stringify(this.dataArr));
        }

        //added for sorting to work==============================
        this.gridData = this.gridData.map((obj, index) => {
            const sno = { SNO: index + 1 };
            return { ...obj, ...sno };
        });
        //=======================================================

        this.gridView = {
            data: orderBy(this.gridData.slice(this.skip, this.skip + this.pageSize), this.sort),
            total: this.gridData.length,
        };
    }
    public async ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService>this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.defaultItem = {
            OwnerStructureDesc: this.pageContent.Ownership_Info.Placeholder_Ownership_Structure,
            OwnerStructureID: null,
            OwnerStructureDescTranslated: this.pageContent.Ownership_Info.Placeholder_Ownership_Structure,
        };
        this.crComments = await this._srvContractorData.getPageComments('Ownership Information');
        // mobile grid codd
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

        this.callMain();

        if (this._srvAuthentication.Language === 2) {
            this.addOwnerPopupWidth = 650;
        }
    }

    public async callMain() {
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.ContrID = this.loginDetails[0].ContrID;
        this.data = [];
        this.disableBtnCtr = 0;
        this.deletedEmployeesList = [];
        this.disableBtnCtr = 0;
        let params;
        this.personnelData = [];
        this.ownerData();
        this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Ownership Information');

        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this.readonlyMode = true;
            if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess) {
                this.accessDenied();
            }
        }

        // fetch user access privilege
        if (this.loginDetails[0].ContrID > 0) {
            if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) {
                this.ownershipForm.disable();
            } else {
                if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess) {
                    this.accessDenied();
                    return;
                }
            }
        }

        if (this.loginDetails[0].ContrID > 0) {
            params = {
                params: {
                    contrID: this.loginDetails[0].ContrID,
                    pageName: 'Ownership Information Page',
                    resourceID: this.resourceId,
                    userLanguageID: this._srvAuthentication.currentLanguageID,
                },
            };
            this.url = `JSON/GetContractorData`;
        } else {
            params = {
                params: {
                    resourceID: this.resourceId,
                    CCOpsId: this.loginDetails[0].CCOpsID,
                },
            };

            this.url = 'OwnershipInformation/GetOwnershipDetails';
        }

        this.ownershipResponse = await this._srvOwnership.getOwnershipDetails(this.url, params);
        // dynamic height of content

        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer, 2000);
        if (this.loginDetails[0].ContrID > 0) {
            this.ownershipResponse.OwnershipDetails.OwnershipInformationList.map((el, index) => (el.ID = index + 1));
            this.forwardedData = this.ownershipResponse;
            this.oldRecord = JSON.parse(JSON.stringify(this.ownershipResponse));
            this._srvContactorRegistration.ownershipStructure.next(this.forwardedData.OwnershipDetails.OwnershipStructure);
            this.getPendingApprovalData();
            return;
        } else {
            if (this.ownershipResponse.OwnershipDetails === null) {
                this.forwardedData = OwnershipMockData;
                this._srvContactorRegistration.funcInternalUserGoDirectlyToContractorPage(this.ownershipResponse.OwnershipDetails, 'OwnershipDetails');
            } else {
                this._srvContactorRegistration.funcInternalUserGoDirectlyToContractorPage(this.ownershipResponse.OwnershipDetails, 'OwnershipDetails');
                this.forwardedData = this.ownershipResponse;
                this.oldRecord = this.ownershipResponse;
            }
        }
        const companyDetails = await this._srvOwnership.getCompanyDetails(params);
        if (companyDetails.CompanyDetails) {
            this.companyName = companyDetails.CompanyDetails.CompanyLegalName;
            this.companyOpeningDate = companyDetails.CompanyDetails.ContractorOpeningDate;
        }
        let companyDataObj: CompanyDataObjModel = null;
        if (this.loginDetails[0].ContrID > 0) {
            companyDataObj = {
                OwnershipNumber: null,
                ID: 1,
                OwnershipName: this.companyName,
                ContrEmployeeTypeId: 0,
                ContactEmail: '',
                ContactPhone: null,
                VeteranEmployeeMilitaryAffiliation: '',
                VeteranMilitaryAffiliationData: [],
                SocialSecurityNumber: '',
                DrivingLicense: '',
                DateOfBirth: new Date(),
                OwnershipPercentage: 0,
                ActiveFlag: false,
                VeteranFlag: false,
                VeteranEmployeeHireDate: null,
                MilitaryAffilationNumber: null,
                LegalIssueFlag: false,
                IsContractorActive: 'Y',
                ContactEmailCue: false,
                ContactPhoneCue: false,
                VeteranEmployeeMilitaryAffiliationCue: false,
                SocialSecurityNumberCue: false,
                DrivingLicenseCue: false,
                DateOfBirthCue: false,
                OwnershipPercentageCue: false,
                ActiveFlagCue: false,
                VeteranFlagCue: false,
                VeteranEmployeeHireDateCue: false,
                LegalIssueFlagCue: false,
                IsContractorActiveCue: true,
            };
        } else {
            companyDataObj = {
                OwnershipNumber: null,
                ID: 1,
                OwnershipName: this.companyName,
                ContrEmployeeTypeId: 0,
                ContactEmail: '',
                ContactPhone: null,
                VeteranEmployeeMilitaryAffiliation: '',
                VeteranMilitaryAffiliationData: [],
                MilitaryAffilationNumber: null,
                SocialSecurityNumber: '',
                DrivingLicense: '',
                DateOfBirth: new Date(),
                OwnershipPercentage: 0,
                ActiveFlag: false,
                VeteranFlag: false,
                VeteranEmployeeHireDate: null,
                LegalIssueFlag: false,
                IsContractorActive: 'Y',
            };
        }
        if (this.forwardedData.hasOwnProperty('OwnershipDetails')) {
            if (this.forwardedData.OwnershipDetails.OwnershipInformationList && this.forwardedData.OwnershipDetails.OwnershipInformationList.some((e) => e.ContrEmployeeTypeId === 0)) {
                if (this.forwardedData.OwnershipDetails.OwnershipInformationList[0].OwnershipName === this.companyName) {
                    // do nothing
                } else {
                    this.forwardedData.OwnershipDetails.OwnershipInformationList[0].OwnershipName = this.companyName;
                }
            } else {
                this.personnelData.push(companyDataObj);
                this.data.push(companyDataObj);
            }
        } else {
            this.personnelData.push(companyDataObj);
            this.data.push(companyDataObj);
        }
        this._srvContactorRegistration.sendSingleSource(this.forwardedData);
        this.bindData();
    }

    public async getPendingApprovalData() {
        const pending = await this._srvOwnership.getEventPageJSON(this.loginDetails[0].ContrID, this.resourceId, this.loginDetails[0].CCOpsID);
        this.editedData =
            pending.length > 0 && pending[0].CCOpsData && JSON.parse(pending[0].CCOpsData).ContractorData.OwnershipDetails ? JSON.parse(pending[0].CCOpsData).ContractorData.OwnershipDetails : {};
        this.keepEditedData = JSON.parse(JSON.stringify(this.editedData));
        this.visualCueProcess();
        // added this to disable ownershipstructure dropdown
        if ((this.editedData && this.editedData.hasOwnProperty('OwnershipInformationList')) || this.visualCue.ExchangeListingCue || this.visualCue.StockSymbolCue) {
            this.disableOwnerDropdown = true;
        }
    }

    // function to process data and attach visual cue on changed properties

    public visualCueProcess() {
        let mergedData: any;
        if (Object.keys(this.editedData).length) {
            if (this.editedData.OwnershipInformationList && this.editedData.OwnershipInformationList.length > 0) {
                let dbLength = this.oldRecord.OwnershipDetails.OwnershipInformationList.length + 1;
                this.editedData.OwnershipInformationList.map((el) => {
                    if (el.OwnershipNumber == null) {
                        el.ID = dbLength;
                        dbLength++;
                    }
                });
            }
            this.oldRecord.OwnershipDetails.OwnershipInformationList.map((el) => (el.ActiveFlag = el.ActiveFlag === true ? 'Y' : 'N'));
            this.finalOuterData = JSON.parse(JSON.stringify(this.editedData));

            mergedData = this._srvContactorRegistration.gridDifferenceInternal(this.oldRecord.OwnershipDetails, this.finalOuterData);
            if (this.finalOuterData.hasOwnProperty('OwnershipInformationList')) {
                delete this.finalOuterData.OwnershipInformationList;
            }
            if (this.editedData.hasOwnProperty('OwnershipInformationList')) {
                this.editedData.OwnershipInformationList.forEach((t) => {
                    for (const [idx, obj] of this.forwardedData.OwnershipDetails.OwnershipInformationList.entries()) {
                        const foundIndex = this.forwardedData.OwnershipDetails.OwnershipInformationList.findIndex((el) => el.ID === t.ID && el.OwnershipNumber === t.OwnershipNumber);
                        if (foundIndex !== -1) {
                            if (
                                t.VeteranMilitaryAffiliationData &&
                                t.VeteranMilitaryAffiliationData.length &&
                                this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData &&
                                this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData.length
                            ) {
                                this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData = t.VeteranMilitaryAffiliationData;
                                this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationDataCue = true;
                            } else {
                                if (t.VeteranMilitaryAffiliationData) {
                                    t.VeteranMilitaryAffiliationData.forEach((vele) => {
                                        Object.keys(vele).map((el) => (vele[el + 'Cue'] = true));
                                    });
                                    this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationData = t.VeteranMilitaryAffiliationData;
                                    // added by sjk for veteran cue
                                    this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex].VeteranMilitaryAffiliationDataCue = true;
                                }
                            }
                            delete t.VeteranMilitaryAffiliationData;
                            this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex] = { ...this.forwardedData.OwnershipDetails.OwnershipInformationList[foundIndex], ...t };

                            return;
                        }
                    }
                    Object.keys(t).map((el) => (t[el + 'Cue'] = true));
                    if (t.VeteranMilitaryAffiliationData) {
                        t.VeteranMilitaryAffiliationData.forEach((vele) => {
                            Object.keys(vele).map((el) => (vele[el + 'Cue'] = true));
                        });
                    }
                    this.forwardedData.OwnershipDetails.OwnershipInformationList.push(t);
                });
            }

            this.forwardedData.OwnershipDetails = { ...this.forwardedData.OwnershipDetails, ...this.finalOuterData };
            this.forwardedData.OwnershipDetails.OwnershipInformationList.map((el, index) => (el.ID = index + 1));

            // to clone data object
            this.clonedObject = JSON.parse(JSON.stringify(this.forwardedData.OwnershipDetails));

            this.bindData();

            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((dataElement, index) => {
                if (dataElement.ContrEmployeeTypeId !== 0) {
                    for (const role of this.ownerRole) {
                        if (dataElement.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                            this.forwardedData.OwnershipDetails.OwnershipInformationList[index].ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                        }
                    }
                }
            });

            this.visualCue = this._srvContactorRegistration.gridDifferenceCue(this.oldRecord.OwnershipDetails, this.forwardedData.OwnershipDetails);
            this.showVisualCue();
            if (this.visualCue.OwnershipInformationList.length > 0) {
                this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((elem, index) => {
                    if (elem.IsContractorActive === 'Y' && elem.OwnershipPercentage !== 0 && this.dataArr.length === 1) {
                        // to be change with IsContractorActive
                        this.visualCue.OwnershipInformationList = this.visualCue.OwnershipInformationList.filter((el) => el.ID === elem.ID);
                    } else if (elem.IsContractorActive === 'Y' && elem.OwnershipPercentage !== 0 && this.dataArr.length > 1) {
                        // to be change with IsContractorActive
                        this.visualCue.OwnershipInformationList.map((el) => el.ID === elem.ID);
                    }
                });
            }

            if (this.visualCue.OwnershipInformationList.length > 0) {
                this.visualProperties = [
                    'OwnershipNumberCue',
                    'ID',
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
                    'ActiveFlagCue',
                    'VeteranFlagCue',
                    'VeteranEmployeeHireDateCue',
                    'LegalIssueFlagCue',
                    'IsContractorActiveCue',
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
            );
            for (let i = 0; i < this.visualCue.OwnershipInformationList.length; i++) {
                const existingKey = this.pick(this.visualCue.OwnershipInformationList[i], this.visualProperties);
                this.visualCue.OwnershipInformationList[i] = existingKey;
            }

            this.visualCue.OwnershipInformationList.forEach((el, index) => {
                this.dataArr[index] = { ...this.dataArr[index], ...el };
            });
            this.dataArr.forEach((dataElement) => {
                if (dataElement.ContrEmployeeTypeId !== 0) {
                    for (const role of this.ownerRole) {
                        if (dataElement.ContrEmployeeTypeId === role.ContrEmployeeTypeID) {
                            dataElement.ContrEmployeeTypeId = role.ContractorEmployeeTypeTranslated;
                        }
                    }
                }
            });
        } else {
            // this._srvStorage.removeStorage('ownershipInternal');
            this.forwardedData.OwnershipDetails = { ...this.forwardedData.OwnershipDetails, ...this.finalOuterData };
            // const ownershipDataMerged = JSON.stringify(this.forwardedData.OwnershipDetails);
            this.clonedObject = JSON.parse(JSON.stringify(this.forwardedData.OwnershipDetails));
            this.bindData();

            this.visualCue = this._srvContactorRegistration.gridDifferenceCue(this.oldRecord.OwnershipDetails, this.forwardedData.OwnershipDetails);
        }
    }
    public showVisualCue() {
        const outerDataCue = [];
        Object.keys(this.editedData).map((el) => (outerDataCue[el + 'Cue'] = true));
        this.visualCue = { ...this.visualCue, ...outerDataCue };

        if (this.editedData.OwnershipInformationList) {
            this.editedData.OwnershipInformationList.forEach((element) => {
                const ownerListCue = {};
                const ind = this.visualCue.OwnershipInformationList.findIndex((x) => x.ID === element.ID);
                Object.keys(element).map((el) => (ownerListCue[el + 'Cue'] = true));
                this.visualCue.OwnershipInformationList[ind] = { ...this.visualCue.OwnershipInformationList[ind], ...ownerListCue };
            });
        }
    }
    public bindData() {
        setTimeout(() => {
            const elementRef = document.querySelectorAll('.visual');
            elementRef.forEach((element) => {
                element.parentElement.classList.add('visual-cue');
            });
        }, 0);

        if (this.forwardedData.OwnershipDetails && this.forwardedData.OwnershipDetails.hasOwnProperty('OwnershipInformationList')) {
            this.ownershipData = this.forwardedData.OwnershipDetails;
            // this.ownershipData.OwnershipStructure === 2 || this.ownershipData.OwnershipStructure === 1
            if (this.ownerStructureCheck(this.ownershipData.OwnershipStructure) || this.ownershipData.OwnershipStructure === null) {
                this.showExchangeSymbolSection = true;
            } else {
                this.showExchangeSymbolSection = false;
                this.disableAddOwnerPrinciple = false;
            }
            this.ownershipData.OwnershipInformationList.forEach((value) => {
                value.ContrEmployeeTypeId === 0 || value.ActiveFlag === true || value.ActiveFlag === 'Y' ? (value.ActiveFlag = 'Y') : (value.ActiveFlag = 'N'); // to be change with Active
                value.VeteranFlag === true || value.VeteranFlag === 'Y' ? (value.VeteranFlag = 'Y') : (value.VeteranFlag = 'N');
                value.LegalIssueFlag === true || value.LegalIssueFlag === 'Y' ? (value.LegalIssueFlag = 'Y') : (value.LegalIssueFlag = 'N');
                this.data.push(value);
                this.personnelData.push(value);
            });
            this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
            this._srvContactorRegistration.ownershipDuplicacyHandle(this.personnelData, {
                app: 'grid',
            });
            this.loadProducts();
        }
        if (this.ownershipData !== undefined) {
            this._srvContactorRegistration.ownershipStructure.next(this.ownershipData.OwnershipStructure);
        } else {
            this._srvContactorRegistration.ownershipStructure.next(null);
        }
        this.ownershipForm.setValue({
            OwnershipStructure: this.ownershipData !== undefined ? this.ownershipData.OwnershipStructure : null,
            ExchangeListing: this.ownershipData !== undefined ? this.ownershipData.ExchangeListing : '',
            StockSymbol: this.ownershipData !== undefined ? this.ownershipData.StockSymbol : '',
            YearsInCurrentOwnership: this.ownershipData !== undefined ? this.ownershipData.YearsInCurrentOwnership : null,
            MonthsInCurrentOwnership: this.ownershipData !== undefined ? this.ownershipData.MonthsInCurrentOwnership : null,
        });
    }

    // dropdown data
    public async ownerData() {
        const ownData = await this._srvOwnership.getOwnData(this.resourceId, this._srvAuthentication.currentLanguageID);
        this.OwnerStructureData = ownData.OwnerStructure;
        this.ownerRole = ownData.OwnerRole;
        this.OwnerStructure = this.OwnerStructureData.slice();
    }
    //  getter for easy access to form fields
    get ownershipInfoFormControl() {
        return this.ownershipForm.controls;
    }

    public accessDenied() {
        this.hidePage = true;
        const dialogRef = this._dialog.open({
            content: DialogAlertsComponent,
            width: 550,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>${this.pageContent.Ownership_Info.Access_Denied}</h2>
                                    <p>${this.pageContent.Ownership_Info.Permission}</p>
                                </div>
                            `;
        dialogRef.result.subscribe((res) => {
            this._route.navigate(['/contractorRegistration/company-information']);
        });
    }
    ngAfterViewInit() {
        setTimeout(() => {
            const elementRef = document.querySelectorAll('.visual');
            elementRef.forEach((element) => {
                element.parentElement.classList.add('visual-cue');
            });
        }, 0);

        // mobile grid code
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: LayoutModel) => {
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
    // navigate to previous page along with form state check
    public async onBackClick() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData({ currentPage: 'Ownership Information Page', nextPage: 'contact-information' }, null, 'OwnershipInformation/EditEventOwnershipInfo');
            this._route.navigate(['/contractorRegistration/contact-information']);
            return;
        }
        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this._route.navigate(['/contractorRegistration/contact-information']);
            return;
        }
        if (this.ownershipForm.dirty) {
            const dialogRef = this._dialog.open({
                content: SaveAlertComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Ownership_Info.Warning;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Data_unsaved}</p>
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
    // extension of the upper function
    public async onBackClickFunction() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            this._route.navigate(['/contractorRegistration/contact-information']);
            return;
        }
        this._srvContactInformation.incomingData.next(this.oldRecord);
        const response = await this._srvContactorRegistration.saveLastPageVisited('contact-information');
        if (response === 1) {
            this._route.navigate(['/contractorRegistration/contact-information']);
        }
    }

    toChangeEmployeeTypeId() {
        this.oldRecord.OwnershipDetails.OwnershipInformationList.forEach((dataElement, index) => {
            if (dataElement.ContrEmployeeTypeId !== 0) {
                for (const role of this.ownerRole) {
                    if (dataElement.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                        this.oldRecord.OwnershipDetails.OwnershipInformationList[index].ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                    }
                }
            }
        });
    }
    // runs if user has selected is owner/principal from signup
    public structureIDChange(ownershipstructureObject) {
        this._srvContactorRegistration.ownershipStructure.next(ownershipstructureObject.OwnerStructureID);
        // ownershipstructureObject.OwnerStructureID === 1 || ownershipstructureObject.OwnerStructureID === 2
        if (this.ownerStructureCheck(ownershipstructureObject.OwnerStructureID)) {
            this.showExchangeSymbolSection = true;
            this.disableAddOwnerPrinciple = true;
            if (this.personnelData.length > 1) {
                this.data = [];
                this.personnelData.forEach((elementPData) => {
                    if (elementPData.ContrEmployeeTypeId !== 0) {
                        elementPData.IsContractorActive = 'N';
                        this.data.push(elementPData);
                    }
                });
                this.loadProducts();
                this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
                this._srvContactorRegistration.ownershipDuplicacyHandle(this.personnelData, {
                    app: 'grid',
                });
            }
        } else {
            this.showExchangeSymbolSection = false;
            this.disableAddOwnerPrinciple = false;

            if (this.loginDetails[0].IsOwnerPrinciple === true && this.personnelData.length === 1) {
                this._srvContactorRegistration.ownershipDuplicacyHandle(this.data, {
                    app: 'signupImport',
                    email: this.loginDetails[0].Email,
                });
                this.emailDuplicacyCheck = this._srvContactorRegistration.ownershipEmail.subscribe((ownershipDuplicacyState) => {
                    this.duplicacyCheck = ownershipDuplicacyState;
                });
                let ownerPrincipleObject = null;
                if (this.duplicacyCheck === false) {
                    this._srvContactorRegistration.userFromSignupAdded.next(true);
                    if (this.loginDetails[0].ContrID > 0) {
                        const notImport = this.data.some((el) => el.IsContractorActive === 'N' && el.IsDeletedFlag === false);
                        const structure = this.OwnerStructure.find((struc) => struc.OwnerStructureID === this.oldRecord.OwnershipDetails.OwnershipStructure);
                        if (
                            structure.OwnerStructureDesc === 'Publicly Traded' ||
                            (structure.OwnerStructureDesc === 'Division, Subsidiary, or Affiliate of a Publicly Traded Company' && (!this.editedData.length || !Object.keys(this.editedData).length)) ||
                            notImport
                        ) {
                            this._srvContactorRegistration.userFromSignupAdded.next(false);
                        } else {
                            ownerPrincipleObject = {
                                OwnershipNumber: null,
                                ID: 2,
                                OwnershipName: this.loginDetails[0].EmployeeFullName.trim(),
                                ContrEmployeeTypeId: null,
                                ContactEmail: this.loginDetails[0].Email,
                                ContactPhone: '',
                                VeteranEmployeeMilitaryAffiliation: '',
                                VeteranMilitaryAffiliationData: [],
                                SocialSecurityNumber: '',
                                DrivingLicense: null,
                                DateOfBirth: null,
                                OwnershipPercentage: 0,
                                ActiveFlag: true,
                                VeteranFlag: false,
                                VeteranEmployeeHireDate: null,
                                MilitaryAffilationNumber: null,
                                LegalIssueFlag: false,
                                IsContractorActive: 'Y',
                                OwnershipNameCue: false,
                                ContactEmailCue: false,
                                ContactPhoneCue: false,
                                VeteranEmployeeMilitaryAffiliationCue: false,
                                SocialSecurityNumberCue: false,
                                DrivingLicenseCue: false,
                                DateOfBirthCue: false,
                                OwnershipPercentageCue: false,
                                ActiveFlagCue: false,
                                VeteranFlagCue: false,
                                VeteranEmployeeHireDateCue: false,
                                LegalIssueFlagCue: false,
                                IsContractorActiveCue: true,
                            };
                        }
                    } else {
                        ownerPrincipleObject = {
                            OwnershipNumber: null,
                            ID: 2,
                            OwnershipName: this.loginDetails[0].EmployeeFullName.trim(),
                            ContrEmployeeTypeId: this.loginDetails[0].IsOwnerPrinciple ? 9 : null,
                            ContactEmail: this.loginDetails[0].Email,
                            ContactPhone: '',
                            VeteranEmployeeMilitaryAffiliation: '',
                            VeteranMilitaryAffiliationData: [],
                            MilitaryAffilationNumber: null,
                            SocialSecurityNumber: '',
                            DrivingLicense: '',
                            DateOfBirth: null,
                            OwnershipPercentage: 0,
                            ActiveFlag: 'Y',
                            VeteranFlag: 'N',
                            VeteranEmployeeHireDate: null,
                            LegalIssueFlag: 'N',
                            IsContractorActive: 'Y',
                        };
                    }

                    if (
                        this.loginDetails[0].ContrID > 0 &&
                        this.oldRecord &&
                        this.oldRecord.hasOwnProperty('OwnershipDetails') &&
                        this.ownerStructureCheck(this.oldRecord.OwnershipDetails.OwnershipStructure) &&
                        (!this.editedData.length || !Object.keys(this.editedData).length)
                    ) {
                    } else {
                        const ownerPrincipleAddObject = {
                            ...ownerPrincipleObject,
                            ActiveFlag: 'Y',
                            VeteranFlag: 'N',
                            LegalIssueFlag: 'N',
                        };
                        this.personnelData.push(ownerPrincipleObject);
                        this.data.push(ownerPrincipleAddObject);
                        this.loadProducts();
                    }
                }
            }
            if (this.personnelData.length > 1 && this.personnelData[1].IsContractorActive === 'N') {
                // to be change with IsContractorActive
                const dialogRef = this._dialog.open({
                    content: SaveAlertComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.header = this.pageContent.Ownership_Info.Warning;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Structure}</p>
                                </div>
                            `;
                dialogRef.result.subscribe((result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        this.checkDuplicateMail = false;
                        // this.loginDetails[0].ContrID >0 ? this.saveImport('Y'): this.loadGrid(false);
                        this.loadGrid(false);
                    } else {
                        this.checkDuplicateMail = true;
                        if (this.loginDetails[0].ContrID > 0) {
                            this.saveImport('N');
                        } else {
                            this.data = [];
                            this.personnelData.forEach((elementNData) => {
                                if (elementNData.ContrEmployeeTypeId !== 0) {
                                    elementNData.IsContractorActive = 'N'; // to be change with IsContractorActive
                                    this.data.push(elementNData);
                                } else {
                                    this.data.push(elementNData);
                                }
                            });
                            this.loadProducts();
                            this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
                        }
                    }
                });
            }
        }
    }
    saveImport(state) {
        const importData = [];
        for (const ele of this.data) {
            // tslint:disable-next-line:forin
            if (ele.ContrEmployeeTypeId === 0) continue;
            const obj = {};
            for (const key in ele) {
                if (key === 'IsContractorActive' || key === 'OwnershipNumber' || key === 'ID' || key === 'ContrEmployeeTypeId') {
                    if (key === 'IsContractorActive') {
                        obj[key] = state;
                    } else if (key === 'ContrEmployeeTypeId') {
                        for (const role of this.ownerRole) {
                            if (ele[key] === role.ContractorEmployeeTypeTranslated) {
                                obj[key] = role.ContrEmployeeTypeID;
                            }
                        }
                    } else {
                        obj[key] = ele[key];
                    }
                }
            }
            importData.push(obj);
        }
        this.loggedInUserType === 'Internal' ? this.internalFinalSave({ OwnershipInformationList: importData }) : this.finalContractorSave({ OwnershipInformationList: importData });
    }

    public loadGrid(state, email?) {
        if (this.loginDetails[0].ContrID > 0 && this.loggedInUserType !== 'Internal' && state) {
            const findItem = this.data.find((elem) => elem.ContactEmail.toLowerCase() === email.toLowerCase());
            this.data = [];
            this.data.push(findItem);
            this.saveImport('Y');
            return;
        }
        this.data = [];
        this.personnelData.forEach((elementData) => {
            if (!elementData.hasOwnProperty('IsDeletedFlag') || elementData.IsDeletedFlag === false) {
                elementData.IsContractorActive = 'Y';
            }
            this.data.push(elementData);
        });

        // to reinitialise visual cue flag
        if (this.loginDetails[0].ContrID !== 0 && this.editedData.hasOwnProperty('OwnershipInformationList')) {
            const cuekey = Object.keys(this.data[0]).filter((res) => res.includes('Cue'));
            this.visualCue.OwnershipInformationList.forEach((res, index) => {
                cuekey.map((key) => {
                    if (res[key] === true && this.data[index].ContrEmployeeTypeId !== 0) {
                        this.data[index + 1][key] = true;
                    }
                });
            });
        }
        if (this.loginDetails[0].ContrID > 0) {
            if (this.editedData.OwnershipInformationList) {
                this.editedData.OwnershipInformationList.map((elementData) => {
                    if (!elementData.hasOwnProperty('IsDeletedFlag') || elementData.IsDeletedFlag === false) {
                        elementData.IsContractorActive = 'Y';
                    }
                });
            }
        }
        this._srvContactorRegistration.ownershipDuplicacyHandle(this.personnelData, {
            app: 'grid',
        });
        this.loadProducts();
        this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
    }
    // data submission
    public async onSubmit() {
        this.emailDuplicacyCheck = this._srvContactorRegistration.ownershipEmail.subscribe((ownershipDuplicacyState) => {
            this.duplicacyCheck = ownershipDuplicacyState;
        });
        this.submitted = true;

        if (this.ownershipForm.valid) {
            this.percentageCheck = this._srvContactorRegistration.transmitOwnerShipPercentage.subscribe((percentage) => {
                this.companyOwnershipPercentage = percentage;
            });
            this.phoneNumberCheck = this._srvContactorRegistration.phoneNumberExists.subscribe((numberExists) => {
                this.validPhoneNumber = numberExists;
            });
            if (this.showExchangeSymbolSection === false) {
                if (this.duplicacyCheck === false) {
                    if (this.companyOwnershipPercentage === 100 && this.validPhoneNumber === true) {
                        this.ownershipDataObj = this.ownershipInfoObjectCreation();
                        const counter = {};

                        this.ownershipDataObj.OwnershipDetails.OwnershipInformationList.forEach((obj) => {
                            if (obj.IsContractorActive === 'Y' && (!obj.hasOwnProperty('IsDeletedFlag') || obj.IsDeletedFlag === false || obj.IsDeletedFlag === null)) {
                                const key = JSON.stringify(obj.ContrEmployeeTypeId);
                                counter[key] = (counter[key] || 0) + 1;
                            }
                        });
                        if (counter[9] && counter[9] > 1) {
                            const dialogRef = this._dialog.open({
                                content: DialogAlertsComponent,
                                width: 550,
                            });
                            const dialog = dialogRef.content.instance;
                            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Primary_Onwer_Exist}</p>
                                </div>
                            `;
                            return;
                        } else if (!counter[9] || counter[9] <= 0) {
                            const dialogRef = this._dialog.open({
                                content: DialogAlertsComponent,
                                width: 550,
                            });
                            const dialog = dialogRef.content.instance;
                            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Please_Add_Atleast_One_Owner}</p>
                                </div>
                            `;
                            return;
                        }

                        if (this.loggedInUserType == 'Internal') {
                            this.internalEmployeeSave('main');
                            return;
                        }
                        // check primary owner in this too
                        if (this.loginDetails[0].ContrID > 0) {
                            if (this.ownershipDataObj.OwnershipDetails.hasOwnProperty('OwnershipInformationList')) {
                                delete this.ownershipDataObj.OwnershipDetails.OwnershipInformationList;
                            }

                            let mergedDetails;
                            if (this.editedData.hasOwnProperty('OwnershipInformationList')) {
                                mergedDetails = { ...this.ownershipDataObj.OwnershipDetails, OwnershipInformationList: [...this.editedData.OwnershipInformationList] };
                            } else if (this.finalOuterData === undefined) {
                                mergedDetails = this.ownershipDataObj.OwnershipDetails;
                            } else {
                                mergedDetails = { ...this.ownershipDataObj.OwnershipDetails };
                            }
                            if (mergedDetails.hasOwnProperty('OwnershipInformationList')) {
                                mergedDetails.OwnershipInformationList.map((el) => {
                                    if (el.ID !== 1 && (!el.hasOwnProperty('IsDeletedFlag') || el.IsDeletedFlag === false)) {
                                        el.IsContractorActive = 'Y';
                                    }
                                });
                            }
                            if (mergedDetails.OwnershipInformationList && mergedDetails.OwnershipInformationList.length > 0) {
                                const onwershipList = mergedDetails.OwnershipInformationList;
                                mergedDetails = this._srvContactorRegistration.gridDifference(
                                    this.ownershipDataObj.OwnershipDetails,
                                    this.oldRecord.OwnershipDetails,
                                    this.finalOuterData === undefined ? {} : this.finalOuterData
                                );

                                mergedDetails = { ...mergedDetails, OwnershipInformationList: onwershipList };
                                const ownerList = [];
                                mergedDetails.OwnershipInformationList.forEach((el: OwnwershipInformationModel, ind) => {
                                    let ObjectFoundInApproval = false;
                                    ObjectFoundInApproval = this.editedData.OwnershipInformationList.find((pendingEl) => pendingEl.ID === el.ID);
                                    if (ObjectFoundInApproval) {
                                        const ObjectIndexInApproval = this.editedData.OwnershipInformationList.findIndex((pendingEl) => pendingEl.ID === el.ID);
                                        const objData = this._srvContactorRegistration.differenceCompany(
                                            mergedDetails.OwnershipInformationList[ObjectIndexInApproval],
                                            this.oldRecord.OwnershipDetails.OwnershipInformationList[ObjectIndexInApproval],
                                            this.editedData.OwnershipInformationList[ObjectIndexInApproval]
                                        );
                                        if (Object.keys(objData).length) {
                                            const keyToContain = { ID: el.ID, OwnershipNumber: el.OwnershipNumber, ...objData };
                                            ownerList.push(keyToContain);
                                        }
                                    }
                                });
                                if (ownerList.length) {
                                    mergedDetails.OwnershipInformationList = ownerList;
                                } else if (mergedDetails.OwnershipInformationList) {
                                    delete mergedDetails.OwnershipInformationList;
                                }

                                if (mergedDetails.OwnershipInformationList) {
                                    const result = [];
                                    mergedDetails.OwnershipInformationList.forEach((elem) => {
                                        const match = result.find((r) => r.ID === elem.ID);
                                        if (match) {
                                            Object.assign(match, elem);
                                        } else {
                                            result.push(elem);
                                        }
                                    });
                                    mergedDetails.OwnershipInformationList = result;

                                    mergedDetails.OwnershipInformationList.map((el, index) => {
                                        Object.keys(mergedDetails.OwnershipInformationList[index]).map((elem) => {
                                            delete mergedDetails.OwnershipInformationList[index][elem + 'Cue'];
                                        });
                                    });
                                }
                            } else {
                                mergedDetails = this._srvContactorRegistration.gridDifference(
                                    this.ownershipDataObj.OwnershipDetails,
                                    this.oldRecord.OwnershipDetails,
                                    this.finalOuterData === undefined ? {} : this.finalOuterData
                                );
                            }

                            const property = [
                                'ExchangeListing',
                                'OwnershipInformationList',
                                'OwnershipName',
                                'OwnershipStructure',
                                'StockSymbol',
                                'MonthsInCurrentOwnership',
                                'YearsInCurrentOwnership',
                            ];
                            let pendingApprovalObject = this.pick(mergedDetails, property);

                            const editObj: editObjModel = {};
                            editObj.ResourceId = this.resourceId;
                            editObj.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
                            editObj.CCOpsID = this.loginDetails[0].CCOpsID;
                            await this._srvOwnership.getServerTime();
                            pendingApprovalObject = {
                                ...pendingApprovalObject,
                                ModifiedDateTime: this._srvOwnership.timeStamp,
                                ModifiedResourceID: this._srvAuthentication.Profile.ContractorResourceID,
                            };
                            editObj.CCOpsData = JSON.stringify({ OwnershipDetails: pendingApprovalObject });
                            editObj.Contr_ID = this.loginDetails[0].ContrID;
                            editObj.PageName = 'Ownership Information Page';
                            if (pendingApprovalObject && Object.keys(pendingApprovalObject).length > 2) {
                                const response = await this._srvContractorData.saveContractorData(
                                    { currentPage: 'Ownership Information Page', nextPage: 'legal-questions' },
                                    { OwnershipDetails: pendingApprovalObject },
                                    'OwnershipInformation/EditEventOwnershipInfo'
                                );
                                this.crComments = await this._srvContractorData.getPageComments('Ownership Information');
                                if (this._srvAuthentication.Profile.EventName === 'No Event') {
                                    if (response === 1) {
                                        mergedDetails = null;
                                        this.editedData = null;
                                        this.finalOuterData = null;
                                        this.callMain();
                                    } else {
                                        this.unsuccess();
                                    }
                                } else {
                                    if (response === 1) {
                                        this._route.navigate(['/contractorRegistration/legal-questions']);
                                    } else {
                                        this.unsuccess();
                                    }
                                }
                            } else {
                                if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                                    await this._srvContractorData.saveContractorData(
                                        { currentPage: 'Ownership Information Page', nextPage: 'legal-questions' },
                                        null,
                                        'OwnershipInformation/EditEventOwnershipInfo'
                                    );
                                    this._route.navigate(['/contractorRegistration/legal-questions']);
                                } else {
                                    await this._srvContractorData.saveContractorData(
                                        { currentPage: 'Ownership Information Page', nextPage: 'legal-questions' },
                                        null,
                                        'OwnershipInformation/EditEventOwnershipInfo'
                                    );
                                    this.crComments = await this._srvContractorData.getPageComments('Ownership Information');
                                }
                            }
                            return;
                        }

                        this.forwardedData = {
                            ...this.forwardedData,
                            ...this.ownershipDataObj,
                        };
                        let count = 0;
                        this.objProgram = this.forwardedData;
                        this.objProgram.OwnershipDetails.OwnershipInformationList.map((obj) => {
                            if (!obj.PRNL_ID) {
                                obj.PRNL_ID = 0;
                            }
                            if (obj.ActiveFlag === 'Y') {
                                obj.ActiveFlag = true;
                            } else if (obj.ActiveFlag === 'N') {
                                obj.ActiveFlag = false;
                            }
                        });
                        this.objProgram.ResourceId = this.resourceId;
                        this.objProgram.CCopsId = this.loginDetails[0].CCOpsID;
                        this.objProgram.LastPageVisited = 'legal-questions';
                        this.objProgram.OwnershipDetails.OwnershipInformationList.map((res) => {
                            if (
                                res.ContrEmployeeTypeId === 9 &&
                                res.IsContractorActive === 'Y' &&
                                ((res.hasOwnProperty('IsDeletedFlag') && (res.IsDeletedFlag === false || res.IsDeletedFlag === null)) || !res.hasOwnProperty('IsDeletedFlag'))
                            ) {
                                count++;
                            }
                        });
                        if (count > 0) {
                            const response = await this._srvOwnership.putOwnerShipData(this.objProgram);
                            if (response === 1) {
                                this._route.navigate(['/contractorRegistration/legal-questions']);
                            }
                        } else {
                            const dialogRef = this._dialog.open({
                                appendTo: this.containerRef,
                                content: DialogAlertsComponent,
                                width: 550,
                            });
                            const dialog = dialogRef.content.instance;
                            const message = this.pageContent.Ownership_Info.Please_Add_Atleast_One_Owner;
                            dialog.alertMessage = `
                                    <div class="modal-alert info-alert">
                                        <p>${message}</p>
                                    </div>
                                `;
                        }
                    } else if (this.validPhoneNumber === false || this.companyOwnershipPercentage !== 100) {
                        const dialogRef = this._dialog.open({
                            appendTo: this.containerRef,
                            content: DialogAlertsComponent,
                            width: 550,
                        });
                        const emptyGrid = this.dataArr.filter((ele) => {
                            return (
                                ele.IsContractorActive === 'Y' &&
                                ((ele.hasOwnProperty('IsDeletedFlag') && (ele.IsDeletedFlag === false || ele.IsDeletedFlag === null)) || !ele.hasOwnProperty('IsDeletedFlag'))
                            );
                        });
                        const dialog = dialogRef.content.instance;
                        let message =
                            this.validPhoneNumber === false
                                ? this.pageContent.Ownership_Info.Update_Info
                                : this.companyOwnershipPercentage !== 100
                                ? this.pageContent.Ownership_Info.Percentage_Ownership
                                : '';
                        message = emptyGrid.length ? message : this.pageContent.Ownership_Info.Please_Enter_atleast_one_employee_record;
                        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${message}</p>
                                </div>
                            `;
                    }
                } else {
                    const dialogRef = this._dialog.open({
                        appendTo: this.containerRef,
                        content: DialogAlertsComponent,
                        width: 550,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Same_Email}</p>
                                </div>
                            `;
                    this._srvContactorRegistration.ownershipEmail.next(true);
                }
            } else if (this.showExchangeSymbolSection === true) {
                this.ownershipDataObj = this.ownershipInfoObjectCreation();
                if (this.loggedInUserType === 'Internal') {
                    this.internalEmployeeSave('main');
                    return;
                }
                if (this.loginDetails[0].ContrID > 0) {
                    const approvalObject: any = this._srvContactorRegistration.gridDifference(
                        this.ownershipDataObj.OwnershipDetails,
                        this.oldRecord.OwnershipDetails,
                        this.finalOuterData === undefined ? {} : this.finalOuterData
                    );
                    if (approvalObject.OwnershipInformationList) {
                        delete approvalObject.OwnershipInformationList;
                    }
                    if (this.ownerStructureCheck(this.ownershipDataObj.OwnershipDetails.OwnershipStructure)) {
                    }
                    const property = ['ExchangeListing', 'OwnershipInformationList', 'OwnershipName', 'OwnershipStructure', 'StockSymbol', 'MonthsInCurrentOwnership', 'YearsInCurrentOwnership'];
                    let pendingApprovalObject = this.pick(approvalObject, property);
                    const editObj: editObjModel = {};
                    editObj.ResourceId = this.resourceId;
                    editObj.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
                    editObj.CCOpsID = this.loginDetails[0].CCOpsID;
                    await this._srvOwnership.getServerTime();
                    pendingApprovalObject = { ...pendingApprovalObject, ModifiedDateTime: this._srvOwnership.timeStamp, ModifiedResourceID: this._srvAuthentication.Profile.ContractorResourceID };
                    editObj.CCOpsData = JSON.stringify({ OwnershipDetails: pendingApprovalObject });
                    editObj.Contr_ID = this.loginDetails[0].ContrID;
                    editObj.PageName = 'Ownership Information Page';
                    if (pendingApprovalObject && Object.keys(pendingApprovalObject).length > 2) {
                        const resp = await this._srvContractorData.saveContractorData(
                            { currentPage: 'Ownership Information Page', nextPage: 'legal-questions' },
                            { OwnershipDetails: pendingApprovalObject },
                            'OwnershipInformation/EditEventOwnershipInfo'
                        );
                        this.crComments = await this._srvContractorData.getPageComments('Ownership Information');
                        if (this._srvAuthentication.Profile.EventName === 'No Event') {
                            if (resp === 1) {
                                this.editedData = null;
                                this.finalOuterData = null;
                                this.callMain();
                            } else {
                                this.unsuccess();
                            }
                        } else {
                            if (resp === 1) {
                                this._route.navigate(['/contractorRegistration/legal-questions']);
                            } else {
                                this.unsuccess();
                            }
                        }
                    } else {
                        await this._srvContractorData.saveContractorData(
                            { currentPage: 'Ownership Information Page', nextPage: 'legal-questions' },
                            null,
                            'OwnershipInformation/EditEventOwnershipInfo'
                        );
                        this.crComments = await this._srvContractorData.getPageComments('Ownership Information');
                        if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                            this._route.navigate(['/contractorRegistration/legal-questions']);
                        }
                    }
                    return;
                }

                this.forwardedData = {
                    ...this.forwardedData,
                    ...this.ownershipDataObj,
                };
                this.objProgram = this.forwardedData;
                this.objProgram.OwnershipDetails.OwnershipInformationList.map((obj) => {
                    if (!obj.PRNL_ID) {
                        obj.PRNL_ID = 0;
                    }
                    if (obj.ActiveFlag === 'Y') {
                        obj.ActiveFlag = true;
                    } else if (obj.ActiveFlag === 'N') {
                        obj.ActiveFlag = false;
                    }
                });
                this.objProgram.ResourceId = this.resourceId;
                this.objProgram.CCopsId = this.loginDetails[0].CCOpsID;
                this.objProgram.LastPageVisited = 'legal-questions';
                const response = await this._srvOwnership.putOwnerShipData(this.objProgram);
                if (response === 1) {
                    this._route.navigate(['/contractorRegistration/legal-questions']);
                }
            }
        }
    }
    // ownership json object creation
    public ownershipInfoObjectCreation() {
        const ownerDataArray = JSON.parse(JSON.stringify(this.personnelData));
        ownerDataArray.map((roleType) => {
            for (const role of this.ownerRole) {
                if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                    roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                }
            }
        });
        if (this.forwardedData.OwnershipDetails && this.forwardedData.OwnershipDetails.OwnershipInformationList) {
            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((roleType) => {
                for (const role of this.ownerRole) {
                    if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                        roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                    }
                }
            });
        }
        return (this.ownershipDataObj = {
            OwnershipDetails: {
                OwnershipStructure: this.ownershipForm.value['OwnershipStructure'],
                ExchangeListing: this.ownerStructureCheck(this.ownershipForm.value['OwnershipStructure']) ? this.ownershipForm.value['ExchangeListing'] : '', //this.ownershipForm.value['OwnershipStructure'] === 1 || this.ownershipForm.value['OwnershipStructure'] === 2
                StockSymbol: this.ownerStructureCheck(this.ownershipForm.value['OwnershipStructure']) ? this.ownershipForm.value['StockSymbol'] : '',
                YearsInCurrentOwnership: parseInt(this.ownershipForm.value['YearsInCurrentOwnership'], 10),
                MonthsInCurrentOwnership: parseInt(this.ownershipForm.value['MonthsInCurrentOwnership'], 10),
                OwnershipInformationList: ownerDataArray,
            },
        });
    }
    // add owner/principal popup opens
    public openDialogForm(event, option, selectedData?, ownerList?) {
        const emailArray: string[] = [];
        this.forwardedData.OwnershipDetails.OwnershipInformationList.map((res) => {
            if (res.hasOwnProperty('ContactEmail') && res.ContactEmail !== '') {
                emailArray.push(res.ContactEmail);
            }
        });
        if (this.ContrID > 0) {
            this.checkDuplicateMail = this.dataArr.some((el) => el.IsContractorActive === 'N');
        }
        if (option === 'ADD') {
            let ownershipPercentageCheck = 0;
            ownerList.forEach((ele) => {
                if ((ele.IsContractorActive === 'Y' && ele.hasOwnProperty('IsDeletedFlag') && (ele.IsDeletedFlag === false || ele.IsDeletedFlag === null)) || !ele.hasOwnProperty('IsDeletedFlag')) {
                    ownershipPercentageCheck = ownershipPercentageCheck + ele.OwnershipPercentage;
                }
            });
            if (ownershipPercentageCheck >= 100) {
                const dialogR = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const dialog = dialogR.content.instance;
                dialog.alertMessage = `
                        <div class="modal-alert info-alert">
                          <p>
                          ${this.pageContent.Ownership_Info.you_cant_add}<br>
                          ${this.pageContent.Ownership_Info.exisiting_already_100}
                          </p>
                        </div>
                    `;
                return;
            }

            const dialogRef = this._dialog.open({
                content: OwnershipPageDialogComponent,
                width: 550,
            });
            const contractorInfo = dialogRef.content.instance;
            contractorInfo.title = this.pageContent.Ownership_Info.Add_New_Owner_Principal;
            contractorInfo.page = 'Ownership';
            contractorInfo.ownershipArrayList = ownerList;
            contractorInfo.emailArray = emailArray;
            contractorInfo.isDuplicateMail = this.checkDuplicateMail;
            contractorInfo.deletedMails = this.deletedMailDuplicate;
            contractorInfo.isDeletedRecovered = false;
            contractorInfo.isReadonlyMail = false;
            dialogRef.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'LOADGRID') {
                    this.checkDuplicateMail = false;
                    this.loadGrid(true, resultFromDialog['email']);
                }
                if (resultFromDialog['button'] === 'SUBMIT') {
                    const datafromDialog = resultFromDialog['insertedData'];
                    const add = {};
                    if (this.loginDetails[0].ContrID > 0) {
                        Object.assign(add, {
                            OwnershipNumber: datafromDialog.OwnershipNumber,
                            ID: this.personnelData.length + 1,
                            SocialSecurityNumber: datafromDialog.SocialSecurityNumber,
                            DrivingLicense: datafromDialog.DrivingLicense,
                            DateOfBirth: datafromDialog.DateOfBirth,
                            VeteranMilitaryAffiliationData: datafromDialog.VeteranMilitaryAffiliationData,
                            VeteranEmployeeHireDate: datafromDialog.VeteranEmployeeHireDate,
                            OwnershipName: datafromDialog.OwnershipName,
                            ContrEmployeeTypeId: this.ownerRoletoDialog(datafromDialog),
                            IsContractor: 'N',
                            ContactEmail: datafromDialog.ContactEmail,
                            ContactPhone: datafromDialog.ContactPhone,
                            OwnershipPercentage: parseInt(datafromDialog.OwnershipPercentage, 10),
                            ActiveFlag: datafromDialog.ActiveFlag === true ? 'Y' : 'N',
                            VeteranFlag: datafromDialog.VeteranFlag === true ? 'Y' : 'N',
                            LegalIssueFlag: 'N',
                            IsContractorActive: 'Y',
                            ContactEmailCue: true,
                            ContactPhoneCue: true,
                            VeteranEmployeeMilitaryAffiliationCue: true,
                            SocialSecurityNumberCue: true,
                            DrivingLicenseCue: true,
                            DateOfBirthCue: true,
                            OwnershipPercentageCue: true,
                            ActiveFlagCue: true,
                            VeteranFlagCue: true,
                            VeteranEmployeeHireDateCue: true,
                            LegalIssueFlagCue: true,
                            IsContractorActiveCue: true,
                            OwnershipNameCue: true,
                            ContrEmployeeTypeIdCue: true,
                        });
                    } else {
                        Object.assign(add, {
                            OwnershipNumber: datafromDialog.OwnershipNumber,
                            ID: this.personnelData.length + 1,
                            SocialSecurityNumber: datafromDialog.SocialSecurityNumber,
                            DrivingLicense: datafromDialog.DrivingLicense,
                            DateOfBirth: datafromDialog.DateOfBirth,
                            VeteranEmployeeHireDate: datafromDialog.VeteranEmployeeHireDate,
                            VeteranMilitaryAffiliationData: datafromDialog.VeteranMilitaryAffiliationData,
                            OwnershipName: datafromDialog.OwnershipName,
                            ContrEmployeeTypeId: this.ownerRoletoDialog(datafromDialog),
                            IsContractor: 'N',
                            ContactEmail: datafromDialog.ContactEmail,
                            ContactPhone: datafromDialog.ContactPhone,
                            OwnershipPercentage: parseInt(datafromDialog.OwnershipPercentage, 10),
                            ActiveFlag: datafromDialog.ActiveFlag === true ? 'Y' : 'N',
                            VeteranFlag: datafromDialog.VeteranFlag === true ? 'Y' : 'N',
                            LegalIssueFlag: 'N',
                            IsContractorActive: 'Y',
                            IsDeletedFlag: false,
                            DeletedDateTime: null,
                            DeletedByResourceID: null,
                        });
                    }
                    const incomingObj = resultFromDialog['insertedData'];
                    const assignedId = { ID: this.personnelData.length + 1 };
                    const combinedObj = {};
                    Object.assign(combinedObj, incomingObj, assignedId);

                    this.personnelData.push(combinedObj);
                    this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
                    this._srvContactorRegistration.ownershipDuplicacyHandle(this.personnelData, {
                        app: 'grid',
                    });
                    this.data.push(add);
                    this.saveOwnersPrinciplesData(assignedId.ID);
                }
                if (resultFromDialog['button'] === 'IMPORTDELETED') {
                    const emailFromDialog = resultFromDialog['email'];
                    const deleteRecover = this.personnelData.find((ele) => ele.ContactEmail === emailFromDialog);
                    this.saveOwnersPrinciplesData(null, false, { deletedRecover: true, email: emailFromDialog });
                }
            });
        }
        if (option === 'EDIT') {
            this.selectedItem = JSON.parse(JSON.stringify(selectedData));
            const dialogRef = this._dialog.open({
                content: OwnershipPageDialogComponent,
                width: 550,
            });
            const contractorInfo = dialogRef.content.instance;
            contractorInfo.title = this.pageContent.Ownership_Info.Edit_Owner_Principal;
            contractorInfo.page = 'Ownership';
            contractorInfo.ownershipArrayList = ownerList;
            contractorInfo.emailArray = emailArray;
            contractorInfo.isDuplicateMail = false;
            contractorInfo.isReadonlyMail = true;
            contractorInfo.isDeletedRecovered =
                this.selectedItem.IsDeletedFlag === true ||
                (this.selectedItem.hasOwnProperty('IsRecoveredFlag') && this.selectedItem.IsRecoveredFlag === true && this.loggedInUserType === 'Internal') ||
                (this.selectedItem.hasOwnProperty('IsRowDisable') && this.selectedItem.IsRowDisable === true && this.loggedInUserType !== 'Internal')
                    ? true
                    : false;
            const militaryAffs =
                this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData.length
                    ? this.selectedItem.VeteranMilitaryAffiliationData.map((el) => {
                          if (!el.hasOwnProperty('RemovedResourceID') || el.RemovedResourceID === null) return el.MilitaryAffiliationNumber;
                      })
                    : null;
            const empHireDate =
                this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData.length
                    ? moment(this.selectedItem.VeteranMilitaryAffiliationData[0].EmployeeHireDate, 'MM-DD-YYYY').format('MM-DD-YYYY')
                    : null;
            if (this.loginDetails[0].ContrID > 0) {
                contractorInfo._incomingData = {
                    OwnershipNumber: this.selectedItem.OwnershipNumber,
                    ID: this.selectedItem.ID,
                    OwnershipName: this.selectedItem.OwnershipName,
                    ContrEmployeeTypeId: this.ownerRoletoDialog(this.selectedItem),
                    ContactEmail: this.selectedItem.ContactEmail,
                    ContactPhone: this.selectedItem.ContactPhone,
                    SocialSecurityNumber: this.selectedItem.SocialSecurityNumber,
                    DrivingLicense: this.selectedItem.DrivingLicense,
                    DateOfBirth: moment(this.selectedItem.DateOfBirth, 'MM-DD-YYYY').format('MM-DD-YYYY'),
                    VeteranEmployeeHireDate: this.selectedItem.VeteranEmployeeHireDate,
                    OwnershipPercentage: parseInt(this.selectedItem.OwnershipPercentage, 10),
                    ActiveFlag: this.selectedItem.ActiveFlag === 'Y' ? true : false,
                    VeteranFlag: this.selectedItem.VeteranFlag === 'Y' ? true : false,
                    VeteranEmployeeMilitaryAffiliation: militaryAffs,
                    VeteranMilitaryAffiliationData:
                        this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData.length > 0 ? this.selectedItem.VeteranMilitaryAffiliationData : [],
                    LegalIssueFlag: this.selectedItem.LegalIssueFlag === 'Y' ? true : false,
                    IsContractorActive: 'Y',
                    TimeStamp: this.selectedItem.TimeStamp,
                    OwnershipNameCue: this.selectedItem.OwnershipNameCue,
                    ContactEmailCue: this.selectedItem.ContactEmailCue,
                    ContrEmployeeTypeIdCue: this.selectedItem.ContrEmployeeTypeIdCue,
                    ContactPhoneCue: this.selectedItem.ContactPhoneCue,
                    VeteranEmployeeMilitaryAffiliationCue:
                        (this.selectedItem.VeteranMilitaryAffiliationData && this.selectedItem.VeteranMilitaryAffiliationData.length) > 0 ? this.selectedItem.VeteranMilitaryAffiliationDataCue : false,
                    SocialSecurityNumberCue: this.selectedItem.SocialSecurityNumberCue,
                    DrivingLicenseCue: this.selectedItem.DrivingLicenseCue,
                    DateOfBirthCue: this.selectedItem.DateOfBirthCue,
                    OwnershipPercentageCue: this.selectedItem.OwnershipPercentageCue,
                    ActiveFlagCue: this.selectedItem.ActiveFlagCue,
                    VeteranFlagCue: this.selectedItem.VeteranFlagCue,
                    VeteranEmployeeHireDateCue: this.selectedItem.VeteranEmployeeHireDateCue,
                    LegalIssueFlagCue: this.selectedItem.LegalIssueFlagCue,
                    IsContractorActiveCue: this.selectedItem.IsContractorActiveCue,
                    visualCues:
                        this.loginDetails[0].ContrID === 0
                            ? null
                            : this.visualCue.OwnershipInformationList
                            ? this.visualCue.OwnershipInformationList.filter((el) => el.ContactEmail === this.selectedItem.ContactEmail)
                            : null,
                };
            } else {
                contractorInfo._incomingData = {
                    OwnershipNumber: this.selectedItem.OwnershipNumber,
                    ID: this.selectedItem.ID,
                    OwnershipName: this.selectedItem.OwnershipName,
                    ContrEmployeeTypeId: this.ownerRoletoDialog(this.selectedItem),
                    ContactEmail: this.selectedItem.ContactEmail,
                    ContactPhone: this.selectedItem.ContactPhone,
                    VeteranEmployeeMilitaryAffiliation: militaryAffs,
                    VeteranMilitaryAffiliationData: this.selectedItem.VeteranMilitaryAffiliationData,
                    SocialSecurityNumber: this.selectedItem.SocialSecurityNumber,
                    DrivingLicense: this.selectedItem.DrivingLicense,
                    DateOfBirth: moment(this.selectedItem.DateOfBirth, 'MM-DD-YYYY').format('MM-DD-YYYY'),
                    VeteranEmployeeHireDate: this.selectedItem.VeteranEmployeeHireDate,
                    OwnershipPercentage: parseInt(this.selectedItem.OwnershipPercentage, 10),
                    ActiveFlag: this.selectedItem.ActiveFlag === 'Y' ? true : false,
                    VeteranFlag: this.selectedItem.VeteranFlag === 'Y' ? true : false,
                    LegalIssueFlag: this.selectedItem.LegalIssueFlag === 'Y' ? true : false,
                    IsContractorActive: 'Y',
                    TimeStamp: this.selectedItem.TimeStamp,
                };
            }
            const dataOld = JSON.parse(JSON.stringify(this.forwardedData));
            dialogRef.result.subscribe((result) => {
                this.forwardedData = dataOld;

                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'SUBMIT') {
                    const datafromDialog = resultFromDialog['insertedData'];
                    const add: any = {};
                    if (this.loginDetails[0].ContrID > 0) {
                        Object.assign(add, {
                            OwnershipNumber: datafromDialog.OwnershipNumber,
                            VeteranEmployeeMilitaryAffiliation: datafromDialog.VeteranEmployeeMilitaryAffiliation === '' ? null : datafromDialog.VeteranEmployeeMilitaryAffiliation,
                            SocialSecurityNumber: datafromDialog.SocialSecurityNumber === '' ? null : datafromDialog.SocialSecurityNumber,
                            DrivingLicense: datafromDialog.DrivingLicense === '' ? null : datafromDialog.DrivingLicense,
                            DateOfBirth: datafromDialog.DateOfBirth,
                            VeteranEmployeeHireDate: datafromDialog.VeteranEmployeeHireDate,
                            VeteranMilitaryAffiliationData: datafromDialog.VeteranMilitaryAffiliationData,
                            ID: datafromDialog.ID,
                            OwnershipName: datafromDialog.OwnershipName,
                            ContrEmployeeTypeId: this.ownerIdData(datafromDialog), //datafromDialog.ContrEmployeeTypeId === 1 ? 'Principal' : datafromDialog.ContrEmployeeTypeId === 2 ? 'Owner' : 'Primary Owner',
                            ContactEmail: datafromDialog.ContactEmail,
                            ContactPhone: datafromDialog.ContactPhone,
                            OwnershipPercentage: parseInt(datafromDialog.OwnershipPercentage, 10),
                            ActiveFlag: datafromDialog.ActiveFlag === true ? 'Y' : 'N',
                            VeteranFlag: datafromDialog.VeteranFlag === true ? 'Y' : 'N',
                            LegalIssueFlag: datafromDialog.LegalIssueFlag === true ? 'Y' : 'N',
                            IsContractorActive: 'Y',
                            ContactEmailCue: datafromDialog.ContactEmailCue,
                            ContactPhoneCue: datafromDialog.ContactPhoneCue,
                            VeteranEmployeeMilitaryAffiliationCue: datafromDialog.VeteranEmployeeMilitaryAffiliationCue,
                            SocialSecurityNumberCue: datafromDialog.SocialSecurityNumberCue,
                            DrivingLicenseCue: datafromDialog.DrivingLicenseCue,
                            DateOfBirthCue: datafromDialog.DateOfBirthCue,
                            OwnershipPercentageCue: datafromDialog.OwnershipPercentageCue,
                            ActiveFlagCue: datafromDialog.ActiveFlagCue,
                            VeteranFlagCue: datafromDialog.VeteranFlagCue,
                            VeteranEmployeeHireDateCue: datafromDialog.VeteranEmployeeHireDateCue,
                            LegalIssueFlagCue: datafromDialog.LegalIssueFlagCue,
                            IsContractorActiveCue: datafromDialog.IsContractorActiveCue,
                            OwnershipNameCue: datafromDialog.OwnershipNameCue,
                            ContrEmployeeTypeIdCue: datafromDialog.ContrEmployeeTypeIdCue,
                        });
                    } else {
                        Object.assign(add, {
                            OwnershipNumber: datafromDialog.OwnershipNumber,
                            SocialSecurityNumber: datafromDialog.SocialSecurityNumber === '' ? null : datafromDialog.SocialSecurityNumber,
                            DrivingLicense: datafromDialog.DrivingLicense === '' ? null : datafromDialog.DrivingLicense,
                            DateOfBirth: datafromDialog.DateOfBirth,
                            VeteranMilitaryAffiliationData: datafromDialog.VeteranMilitaryAffiliationData,
                            VeteranEmployeeHireDate: datafromDialog.VeteranEmployeeHireDate,
                            ID: datafromDialog.ID,
                            OwnershipName: datafromDialog.OwnershipName,
                            ContrEmployeeTypeId: this.ownerIdData(datafromDialog), //datafromDialog.ContrEmployeeTypeId === 1 ? 'Principal' : datafromDialog.ContrEmployeeTypeId === 2 ? 'Owner' : 'Primary Owner',
                            ContactEmail: datafromDialog.ContactEmail,
                            ContactPhone: datafromDialog.ContactPhone,
                            OwnershipPercentage: parseInt(datafromDialog.OwnershipPercentage, 10),
                            ActiveFlag: datafromDialog.ActiveFlag === true ? 'Y' : 'N',
                            VeteranFlag: datafromDialog.VeteranFlag === true ? 'Y' : 'N',
                            LegalIssueFlag: datafromDialog.LegalIssueFlag === true ? 'Y' : 'N',
                            IsContractorActive: 'Y',
                            IsDeletedFlag: false,
                            DeletedDateTime: null,
                            DeletedByResourceID: null,
                        });
                    }
                    let index = -1;
                    index = this.personnelData.findIndex((e) => e.ID === datafromDialog.ID);

                    if (index === -1) {
                        this.data.push(add);
                        this.personnelData.push(datafromDialog);
                        this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
                        this._srvContactorRegistration.ownershipDuplicacyHandle(this.personnelData, {
                            app: 'grid',
                        });
                    } else {
                        add.ContractorLegalIssue = this.data[index].ContractorLegalIssue;
                        datafromDialog.ContractorLegalIssue = this.personnelData[index].ContractorLegalIssue;
                        this.data[index] = add;
                        this.personnelData[index] = datafromDialog;
                        this._srvContactorRegistration.ownershipPercentageCalculation(this.personnelData);
                        this._srvContactorRegistration.ownershipDuplicacyHandle(this.personnelData, {
                            app: 'grid',
                        });
                    }
                    this.saveOwnersPrinciplesData(datafromDialog.ID);
                }
            });
        }
    }

    ownerIdData(datafromDialog) {
        for (const role of this.ownerRole) {
            if (datafromDialog.ContrEmployeeTypeId === role.ContrEmployeeTypeID) return role.ContractorEmployeeTypeTranslated; //=== 1 ? 'Principal' : datafromDialog.ContrEmployeeTypeId === 2 ? 'Owner' : 'Primary Owner'
        }
    }
    ownerRoletoDialog(selectedItem) {
        for (const role of this.ownerRole) {
            if (selectedItem.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated || selectedItem.ContrEmployeeTypeId === role.ContrEmployeeTypeID) return role.ContrEmployeeTypeID;
        }
    }

    // focus dropdown
    public onFocus(event) {
        // Close the list if the component is no longer focused

        setTimeout(() => {
            if (this.dropdownlist.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlist.toggle(true);
            }
        });
    }

    // save data after popup is closed
    public async saveOwnersPrinciplesData(id: number = null, deleteAction?, recoverMail?: { deletedRecover: boolean; email: string }) {
        const ownerDataArray = JSON.parse(JSON.stringify(this.data));
        ownerDataArray.map((roleType) => {
            for (const role of this.ownerRole) {
                if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                    roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                }
            }
        });
        if (this.forwardedData.OwnershipDetails && this.forwardedData.OwnershipDetails.OwnershipInformationList) {
            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((roleType) => {
                for (const role of this.ownerRole) {
                    if (roleType.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                        roleType.ContrEmployeeTypeId = role.ContrEmployeeTypeID;
                    }
                }
            });
        }

        this.ownershipDataObj = {
            OwnershipDetails: {
                OwnershipStructure: this.ownershipForm.value['OwnershipStructure'],
                ExchangeListing: this.ownerStructureCheck(this.ownershipForm.value['OwnershipStructure']) ? this.ownershipForm.value['ExchangeListing'] : '',
                StockSymbol: this.ownerStructureCheck(this.ownershipForm.value['OwnershipStructure']) ? this.ownershipForm.value['StockSymbol'] : '',
                YearsInCurrentOwnership: parseInt(this.ownershipForm.value['YearsInCurrentOwnership'], 10),
                MonthsInCurrentOwnership: parseInt(this.ownershipForm.value['MonthsInCurrentOwnership'], 10),
                OwnershipInformationList: ownerDataArray,
            },
        };
        if (this.loggedInUserType === 'Internal') {
            this.internalEmployeeSave('users', id, deleteAction);
            return;
        }
        if (this.loginDetails[0].ContrID > 0) {
            if (deleteAction === true) {
                this.finalContractorSave({ OwnershipInformationList: this.deletedEmployeesList }, true);
                return;
            }
            if (recoverMail && recoverMail.deletedRecover === true) {
                const findItem = this.ownershipDataObj.OwnershipDetails.OwnershipInformationList.find((elem) => elem.ContactEmail.toLowerCase() === recoverMail.email.toLowerCase());
                const itemToSend = {
                    ContactEmail: findItem.ContactEmail,
                    ID: findItem.ID,
                    OwnershipNumber: findItem.OwnershipNumber,
                    ContrEmployeeTypeId: findItem.ContrEmployeeTypeId,
                };
                let obj = { IsDeletedFlag: false, DeletedDateTime: null, DeletedByResourceID: null, IsContractorActive: 'Y', IsRecoveredFlag: true };
                obj = { ...obj, ...itemToSend };
                this.finalContractorSave({ OwnershipInformationList: [obj] });
                return;
            }
            const approvalObject: any = this._srvContactorRegistration.gridDifferenceInternal(this.ownershipDataObj.OwnershipDetails, this.forwardedData.OwnershipDetails);
            //this.forwardedData.OwnershipDetails.OwnershipStructure !== 1 || this.forwardedData.OwnershipDetails.OwnershipStructure !== 2
            if (
                (this.negativeStructureCheck(this.forwardedData.OwnershipDetails.OwnershipStructure) &&
                    Object.keys(approvalObject).length &&
                    approvalObject.hasOwnProperty('OwnershipInformationList') &&
                    approvalObject.OwnershipStructure === this.forwardedData.OwnershipDetails.OwnershipStructure,
                id !== null) // added approvalObject.OwnershipStructure === this.forwardedData.OwnershipDetails.OwnershipStructure to meet the save demand
            ) {
                approvalObject.OwnershipInformationList = Object.values(approvalObject.OwnershipInformationList);
                delete approvalObject.OwnershipInformationList[0];
                approvalObject.OwnershipInformationList = approvalObject.OwnershipInformationList.filter((el) => el.ID === id);
                approvalObject.OwnershipInformationList.map((el, index) => {
                    delete approvalObject.OwnershipInformationList[index].ContractorLegalIssue;
                });
            } else {
                delete approvalObject.ExchangeListing;
                delete approvalObject.OwnershipStructure;
                delete approvalObject.StockSymbol;
                delete approvalObject.OwnershipInformationList;
            }
            const apprvObj: string = JSON.stringify(approvalObject);
            const parsedApprvObj = JSON.parse(apprvObj);
            let masterCombinedObj: any = {};
            masterCombinedObj = this._srvContactorRegistration.gridDifference(parsedApprvObj, this.oldRecord.OwnershipDetails, this.editedData);
            const ownerList = [];
            if (parsedApprvObj && parsedApprvObj.OwnershipInformationList) {
                parsedApprvObj.OwnershipInformationList = parsedApprvObj.OwnershipInformationList.filter((el) => {
                    if (Object.keys(el).length > 2) {
                        return el;
                    }
                });
            }
            if (parsedApprvObj && parsedApprvObj.OwnershipInformationList) {
                parsedApprvObj.OwnershipInformationList.forEach((el, ind) => {
                    let ObjectFoundInApproval = false;
                    let ObjectIndexInApproval = -1;
                    if (this.editedData.OwnershipInformationList) {
                        ObjectFoundInApproval = this.editedData.OwnershipInformationList.find((pendingEl) => pendingEl.ID === el.ID);

                        ObjectIndexInApproval = this.editedData.OwnershipInformationList.findIndex((pendingEl) => pendingEl.ID === el.ID);
                    }
                    const parsedIndex = parsedApprvObj.OwnershipInformationList.findIndex((ele) => ele.ID === el.ID);

                    const dbIndex = this.oldRecord.OwnershipDetails.OwnershipInformationList.findIndex((dbEl) => dbEl.ID === el.ID);
                    if (ObjectFoundInApproval) {
                        if (el.VeteranMilitaryAffiliationData) {
                            el.VeteranMilitaryAffiliationData = el.VeteranMilitaryAffiliationData ? Object.values(el.VeteranMilitaryAffiliationData) : null;
                            parsedApprvObj.OwnershipInformationList[parsedIndex].VeteranMilitaryAffiliationData = el.VeteranMilitaryAffiliationData.filter((ele) => {
                                if (Object.keys(ele).length > 2) {
                                    return ele;
                                }
                            });
                        }
                        const objData: any = this._srvContactorRegistration.differenceCompany(
                            parsedApprvObj.OwnershipInformationList[parsedIndex],
                            dbIndex === -1 ? {} : this.oldRecord.OwnershipDetails.OwnershipInformationList[dbIndex],
                            this.editedData.OwnershipInformationList[ObjectIndexInApproval]
                        );

                        let mData = {};
                        const mDataArray = [];
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
                        if (el.VeteranMilitaryAffiliationData) {
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
                    if (ownerList[ind].VeteranMilitaryAffiliationData) {
                        ownerList[ind].VeteranMilitaryAffiliationData = ownerList[ind].VeteranMilitaryAffiliationData.filter((milEl) => milEl !== undefined && Object.keys(milEl).length);
                        if (!ownerList[ind].VeteranMilitaryAffiliationData.length) {
                            delete ownerList[ind].VeteranMilitaryAffiliationData;
                        }
                    }
                });
            }
            if (ownerList.length) {
                masterCombinedObj.OwnershipInformationList = ownerList;
            } else if (masterCombinedObj.OwnershipInformationList) {
                delete masterCombinedObj.OwnershipInformationList;
            }

            // remove duplicates
            if (masterCombinedObj && masterCombinedObj.OwnershipInformationList) {
                // tslint:disable-next-line:prefer-const
                let result = [];
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
                if (this.visualCue.OwnershipInformationList) {
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
                } else {
                    const existingKey = this.pick(this.visualCue, this.properties);
                    for (const k in existingKey) {
                        if (existingKey[k] === true) {
                            this.checkVisualCueExists = true;
                            break;
                        }
                    }
                }
            }
            // tslint:disable-next-line:prefer-const
            let OwnershipInformationList = [];
            if (masterCombinedObj.OwnershipInformationList && masterCombinedObj.OwnershipInformationList.length) {
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
                if (
                    masterCombinedObj.OwnershipInformationList &&
                    masterCombinedObj.OwnershipInformationList[0].VeteranFlag === 'N' &&
                    masterCombinedObj.OwnershipInformationList[0].VeteranEmployeeHireDate === null
                ) {
                    delete masterCombinedObj.OwnershipInformationList[0].VeteranEmployeeHireDate;
                }
            }
            const editObj: editObjModel = {};
            editObj.ResourceId = this.resourceId;
            editObj.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
            editObj.CCOpsID = this.loginDetails[0].CCOpsID;
            editObj.CCOpsData = JSON.stringify({ OwnershipDetails: masterCombinedObj });
            editObj.Contr_ID = this.loginDetails[0].ContrID;
            editObj.PageName = 'Ownership Information Page';
            if (masterCombinedObj && Object.keys(masterCombinedObj).length) {
                await this.finalContractorSave(masterCombinedObj);
                return;
            }
            return;
        }

        this.forwardedData = {
            ...this.forwardedData,
            ...this.ownershipDataObj,
        };

        if (recoverMail && recoverMail.deletedRecover) {
            const ind = this.forwardedData.OwnershipDetails.OwnershipInformationList.findIndex((ele) => ele.ContactEmail.toLowerCase() === recoverMail.email.toLowerCase());
            const obj = { IsDeletedFlag: false, DeletedDateTime: null, DeletedByResourceID: null, IsContractorActive: 'Y' };
            this.forwardedData.OwnershipDetails.OwnershipInformationList[ind] = { ...this.forwardedData.OwnershipDetails.OwnershipInformationList[ind], ...obj };
        }

        if (deleteAction === true && this.deletedEmployeesList.length) {
            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((ele, ind) => {
                const indRemoveInList = this.deletedEmployeesList.findIndex((el) => el['ID'] === ele['ID']);
                if (indRemoveInList > -1) {
                    this.forwardedData.OwnershipDetails.OwnershipInformationList[ind] = {
                        ...this.forwardedData.OwnershipDetails.OwnershipInformationList[ind],
                        ...this.deletedEmployeesList[indRemoveInList],
                        IsContractorActive: 'N',
                    };
                } else {
                    ele['DeletedDateTime'] = ele['DeletedDateTime'] === '' ? null : ele['DeletedDateTime'];
                }
            });
        } else {
            this.forwardedData.OwnershipDetails.OwnershipInformationList.forEach((ele, ind) => {
                ele['DeletedDateTime'] = ele['DeletedDateTime'] === '' ? null : ele['DeletedDateTime'];
            });
        }

        this.objProgram = this.forwardedData;
        this.objProgram.OwnershipDetails.OwnershipInformationList.map((obj) => {
            if (!obj.PRNL_ID) {
                obj.PRNL_ID = 0;
            }
            if (obj.ActiveFlag === 'Y') {
                obj.ActiveFlag = true;
            } else if (obj.ActiveFlag === 'N') {
                obj.ActiveFlag = false;
            }
        });
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.CCopsId = this.loginDetails[0].CCOpsID;
        this.objProgram.LastPageVisited = 'ownership';
        const response = await this._srvOwnership.putOwnerShipData(this.objProgram);
        if (response === 1) {
            if (deleteAction === true) {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                          <div class="modal-alert confirmation-alert">
                                              <h2>${this.pageContent.Employee_Info.Emp_Delete_head}</h2>
                                              <p>${this.pageContent.Employee_Info.Emp_Delete_SuccessMsg}</p>
                                          </div>
                                      `;
            }
            this.callMain();
        }
    }

    private async finalContractorSave(masterCombinedObj, deleted?: boolean) {
        if (masterCombinedObj && masterCombinedObj.hasOwnProperty('OwnershipInformationList')) {
            masterCombinedObj.OwnershipInformationList.map((obj) => {
                if (obj.hasOwnProperty('ActiveFlag') && obj.ActiveFlag === 'Y') {
                    obj.ActiveFlag = true;
                } else if (obj.hasOwnProperty('ActiveFlag') && obj.ActiveFlag === 'N') {
                    obj.ActiveFlag = false;
                }
            });
        }
        await this._srvOwnership.getServerTime();
        masterCombinedObj = { ...masterCombinedObj, ModifiedDateTime: this._srvOwnership.timeStamp, ModifiedResourceID: this._srvAuthentication.Profile.ContractorResourceID };
        const response = await this._srvContractorData.saveContractorData(
            { currentPage: 'Ownership Information Page', nextPage: 'ownership' },
            { OwnershipDetails: masterCombinedObj },
            'OwnershipInformation/EditEventOwnershipInfo'
        );
        if (deleted === true && response === 1) {
            const dialogRef = this._dialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                  <div class="modal-alert confirmation-alert">
                                      <h2>${this.pageContent.Employee_Info.Emp_Delete_head}</h2>
                                      <p>${this.pageContent.Employee_Info.Emp_Delete_SuccessMsg}</p>
                                  </div>
                              `;
        }

        this.crComments = await this._srvContractorData.getPageComments('Ownership Information');
        if (this._srvAuthentication.Profile.EventName === 'No Event') {
            if (response === 1) {
                this.editedData = null;
                this.finalOuterData = null;
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
    }

    compareMilitary(parsedApprvObj, existingData) {
        for (const element of parsedApprvObj.VeteranMilitaryAffiliationData) {
            // const objectsEqual = (o1, o2) =>
            //   Object.keys(o1).every((p) => o1[p] === o2[p]);
            const ObjectFoundInApproval = existingData.VeteranMilitaryAffiliationData.find((pendingEl) => pendingEl.MilitaryAffiliationNumber === element.MilitaryAffiliationNumber);
            if (ObjectFoundInApproval) {
                const equalObject = this.objectsEqual(element, ObjectFoundInApproval);
                if (equalObject === false) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }
    objectsEqual(obj1, obj2) {
        if (obj1['AddedDate'] !== null && obj2['AddedDate'] !== null) {
            if (obj1['RemovedDate'] === null && obj2['RemovedDate'] === null) {
                return true;
            }
        }
        const objectEqual = (o1, o2) => Object.keys(o1).every((p) => o1[p] === o2[p]);
        return objectEqual(obj1, obj2);
    }
    public militaryDataProcess(parsedApprvObj, oldData, editedData) {
        let militaryList = [];
        let equalObject;
        if (oldData === undefined) {
            oldData = {};
        }
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

        return militaryList;
    }

    // internal employee function

    public internalEmployeeSave(path: string, id: number = null, actionDelete?: boolean) {
        if (actionDelete === true) {
            this.internalFinalSave({ OwnershipInformationList: this.deletedEmployeesList }, true);
            return;
        }
        const parsedData = this.clonedObject;
        const approvalObject: any = this._srvContactorRegistration.gridDifferenceInternal(this.ownershipDataObj.OwnershipDetails, parsedData);
        if (this.negativeStructureCheck(parsedData.OwnershipStructure) && Object.keys(approvalObject).length && approvalObject.hasOwnProperty('OwnershipInformationList') && id !== null) {
            approvalObject.OwnershipInformationList = Object.values(approvalObject.OwnershipInformationList);
            delete approvalObject.OwnershipInformationList[0];
            approvalObject.OwnershipInformationList = approvalObject.OwnershipInformationList.filter((el) => el.ID === id);
            approvalObject.OwnershipInformationList.map((el) => {
                approvalObject.OwnershipInformationList[0].VeteranMilitaryAffiliationData = Object.values(approvalObject.OwnershipInformationList[0].VeteranMilitaryAffiliationData);
                if (!approvalObject.OwnershipInformationList[0].VeteranMilitaryAffiliationData.length) {
                    delete approvalObject.OwnershipInformationList[0].VeteranMilitaryAffiliationData;
                }
                delete approvalObject.OwnershipInformationList[0].ContractorLegalIssue;
            });

            const myData = approvalObject.OwnershipInformationList.filter((key, ind) => {
                return Object.keys(approvalObject.OwnershipInformationList[ind]).length > 2;
            }).map((key, ind) => {
                return approvalObject.OwnershipInformationList[ind];
            });
            approvalObject.OwnershipInformationList = myData;
        } else {
            delete approvalObject.OwnershipInformationList;
        }

        let newApprovedObject;
        let obj;
        // tslint:disable-next-line:prefer-const
        let OwnershipInformationList = [];
        if (approvalObject.OwnershipInformationList && approvalObject.OwnershipInformationList[0] && path === 'users') {
            newApprovedObject = this.pick(approvalObject.OwnershipInformationList[0], this.properties);
            OwnershipInformationList.push(newApprovedObject);
            obj = { ...approvalObject, OwnershipInformationList };
        } else {
            const property = ['ExchangeListing', 'OwnershipInformationList', 'OwnershipName', 'OwnershipStructure', 'StockSymbol', 'MonthsInCurrentOwnership', 'YearsInCurrentOwnership'];
            newApprovedObject = this.pick(approvalObject, property);
            obj = newApprovedObject;
        }

        if (obj.OwnershipInformationList && obj.OwnershipInformationList[0].VeteranMilitaryAffiliationData) {
            obj.OwnershipInformationList[0].VeteranMilitaryAffiliationData = obj.OwnershipInformationList[0].VeteranMilitaryAffiliationData.filter((element) => Object.keys(element).length > 2);
            if (!obj.OwnershipInformationList[0].VeteranMilitaryAffiliationData.length) {
                delete obj.OwnershipInformationList[0].VeteranMilitaryAffiliationData;
            }
        }
        this.internalFinalSave(obj);
    }

    public async internalFinalSave(obj, deleted?: boolean) {
        if (obj && obj.hasOwnProperty('OwnershipInformationList')) {
            obj.OwnershipInformationList.map((elem) => {
                if (elem.hasOwnProperty('ActiveFlag') && elem.ActiveFlag === 'Y') {
                    elem.ActiveFlag = true;
                } else if (elem.hasOwnProperty('ActiveFlag') && elem.ActiveFlag === 'N') {
                    elem.ActiveFlag = false;
                }
            });
        }
        const editObj: editObjModel = {};
        editObj.Contr_ID = this.loginDetails[0].ContrID;
        editObj.ResourceId = this.resourceId;
        editObj.CCOpsID = this.loginDetails[0].CCOpsID;
        editObj.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
        await this._srvOwnership.getServerTime();
        obj = { ...obj, ModifiedDateTime: this._srvOwnership.timeStamp, ModifiedResourceID: this._srvAuthentication.ProfileInternal.ResourceID };
        editObj.CCOpsData = JSON.stringify({ OwnershipDetails: obj });
        editObj.PageName = 'Ownership Information Page';

        this._srvApi.put('JSON/EditJsonDataInternal ', editObj).subscribe((res) => {
            if (res === 1) {
                if (deleted === true) {
                    const dialogRef = this._dialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                                              <div class="modal-alert confirmation-alert">
                                                  <h2>${this.pageContent.Employee_Info.Emp_Delete_head}</h2>
                                                  <p>${this.pageContent.Employee_Info.Emp_Delete_SuccessMsg}</p>
                                              </div>
                                          `;
                }
                this.callMain();
            } else {
                this.unsuccess();
            }
        });
        return;
    }

    public pick(obj, keys) {
        return keys.map((k) => (k in obj ? { [k]: obj[k] } : {})).reduce((res, o) => Object.assign(res, o), {});
    }

    // numeric character check
    public isNumber(evt) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // readonly _route
    public nextPage() {
        this._route.navigate(['/contractorRegistration/legal-questions']);
    }

    // unsubscribe services
    public ngOnDestroy(): void {
        if (this.emailDuplicacyCheck) {
            this.emailDuplicacyCheck.unsubscribe();
        }
        if (this.percentageCheck) {
            this.percentageCheck.unsubscribe();
        }
        if (this.phoneNumberCheck) {
            this.phoneNumberCheck.unsubscribe();
        }
    }
    // Ownership structure filter
    public handleFilterOwner(value) {
        this.OwnerStructure = this.OwnerStructureData.filter((s) => s.OwnerStructureDescTranslated.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    public unsuccess() {
        this.callMain();
        const dialogRef = this._dialog.open({
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

    public disableDialog(text?) {
        if (text === 'add') {
            if (
                this.$pagePrivilege.readonlyAccess ||
                this.ownershipInfoFormControl.MonthsInCurrentOwnership.value === null ||
                this.ownershipInfoFormControl.YearsInCurrentOwnership.value === null ||
                this.ownershipInfoFormControl.MonthsInCurrentOwnership.value === '' ||
                this.ownershipInfoFormControl.YearsInCurrentOwnership.value === '' ||
                this.disableAddOwnerPrinciple === true ||
                (this.ContrID === 0 && this.loggedInUserType === 'Internal')
            ) {
                return 'true';
            }
        } else {
            if (
                this.ownershipInfoFormControl.MonthsInCurrentOwnership.value === null ||
                this.ownershipInfoFormControl.YearsInCurrentOwnership.value === null ||
                this.ownershipInfoFormControl.MonthsInCurrentOwnership.value === '' ||
                this.ownershipInfoFormControl.YearsInCurrentOwnership.value === '' ||
                this.disableAddOwnerPrinciple === true
            ) {
                return 'true';
            }
        }
        return null;
    }

    public async checkedRow(ev, dataItem) {
        if (ev.target.checked === true) {
            this.disableBtnCtr++;
            await this._srvOwnership.getServerTime();
            let contrEmployeeTypeId: number;
            for (const role of this.ownerRole) {
                if (dataItem.ContrEmployeeTypeId === role.ContractorEmployeeTypeTranslated) {
                    contrEmployeeTypeId = role.ContrEmployeeTypeID;
                }
            }
            const obj =
                this.loginDetails[0].ContrID > 0
                    ? {
                          ContrEmployeeTypeId: contrEmployeeTypeId,
                          ContactEmail: dataItem.ContactEmail,
                          OwnershipNumber: dataItem.OwnershipNumber,
                          ID: dataItem.ID,
                          IsDeletedFlag: true,
                          DeletedDateTime: this._srvOwnership.timeStamp,
                          DeletedByResourceID:
                              this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID,
                      }
                    : {
                          ID: dataItem.ID,
                          IsDeletedFlag: true,
                          DeletedDateTime: this._srvOwnership.timeStamp,
                          DeletedByResourceID:
                              this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID,
                      };
            this.deletedEmployeesList = [...this.deletedEmployeesList, obj];
        } else {
            this.disableBtnCtr--;
            this.deletedEmployeesList.splice(
                this.deletedEmployeesList.findIndex((ele) => ele.ID === dataItem.ID),
                1
            );
        }
    }

    deleteEmployeeClicked() {
        if (!this.deletedEmployeesList.length) {
            const dialogAlert = this._dialog.open({ content: DialogAlertsComponent, width: 500 });
            const dialogData = dialogAlert.content.instance;
            dialogData.header = this.pageContent.Event_Selection.Alert;

            dialogData.alertMessage = `
      <div class="modal-alert info-alert">
       <p>${this.pageContent.Ownership_Info.Please_select_at_least_one_record_to_delete}</p>
      </div> `;
        } else {
            const dialogAlert = this._dialog.open({ content: DeleteAlertComponent, width: 500 });
            const dialogData = dialogAlert.content.instance;
            dialogData.header = this.pageContent.Event_Selection.Alert;
            dialogData.alertMessage = `
<div class="modal-alert info-alert">
 <p>${this.pageContent.Ownership_Info.Are_you_sure_to_delete}</p>
</div> `;

            dialogAlert.result.subscribe(async (result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this.saveOwnersPrinciplesData(null, true);
                }
            });
        }
    }
}
