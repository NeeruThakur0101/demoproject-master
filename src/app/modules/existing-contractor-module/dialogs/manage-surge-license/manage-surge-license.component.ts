import { GridComponent } from '@progress/kendo-angular-grid';
import { FormGroup } from '@angular/forms';
import { ManageSurgeService, User } from './manage-surge.service';
import { CompositeFilterDescriptor, filterBy, distinct, SortDescriptor } from '@progress/kendo-data-query';
import { UniversalService } from './../../../../core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { DOCUMENT } from '@angular/common';import { ManageSurge, ManageSurgeData, SurgeDetails, VisualCueMangeSurge, VisualCueRadioButton } from './model_manage_surge';
import { SurgeData, SurgeJSONData, SurgeResponseInformation } from '../../components/surge-information/model-surge';
import { CorrectionRequestComments, LoginUser, PageObj } from 'src/app/core/models/user.model';
@Component({
    selector: 'app-manage-surge-license',
    templateUrl: './manage-surge-license.component.html',
    styleUrls: ['./manage-surge-license.component.scss'],
})
export class ManageSurgeLicenseComponent extends DialogContentBase implements OnInit, AfterViewInit {
    public Profile: User;
    @ViewChild(GridComponent) private grid: GridComponent;
    public Page: ManageSurgeData;
    public contractorData: SurgeJSONData;
    public manageDataArr: any;
    public loggedInUserType: string;
    public submitted: boolean = false;
    public backupArr: ManageSurge[];

    // grid code
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    public quickAction: boolean = false;

    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: any;
    public editRecertDatePvlg: boolean = false;
    public multiple: boolean = false;
    public allowUnsort: boolean = true;

    public sort: SortDescriptor[] = [];

    public step: string = '';
    public pageHeight: number = 300;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    formGroup: FormGroup;
    public filter: CompositeFilterDescriptor;
    public showMainPage: boolean;
    public gridData: ManageSurge[];
    public editedData: any;
    public visualCue: VisualCueMangeSurge[] = [];
    public internalData: ManageSurge[] = [];
    public manageSurgeDb: SurgeData;
    public backupContrData: SurgeResponseInformation;
    public newBackup: ManageSurge[] = [];
    public jsonData: SurgeResponseInformation;
    public pageContent: any;
    public visualCueForRadio: VisualCueRadioButton[] = [];
    public radioArray: SurgeDetails[] = [];
    public crComments: CorrectionRequestComments[];
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridData = filterBy(this.Page.SurgeLicenses, filter);
    }
    public distinctPrimitive(fieldName: string): ManageSurge[] {
        return distinct(this.Page.SurgeLicenses, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        dialog: DialogRef,
        private deviceService: DeviceDetectorService,
        @Inject(DOCUMENT) private document: Document,
        private _srvUniversal: UniversalService,
        private _srvDialog: DialogService,
        private _srvManageSurge: ManageSurgeService,
        public _srvInternalUserDetail: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvAuthentication: AuthenticationService
    ) {
        super(dialog);
        this._srvManageSurge.validateUser();
        this.Profile = _srvManageSurge.Profile;
        this.Profile.USER_TYPE = this._srvAuthentication.LoggedInUserType;

        this.pageContent = this._srvInternalUserDetail.getPageContentByLanguage();
        this.loginDetails = Array(this._srvAuthentication.Profile);
    }

    async ngOnInit() {
        this.loadPageData();
    }

    ngAfterViewInit() {
        this.deviceResObj = this._srvUniversal.deviceResolution();
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
        }
        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;
    }

    async loadPageData() {
        this.document.body.classList.add('manage-surge');
        this.showMainPage = true;
        await this.getDBData();
        await this.getContractorJSON();
        await this.manageSurgeData();

        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.crComments = await this._srvContractorData.getPageComments('Surge/CAT Response');

        this.deviceResObj = this._srvUniversal.deviceResolution();
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
        }
        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;

        this.document.body.classList.remove('manage-surge');
    }

    async getDBData() {
        this.manageSurgeDb = await this._srvManageSurge.getDBSurgeRes(this.loginDetails[0]);
    }

    async getContractorJSON() {
        this.contractorData = await this._srvManageSurge.getPageJSONData(this.loginDetails[0]);

        if (Object.keys(this.contractorData).length) {
            if (this.contractorData[0].CCOpsData == null) {
                this.jsonData = {} as SurgeResponseInformation;
            } else {
                this.jsonData = JSON.parse(this.contractorData[0].CCOpsData).ContractorData.SurgeResponseInformation;
            }
        } else {
            this.jsonData = {} as SurgeResponseInformation;
        }
    }

    async manageSurgeData() {
        this.Page = await this._srvManageSurge.getManageSurgeLicenceData(this.loginDetails[0]);
        this.Page.SurgeLicenses.map(
            (lrtn) => (lrtn.LicenseRequiredTypeNumber = lrtn.LicenseRequiredTypeNumber === '0' || lrtn.LicenseRequiredTypeNumber === 0 ? '12' : lrtn.LicenseRequiredTypeNumber)
        );
        this.radioArray = this.Page.SurgeDetails;
        this.radioArray.map((el) => (el.TypeTitleID = el.TypeTitleID.toString()));
        this.backupArr = JSON.parse(JSON.stringify(this.Page.SurgeLicenses));

        this.newBackup = JSON.parse(JSON.stringify(this.Page.SurgeLicenses));
        this.gridData = this.Page.SurgeLicenses;

        const tempArray = [];
        if (this.jsonData && this.jsonData.ManageSurgeLicenses) {
            this.gridData.forEach((el) => {
                const filteredData = this.jsonData.ManageSurgeLicenses.find((x) => x.ContrLicenseName === el.ContrLicenseName && x.USStateAbbreviation === el.USStateAbbreviation);
                if (filteredData !== undefined) tempArray.push(filteredData);
            });

            this.jsonData.ManageSurgeLicenses = tempArray;
        }

        this.gridData.map((element, index) => {
            element.id = index + 1;
            element.yesCue = false;
            element.noCue = false;
            element.partnerCue = false;
            element.LicenseNumberCue = false;
            element.LicenseCompanyNameCue = false;
        });
        if (this.contractorData) {
            this.backupContrData = this.jsonData;

            if (this.jsonData.hasOwnProperty('ManageSurgeLicenses')) {
                this.jsonData.ManageSurgeLicenses.map((element, index) => (element.id = index + 1));
                this.jsonData.ManageSurgeLicenses.forEach((t) => {
                    for (const [idx, obj] of this.gridData.entries()) {
                        if (obj.USStateAbbreviation === t.USStateAbbreviation && obj.ContrLicenseName === t.ContrLicenseName) {
                            // The object exist in this.gridData, need to update the existing object
                            if ((obj.LicenseRequiredTypeNumber === '0' || obj.LicenseRequiredTypeNumber === '13' || obj.LicenseRequiredTypeNumber === '14') && t.LicenseRequiredTypeNumber === '12') {
                                this.gridData[idx].yesCue = true;
                            } else if (
                                (obj.LicenseRequiredTypeNumber === '0' || obj.LicenseRequiredTypeNumber === '12' || obj.LicenseRequiredTypeNumber === '14') &&
                                t.LicenseRequiredTypeNumber === '13'
                            ) {
                                this.gridData[idx].noCue = true;
                            } else if (
                                (obj.LicenseRequiredTypeNumber === '0' || obj.LicenseRequiredTypeNumber === '12' || obj.LicenseRequiredTypeNumber === '13') &&
                                t.LicenseRequiredTypeNumber === '14'
                            ) {
                                this.gridData[idx].partnerCue = true;
                            }

                            if (t.LicenseRequiredTypeNumber === '12' || t.LicenseRequiredTypeNumber === 12) {
                                this.gridData[idx].yesCue = true;
                            } else if (t.LicenseRequiredTypeNumber === '13' || t.LicenseRequiredTypeNumber === 13) {
                                this.gridData[idx].noCue = true;
                            } else if (t.LicenseRequiredTypeNumber === '14' || t.LicenseRequiredTypeNumber === 14) {
                                this.gridData[idx].partnerCue = true;
                            }

                            if (t.LicenseCompanyName) {
                                this.gridData[idx].LicenseCompanyNameCue = true;
                            }
                            if (t.LicenseNumber) {
                                this.gridData[idx].LicenseNumberCue = true;
                            }
                            this.gridData[idx] = { ...this.gridData[idx], ...t };
                            return;
                        }
                    }
                    // The object not already exist. we should add it to the array
                    this.gridData.push(t);
                });
            }
        }
        this.gridData.map((liNum) => {
            liNum.LicenseRequiredTypeNumber = liNum.LicenseRequiredTypeNumber.toString();
        });
        this.internalData = JSON.parse(JSON.stringify(this.gridData));

        if (this.gridData.length > 0) {
            this.visualCueForRadio = this.gridData.map((el) => {
                return { yesCue: false, noCue: false, partnerCue: false, ContrLicenseName: el.ContrLicenseName, USStateAbbreviation: el.USStateAbbreviation };
            });

            this.visualCue = this._srvManageSurge.gridDifferenceCue(this.backupArr, this.gridData);
        }

        this.showMainPage = false;
    }

    // popup close
    public close() {
        this.dialog.close({ button: 'Yes' });
    }

    // save
    async save(f) {
        this.showMainPage = true;
        this.submitted = true;
        this.editedData = this.grid;
        this.manageDataArr = this.editedData.data.data;

        let returnedjsonData;
        const tempManageArray = [];

        this.manageDataArr.forEach((element) => {
            let obj = {};
            let jsonIndex: number;

            if (Object.keys(this.jsonData).length && this.jsonData.ManageSurgeLicenses) {
                jsonIndex = this.jsonData.ManageSurgeLicenses.findIndex((x) => element.USStateAbbreviation === x.USStateAbbreviation && element.ContrLicenseName === x.ContrLicenseName);
            }
            const dbIndex = this.backupArr && this.backupArr.findIndex((y) => element.USStateAbbreviation === y.USStateAbbreviation && element.ContrLicenseName === y.ContrLicenseName);

            element.LicenseRequiredTypeNumber = parseInt(element.LicenseRequiredTypeNumber, 10);
            if (element.LicenseRequiredTypeNumber === '13') {
                (element.LicenseCompanyName = null), (element.LicenseNumber = null);
            }
            if (jsonIndex > -1) {
                returnedjsonData = this._srvManageSurge.differenceLocation(element, this.backupArr[dbIndex], this.jsonData.ManageSurgeLicenses[jsonIndex]);
            } else if (dbIndex > -1) {
                returnedjsonData = this._srvManageSurge.difference(element, this.backupArr[dbIndex]);
            } else {
                returnedjsonData = element;
            }

            if (returnedjsonData.LicenseRequiredTypeNumber === undefined) {
                delete returnedjsonData.LicenseRequiredTypeNumber;
            }
            delete returnedjsonData.LicenseCompanyNameCue;
            delete returnedjsonData.LicenseNumberCue;

            if (Object.keys(returnedjsonData).length > 0) {
                obj = {
                    ContractorLicenseExpirationDateNumber: element.ContractorLicenseExpirationDateNumber,
                    ContrLicenseName: element.ContrLicenseName,
                    ContrLicenseDesc: element.ContrLicenseDesc,
                    ContractorLicenseNumber: element.ContractorLicenseNumber,
                    USStateAbbreviation: element.USStateAbbreviation,
                    PartnerFlag: element.PartnerFlag,
                    id: element.id,
                };
            }

            obj = { ...obj, ...returnedjsonData };

            if (typeof returnedjsonData.LicenseCompanyName !== 'object' && typeof returnedjsonData.LicenseNumber !== 'object' && Object.keys(returnedjsonData).length > 0) {
                tempManageArray.push(obj);
            }
            // @ts-ignore
            else if (obj.LicenseCompanyName == null && obj.LicenseNumber == null && Object.keys(obj).length > 0) {
                tempManageArray.push(obj);
            }
        });

        let finalObj = {};
        if (tempManageArray.length > 0) {
            // @ts-ignore
            finalObj = { SurgeResponseInformation: { ManageSurgeLicenses: [...tempManageArray] } };
        }

        if (this.loggedInUserType !== 'Internal') {
            const ccopsData = Object.keys(finalObj).length > 0 ? finalObj : null;
            this.document.body.classList.add('manage-surge');
            await this._srvContractorData.saveContractorData({ currentPage: 'Surge Information Page', nextPage: 'surge-info' }, ccopsData, 'SurgeResponseInfo/EditSurgeEventJsonData');
            this.crComments = await this._srvContractorData.getPageComments('Surge/CAT Response');
            this.loadPageData();
            return;
        } else {
            const ccopsData = Object.keys(finalObj).length > 0 ? finalObj : null;
            this.document.body.classList.add('manage-surge');
            await this._srvManageSurge.SaveInternalData(ccopsData);
            this.loadPageData();
            return;
        }
    }

    // open popup
    openRepo() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
        const dialogRef = this._srvDialog.open({
            content: DocumentUploadComponent,
            width: 680,
        });
        const contractorInfo = dialogRef.content.instance;
        contractorInfo.pageOrigin = 'manageSurgeResponse';
    }
}
