import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { DataValidation } from './model';
import { NgForm } from '@angular/forms';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorOperationService } from '../../components/contractor-operation/contractor-operation.service';
import { OperationHistoryDetails } from '../../components/contractor-operation/models';

@Component({
    selector: 'app-pending-profile-change',
    templateUrl: './pending-profile-change.component.html',
    styleUrls: ['./pending-profile-change.component.scss'],
})
export class PendingProfileChangeComponent extends DialogContentBase implements OnInit {
    public baseURL: string = environment.api_url;
    public ContractorChanges: any; // it holds both stringified as well as parsed data of page depending on the page name
    public dataItem: OperationHistoryDetails;
    public ResourceID: number;
    public fieldValidationObject: DataValidation = { DataLength: 10, DataType: 'text', JSONKey: '' };
    public fieldValidation: number = 10;
    public submitted: boolean = false;
    public newValue: string;
    public dataType: string = 'text';
    public federalBinNumberMask: string = '00-0000000';
    public mobileNumberMask: string = '000-000-0000';
    public ssnNumberMask: string = '000-00-0000';
    public maxLength: number;
    public pattern: string;
    public pageContent: any;
    public loginDetailsInternal: SessionUser;
    constructor(
        dialog: DialogRef,
        private _srvOper: ContractorOperationService,
        private _srvAuth: AuthenticationService,
        private _srvDialog: DialogService,
        public _srvLanguage: InternalUserDetailsService
    ) {
        super(dialog);
        this.loginDetailsInternal = this._srvAuth.ProfileInternal;
        this.ResourceID = this.loginDetailsInternal.ResourceID;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    async ngOnInit() {
        this.newValue = this.dataItem.NewValue;
        // Get contractor changes
        this.fieldValidationObject = await this.getFieldValidations();
        if (this.fieldValidationObject === null) {
            this.fieldValidationObject = new DataValidation();
            this.fieldValidationObject.DataLength = 10;
            this.fieldValidationObject.DataType = 'text';
        }
        this.fieldValidation = this.fieldValidationObject.DataLength;
        if (this.dataItem.contractor_page === 'Trades') {
            this.fieldValidation = this.dataItem.maxLength;
        }
        if (this.dataItem.contractor_page === 'Equipment Information Page') {
            this.fieldValidation = 5;
        }
        if (
            this.fieldValidationObject.DataType === 'money' ||
            this.fieldValidationObject.DataType === 'numeric' ||
            this.fieldValidationObject.DataType === 'integer' ||
            this.fieldValidationObject.DataType === 'real' ||
            this.fieldValidationObject.DataType === 'float' ||
            this.fieldValidationObject.DataType === 'decimal' ||
            this.fieldValidationObject.DataType === 'int'
        ) {
            this.dataType = 'number';
        } else {
            this.dataType = 'text';
        }

        if (this.fieldValidationObject.JSONKey === 'MobilizeMinimum' ||
            this.fieldValidationObject.JSONKey === 'ExpandDistance' ||
            this.fieldValidationObject.JSONKey === 'HoursToMobilize' || this.fieldValidationObject.JSONKey === 'ContractorPercentOfOverallBusinessSubContracted') {
            this.dataType = 'text';
        }



        if (this.fieldValidationObject.DataType === 'money' || (this.fieldValidationObject.DataType === 'decimal' && this.fieldValidationObject.DataLength === 0)) {
            this.fieldValidation = 10;
        } else if (
            (this.fieldValidationObject.DataType === 'char' || this.fieldValidationObject.DataType === 'varchar' || this.fieldValidationObject.DataType === 'nvarchar') &&
            this.fieldValidationObject.DataLength === -1
        ) {
            this.fieldValidation = 500;
        } else if ((this.fieldValidationObject.DataType === 'text' && this.fieldValidationObject.DataLength === 0) || this.fieldValidationObject.DataLength === -1) {
            this.fieldValidation = 500;
        } else if (this.fieldValidationObject.DataLength === 0) {
            this.fieldValidation = 10;
        }
        if (this.dataItem.FieldName === 'ContractorSymbilityAddress' || this.dataItem.FieldName === 'ContractorXactNetAddress') {
            this.fieldValidation = this.dataItem.maxLength;
        }
        if (this.dataItem.FieldName === 'StreetAddress2-Physical' || this.dataItem.FieldName === 'StreetAddress2-Mailing' || this.dataItem.FieldName === 'StreetAddress2-Billing') {
            this.fieldValidation = this.dataItem.maxLength;
        }
        this.ContractorChanges = JSON.parse((await this.getContractorChanges(this.dataItem.Event, this.setPageUrl()))[0].CCOpsData);
        this.ContractorChanges = this.ContractorChanges.ContractorData;
    }

    public setPageUrl() {
        let url;
        switch (this.dataItem.contractor_page) {
            case 'Contractor Locations Page':
                url = 'AddContractorLocation/GetLocationEventPageJson';
                break;
            case 'Job Volume Information Page':
                url = 'JobVolume/GetJobVolumeEventPageJson';
                break;
            case 'Company Information Page':
                url = 'CompanyInfo/GetCompanyEventJson';
                break;
            case 'Contact Information Page':
                url = 'ContactInfo/GetContactEventJson';
                break;
            case 'References Information Page':
                url = 'AddReference/GetReferenceEventPageJson';
                break;
            case 'Financial Information Page':
                url = 'FinancialInfo/GetFinancialInfoEventPageJson';
                break;
            case 'Equipment Information Page':
                url = 'EquipmentInformation/GetEquipmentEventPageJson';
                break;
            case 'Trades':
                url = 'TradeInformation/GetTradeEventPageJson';
                break;
            case 'Coverage Area':
                url = 'CoverageProfile/GetCoverageEventJson';
                break;
            case 'Surge Information Page':
                url = 'SurgeResponseInfo/GetSurgeEventPageJson';
                break;
            case 'Ownership Information Page':
                url = 'OwnershipInformation/GetOwnershipEventJson';
                break;
            case 'Legal Item Information Page':
                url = 'LegalIssue/GetLegalEventJson';
                break;
            case 'Language-Veteran Information Page':
                url = 'LanguageAndVeteranInfo/GetLangVeteranEventPageJson';
                break;
            case 'Contractor Questionnaire':
                url = 'QuestionnaireAnswer/GetQuestionnaireAnswersEventPageJson';
                break;
            default:
                console.log('Work in progress.');
                break;
        }
        return url;
    }
    public checkEmail(isEmail) {
        const filter = /^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/;
        if (!filter.test(isEmail)) {
            // alert('Please enter valid email format.');

            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `<div class="modal-alert info-alert">
            <p>${this.pageContent.General_Keys.Valid_Email_Format}</p>
       </div> `
            return false;
        }
        return true;
    }

    public onChangeSubmit(form: NgForm) {
        if (form.valid) {
            if (this.dataItem.isEmail) {
                if (!this.checkEmail(form.value.newValue)) {
                    return;
                }
            }

            if (form.value.newValue.trim().length > this.fieldValidation) {
                this.submitted = true;
                return false;
            }
            // Select appropricate page funtion for change process.
            switch (this.dataItem.contractor_page) {
                case 'Contractor Locations Page':
                    this.processContractorLocationPage(form.value.newValue);
                    break;
                case 'Job Volume Information Page':
                    this.processJobVolumeInformationPage(form.value.newValue);
                    break;
                case 'Company Information Page':
                    this.processCompanyInformationPage(form.value.newValue);
                    break;
                case 'Contact Information Page':
                    this.processContactInformationPage(form.value.newValue);
                    break;
                case 'References Information Page':
                    this.processReferenceInformationPage(form.value.newValue);
                    break;
                case 'Financial Information Page':
                    this.processFinancialInformationPage(form.value.newValue);
                    break;
                case 'Equipment Information Page':
                    this.processEquipmentInformationPage(form.value.newValue);
                    break;
                case 'Trades':
                    this.processTradesInformationPage(form.value.newValue);
                    break;
                case 'Coverage Area':
                    this.processCoveragePage(form.value.newValue);
                    break;
                case 'Surge Information Page':
                    this.processSurgeInformationPage(form.value.newValue);
                    break;
                case 'Ownership Information Page':
                    this.processOwnershipInformationPage(form.value.newValue);
                    break;
                case 'Legal Item Information Page':
                    this.processLegalInformationPage(form.value.newValue);
                    break;
                case 'Language-Veteran Information Page':
                    this.processLanguageVeteranInformationPage(form.value.newValue);
                    break;
                case 'Contractor Questionnaire':
                    this.processQuestionnairePage(form.value.newValue);
                    break;
                default:
                    console.log('Work in progress.');
                    break;
            }
        }
    }
    async getFieldValidations() {
        if (this.dataItem.FieldName.includes('Reference') || this.dataItem.FieldName.includes('ContactNumber')) {
            this.dataItem.FieldName = this.dataItem.FieldName.split('-')[0].trim()
        }
        return this._srvOper.GetFieldValidation(this.dataItem.FieldName, this.dataItem.contractor_page, this.ResourceID);
    }

    async processContractorLocationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.LocationInformation.ContractorLocationList.find((x) => x.SerialNumber === this.dataItem.SerialNumber);
        if (getItemToChange) {
            if (this.dataItem.FieldName === 'ContractorLocationSpaceUse') {
                getItemToChange[this.dataItem.FieldName] = +approverChange.trim();
            } else {
                getItemToChange[this.dataItem.FieldName] = approverChange.trim();
            }
            await this.EditContractorData({ LocationInformation: this.ContractorChanges.LocationInformation }, this.dataItem.Event, 'AddContractorLocation/EditLocationEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.LocationInformation });
        }
    }

    // Job Volume Information Process
    async processJobVolumeInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.JobVolumeInformation.find((x) => x.Year === this.dataItem.Id);

        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName] = +approverChange.trim();
            await this.EditContractorData({ JobVolumeInformation: this.ContractorChanges.JobVolumeInformation }, this.dataItem.Event, 'JobVolume/EditJobVolumeEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.JobVolumeInformation });
        }
    }
    // Company Information Process
    async processCompanyInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.CompanyDetails;

        if (getItemToChange) {
            if (this.dataItem.FieldName === 'ContractorPercentOfOverallBusinessSubContracted' && (+approverChange < 0 || +approverChange > 100)) {
                this.newValue = null;
                const cancelRef = this._srvDialog.open({ content: DialogAlertsComponent, width: 500 });
                const cancelIns: DialogAlertsComponent = cancelRef.content.instance;
                cancelIns.alertMessage = `
                        <div class="modal-alert info-alert">
                        <p>${this.pageContent.Profile_Change.BusinessSubContracted}</p>
                        </div>
                        `;
                return;
            }
            getItemToChange[this.dataItem.FieldName] = approverChange.trim();
            await this.EditContractorData({ CompanyDetails: this.ContractorChanges.CompanyDetails }, this.dataItem.Event, 'CompanyInfo/EditEventCompanyInfo');
            this.dialog.close({ result: this.ContractorChanges.CompanyDetails });
        }
    }
    // Contact Information Process
    async processContactInformationPage(approverChange) {
        let getItemToChange;
        if (this.dataItem.FieldName === 'ContactNumber') {
            getItemToChange = this.ContractorChanges.ContactDetails.ContactNumbers.find((x) => x.ContactNumberType === this.dataItem.ContactNumberType);
        } else if (this.dataItem.AddressType !== null) {
            getItemToChange = this.ContractorChanges.ContactDetails.Address.find((x) => x.AddressType === this.dataItem.AddressType);
        } else {
            getItemToChange = this.ContractorChanges.ContactDetails;
        }
        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName.split('-')[0].trim()] = approverChange.trim();
            await this.EditContractorData({ ContactDetails: this.ContractorChanges.ContactDetails }, this.dataItem.Event, 'ContactInfo/EditEventContactInfo');
            this.dialog.close({ result: this.ContractorChanges.ContactDetails });
        }
    }

    // Reference Information Process
    async processReferenceInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.ReferenceInformation.find((x) => x.SrNo === this.dataItem.SerialNumber);

        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName.split('-')[0].trim()] = approverChange.trim();
            await this.EditContractorData({ ReferenceInformation: this.ContractorChanges.ReferenceInformation }, this.dataItem.Event, 'AddReference/EditReferenceEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.ReferenceInformation });
        }


    }

    // Financial Information Process
    async processFinancialInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.FinancialInformation.find((x) => x.FinancialYear === this.dataItem.Id);

        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName] = +approverChange.trim();
            await this.EditContractorData({ FinancialInformation: this.ContractorChanges.FinancialInformation }, this.dataItem.Event, 'FinancialInfo/EditFinancialInfoEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.FinancialInformation });
        }
    }
    // Equipment Information Process
    async processEquipmentInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.EquipmentInformation.EquipmentDetails.find((x) => x.EquipmentNumber === this.dataItem.Id);

        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName.split('-')[0]] = +approverChange.trim();
            await this.EditContractorData({ EquipmentInformation: this.ContractorChanges.EquipmentInformation }, this.dataItem.Event, 'EquipmentInformation/EditEquipmentEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.EquipmentInformation });
        }
    }
    // Surge Information Process
    async processSurgeInformationPage(approverChange) {
        let getItemToChange;
        if (this.dataItem.FieldName !== 'SurgeResponseDetail' && !this.dataItem.FieldName.includes('ManageSurgeLicenses')) {
            getItemToChange = this.ContractorChanges.SurgeResponseInformation;
        } else if (this.dataItem.FieldName.includes('ManageSurgeLicenses')) {
            const splitData = this.dataItem.FieldName.split('-');
            getItemToChange = this.ContractorChanges.SurgeResponseInformation.ManageSurgeLicenses.find((x) => x.USStateAbbreviation === splitData[0] && x.ContrLicenseName === splitData[1]);
        }
        if (getItemToChange) {
            if (this.dataItem.FieldName.includes('ManageSurgeLicenses')) {
                this.dataItem.FieldName = this.dataItem.FieldName.split('-')[3];
            }
            getItemToChange[this.dataItem.FieldName] = approverChange.trim();
            await this.EditContractorData({ SurgeResponseInformation: this.ContractorChanges.SurgeResponseInformation }, this.dataItem.Event, 'SurgeResponseInfo/EditSurgeEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.SurgeResponseInformation });
        }
    }
    // Ownership Information Process
    async processOwnershipInformationPage(approverChange) {
        let getItemToChange;
        if (
            this.dataItem.FieldName === 'MonthsInCurrentOwnership' ||
            this.dataItem.FieldName === 'YearsInCurrentOwnership' ||
            this.dataItem.FieldName === 'StockSymbol' ||
            this.dataItem.FieldName === 'ExchangeListing'
        ) {
            getItemToChange = this.ContractorChanges.OwnershipDetails;
        } else {
            getItemToChange = this.ContractorChanges.OwnershipDetails.OwnershipInformationList.find((x) => x.ID === this.dataItem.SerialNumber);
        }
        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName] = approverChange.trim();
            await this.EditContractorData({ OwnershipDetails: this.ContractorChanges.OwnershipDetails }, this.dataItem.Event, 'OwnershipInformation/EditEventOwnershipInfo');
            this.dialog.close({ result: this.ContractorChanges.OwnershipDetails });
        }
    }
    // Legal Information Process
    async processLegalInformationPage(approverChange) {
        const getOwner = this.ContractorChanges.LegalInformationPage.ContractorLegalIssue.find((x) =>
            x.LegalIssueEntry[0].ID
                ? x.LegalIssueEntry[0].ID === this.dataItem.LegalID
                : x.LegalIssueEntry[0].LegalIssueEntryID === this.dataItem.LegalIssueEntryID && x.OwnershipNumber === this.dataItem.SerialNumber
        );
        const getLegalIssueEntry = getOwner.LegalIssueEntry[0].LegalIssueDetail.find((x) => x.LegalIssueFieldTypeID === this.dataItem.LegalIssueFieldTypeID);
        if (getLegalIssueEntry) {
            getLegalIssueEntry[this.dataItem.FieldName.split('-')[0].trim()] = approverChange.trim();
            await this.EditContractorData({ LegalInformationPage: this.ContractorChanges.LegalInformationPage }, this.dataItem.Event, 'LegalIssue/EditEventLegalInfo');
            this.dialog.close({ result: this.ContractorChanges.LegalInformationPage });
        }
    }
    // Trades Information Process
    async processTradesInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.TradeInformation.find((x) => x.TradeListID === this.dataItem.SerialNumber);
        if (getItemToChange) {
            getItemToChange.SubOutComment = approverChange.trim();
            await this.EditContractorData({ TradeInformation: this.ContractorChanges.TradeInformation }, this.dataItem.Event, 'TradeInformation/EditTradeEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.TradeInformation });
        }
    }
    // Coverage Information Process
    async processCoveragePage(approverChange) {
        const getItemToChange = this.ContractorChanges.TradeInformation.find((x) => x.tradeListID === this.dataItem.SerialNumber);

        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName] = +approverChange.trim();
            await this.EditContractorData({ TradeInformation: this.ContractorChanges.TradeInformation }, this.dataItem.Event, 'CoverageProfile/EditEventCoverageInfo');
            this.dialog.close({ result: this.ContractorChanges.TradeInformation });
        }
    }
    // Coverage Information Process
    async processLanguageVeteranInformationPage(approverChange) {
        const getItemToChange = this.ContractorChanges.LanguageAndVeteranInformation;

        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName] = +approverChange.trim();
            await this.EditContractorData(
                { LanguageAndVeteranInformation: this.ContractorChanges.LanguageAndVeteranInformation },
                this.dataItem.Event,
                'LanguageAndVeteranInfo/EditLangVeteranEventJsonData'
            );
            this.dialog.close({ result: this.ContractorChanges.LanguageAndVeteranInformation });
        }
    }

    async processQuestionnairePage(approverChange) {
        const getItemToChange = this.ContractorChanges.ContractorQuestionnaire[this.dataItem.Questionnaire].find((x) => x.QuestionTypeNumber === this.dataItem.Id);
        if (getItemToChange) {
            getItemToChange[this.dataItem.FieldName.split('-')[0]] = +approverChange.trim();
            await this.EditContractorData({ ContractorQuestionnaire: this.ContractorChanges.ContractorQuestionnaire }, this.dataItem.Event, 'QuestionnaireAnswer/EditQuestionnaireAnswerEventJsonData');
            this.dialog.close({ result: this.ContractorChanges.ContractorQuestionnaire });
        }
    }

    // Get Page Json Data
    public getContractorChanges(eventName: string, url) {
        return this._srvOper.GetContractorChanges(
            this._srvAuth.Profile.ContrID,
            this.ResourceID,
            this.dataItem.contractor_page,
            this.dataItem.CCOpsID,
            eventName,
            // this._srvAuth.Profile.EventAlias ? this._srvAuth.Profile.EventAlias : this._srvAuth.Profile.EventName,
            url
        );
    }

    // Edit Page Json Data for Submitted Contractor
    public async EditContractorData(obj, event, url): Promise<any> {
        const objct = {
            ResourceId: this.loginDetailsInternal.ResourceID,
            ContractorResourceID: this._srvAuth.Profile.ContractorResourceID,
            CCOpsID: this.dataItem.CCOpsID,
            CCOpsData: JSON.stringify(obj),
            PageName: this.dataItem.contractor_page,
            Contr_ID: this._srvAuth.Profile.ContrID,
            EventName: event === 'No Event' || event === null ? null : event,
            isInternal: true,
            EventDataFlag: event === 'No Event' || event === null ? false : true,
        };
        return await this._srvOper.EditJsonData(objct, url);
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

    public masterFunction(key: string, evt, flag = false) {
        if (key === 'YearsInCurrentOwnership' && !flag) {
            this.fieldValidation = 3;
        } // OwnershipPage
        else if (key === 'ContractorFederalTaxNumber' && !flag) {
            this.fieldValidation = 9;
        } // CompanyInformation
        else if (key === 'MonthsInCurrentOwnership' && !flag) {
            const val = this.checkInput();
            return val;
        } else if (key === 'VeteranPledgeCount') {
            this.fieldValidation = 5;
        } else if (flag) {
            const val = this.numberOnly(evt);
            return val;
        } else if (key.includes('LicenseCompanyName')) {
            this.fieldValidation = 50;
        } else if (key.includes('LicenseNumber')) {
            this.fieldValidation = 50;
        } else if (key === 'HoursToMobilize') {
            this.fieldValidation = 5;
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key === 'ExpandDistance') {
            this.fieldValidation = 5;
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key === 'MobilizeMinimum') {
            this.fieldValidation = 5;
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key.includes('NumberOfEquipmentOwned') || key.includes('NumberOfEquipmentLease')) {
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key.includes('QuestionAnswer')) {
            this.fieldValidation = 5;
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key === 'AverageJobAmountInYear') {
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key.includes('SubOutComment')) {
            this.fieldValidation = 1000;
        } else if (key === 'OwnershipName') {
            this.fieldValidation = 30;
            // const val = this.OwnershipNameFormat(evt);
            // return val;
        } else if (key.includes('ReferenceName')) {
            this.fieldValidation = 50;
        } else if (key.includes('ReferencePosition') || key.includes('ReferenceEmail')) {
            this.fieldValidation = 100;
        } else if (key.includes('ContractorLocationSpaceUse')) {
            this.fieldValidation = 6;
            const val = this.onlyWholeNumber(evt);
            return val;
        } else if (key === 'ContractorPercentOfOverallBusinessSubContracted') {
            this.fieldValidation = 3;
            const val = this.onlyWholeNumber(evt);
            return val;
        }
    }

    // public OwnershipNameFormat(event) {
    //     const pattern = /^[a-zA-Z ,.'-]+$/;
    //     const inputChar = String.fromCharCode(event.charCode);
    //     if (!pattern.test(inputChar)) {
    //         event.preventDefault();
    //     }
    // }

    // }
    public onlyWholeNumber(event) {
        const pattern = /[0-9\+\-\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode === 32 || inputChar === '-' || inputChar === '+') {
            return false;
        } else if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }
    checkInput() {
        if (this.fieldValidationObject.JSONKey === 'MonthsInCurrentOwnership') {
            this.pattern = '^([0-9]|1[011])$';
            this.fieldValidation = 2;
            if (parseInt(this.newValue, 10) < 0 || parseInt(this.newValue, 10) > 11) {
                return false;
            }
            return true;
        }
        return true;
    }

    public numberOnly(evt: any): boolean {
        // getting key code of pressed key
        const keycode = evt.which ? evt.which : evt.keyCode;
        const pattern = /[0-9\.\ ]/;
        const inputChar = String.fromCharCode(evt.charCode);
        // comparing pressed keycodes
        if (!(keycode === 8 || keycode === 46) && (keycode < 48 || keycode > 57) && !pattern.test(inputChar)) {
            evt.srcElement.classList.add('err');
            return false;
        } else {
            evt.srcElement.classList.remove('err');
            const parts = evt.srcElement.value.split('.');
            if (parts.length > 1 && keycode === 46) {
                return false;
            }
            if (evt.srcElement.value !== '' && keycode === 45) {
                return false;
            }
            if (isNaN(parseFloat(parts))) {
                return;
            } else {
                if (parts.length > 1) {
                    if (parts[1].length > 1) return false;
                }
            }
            return true;
        }
    }

    public onPaste() {
        return false;
    }
}
