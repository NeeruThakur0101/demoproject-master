import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient, HttpParams } from '@angular/common/http';
import { AuthenticationService, SessionUser } from './../../../../core/services/authentication.service';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { CompositeFilterDescriptor, filterBy, distinct, SortDescriptor } from '@progress/kendo-data-query';
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/http-service';
import { PendingProfileChangeComponent } from './../pending-profile-change/pending-profile-change.component';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CompanyMetadata, OperationHistoryDetails, OwnerMetadata, SelectedItem } from '../../components/contractor-operation/models';
import { DeviceObj, PageObj } from 'src/app/core/models/user.model';
import { ContractorOperationService } from '../../components/contractor-operation/contractor-operation.service';
import { UniversalService } from 'src/app/core/services/universal.service';

@Component({
    selector: 'app-operation-history-detail',
    templateUrl: './operation-history-detail.component.html',
    styleUrls: ['./operation-history-detail.component.scss'],
})

export class OperationHistoryDetailComponent extends DialogContentBase implements OnInit {
    public pageContent: any;
    public opsHistoryDetail: OperationHistoryDetails[] = [];
    public dataItem: SelectedItem;
    public dbData: OperationHistoryDetails[];
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser>;
    public ContrID: number;
    public ResourceId: number;
    public filterOpsHistory: CompositeFilterDescriptor;
    public gridOpsHistoryData: OperationHistoryDetails[];
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 10;
    public info: boolean = true;
    public allowUnsort: boolean = true;


    public Contractor_Central_Field: number = 230;
    public New_Value: number = 100;


    public sort: SortDescriptor[];
    public baseURL: string = environment.api_url;
    public step: string = '';
    public pageHeight: number = 300;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };
    public quickAction: boolean = false;
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceObj;
    public editRecertDatePvlg: boolean = false;
    public loader: boolean = false;
    public companyMetadata: CompanyMetadata;
    public ownerMetadata: OwnerMetadata;
    public loginDetailsInternal: SessionUser;
    public fieldDifferent: boolean = false;

    constructor(private _srvOper: ContractorOperationService, dialog: DialogRef, private _srvApi: ApiService, private _srvDialog: DialogService, private _srvAuth: AuthenticationService, private _http: HttpClient, public _srvLanguage: InternalUserDetailsService, private _srvDevice: DeviceDetectorService, private _srvUniversal: UniversalService) {
        super(dialog);
        this.loginDetailsInternal = this._srvAuth.ProfileInternal;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();

    }

    async ngOnInit() {
        this.loginDetails = Array(this._srvAuth.Profile);
        if (this.loginDetails) {
            this.ContrID = this.loginDetails[0].ContrID;
            this.ResourceId = this.loginDetailsInternal.ResourceID;
            this.dbData = await this.getDbData();
            await this.pageSelected(this.dataItem.ChangeType);
            this.gridOpsHistoryData = filterBy(this.opsHistoryDetail, this.filterOpsHistory);

        }

        if (this._srvAuth.Language === 2) {
            this.Contractor_Central_Field = 220;
            this.New_Value = 150;
        }

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

        // this.pageSize = this.deviceResObj.pageSize;
        // this.pageObj = this.deviceResObj.pageObj;
    }

    async pageSelected(page: string) {
        switch (page) {
            case 'Contractor Locations Page':
                this.locationPage();
                break;
            case 'References Information Page':
                this.referencePage();
                break;
            case 'Job Volume Information Page':
                this.jobVolumePage();
                break;
            case 'Company Information Page':
                this.companyMetadata = await this.companyInfoMetadata();
                this.companyInfoPage();
                break;
            case 'Contact Information Page':
                this.contactInfoPage();
                break;
            case 'Financial Information Page':
                this.financialInfoPage();
                break;
            case 'Equipment Information Page':
                this.equipmentInfoPage();
                break;
            case 'Trades':
                this.tradesInfoPage();
                break;
            case 'Coverage Area':
                this.coveragePage();
                break;
            case 'Surge Information Page':
                this.surgeInfoPage();
                break;
            case 'Legal Item Information Page':
                this.legalInfoPage();
                break;
            case 'Ownership Information Page':
                this.fieldDifferent = true;
                this.ownerMetadata = await this.ownerInfoMetadata();
                this.ownershipInfoPage();
                break;
            case 'Language-Veteran Information Page':
                this.languageVeteranInfoPage();
                break;
            case 'Contractor Questionnaire':
                this.questionnairePage();
                break;
            case 'Credentialing Information Page':
                this.credentialingPage();
                break;

        }
    }

    public close() {
        this.dialog.close({ result: 'Close' });
    }

    public filterOpsHistoryChange(filter: CompositeFilterDescriptor): void {
        this.filterOpsHistory = this.filterOpsHistory;
        this.gridOpsHistoryData = filterBy(this.opsHistoryDetail, this.filterOpsHistory);
    }
    public distinctPrimitiveOpsHistory(fieldName: string): any {
        return distinct(this.opsHistoryDetail, fieldName).map((item) => item[fieldName]);
    }

    openProfile() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }


    private getDbData(): Promise<OperationHistoryDetails[]> {
        let URL: string;
        let param = new HttpParams();
        param = param.append('contrId', this.dataItem.Contr_Id.toString());
        param = param.append('resourceID', this.ResourceId.toString());
        param = param.append('pageName', this.dataItem.ChangeType);
        if (this._srvAuth.Profile.ContrID > 0 && this.dataItem.Event) {
            param = param.append('CCOpsId', this.dataItem.CCOpsID.toString());
            param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
            URL = `ContractorOperations/GetEventOpsHistoryDetails`;
        } else {
            param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
            URL = `ContractorOperations/GetOpsHistoryDetails`;
        }
        return this._srvOper.GetDbData(URL, param);
    }

    private locationPage(): void {

        this.dbData.forEach((el, i) => {
            el.isLocation = true;
            if (
                el.FieldName === 'ContractorFacilityTypeName' ||
                el.FieldName === 'ContractorLocationTypeName' ||
                el.FieldName === 'IsPhysicalAddressSame' ||
                el.FieldName === 'SeparateOfficeFlag' ||
                el.FieldName === 'SeparateEntranceFlag' ||
                el.FieldName === 'OfficeOwnedIndicatorName' ||
                el.FieldName === 'SpaceHoldTypeName' ||
                el.FieldName === 'StateName' ||
                el.FieldName === 'State' ||
                el.FieldName === 'ContractorLocationTypeNumber' ||
                el.FieldName === 'ContractorFacilityTypeNumber' ||
                el.FieldName === 'SpaceHoldTypeNumber' ||
                el.FieldName === 'LocationNumber' ||
                el.FieldName === 'SeparateOfficeFlag' ||
                el.FieldName === 'SeparateEntranceFlag'
            ) {
                el.isEditable = false;
            } else if ((el.FieldName === 'ContractorLocationSpaceUse' && el.NewValue !== '') || el.FieldName === 'PostalCode') {
                el.isEditable = true;
                el.locationKeypress = true;
                el.dataType = 'text';
            }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    public credentialingPage() {
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    public jobVolumePage() {
        this.dbData.forEach(el => {
            if (el.FieldName === 'Year') { el.isEditable = false; }
            else if (el.FieldName === 'ResidentialInsuranceRestorationInPercentage') { el.isEditable = false; }
            else if (el.FieldName === 'CommercialInsuranceRestorationInPercentage') { el.isEditable = false; }
            else if (el.FieldName === 'ResidentialRemodellingInPercentage') { el.isEditable = false; }
            else if (el.FieldName === 'CommercialRemodellingInPercentage') { el.isEditable = false; }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    public companyInfoPage() {

        this.dbData.forEach(el => {
            el.federalMask = false;
            el.mobileMask = false;
            el.ssnMask = false;
            if (el.FieldName === 'ContractorSymbilityAddress' || el.FieldName === 'ContractorXactNetAddress') {
                el.isEditable = true; el.customLength = true; el.maxLength = 40;
            }
            else if (el.FieldName === 'ContractorFranchiseSelectedNumber') {
                el.isEditable = false;
                const franchiseNameNew = this.companyMetadata.frenchise.find(metaEl => metaEl.FranchiseID === parseInt(el.NewValue, 10));
                const franchiseNameOld = this.companyMetadata.frenchise.find(metaElO => metaElO.FranchiseID === parseInt(el.OldValue, 10));
                el.NewValue = franchiseNameNew === undefined ? null : franchiseNameNew.FranchiseName;
                el.OldValue = franchiseNameOld === undefined ? null : franchiseNameOld.FranchiseName;
            }
            else if (el.FieldName === 'ContractorCountryCode') { el.isEditable = false; }
            else if (el.FieldName === 'ContractorOpeningDate') { el.isEditable = false; }
            else if (el.FieldName === 'ContractorEmployeeUniformFlag') {
                el.isEditable = false;
                if (el.OldValue === 'True') {
                    el.OldValue = 'Yes'
                } else if (el.OldValue === 'False' || !el.OldValue) {
                    el.OldValue = 'No'
                }
                if (el.NewValue === 'True') {
                    el.NewValue = 'Yes'
                } else if (el.NewValue === 'False' || !el.NewValue) {
                    el.NewValue = 'No'
                }
            }
            else if (el.FieldName === 'WorkersCompanyMinimumRequirementFlag') {
                el.isEditable = false;
                if (el.OldValue === 'True') {
                    el.OldValue = 'Yes'
                } else if (el.OldValue === 'False' || !el.OldValue) {
                    el.OldValue = 'No'
                }
                if (el.NewValue === 'True') {
                    el.NewValue = 'Yes'
                } else if (el.NewValue === 'False' || !el.NewValue) {
                    el.NewValue = 'No'
                }
            }
            else if (el.FieldName === 'ContractorEmployeeIdentificationFlag') {
                el.isEditable = false;
                if (el.OldValue === 'True') {
                    el.OldValue = 'Yes'
                } else if (el.OldValue === 'False' || !el.OldValue) {
                    el.OldValue = 'No'
                }
                if (el.NewValue === 'True') {
                    el.NewValue = 'Yes'
                } else if (el.NewValue === 'False' || !el.NewValue) {
                    el.NewValue = 'No'
                }
            }
            else if (el.FieldName === 'SupportedFlag') { el.isEditable = false; }
            else if (el.FieldName === 'PreferredFlag') { el.isEditable = false; }
            else if (el.FieldName === 'ContractorMoistureData') {
                if (el.OldValue.indexOf('18') !== -1) {
                    const vendorName = this.companyMetadata.vendors.find(metaEl => metaEl.VendorID === 18);
                    el.NewValue = el.NewValue.replace('VendorNumber', `VendorName`);
                    el.OldValue = el.OldValue.replace('VendorNumber', `VendorName`);
                    el.NewValue = el.NewValue.replace('18', `${vendorName.VendorName}`);
                    el.OldValue = el.OldValue.replace('18', `${vendorName.VendorName}`);
                }
                if (el.OldValue.indexOf('17') !== -1) {
                    const vendorName = this.companyMetadata.vendors.find(metaEl => metaEl.VendorID === 17);
                    el.NewValue = el.NewValue.replace('VendorNumber', `VendorName`);
                    el.OldValue = el.OldValue.replace('VendorNumber', `VendorName`);
                    el.NewValue = el.NewValue.replace('17', `${vendorName.VendorName}`);
                    el.OldValue = el.OldValue.replace('17', `${vendorName.VendorName}`);

                }
                if (el.OldValue.indexOf('16') !== -1) {
                    const vendorName = this.companyMetadata.vendors.find(metaEl => metaEl.VendorID === 16);
                    el.NewValue = el.NewValue.replace('VendorNumber', `VendorName`);
                    el.OldValue = el.OldValue.replace('VendorNumber', `VendorName`);
                    el.NewValue = el.NewValue.replace('16', `${vendorName.VendorName}`);
                    el.OldValue = el.OldValue.replace('16', `${vendorName.VendorName}`);

                }
                el.isEditable = false;
            } else if (el.FieldName === 'ContractorFederalTaxNumber') {
                el.isEditable = true;
                el.federalMask = true;
            } else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    public contactInfoPage() {
        this.dbData.forEach(el => {
            el.federalMask = false;
            el.mobileMask = false;
            el.ssnMask = false;
            el.isEmail = false;
            if (el.FieldName === 'BillingFax' || el.FieldName === 'BillingPhone' || el.FieldName === 'CrawfordContractorConnectionContactNumber' || el.FieldName === 'ContactNumber') {
                el.mobileMask = true;

            }
            if (el.FieldName === 'CrawfordContractorConnectionContactEmail' || el.FieldName === 'BillingEmail' || el.FieldName === 'CrawfordContractorConnectionTrainingContact') {
                el.isEmail = true;
                el.dataLength = 60;
                el.isEditable = true;
            }

            el.isEditable = true;
            if (el.FieldName === 'State-Billing' || el.FieldName === 'State-Physical' || el.FieldName === 'State-Mailing' || el.FieldName === 'ContractorEmails') {
                el.isEmail = false;
                el.isEditable = false;
            }
            if (el.FieldName === 'StreetAddress2-Physical' || el.FieldName === 'StreetAddress2-Mailing' || el.FieldName === 'StreetAddress2-Billing') {
                el.maxLength = 50;
            }
        });
        this.dbData = this.dbData.filter(el => el.FieldName !== 'IsBillingAddressPhysicalAddressSame' && el.FieldName !== 'IsMailingAddressPhysicalAddressSame');
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    public coveragePage() {
        this.dbData.forEach(el => { el.isEditable = false; });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }



    private referencePage(): void {

        this.dbData.forEach(el => {
            el.federalMask = false;
            el.mobileMask = false;
            el.ssnMask = false;
            el.isEmail = false;
            if (el.FieldName === 'SrNo') { el.isEditable = false; }
            else if (el.FieldName.includes('ReferenceTypeNumber')) { el.isEditable = false; }
            else if (el.FieldName.includes('JobType')) { el.isEditable = false; }
            else if (el.FieldName.includes('ReferencePhoneNumber')) { el.mobileMask = true; el.isEditable = true; }
            else if (el.FieldName.includes('ReferenceEmail')) { el.dataLength = 100; el.isEmail = true; el.isEditable = true; }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    private financialInfoPage() {
        this.dbData.forEach(el => {
            el.isFinancial = true;
            if (el.FieldName === 'FinancialYear') { el.isEditable = false; }
            else if (el.FieldName === 'ROW_NO') { el.isEditable = false; }
            else if (el.FieldName === 'FiscalYearStartDate') { el.isEditable = false; }
            else if (el.FieldName === 'FiscalYearFlag') { el.isEditable = false; }
            else if (el.FieldName === 'TotalRevenue' || el.FieldName === 'TotalExpenses' || el.FieldName === 'NetIncome'
                || el.FieldName === 'TotalCurrentAssets' || el.FieldName === 'TotalCurrentLiabilities' || el.FieldName === 'LongTermDebt' ||
                el.FieldName === 'LongTermDebt' || el.FieldName === 'Equity') {
                el.isEditable = true; el.dataType = 'text'; el.customLength = true; el.maxLength = 14; el.financialKeypress = true; el.financailonPaste = true;
            }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    private equipmentInfoPage() {
        this.dbData.forEach(el => {
            if (el.FieldName === 'IsMarkedCompanyVehicles') { el.isEditable = false; el.OldValue = el.OldValue === 'True' ? 'Yes' : 'No'; el.NewValue = el.NewValue === 'True' ? 'Yes' : 'No'; }
            else if (el.FieldName === 'EquipmentName') { el.isEditable = false; }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    private tradesInfoPage() {
        this.dbData.forEach(el => {
            if (el.FieldName.includes('SubOutComment')) { el.isEditable = true; el.customLength = true; el.maxLength = 100 }
            else { el.isEditable = false; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    private surgeInfoPage() {
        this.dbData.forEach(el => {

            if (el.FieldName === 'HoursToMobilize') {
                el.isEditable = true;
            }

            if (el.FieldName === 'ExpandDistance') {
                el.isEditable = true;
            }

            if (el.FieldName === 'MobilizeMinimum') {
                el.isEditable = true;
            }
            else if (el.FieldName.includes('ManageSurgeLicenses') && !el.FieldName.includes('LicenseRequiredTypeNumber')) {
                if (el.SerialNumber === 13) {
                    el.isEditable = false;
                } else {
                    el.isEditable = true;
                }
            } else if (el.FieldName.includes('LicenseRequiredTypeNumber')) {
                el.isEditable = false;
                if (el.SerialNumber === 13) {
                    if (el.NewValue === '13') {
                        el.NewValue = 'No'
                    }
                    if (el.OldValue === '13') {
                        el.OldValue = 'No'
                    }
                    if (el.OldValue === '0') {
                        el.OldValue = 'Yes'
                    }
                    if (el.NewValue === '14') {
                        el.NewValue = 'Partner'
                    }
                    if (el.OldValue === '14') {
                        el.OldValue = 'Partner'
                    }
                    if (el.NewValue === '12') {
                        el.NewValue = 'Yes'
                    }
                    if (el.OldValue === '12') {
                        el.OldValue = 'Yes'
                    }
                } else {
                    if (el.NewValue === '13') {
                        el.NewValue = 'No'
                    }
                    if (el.OldValue === '13') {
                        el.OldValue = 'No'
                    }
                    if (el.OldValue === '0') {
                        el.OldValue = 'Yes'
                    }
                    if (el.NewValue === '14') {
                        el.NewValue = 'Partner'
                    }
                    if (el.OldValue === '14') {
                        el.OldValue = 'Partner'
                    }
                    if (el.NewValue === '12') {
                        el.NewValue = 'Yes'
                    }
                    if (el.OldValue === '12') {
                        el.OldValue = 'Yes'
                    }
                }
            }
        });
        this.dbData.forEach(el => {
            if (el.FieldName === 'WillingToExpandFlag') {
                el.OldValue = el.OldValue === '0' ? 'No' : 'Yes';
                el.NewValue = el.NewValue === '0' ? 'No' : 'Yes';
            } else if (el.FieldName === 'WillingToMobilizeFlag') {
                el.OldValue = el.OldValue === '0' ? 'No' : 'Yes';
                el.NewValue = el.NewValue === '0' ? 'No' : 'Yes';
            }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    private legalInfoPage() {
        this.dbData.forEach(el => {
            if (el.FieldName === 'FieldDetailDate') { el.isEditable = false; }
            else if (el.FieldName === 'LegalIssueDetailDate') { el.isEditable = false; }
            else if (el.FieldName === 'FieldDetailBoolean') { el.isEditable = false; }
            else if (el.FieldName === 'FieldDetailDate') { el.isEditable = false; }
            else if (el.FieldName === 'FieldDetailInt') { el.isEditable = false; }
            else if (el.FieldName.includes('ActiveFlag')) { el.isEditable = false; }
            else if (el.FieldName.includes('DeletedFlag')) { el.isEditable = false; }
            else if (el.FieldName.includes('-') && !el.FieldName.includes('FieldDetailText')) { el.isEditable = false; }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }
    private ownershipInfoPage() {
        this.dbData.forEach(el => {
            el.federalMask = false;
            el.mobileMask = false;
            el.ssnMask = false;
            el.isEmail = false;
            if (el.FieldName === 'VeteranMilitaryAffiliationData') {
                el.isEditable = false;
            }
            else if (el.FieldName === 'DateOfBirth') { el.isEditable = false; }
            else if (el.FieldName.includes('IsDeletedFlag')) { el.isEditable = false }
            else if (el.FieldName.includes('ActiveFlag')) { el.isEditable = false }
            else if (el.FieldName.includes('DateOfBirth')) { el.isEditable = false }
            else if (el.FieldName.includes('LegalIssueFlag')) { el.isEditable = false }
            else if (el.FieldName.includes('OwnershipPercentage')) { el.isEditable = false; }
            else if (el.FieldName.includes('VeteranFlag')) { el.isEditable = false; }
            else if (el.FieldName === 'VeteranEmployeeHireDate') { el.isEditable = false; }
            else if (el.FieldName === 'Name') { el.isEditable = false; }
            else if (el.FieldName.includes('IsContractorActive')) { el.isEditable = false; }
            else if (el.FieldName.includes('SocialSecurityNumber')) {
                if (el.OldValue.trim() === '') { el.OldValue = null }
                el.isEditable = false;
                el.ssnMask = true;
                el.isEditable = true;
            }
            else if (el.FieldName.includes('ContactPhone')) { el.mobileMask = true; el.isEditable = true; }
            else if (el.FieldName.includes('ContactEmail')) { el.isEditable = false; el.dataLength = 200; el.isEmail = true; }
            else if (el.FieldName.includes('DrivingLicense')) {
                if (el.OldValue.trim() === '') { el.OldValue = null }
            }
            else if (el.FieldName.includes('ContrEmployeeTypeId')) {
                el.isEditable = false;
                const roleTypeNew = this.ownerMetadata.OwnerRole.find(metaEl => metaEl.ContrEmployeeTypeID === parseInt(el.NewValue, 10));

                const roleTypeOld = this.ownerMetadata.OwnerRole.find(metaElO => metaElO.ContrEmployeeTypeID === parseInt(el.OldValue, 10));
                el.NewValue = roleTypeNew === undefined ? null : roleTypeNew.ContractorEmployeeType;
                el.OldValue = roleTypeOld === undefined ? null : roleTypeOld.ContractorEmployeeType;
            }
            else if (el.FieldName === 'OwnershipStructure') {
                el.isEditable = false;
                const structureTypeNew = this.ownerMetadata.OwnerStructure.find(metaEl => metaEl.OwnerStructureID === parseInt(el.NewValue, 10));
                const structureTypeOld = this.ownerMetadata.OwnerStructure.find(metaElO => metaElO.OwnerStructureID === parseInt(el.OldValue, 10));
                el.NewValue = structureTypeNew.OwnerStructureDesc;
                el.OldValue = structureTypeOld.OwnerStructureDesc;
            }
            else if (el.FieldName === 'ActiveFlag') { el.isEditable = false; }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    public languageVeteranInfoPage() {
        this.dbData.forEach(el => {
            if (el.FieldName.includes('MultiLanguageAnswer')) {
                el.isEditable = false;
            }
            else if (el.FieldName === 'VeteranPledgeDate') { el.isEditable = false; }
            else if (el.FieldName === 'MinorityOwnedBusinessFlag') {
                el.isEditable = false; if (el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {   // if (el.OldValue === 0 || el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {
                    el.OldValue = 'No';
                } else {
                    el.OldValue = 'Yes';
                }
                if (el.NewValue === null || el.NewValue === 'NO' || el.NewValue === 'false') {
                    el.NewValue = 'No';
                } else {
                    el.NewValue = 'Yes';
                }
            }
            else if (el.FieldName === 'WomanOwnedBusinessFlag') {
                el.isEditable = false; if (el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {  // if (el.OldValue === 0 || el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {
                    el.OldValue = 'No';
                } else {
                    el.OldValue = 'Yes';
                }
                if (el.NewValue === null || el.NewValue === 'NO' || el.NewValue === 'false') {
                    el.NewValue = 'No';
                } else {
                    el.NewValue = 'Yes';
                }
            }
            else if (el.FieldName === 'VeteranOwnedBusinessFlag') {
                el.isEditable = false; if (el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') { //    if (el.OldValue === 0 || el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {
                    el.OldValue = 'No';
                } else {
                    el.OldValue = 'Yes';
                }
                if (el.NewValue === null || el.NewValue === 'NO' || el.NewValue === 'false') {
                    el.NewValue = 'No';
                } else {
                    el.NewValue = 'Yes';
                }
            }
            else if (el.FieldName === 'DisabledOwnedBusinessFlag') {
                if (el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {
                    el.OldValue = 'No';
                } else {
                    el.OldValue = 'Yes';
                }
                if (el.NewValue === null || el.NewValue === 'NO' || el.NewValue === 'false') {
                    el.NewValue = 'No';
                } else {
                    el.NewValue = 'Yes';
                } el.isEditable = false;
            } else if (el.FieldName === 'NonVeteranFlag') { el.isEditable = false; }
            else { el.isEditable = true; }
        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    public questionnairePage() {
        const toggle = this.dbData.find(el => el.Id === 1 || el.Id === 7) !== undefined ? this.dbData.find(el => el.Id === 1 || el.Id === 7).NewValue : undefined;

        this.dbData.forEach(el => {
            if (el.Id > 1) {
                el.isEditable = toggle === 'true' || toggle === undefined ? true : false;
            }
            if (el.Id === 1 || el.Id === 7) {
                el.isEditable = false;
                if (el.OldValue === null || el.OldValue === 'NO' || el.OldValue === 'false') {
                    el.OldValue = 'No';
                } else {
                    el.OldValue = 'Yes';
                }
                if (el.NewValue === null || el.NewValue === 'NO' || el.NewValue === 'false') {
                    el.NewValue = 'No';
                } else {
                    el.NewValue = 'Yes';
                }
            }

        });
        this.opsHistoryDetail = this.dbData;
        this.refreshGrid();
    }

    public refreshGrid() {
        this.gridOpsHistoryData = filterBy(this.opsHistoryDetail, this.filterOpsHistory);
    }


    private companyInfoMetadata() {
        let param = new HttpParams();
        param = param.append('resourceId', this.ResourceId.toString());
        param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
        return this._http.get<any>(`${this.baseURL}CompanyInfo/GetCompType`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    private ownerInfoMetadata() {
        const params: {} = {
            params: {
                resourceID: this.ResourceId
            }
        }
        return this._http.get<any>(`${this.baseURL}OwnershipInformation/GetOwnData`, params).pipe(catchError(this.handleError)).toPromise();
    }

    closeOpHis(): void {
        const reqObj: any = {
            ResourceId: this.dataItem.ResourceId,
            Contr_ID: this.dataItem.Contr_Id,
            PageName: this.dataItem.ChangeType,
        };
        this.dialog.close({ button: 'Yes' });
    }

    openEditDialog(dataItem) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
        const EditPendingProfile = this._srvDialog.open({
            content: PendingProfileChangeComponent,
            width: 500,
        });
        const dialog = EditPendingProfile.content.instance;
        dataItem.Event = this.dataItem.EventName;
        dataItem.CCOpsID = this.dataItem.CCOpsID;
        dataItem.contractor_page = this.dataItem.ChangeType;
        dialog.dataItem = dataItem;

        EditPendingProfile.result.subscribe(async res => {
            if ('result' in res) {
                this.dbData = await this.getDbData();
                this.pageSelected(this.dataItem.ChangeType);
            }
        })
    }

    public processCall(type: string) {
        const urltxt = type === 'Disapprove' ? 'JSON/Disapprove' : 'JSON/Approve';
        this.loader = true;
        this._srvApi.put(`${urltxt}`, {
            Contr_ID: this._srvAuth.Profile.ContrID, ResourceId: this.loginDetailsInternal.ResourceID, PageName: this.dataItem.ChangeType, EventName: null, ContractorResourceID: this._srvAuth.Profile.ContractorResourceID, CCOpsID: this.dataItem.CCOpsID
        }).pipe(catchError(this.handleError)).subscribe(result => {
            if (result === 1) { this.loader = false; this.dialog.close({ result: 'Refresh' }) }
            else {
                this.loader = false; const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 600
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ops_History_Detail.Alert_Something_Went_Wrong}</p>
                                </div>
                            `;
            }
        });
    }


    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

}