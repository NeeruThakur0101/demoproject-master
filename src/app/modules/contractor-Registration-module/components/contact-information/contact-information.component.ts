import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { PageAccess, AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { SaveAlertComponent } from './../../../../shared-module/components/save-alert.component';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Addresses } from './../../models/data-model';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { SelectApplicationModel, ContactNumbers, ContactDetails, Address } from '../../models/data-model';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { DialogService } from '@progress/kendo-angular-dialog';
import { ContactInformationService } from '../../services/contactInfo.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AddressObj, ApprovalContactDetail, Contact, ContactDetail, initialContactMockData, LoginUser, visualCueInitialObject, VisualCueObjectModel } from './contact.model';
import { CorrectionRequestComments } from 'src/app/core/models/user.model';
import { ContactApiService } from './contact-api.service';

@Component({
    selector: 'app-contact-information',
    templateUrl: './contact-information.component.html',
    styleUrls: ['./contact-information.component.scss'],
})
export class ContactInformationComponent implements OnInit, AfterViewInit {
    @ViewChild('kendoTabStripInstance', { static: false })
    public kendoTabStripInstance: any;
    @ViewChild('mapDiv', { static: false }) mapDiv: ElementRef;
    public selectedIndex;
    public resp = [];
    @ViewChild('placesRef', { static: false }) placesRef: GooglePlaceDirective;
    @ViewChild('search', { static: false })
    public searchElementRef: ElementRef;
    @ViewChild('dropdownlist', { static: false }) public dropdownlist: any;
    public showMap: boolean = false;
    public approvalJsonContactApproval;
    public disableMapButton: boolean = true;
    public userForm: FormGroup;
    public emailForm: FormGroup;
    public contactForm: FormGroup;
    public addressForm: FormGroup;
    public mailingForm: FormGroup;
    public billingForm: FormGroup;
    public cccContactForm: FormGroup;
    public field: string = '';
    public contactObj = new ContactDetails();
    public billingObj = new ContactDetails();
    public physicalAddressObj: Addresses;
    public mailingAddressObj: Addresses;
    public billingAddressObj: Addresses;
    public addressObj = new Address();
    public contactInfo = new ContactNumbers();
    public nextTabVal: number = 0;
    public prevTabVal: number = 0;
    public contactData: ContactDetail;
    public forwardedData: ContactDetail;
    public oldRecord: ContactDetail;
    public info: string;
    public lat: number;
    public lng: number;
    public mobileNumberMask: string = '000-000-0000';
    public emailString = [];
    public submitted1: boolean = false;
    public submitted2: boolean = false;
    public submitted3: boolean = false;
    public submitted4: boolean = false;
    public submitted5: boolean = false;
    public submitted6: boolean = false;
    public submitted7: boolean = false;
    public value: boolean = true;
    public accountId: number;
    public resourceId: number;
    public nameRegex: string = `^[a-zA-Z ,.'-]+$`;
    public mobileNumberRegex: string = '^((\\+1-?)|0)?[0-9]{10}$';
    public objProgram = new SelectApplicationModel();
    public state: Array<{ Name: string; ID: number }> = [];
    public stateData: Array<{ Name: string; ID: number }>;
    public contactArray = [];
    public emails: FormArray;
    public formReset: boolean = false;
    public ContrID: number | string;
    public obj = {
        ContactDetails: {
            BillingCompanyName: null,
            BillingContactName: null,
            BillingPhone: null,
            BillingFax: null,
            BillingEmail: null,
            ContractorEmails: null,
            CrawfordContractorConnectionContactName: null,
            CrawfordContractorConnectionContactNumber: null,
            CrawfordContractorConnectionContactEmail: null,
            CrawfordContractorConnectionTrainingContact: null,
            IsMailingAddressPhysicalAddressSame: false,
            IsBillingAddressPhysicalAddressSame: false,
            ContactNumbers: null,
            Address: [],
        },
    };
    public countryId: number;
    public billingToggle: boolean;
    public mailingToggle: boolean;
    public loginDetails: Array<SessionUser> = [];
    public url: string = '';
    public approvalGetObject: ApprovalContactDetail = {};
    public catchTab: boolean = false;
    public visualCueObject: VisualCueObjectModel = visualCueInitialObject;
    public isVerify: boolean = false;
    public phoneNumberCue: boolean = false;
    public physicalAddressArray: AddressObj;
    public billingAddressArray: AddressObj;
    public mailingAddressArray: AddressObj;
    public billingTog: boolean;
    public mailingTog: boolean;
    public tabNo: number;
    public emailTabCueArr: Array<boolean>;
    public emailTabCue: boolean = false;
    public primaryContactTabCue: boolean = false;
    public billingContactTabCue: boolean = false;
    public physicalAddressTabCue: boolean = false;
    public mailingAddressTabCue: boolean = false;
    public billingAddressTabCue: boolean = false;
    public loggedInUserType: string;
    public readonlyMode: boolean = false;
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };
    public showPage: boolean = false;
    public pageContent: any;
    public approvalJSONCue: any;
    public crComments: CorrectionRequestComments[];
    public contactInformation: ContactDetail;
    public ContactDetailsObject: Contact;

    public showHtml: boolean = true;
    constructor(
        private _formBuilder: FormBuilder,
        private _srvContactorRegistration: ContractorRegistrationService,
        private _route: Router,
        private _dialog: DialogService,
        private _srvcontactInfo: ContactInformationService,
        public _srvAuthentication: AuthenticationService,
        private _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvContactApi: ContactApiService
    ) {
        this._srvcontactInfo.success.next({ msg: '', data: {} });
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

    public async ngOnInit() {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.crComments = await this._srvContractorData.getPageComments('Contact Information');
        const abc = '';
        this.emailForm = this._formBuilder.group({
            emails: this._formBuilder.array([this.addEmail(abc)]),
        });
        this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Contact Information');
        this.onLoad();
    }

    ngAfterViewInit() {
        this._srvcontactInfo.success.subscribe((res) => {
            this.forwardedData = null;
            this.oldRecord = null;
            this.contactData = null;
            if (res.msg) {
                if (res.msg === 'success') {
                    this.submitted1 = false;
                    this.submitted2 = false;
                    this.submitted3 = false;
                    this.submitted4 = false;
                    this.submitted5 = false;
                    this.submitted6 = false;
                    this.submitted7 = false;
                    this.forwardedData = res.data;
                    this._srvcontactInfo.incomingData.next(this.forwardedData);
                    this.oldRecord = res.data;
                    this.contactData = res.data;

                    if (this.contactData.hasOwnProperty('ContactDetails')) {
                        this.billingToggle = this.contactData.ContactDetails.IsBillingAddressPhysicalAddressSame;
                        this.mailingToggle = this.contactData.ContactDetails.IsMailingAddressPhysicalAddressSame;

                        if (this._srvAuthentication.Profile.ContrID > 0 && this._srvAuthentication.Profile.EventName === 'No Event') {
                            this.onLoad();
                        } else if (this._srvAuthentication.Profile.ContrID > 0 && this._srvAuthentication.Profile.EventName !== 'No Event') {
                            this.allFormReset();
                            if (this.kendoTabStripInstance) this.kendoTabStripInstance.selectTab(this.contactData.ContactInfoLastTabVisited);

                            this.tabNo = this.contactData.ContactInfoLastTabVisited;
                            this.onLoad();
                        } else {
                            if (this.kendoTabStripInstance) this.kendoTabStripInstance.selectTab(this.contactData.ContactInfoLastTabVisited);
                            this.readdata(this.contactData.ContactDetails);
                        }
                    } else {
                        if (this.kendoTabStripInstance) this.kendoTabStripInstance.selectTab(0);
                        this.userForm.reset();
                        this.cccContactForm.reset();
                        this.emailForm.reset();
                        this.billingForm.reset();
                        this.mailingForm.reset();
                        this.contactForm.reset();
                        this.addressForm.reset();
                    }
                }
            }
        });
    }
    // previous tab form validation check
    public prevTab() {
        this.submitted1 = false;
        this.submitted2 = false;
        this.submitted3 = false;
        this.submitted4 = false;
        this.submitted5 = false;
        this.submitted6 = false;
        this.submitted7 = false;
        const forms = this.userForm.dirty || this.emailForm.dirty || this.contactForm.dirty || this.addressForm.dirty || this.mailingForm.dirty || this.billingForm.dirty || this.cccContactForm.dirty;
        if (forms) {
            this.onEmailConfirmation();
        } else if (forms || (this.emailForm.invalid && this.emails)) {
            this.emails.controls.pop();
            this.onEmailConfirmation();
        } else {
            this.nextTabVal = this.nextTabVal - 1;
            if (this.nextTabVal !== -1) {
                if (this.kendoTabStripInstance) this.kendoTabStripInstance.selectTab(this.nextTabVal);
                this.tabNo = this.nextTabVal;
                if (this.loginDetails[0].ContrID === 0) {
                    this.onPrevAPICall();
                } else {
                    if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                        return;
                    }
                    this.onLoad();
                }
            }
        }
    }
    // confirming email form unsaved changes on back button click
    public onEmailConfirmation() {
        const dialogRef = this._dialog.open({
            content: SaveAlertComponent,
            width: 550,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                <h2>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved}<h2>
                                    <p>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved_Stmt}</p>
                                </div>
                            `;

        dialogRef.result.subscribe((res) => {
            if (res['button'] === 'Yes') {
                this.allFormsPristineState();
                this.nextTabVal = this.nextTabVal - 1;
                if (this.nextTabVal !== -1) {
                    if (this.kendoTabStripInstance) this.kendoTabStripInstance.selectTab(this.nextTabVal);
                    this.tabNo = this.nextTabVal;
                    if (this.loginDetails[0].ContrID === 0) {
                        this.toClearForm(this.tabNo);
                        this.onPrevAPICall();
                    } else {
                        this.onLoad();
                    }
                }
            }
        });
    }
    toClearForm(tab) {
        if (tab + 1 === 2 && !Object.keys(this.cccContactForm.value).some((k) => this.contactData[k])) {
            this.cccContactForm.reset();
        }
        if (tab + 1 === 3 && !Object.keys(this.contactForm.value).some((k) => this.contactData[k])) {
            this.contactForm.reset();
        }
        if (tab + 1 === 5 && !this.contactData.ContactDetails.Address.map((res) => res.AddressType === 'Physical')[0]) {
            this.addressForm.reset();
        }
        if (tab + 1 === 5 && !this.contactData.ContactDetails.Address.map((res) => res.AddressType === 'Mailing')[0]) {
            this.mailingForm.reset();
        }
        if (tab + 1 === 6 && !this.contactData.ContactDetails.Address.map((res) => res.AddressType === 'Billing')[0]) {
            this.billingForm.reset();
        }
    }

    removeMail(index) {
        (<FormArray>this.emailForm.controls.emails).removeAt(index);
    }

    // form builder for validation of email
    public addEmail(value: ''): FormGroup {
        return this._formBuilder.group({
            value: [value, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
        });
    }
    // add new controls of email field
    public addField(): void {
        this.emails = this.emailForm.get('emails') as FormArray;
        const abc = '';
        this.emails.push(this.addEmail(abc));
    }

    public getEmailArrayLen() {
        return this.emailForm.get('emails')['controls'].length;
    }

    // initializing forms and dropdown data
    public async onLoad() {
        let params = {};
        // tslint:disable-next-line: radix
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = [];
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.countryId = this.loginDetails[0].CountryID;
        this.ContrID = this.loginDetails[0].ContrID;
        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this.readonlyMode = true;
        }

        if (this.loginDetails[0].ContrID > 0) {
            params = {
                params: {
                    contrID: this.loginDetails[0].ContrID,
                    pageName: 'Contact Information Page',
                    resourceID: this.resourceId,
                    userLanguageID: this._srvAuthentication.currentLanguageID,
                },
            };
            this.url = `JSON/GetContractorData`;
        } else {
            this.url = 'ContactInfo/GetContactDetails';
            params = {
                params: {
                    resourceID: this.resourceId,
                    CCOpsId: this.loginDetails[0].CCOpsID,
                    userLanguageID: this._srvAuthentication.currentLanguageID,
                },
            };
        }
        this._srvContactApi.getContactDetail(this.url, params).then((res) => {
            this.contactInformation = res;
            this.forwardedData = null;
            this.oldRecord = null;
            this.contactData = null;
            if (this.loginDetails[0].ContrID > 0) {
                this.forwardedData = res;
                this.oldRecord = JSON.parse(JSON.stringify(res));
                this.getPendingApprovalData();
            } else {
                if (res.ContactDetails === null) {
                    this.forwardedData = initialContactMockData;
                    this.oldRecord = initialContactMockData;
                    this._srvcontactInfo.incomingData.next(initialContactMockData);
                } else {
                    let count = 0;
                    if (this.contactInformation.ContactDetails.ContactNumbers.length > 4) {
                        this.contactInformation.ContactDetails.ContactNumbers.map((result) => {
                            if (result.ContactNumber === '' && result.ContactNumberType === '') {
                                count++;
                            }
                        });
                        if (count > 3) {
                            this.contactInformation.ContactDetails.ContactNumbers.splice(0, count);
                        }
                    }
                    this.forwardedData = this.contactInformation;
                    this.oldRecord = this.contactInformation;
                    this._srvcontactInfo.incomingData.next(this.forwardedData);
                }
            }
            this._srvContactorRegistration.funcInternalUserGoDirectlyToContractorPage(res.ContactDetails, 'ContactDetails');
            if (this.forwardedData.hasOwnProperty('ContactDetails') && this.forwardedData.ContactDetails !== null) {
                this.contactData = this.forwardedData;
                this.contactData.ContactDetails.Address.map((element, index) => {
                    if (element.AddressType === 'Physical') {
                        this.physicalAddressArray = this.contactData.ContactDetails.Address[index];
                    }
                    if (element.AddressType === 'Billing') {
                        this.billingAddressArray = this.contactData.ContactDetails.Address[index];
                    }
                    if (element.AddressType === 'Mailing') {
                        this.mailingAddressArray = this.contactData.ContactDetails.Address[index];
                    }
                });
                if (this.loginDetails[0].ContrID === 0) {
                    this.billingToggle = this.loginDetails[0].ContrID > 0 ? this.billingTog : this.contactData.ContactDetails.IsBillingAddressPhysicalAddressSame;
                    this.mailingToggle = this.loginDetails[0].ContrID > 0 ? this.mailingTog : this.contactData.ContactDetails.IsMailingAddressPhysicalAddressSame;
                }
                if (this.kendoTabStripInstance)
                    Promise.resolve(null).then(() => this.kendoTabStripInstance.selectTab(this.loginDetails[0].ContrID > 0 ? this.tabNo : this.contactData.ContactInfoLastTabVisited));

                this.userForm.reset();
                this.cccContactForm.reset();
                this.emailForm.reset();
                this.billingForm.reset();
                this.mailingForm.reset();
                this.contactForm.reset();
                this.addressForm.reset();
                this.fillData();
            } else {
                this.userForm.reset();
                this.cccContactForm.reset();
                this.emailForm.reset();
                this.billingForm.reset();
                this.mailingForm.reset();
                this.contactForm.reset();
                this.addressForm.reset();
                this.fillData();
            }
        });
        this.userForm = this._formBuilder.group({
            Office: ['', [Validators.required]],
            Alternate: ['', [Validators.required]],
            Emergency: ['', [Validators.required]],
            Fax: [null],
        });

        this.contactForm = this._formBuilder.group({
            company: ['', Validators.required],
            cName: ['', Validators.required],
            cPhone: ['', [Validators.required]],
            cFax: [null],
            cEmail: ['', [Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
        });

        this.addressForm = this._formBuilder.group({
            StreetAddress: ['', Validators.required],
            StreetAddress2: [''],
            City: ['', Validators.required],
            State: ['', Validators.required],
            PostalCode: ['', Validators.required],
            IsMailingAddressPhysicalAddressSame: [false],
            IsBillingAddressPhysicalAddressSame: [false],
        });
        this.mailingForm = this._formBuilder.group({
            StreetAddress: ['', Validators.required],
            StreetAddress2: [''],
            City: ['', Validators.required],
            State: ['', Validators.required],
            PostalCode: ['', Validators.required],
        });

        this.billingForm = this._formBuilder.group({
            StreetAddress: ['', Validators.required],
            StreetAddress2: [''],
            City: ['', Validators.required],
            State: ['', Validators.required],
            PostalCode: ['', Validators.required],
        });
        this.cccContactForm = this._formBuilder.group({
            CrawfordContractorConnectionContactName: ['', [Validators.required]],
            CrawfordContractorConnectionContactNumber: ['', [Validators.required]],
            CrawfordContractorConnectionContactEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
            CrawfordContractorConnectionTrainingContact: [null, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)],
        });

        // fetch user access privilege
        if (this.loginDetails[0].ContrID > 0) {
            if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) {
                this.userForm.disable();
                this.contactForm.disable();
                this.addressForm.disable();
                this.emailForm.disable();
                this.mailingForm.disable();
                this.billingForm.disable();
                this.cccContactForm.disable();
            } else {
                if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess) {
                    this.showHtml = false;
                    this.accessDenied();
                }
            }
        }
    }

    public keyupEmail(event) {
        if (this.loginDetails[0].ContrID > 0) {
            if (event.currentTarget.value !== this.contactData.ContactDetails.CrawfordContractorConnectionContactEmail) {
                this.cccContactForm.patchValue({
                    CrawfordContractorConnectionContactName: '',
                    CrawfordContractorConnectionContactNumber: '',
                });
            }
        }
    }

    public accessDenied() {
        this.showPage = false;
        const dialogRef = this._dialog.open({
            content: DialogAlertsComponent,
            width: 550,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>${this.pageContent.Contact_Information.Contact_Info_Alert_Access_Denied}</h2>
                                    <p>${this.pageContent.Contact_Information.Contact_Info_Alert_Access_Denied_Stmt}</p>
                                </div>
                            `;
        dialogRef.result.subscribe((res) => {
            this._route.navigate(['/contractorRegistration/company-information']);
        });
    }

    public isEquivalent(a, b) {
        // Create arrays of property names
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);
        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length !== bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (propName !== 'AddressType') {
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

    public async getPendingApprovalData() {
        const pendingData = await this._srvContactApi.getEventPageJSON(this.loginDetails[0].ContrID, this.resourceId, this.loginDetails[0].CCOpsID);
        this.approvalGetObject =
            pendingData.length > 0 && pendingData[0].CCOpsData && JSON.parse(pendingData[0].CCOpsData).ContractorData.ContactDetails
                ? JSON.parse(pendingData[0].CCOpsData).ContractorData.ContactDetails
                : {};
        this.visualCueProcess();
    }

    // function to process data and attach visual cue on changed properties
    public visualCueProcess() {
        const approvalData = JSON.stringify(this.approvalGetObject);
        let approvalDataParsed;
        approvalDataParsed = JSON.parse(approvalData);
        this._srvcontactInfo.approvalObj.next(approvalDataParsed);
        const comparingObject: any = this._srvContactorRegistration.booleanCheck(this.oldRecord.ContactDetails, this.approvalGetObject);
        this.visualCueObject = { ...this.visualCueObject, ...comparingObject };
        this.visualCueObject.Emails = [{ visualCue: false }, { visualCue: false }, { visualCue: false }, { visualCue: false }, { visualCue: false }];
        this.visualCueObject.ContactNumbers = [
            {
                ContactNumberType: 'Office',
                ContactNumber: '',
                visualCue: false,
            },
            {
                ContactNumberType: 'Alternate',
                ContactNumber: '',
                visualCue: false,
            },
            {
                ContactNumberType: 'Emergency',
                ContactNumber: '',
                visualCue: false,
            },
            {
                ContactNumberType: 'Fax',
                ContactNumber: '',
                visualCue: false,
            },
        ];
        this.visualCueObject.Address = [
            {
                AddressType: 'Physical',
                StreetAddress: false,
                StreetAddress2: false,
                City: false,
                State: false,
                PostalCode: false,
                visualCue: false,
            },
            {
                AddressType: 'Mailing',
                StreetAddress: false,
                StreetAddress2: false,
                City: false,
                State: false,
                PostalCode: false,
                visualCue: false,
            },
            {
                AddressType: 'Billing',
                StreetAddress: false,
                StreetAddress2: false,
                City: false,
                State: false,
                PostalCode: false,
                visualCue: false,
            },
        ];
        if (this.approvalGetObject.ContactNumbers) {
            this.approvalGetObject.ContactNumbers.forEach((t) => {
                for (const [idx, obj] of this.forwardedData.ContactDetails.ContactNumbers.entries()) {
                    if (obj.ContactNumberType === t.ContactNumberType) {
                        this.forwardedData.ContactDetails.ContactNumbers[idx] = { ...this.forwardedData.ContactDetails.ContactNumbers[idx], ...t };
                        this.visualCueObject.ContactNumbers[idx].visualCue = true;
                        return;
                    }
                }
                this.forwardedData.ContactDetails.ContactNumbers.push(t);
            });
        }

        if (this.approvalGetObject.Address) {
            this.approvalGetObject.Address.forEach((t) => {
                for (const [idx, obj] of this.forwardedData.ContactDetails.Address.entries()) {
                    if (obj.AddressType === t.AddressType) {
                        this.forwardedData.ContactDetails.Address[idx] = { ...this.forwardedData.ContactDetails.Address[idx], ...t };
                        return;
                    }
                }
                this.forwardedData.ContactDetails.Address.push(t);
            });
        }
        const jsonData = this.approvalGetObject.Address;
        delete this.approvalGetObject.Address;
        delete this.approvalGetObject.ContactNumbers;
        const mergedData = { ...this.forwardedData.ContactDetails, ...this.approvalGetObject };
        this._srvcontactInfo.incomingData.next({ ContactDetails: mergedData });
        if (jsonData) {
            jsonData.forEach((ele, index) => {
                const indexCue = this.visualCueObject.Address.findIndex((x) => x.AddressType === ele.AddressType);

                if (ele.AddressType === 'Physical') {
                    if (ele.City) this.visualCueObject.Address[indexCue].City = true;
                    if (ele.PostalCode) this.visualCueObject.Address[indexCue].PostalCode = true;
                    if (ele.State) this.visualCueObject.Address[indexCue].State = true;
                    if (ele.StreetAddress) this.visualCueObject.Address[indexCue].StreetAddress = true;
                    if (ele.hasOwnProperty('StreetAddress2')) this.visualCueObject.Address[indexCue].StreetAddress2 = true;
                }

                if (ele.AddressType === 'Mailing') {
                    if (ele.City) this.visualCueObject.Address[indexCue].City = true;
                    if (ele.PostalCode) this.visualCueObject.Address[indexCue].PostalCode = true;
                    if (ele.State) this.visualCueObject.Address[indexCue].State = true;
                    if (ele.StreetAddress) this.visualCueObject.Address[indexCue].StreetAddress = true;
                    if (ele.hasOwnProperty('StreetAddress2')) this.visualCueObject.Address[indexCue].StreetAddress2 = true;
                }

                if (ele.AddressType === 'Billing') {
                    if (ele.City) this.visualCueObject.Address[indexCue].City = true;
                    if (ele.PostalCode) this.visualCueObject.Address[indexCue].PostalCode = true;
                    if (ele.State) this.visualCueObject.Address[indexCue].State = true;
                    if (ele.StreetAddress) this.visualCueObject.Address[indexCue].StreetAddress = true;
                    if (ele.hasOwnProperty('StreetAddress2')) this.visualCueObject.Address[indexCue].StreetAddress2 = true;
                }
            });
        }
        let emailArray = [];
        emailArray = mergedData.ContractorEmails.split(',');
        let dbEmailArray = [];
        dbEmailArray = this.forwardedData.ContactDetails.ContractorEmails.split(',');
        let appr = [];
        if (this.approvalGetObject.ContractorEmails) appr = this.approvalGetObject.ContractorEmails.split(',');
        if (appr && appr.length > 0) {
            appr.forEach((el, index) => {
                this.visualCueObject.Emails[index].visualCue = true;
            });
        }
        this.phoneNumberCue = this.visualCueObject.ContactNumbers.some((el) => el.visualCue === true);
        this.emailTabCue = this.visualCueObject.Emails.some((el) => el.visualCue === true);
        this.emailTabCueArr = this.visualCueObject.Emails.map((el) => el.visualCue);

        if (this.approvalGetObject.CrawfordContractorConnectionContactName) {
            this.visualCueObject.CrawfordContractorConnectionContactName = true;
            this.primaryContactTabCue = true;
        }
        if (this.approvalGetObject.CrawfordContractorConnectionContactNumber) {
            this.visualCueObject.CrawfordContractorConnectionContactNumber = true;
            this.primaryContactTabCue = true;
        }
        if (this.approvalGetObject.CrawfordContractorConnectionContactEmail) {
            this.visualCueObject.CrawfordContractorConnectionContactEmail = true;
            this.primaryContactTabCue = true;
        }
        if (this.approvalGetObject.CrawfordContractorConnectionTrainingContact || this.approvalGetObject.hasOwnProperty('CrawfordContractorConnectionTrainingContact')) {
            this.visualCueObject.CrawfordContractorConnectionTrainingContact = true;
            this.primaryContactTabCue = true;
        }

        if (this.approvalGetObject.BillingCompanyName) {
            this.visualCueObject.BillingCompanyName = true;
            this.billingContactTabCue = true;
        }
        if (this.approvalGetObject.BillingContactName) {
            this.visualCueObject.BillingContactName = true;
            this.billingContactTabCue = true;
        }
        if (this.approvalGetObject.BillingPhone) {
            this.visualCueObject.BillingPhone = true;
            this.billingContactTabCue = true;
        }
        if (this.approvalGetObject.BillingFax) {
            this.visualCueObject.BillingFax = true;
            this.billingContactTabCue = true;
        }
        if (this.approvalGetObject.BillingEmail) {
            this.visualCueObject.BillingEmail = true;
            this.billingContactTabCue = true;
        }

        this.physicalAddressTabCue = Object.values(this.visualCueObject.Address[0]).some((val) => val === true);
        this.billingAddressTabCue = Object.values(this.visualCueObject.Address[2]).some((val) => val === true);
        this.mailingAddressTabCue = Object.values(this.visualCueObject.Address[1]).some((val) => val === true);
        if (this._srvAuthentication.Profile.EventName !== 'No Event') {
            this.approvalJSONCue = JSON.parse(approvalData);
            Object.keys(this.approvalJSONCue).forEach((key) => {
                if (key !== 'Address' && key !== 'ContactNumbers' && !key.includes('Disable')) {
                    this.approvalJSONCue[key] = true;
                }
            });

            if (this.approvalJSONCue.Address) {
                this.approvalJSONCue.Address.map((addressKey) =>
                    Object.keys(addressKey).forEach((key) => {
                        if (key !== 'AddressType') {
                            addressKey[key] = true;
                        }
                    })
                );

                this.approvalJSONCue.Address.forEach((el) => {
                    const index = this.visualCueObject.Address.findIndex((vel) => vel.AddressType === el.AddressType);
                    if (index !== -1) {
                        const visualIndex = el.AddressType === 'Mailing' ? 1 : el.AddressType === 'Billing' ? 2 : el.AddressType === 'Physical' ? 0 : -1;
                        this.visualCueObject.Address[visualIndex].visualCue = true;
                        this.visualCueObject.Address[visualIndex] = { ...this.visualCueObject.Address[visualIndex], ...el };
                    }
                });
            }
            if (this.approvalJSONCue.ContactNumbers) {
                this.approvalJSONCue.ContactNumbers.forEach((contactKey) => (contactKey.visualCue = true));
                this.approvalJSONCue.ContactNumbers.forEach((el) => {
                    const index = this.visualCueObject.ContactNumbers.findIndex((vel) => vel.ContactNumberType === el.ContactNumberType);
                    if (index !== -1) {
                        this.visualCueObject.ContactNumbers[index].visualCue = true;
                    }
                });
            }
            delete this.approvalJSONCue.ContactNumbers;
            delete this.approvalJSONCue.Address;
            this.visualCueObject = { ...this.visualCueObject, ...this.approvalJSONCue };
        }
        this.approvalJsonContactApproval = JSON.parse(JSON.stringify(mergedData));
        this.readdata(mergedData);
    }

    // switch reset function
    public setSwitchValue() {
        if (this.loginDetails[0].ContrID > 0) {
            return;
        }
        if (this.loginDetails[0].ContrID === 0) {
            this._srvcontactInfo.sameMailingAddress.next(false);
            this._srvcontactInfo.sameBillingAddress.next(false);
        }

        this.disableMapButton = true;
        const mailingToggle = this.addressForm.get('IsMailingAddressPhysicalAddressSame').value;
        const billingToggle = this.addressForm.get('IsBillingAddressPhysicalAddressSame').value;
        this.addressForm.get('IsMailingAddressPhysicalAddressSame').patchValue(false);
        this.addressForm.get('IsBillingAddressPhysicalAddressSame').patchValue(false);

        if (mailingToggle === true) {
            this.formReset = true;
            this.mailingForm.patchValue({
                StreetAddress: '',
                StreetAddress2: '',
                City: '',
                State: '',
                PostalCode: '',
            });
        }

        if (billingToggle === true) {
            this.billingForm.patchValue({
                StreetAddress: '',
                StreetAddress2: '',
                City: '',
                State: '',
                PostalCode: '',
            });
        }
    }
    // dropdown data fill function
    public async fillData() {
        this.showPage = true;
        this.stateData = await this._srvContactApi.getStateDetails(this.countryId, this.resourceId);
        this.state = this.stateData.slice();
        if (this.loginDetails[0].ContrID === 0 || this.loginDetails[0].ContrID === null) {
            if (this.contactData) {
                this.readdata(this.contactData.ContactDetails);
            } else {
                this.showPage = true;
            }
        }
    }
    // getter functions of form controls
    get contactFormControl() {
        if (this.userForm) return this.userForm.controls;
    }
    get emailFormcontrol() {
        if (this.emailForm) return this.emailForm.controls;
    }
    get companyFormControl() {
        if (this.contactForm) return this.contactForm.controls;
    }
    get addressFormcontrol() {
        if (this.addressForm) return this.addressForm.controls;
    }
    get mailingFormControl() {
        if (this.mailingForm) return this.mailingForm.controls;
    }
    get billingFormControl() {
        if (this.billingForm) return this.billingForm.controls;
    }
    get cccContactFormControl() {
        if (this.cccContactForm) return this.cccContactForm.controls;
    }

    // on address change map reset
    public handleAddressChange(address) {
        this.addressForm.get('StreetAddress').patchValue(address.formatted_address.slice(0, 49));
        this.lng = address.geometry.location.lng();
        this.lat = address.geometry.location.lat();
        if (this.lat === 0 || this.lng === 0 || this.lat === null || this.lng === null || this.lat === undefined || this.lng === undefined) {
            this.disableMapButton = true;
            return;
        } else {
            this.disableMapButton = false;
        }
        const location = {
            lat: this.lat,
            lng: this.lng,
        };
        this._srvcontactInfo.locationDetails.next(location);
    }

    // patching up existing records to forms
    public readdata(data) {
        if (data) {
            if (data.ContactNumbers && data.ContactNumbers.length > 0) {
                this.userForm.patchValue({
                    Office: data.ContactNumbers[0].ContactNumber,
                    Alternate: data.ContactNumbers[1].ContactNumber,
                    Emergency: data.ContactNumbers[2].ContactNumber,
                    Fax: typeof data.ContactNumbers[3].ContactNumber === 'string' ? data.ContactNumbers[3].ContactNumber : null,
                });
                data.ContactNumbers[3].ContactNumber = typeof data.ContactNumbers[3].ContactNumber === 'string' ? data.ContactNumbers[3].ContactNumber : '';
                this.obj.ContactDetails.ContactNumbers = data.ContactNumbers;
            }

            if (data.ContractorEmails && data.ContractorEmails.length > 0) {
                // set value of emails(array of array)
                const emails: FormArray = this.emailForm.get('emails') as FormArray;
                emails.removeAt(0);
                if (data.ContractorEmails.length === 0) {
                    let blank;
                    emails.push(this.addEmail(blank));
                }
                // conversion code
                let emailArray = [];
                emailArray = data.ContractorEmails.split(',');
                emails.controls = [];
                emailArray.map((item) => {
                    if (item !== '' && item !== null) {
                        emails.push(this.addEmail(item));
                    }
                });
                this.obj.ContactDetails.ContractorEmails = data.ContractorEmails.toString();
            }

            if (data.CrawfordContractorConnectionContactName) {
                this.cccContactForm.patchValue({
                    CrawfordContractorConnectionContactName: typeof data.CrawfordContractorConnectionContactName === 'object' ? '' : data.CrawfordContractorConnectionContactName,
                });
                this.obj.ContactDetails.CrawfordContractorConnectionContactName = typeof data.CrawfordContractorConnectionContactName === 'object' ? '' : data.CrawfordContractorConnectionContactName;
            }
            if (data.CrawfordContractorConnectionContactNumber) {
                this.cccContactForm.patchValue({
                    CrawfordContractorConnectionContactNumber:
                        typeof data.CrawfordContractorConnectionContactNumber === 'object' ? '' : data.CrawfordContractorConnectionContactNumber.replace(/-/g, ''),
                });
                this.obj.ContactDetails.CrawfordContractorConnectionContactNumber =
                    typeof data.CrawfordContractorConnectionContactNumber === 'object' ? '' : data.CrawfordContractorConnectionContactNumber.replace(/-/g, '');
            }
            if (data.CrawfordContractorConnectionContactEmail) {
                this.cccContactForm.patchValue({
                    CrawfordContractorConnectionContactEmail: typeof data.CrawfordContractorConnectionContactEmail === 'object' ? '' : data.CrawfordContractorConnectionContactEmail,
                });
                this.obj.ContactDetails.CrawfordContractorConnectionContactEmail =
                    typeof data.CrawfordContractorConnectionContactEmail === 'object' ? '' : data.CrawfordContractorConnectionContactEmail;
            }
            if (data.CrawfordContractorConnectionTrainingContact) {
                this.cccContactForm.patchValue({
                    CrawfordContractorConnectionTrainingContact: typeof data.CrawfordContractorConnectionTrainingContact === 'object' ? null : data.CrawfordContractorConnectionTrainingContact,
                });
                this.obj.ContactDetails.CrawfordContractorConnectionTrainingContact =
                    typeof data.CrawfordContractorConnectionTrainingContact === 'object' ? null : data.CrawfordContractorConnectionTrainingContact;
            }
            if (data.BillingCompanyName) {
                this.contactForm.patchValue({
                    company: data.BillingCompanyName,
                });
                this.obj.ContactDetails.BillingCompanyName = data.BillingCompanyName;
            }
            if (data.BillingContactName) {
                this.contactForm.patchValue({
                    cName: data.BillingContactName,
                });
                this.obj.ContactDetails.BillingContactName = data.BillingContactName;
            }
            if (data.BillingPhone) {
                this.contactForm.patchValue({
                    cPhone: data.BillingPhone,
                });
                this.obj.ContactDetails.BillingPhone = data.BillingPhone;
            }
            if (data.BillingFax) {
                this.contactForm.patchValue({
                    cFax: typeof data.BillingFax === 'string' ? data.BillingFax : null,
                });
                this.obj.ContactDetails.BillingFax = typeof data.BillingFax === 'string' ? data.BillingFax : null;
            }
            if (data.BillingEmail) {
                this.contactForm.patchValue({
                    cEmail: typeof data.BillingEmail === 'string' ? data.BillingEmail : null,
                });
                this.obj.ContactDetails.BillingEmail = data.BillingEmail;
            }
            if (data.Address) {
                const index = this._srvcontactInfo.findIndex('Physical');
                this.addressForm.get('IsMailingAddressPhysicalAddressSame').patchValue(this.loginDetails[0].ContrID > 0 ? this.mailingTog : data.IsMailingAddressPhysicalAddressSame);
                this.addressForm.get('IsBillingAddressPhysicalAddressSame').patchValue(this.loginDetails[0].ContrID > 0 ? this.billingTog : data.IsBillingAddressPhysicalAddressSame);
                if (index !== -1) {
                    this.addressForm.patchValue({
                        StreetAddress: data.Address[index].StreetAddress,
                        StreetAddress2: data.Address[index].StreetAddress2,
                        City: data.Address[index].City,
                        State: data.Address[index].State,
                        PostalCode: data.Address[index].PostalCode,
                    });

                    this.obj.ContactDetails.Address[index] = data.Address[index];
                }
            }
            if (data.Address) {
                const index = this._srvcontactInfo.findIndex('Mailing');
                if (index !== -1) {
                    this.mailingForm.patchValue({
                        StreetAddress: data.Address[index].StreetAddress,
                        StreetAddress2: data.Address[index].StreetAddress2,
                        City: data.Address[index].City,
                        State: data.Address[index].State,
                        PostalCode: data.Address[index].PostalCode,
                    });
                    this.obj.ContactDetails.Address[index] = data.Address[index];
                }
            }
            if (data.Address) {
                const index = this._srvcontactInfo.findIndex('Billing');
                if (index !== -1) {
                    this.billingForm.patchValue({
                        StreetAddress: data.Address[index].StreetAddress,
                        StreetAddress2: data.Address[index].StreetAddress2,
                        City: data.Address[index].City,
                        State: data.Address[index].State,
                        PostalCode: data.Address[index].PostalCode,
                    });
                    this.obj.ContactDetails.Address[index] = data.Address[index];
                }
            }
        }
        this.showPage = true;
    }
    // dropdown filter
    public handleFilterState(value) {
        this.state = this.stateData.filter((s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // on tab change form state check
    public tabChanged(tabChangeEvent): void {
        if (this.userForm.dirty || this.emailForm.dirty || this.contactForm.dirty || this.addressForm.dirty || this.mailingForm.dirty || this.billingForm.dirty || this.cccContactForm.dirty) {
            const dialogRef = this._dialog.open({
                content: DialogAlertsComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <h2>${this.pageContent.Contact_Information.Contact_Info_Alert_Data_Unsaved}</h2>
                                    <p>${this.pageContent.Contact_Information.Contact_Info_Alert_Data_Unsaved_Stmt}</p>
                                </div>
                            `;
            tabChangeEvent.preventDefault();
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                }
            });
        } else {
            this.nextTabVal = tabChangeEvent.index;
        }
    }

    // save data of particular form
    public async saveUser(val: number, state: string) {
        if (val === 1) {
            if (this.userForm.invalid) {
                this.submitted1 = true;
                return;
            }
            this.contactArray = [];
            Object.keys(this.userForm.value).forEach((element) => {
                this.contactArray.push({
                    ContactNumberType: element,
                    ContactNumber: this.userForm.value[element],
                });
            });

            this.submitted1 = false;

            this.apiCall(1, state);
        } else if (val === 2) {
            if (this.emailForm.invalid) {
                this.submitted2 = true;
                return;
            }
            this.emailString = [];
            // email field
            this.contactObj.ContractorEmails = this.emailForm.value.emails;
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.contactObj.ContractorEmails.length; i++) {
                this.emailString.push(this.contactObj.ContractorEmails[i]['value']);
            }
            const isDuplicate = this.emailString.some((item, idx) => {
                return this.emailString.indexOf(item) !== idx;
            });
            if (isDuplicate === true) {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Contact_Information.Contact_Info_Alert_Duplicate_Email}</p>
                                </div>
                            `;
            } else {
                this.submitted2 = false;
                this.apiCall(2, state);
            }
        } else if (val === 3) {
            if (this.cccContactForm.invalid) {
                this.submitted7 = true;
                return;
            }
            this.apiCall(3, state);
        } else if (val === 4) {
            if (this.contactForm.invalid) {
                this.submitted3 = true;
                return;
            }
            this.apiCall(4, state);
            this.submitted3 = false;
        } else if (val === 5) {
            if (this.addressForm.invalid) {
                this.submitted4 = true;
                return;
            }
            this.formReset === true ? (state = 'editBilingPhysicalForm') : (state = state);
            this.apiCall(5, state);
            this.submitted4 = false;
        } else if (val === 6) {
            if (this.mailingForm.invalid) {
                this.submitted5 = true;
                return;
            }
            this.apiCall(6, state);

            this.submitted5 = false;
        } else if (val === 7) {
            if (this.billingForm.invalid) {
                this.submitted6 = true;
                return;
            }
            this.submitted6 = false;
            this.apiCall(7, state);
        }
    }

    // forwarding form data to contact info service
    async apiCall(pageVal, state) {
        if (pageVal === 1) {
            await this._srvcontactInfo.saveTabData(this.contactArray, 1, 'none', this.approvalJsonContactApproval);
        } else if (pageVal === 2) {
            await this._srvcontactInfo.saveTabData(this.emailString, 2, 'none', this.approvalJsonContactApproval);
        } else if (pageVal === 3) {
            await this._srvcontactInfo.saveTabData(this.cccContactForm.value, 3, 'none', this.approvalJsonContactApproval);
        } else if (pageVal === 4) {
            await this._srvcontactInfo.saveTabData(this.contactForm.value, 4, 'none', this.approvalJsonContactApproval);
        } else if (pageVal === 5) {
            await this._srvcontactInfo.saveTabData(this.addressForm.value, 5, state, this.approvalJsonContactApproval);
        } else if (pageVal === 6) {
            await this._srvcontactInfo.saveTabData(this.mailingForm.value, 6, 'none', this.approvalJsonContactApproval);
        } else if (pageVal === 7) {
            if (this.userForm.valid && this.emailForm.valid && this.contactForm.valid && this.addressForm.valid && this.mailingForm.valid && this.billingForm.valid && this.cccContactForm.valid) {
                await this._srvcontactInfo.saveTabData(this.billingForm.value, 7, 'none', this.approvalJsonContactApproval);
            } else if (
                this.userForm.invalid ||
                this.emailForm.invalid ||
                this.contactForm.invalid ||
                this.addressForm.invalid ||
                this.mailingForm.invalid ||
                this.billingForm.invalid ||
                this.cccContactForm.invalid
            ) {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const message =
                    this.pageContent.Contact_Information.Incomplete_Data +
                    (this.userForm.invalid === true
                        ? this.pageContent.Contact_Information.Phone_Tab
                        : this.emailForm.invalid === true
                        ? this.pageContent.Contact_Information.Email_Tab
                        : this.cccContactForm.invalid === true
                        ? this.pageContent.Contact_Information.Primary_Contact_Tab
                        : this.contactForm.invalid === true
                        ? this.pageContent.Contact_Information.Billing_Contact_Tab
                        : this.addressForm.invalid === true
                        ? this.pageContent.Contact_Information.Physical_Address_Tab
                        : this.mailingForm.invalid === true
                        ? this.pageContent.Contact_Information.Mailing_Address_Tab
                        : this.billingForm.invalid === true
                        ? this.pageContent.Contact_Information.Billing_Address_Tab
                        : 'none');
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${message}</p>
                                </div>
                            `;

                this._srvcontactInfo.success.next({ msg: 'fail', data: this.forwardedData });
                this.userForm.updateValueAndValidity();
                this.emailForm.updateValueAndValidity();
                this.cccContactForm.updateValueAndValidity();
                this.contactForm.updateValueAndValidity();
                this.addressForm.updateValueAndValidity();
                this.mailingForm.updateValueAndValidity();
                this.billingForm.updateValueAndValidity();
            }
        }
        this.crComments = await this._srvContractorData.getPageComments('Contact Information');

        this.allFormsPristineState();
    }
    // converting form state from dirty to pristine
    public allFormsPristineState() {
        this.userForm.markAsPristine();
        this.emailForm.markAsPristine();
        this.contactForm.markAsPristine();
        this.addressForm.markAsPristine();
        this.mailingForm.markAsPristine();
        this.billingForm.markAsPristine();
        this.cccContactForm.markAsPristine();
    }

    public allFormReset() {
        this.userForm.reset();
        this.cccContactForm.reset();
        this.emailForm.reset();
        this.billingForm.reset();
        this.mailingForm.reset();
        this.contactForm.reset();
        this.addressForm.reset();
    }

    // formValidityCheck
    public formValidityCheck() {
        if (
            (this.userForm && this.userForm.invalid) ||
            (this.emailForm && this.emailForm.invalid) ||
            (this.contactForm && this.contactForm.invalid) ||
            (this.addressForm && this.addressForm.invalid) ||
            (this.mailingForm && this.mailingForm.invalid) ||
            (this.billingForm && this.billingForm.invalid) ||
            (this.cccContactForm && this.cccContactForm.invalid)
        ) {
            return 'none';
        } else {
            return null;
        }
    }
    // previous page navigation function
    public async onBackClick() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData({ currentPage: 'Contact Information Page', nextPage: 'company-information' }, null, 'ContactInfo/EditEventContactInfo');
            this.crComments = await this._srvContractorData.getPageComments('Contact Information');
            this._route.navigate(['/contractorRegistration/company-information']);
            return;
        }
        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this._route.navigate(['/contractorRegistration/company-information']);
            return;
        }
        if (this.userForm.dirty || this.emailForm.dirty || this.contactForm.dirty || this.addressForm.dirty || this.mailingForm.dirty || this.billingForm.dirty || this.cccContactForm.dirty) {
            const dialogRef = this._dialog.open({
                content: SaveAlertComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                <h2>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved}</h2>
                                    <p>${this.pageContent.Contact_Information.Global_Alert_Data_Unsaved_Stmt}</p>
                                </div>
                            `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    this.allFormsPristineState();
                    if (this.loginDetails[0].ContrID === 0) {
                        this.onBackAPICall();
                    } else {
                        this.onLoad();
                    }
                }
            });
        } else {
            if (this.loginDetails[0].ContrID === 0) {
                this.onBackAPICall();
            } else {
                this.onLoad();
            }
        }
    }
    // previous page navigation function extended
    public onPrevAPICall() {
        this.ContactDetailsObject = this.oldRecord.ContactDetails;
        this.ContactDetailsObject.CCopsId = this.loginDetails[0].CCOpsID;
        this.ContactDetailsObject.ResourceId = this.resourceId;
        this.ContactDetailsObject.LastPageVisited = 'contact-information';
        this.readdata(this.oldRecord.ContactDetails);
        this._srvContactApi.putContactDetail('ContactInfo/SaveContactInformation', this.ContactDetailsObject).then((response) => {
            if (response === 1) {
            }
        });
    }
    // extension of onBackClick function
    public async onBackAPICall() {
        const response = await this._srvContactorRegistration.saveLastPageVisited('company-information');
        if (response === 1) {
            this._route.navigate(['/contractorRegistration/company-information']);
        }
    }

    // readonlyMode _route
    public nextPage() {
        this.nextTabVal = this.nextTabVal + 1;
        if (this.kendoTabStripInstance) this.kendoTabStripInstance.selectTab(this.nextTabVal);
        if (this.nextTabVal === 7) {
            this._route.navigate(['/contractorRegistration/ownership']);
        }
    }

    // mailing address toggle function
    public mailingAddress(event) {
        if (event === true) {
            this._srvcontactInfo.sameMailingAddress.next(true);
            this.mailingForm.patchValue({
                StreetAddress: this.addressForm.value.StreetAddress,
                StreetAddress2: this.addressForm.value.StreetAddress2,
                City: this.addressForm.value.City,
                State: this.addressForm.value.State,
                PostalCode: this.addressForm.value.PostalCode,
            });
        } else {
            this._srvcontactInfo.sameMailingAddress.next(false);
            this.mailingForm.patchValue({
                StreetAddress: '',
                StreetAddress2: '',
                City: '',
                State: '',
                PostalCode: '',
            });
        }
    }

    // mailing address toggle function
    public billingAddress(event) {
        if (event === true) {
            this.billingForm.patchValue({
                StreetAddress: this.addressForm.value.StreetAddress,
                StreetAddress2: this.addressForm.value.StreetAddress2,
                City: this.addressForm.value.City,
                State: this.addressForm.value.State,
                PostalCode: this.addressForm.value.PostalCode,
            });
        } else {
            this.billingForm.patchValue({
                StreetAddress: '',
                StreetAddress2: '',
                City: '',
                State: '',
                PostalCode: '',
            });
        }
        this._srvcontactInfo.sameBillingAddress.next(true);
    }

    // numeric character validator
    public isNumber(evt) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // postal code validator through service
    public postalCodeValidatior(event: Event) {
        return this._srvContactorRegistration.alphanumericEvaluator(event);
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
}
