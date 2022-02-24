import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from './../../../../../environments/environment';
import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from './../../services/contractor-Registration.service';
import { SaveAlertComponent } from './../../../../shared-module/components/save-alert.component';
import { AddOwnerShipOrPrinciple, VeteranEmployeeData } from './../../models/data-model';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input, HostListener, AfterViewInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogRef, DialogContentBase, DialogService } from '@progress/kendo-angular-dialog';
import { Subscription, throwError } from 'rxjs';
import * as moment from 'moment';
import { AuthenticationService, PageAccess, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { OwnershipInformationService } from '../../components/ownership-information/ownership-information.service';
import { OwnwershipInformationObject, VisualCuesModel } from '../../components/ownership-information/ownership.model';

@Component({
    selector: 'app-ownership-page-_srvDialogRef',
    templateUrl: './ownership-page-dialog.component.html',
    styleUrls: ['./ownership-page-dialog.component.scss'],
})
export class OwnershipPageDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {
    public ownershipModal: FormGroup = this.addOwnerForm();
    public unchecked: boolean = false;
    public submitted: boolean = false;
    public emailFromSignup: boolean = false;
    public containerRef: ViewContainerRef;
    public incomingData: AddOwnerShipOrPrinciple;
    @Input() set _incomingData(value: AddOwnerShipOrPrinciple) {
        this.incomingData = value;
    }
    get _incomingData(): AddOwnerShipOrPrinciple {
        return this.incomingData;
    }
    @Input() public disableFields: boolean;
    @Input() public disableFieldOwnershipName: boolean;
    @Input() public title: string;
    @Input() public ownershipArrayList: Array<OwnwershipInformationObject>;
    @Input() public page: string;
    @Input() public emailArray: string[];
    @Input() public isDuplicateMail: boolean;
    @Input() public deletedMails: string[];
    @Input() public isDeletedRecovered: boolean;
    @Input() public isReadonlyMail: boolean;
    public minHire: Date;
    public mobileNumberMask: string = '000-000-0000';
    public ssnNumberMask: string = '000-00-0000';
    public hireDateValue = null;
    public dobValue = null;
    public OwnerResult: Array<{}> = [];
    public formDirtyState: boolean = false;
    public mobileNumberRegex: string = '^((\\+1-?)|0)?[0-9]{10}$';
    public ssnRegex: string = '^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$';
    public emailRegex: string = '^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$';
    public min: Date = new Date(1900, 0, 1);
    public max: Date = new Date(Date.now());
    public ownerPrincipleIDSub: Subscription;
    public emailDuplicacyCheck: Subscription;
    public duplicacyCheck: boolean;
    public ownerPrincipleStatus: boolean;
    public serverTime: Date;
    public disableSavebutton = false;
    public pageContent: any;
    public OwnerRole: Array<{
        ContractorEmployeeType: string;
        ContrEmployeeTypeID: number;
        ContractorEmployeeTypeTranslated: string;
    }> = [];
    public militaryAffiliationsData: Array<{
        MilitaryAffiliationID: number;
        MilitaryAffiliationBranch: string;
    }> = [];
    public OwnerRoleData: Array<{
        ContractorEmployeeType: string;
        ContrEmployeeTypeID: number;
        ContractorEmployeeTypeTranslated: string;
    }>;
    public militaryAffiliations: Array<{
        MilitaryAffiliationID: number;
        MilitaryAffiliationBranch: string;
    }>;
    public countryID: number;
    public resourceId: number;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];

    @ViewChild('dropdownlist', { static: false }) public dropdownlist: any;
    @ViewChild('military', { static: false }) public military: any;
    public visualCues: VisualCuesModel = {
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
    public loggedInUserType: string;
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };
    public removedItems: VeteranEmployeeData[] = [];
    public addItems: VeteranEmployeeData[] = [];
    private baseURL: string = environment.api_url;
    temp: number[] = [];
    constructor(
        private _formBuilder: FormBuilder,
        private _srvDialogRef: DialogRef,
        private _dialog: DialogService,
        private _srvContractor: ContractorRegistrationService,
        private _srvAuthentication: AuthenticationService,
        private _srvLanguage: InternalUserDetailsService,
        private _http: HttpClient,
        private _srvOwnership: OwnershipInformationService
    ) {
        super(_srvDialogRef);
        this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Ownership Information');
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.countryID = this.loginDetails[0].CountryID;
        this.resourceId = this.loginDetails[0].ResourceID;
        this.ownershipModal = this._formBuilder.group({
            OwnershipNumber: [''],
            ID: [''],
            OwnershipName: ['', [Validators.required]],
            ContrEmployeeTypeId: [null, Validators.required],
            ContactEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
            ContactPhone: ['', Validators.required, Validators.pattern(this.mobileNumberRegex)],
            VeteranEmployeeMilitaryAffiliation: [null, Validators.required],
            SocialSecurityNumber: ['', [Validators.required, Validators.pattern(this.ssnRegex)]],
            DrivingLicense: [null, Validators.required],
            DateOfBirth: [null, Validators.required],
            OwnershipPercentage: ['', Validators.required, Validators.pattern('^[1-9][0-9]?$|^100$')],
            ActiveFlag: ['', Validators.required],
            VeteranFlag: [null, Validators.required],
            VeteranEmployeeHireDate: [null, Validators.required],
            LegalIssueFlag: [false],
            IsContractorActive: ['N'],
            TimeStamp: [''],
        });

        this.ownerPrincipleIDSub = this._srvContractor.userFromSignupAdded.subscribe((status) => {
            this.ownerPrincipleStatus = status;
        });

        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    @HostListener('window:beforeunload')
    public canDeactivate(): boolean {
        if (this.ownershipModal.dirty) {
            return false;
        } else {
            return true;
        }
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
    // auto scroll
    public ngAfterViewInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }

    public async ngOnInit() {
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.getOwndata();
        this.ownershipModal = this.addOwnerForm();
        const militaryAffiliationControl = this.ownershipModal.get('VeteranEmployeeMilitaryAffiliation');
        const flag = this.ownershipModal.get('VeteranFlag').value;
        if (flag === true) {
            militaryAffiliationControl.setValidators([Validators.required]);
        }
        this.disableFormFields();
        this.setOwnerStructureIDVeteranValidators();
        this.serverTime = await this.fetchServerTime();
        this.emailDuplicacyCheck = this._srvContractor.inactiveOwnershipEmail.subscribe((ownershipDuplicacyState) => {
            this.duplicacyCheck = ownershipDuplicacyState;
        });
    }
    // to disable field as per visulacued data
    public disableFormFields() {
        if (this.loggedInUserType === 'Internal') {
            if (this.incomingData && this.incomingData.OwnershipNameCue === true) {
                this.ownershipModal.controls.OwnershipName.disable();
            }
            if (this.incomingData && this.incomingData.ContrEmployeeTypeIdCue === true) {
                this.ownershipModal.controls.ContrEmployeeTypeId.disable();
            }
            if (this.incomingData && this.incomingData.ContactEmailCue === true) {
                this.ownershipModal.controls.ContactEmail.disable();
            }
            if (this.incomingData && this.incomingData.ContactPhoneCue === true) {
                this.ownershipModal.controls.ContactPhone.disable();
            }
            if (this.incomingData && this.incomingData.SocialSecurityNumberCue === true) {
                this.ownershipModal.controls.SocialSecurityNumber.disable();
            }
            if (this.incomingData && this.incomingData.DrivingLicenseCue === true) {
                this.ownershipModal.controls.DrivingLicense.disable();
            }
            if (this.incomingData && this.incomingData.DateOfBirthCue === true) {
                this.ownershipModal.controls.DateOfBirth.disable();
            }
            if (this.incomingData && this.incomingData.DateOfBirthCue === true) {
                this.ownershipModal.controls.DateOfBirth.disable();
            }
            if (this.incomingData && this.incomingData.DateOfBirthCue === true) {
                this.ownershipModal.controls.DateOfBirth.disable();
            }
            if (this.incomingData && this.incomingData.VeteranEmployeeMilitaryAffiliationCue === true) {
                this.ownershipModal.controls.VeteranEmployeeMilitaryAffiliation.disable();
            }
            if (this.incomingData && this.incomingData.VeteranEmployeeHireDateCue === true) {
                this.ownershipModal.controls.VeteranEmployeeHireDate.disable();
            }
            if (this.incomingData && this.incomingData.OwnershipPercentageCue === true) {
                this.ownershipModal.controls.OwnershipPercentage.disable();
            }
            if (this.incomingData && this.incomingData.ActiveFlagCue === true) {
                this.ownershipModal.controls.ActiveFlag.disable();
            }
            if (
                this.incomingData &&
                (this.incomingData.VeteranFlagCue === true || this.incomingData.VeteranEmployeeMilitaryAffiliationCue === true || this.incomingData.VeteranEmployeeHireDateCue === true)
            ) {
                this.ownershipModal.controls.VeteranFlag.disable();
            }
        }

        if ((this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') || (this.$pagePrivilege.readonlyAccess && !this.$pagePrivilege.editAccess)) {
            this.ownershipModal.disable();
        }
    }
    public async getOwndata() {
        const ownData = await this._srvOwnership.getOwnData(this.resourceId, this._srvAuthentication.currentLanguageID);
        this.OwnerRoleData = ownData.OwnerRole;
        this.militaryAffiliationsData = ownData.MilitaryAffiliations;
        this.OwnerRole = this.OwnerRoleData;
        this.militaryAffiliations = ownData.MilitaryAffiliations;
    }
    // dynamic validations according to the veteran toggle selection and state selection
    public setOwnerStructureIDVeteranValidators() {
        const militaryAffiliationControl = this.ownershipModal.get('VeteranEmployeeMilitaryAffiliation');

        const veteranEmployeeHireDateControl = this.ownershipModal.get('VeteranEmployeeHireDate');
        const OwnershipPercentageControl = this.ownershipModal.get('OwnershipPercentage');
        const ssnControl = this.ownershipModal.get('SocialSecurityNumber');
        const drivingLicenseControl = this.ownershipModal.get('DrivingLicense');
        this.ownershipModal.get('VeteranFlag').valueChanges.subscribe((veteranFlagState) => {
            if (veteranFlagState === true) {
                militaryAffiliationControl.setValidators([Validators.required]);
            } else {
                if (this.ownershipModal.value.VeteranEmployeeMilitaryAffiliation && this.ownershipModal.value.VeteranEmployeeMilitaryAffiliation.length) {
                    if (this.addItems && this.addItems.length) {
                        this.addItems.forEach((militaryEl) => {
                            militaryEl.RemovedDate = this.serverTime;
                            militaryEl.RemovedResourceID = this.loggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID;
                        });
                    }
                }
                militaryAffiliationControl.setValidators(null);
                militaryAffiliationControl.setValue('');
                if (
                    (this.incomingData && (!this.incomingData.VeteranEmployeeHireDate || this.incomingData.VeteranEmployeeHireDate === null || this.incomingData.VeteranEmployeeHireDate === '')) ||
                    this.incomingData === undefined
                ) {
                    veteranEmployeeHireDateControl.setValidators(null);
                    veteranEmployeeHireDateControl.setValue(null);
                }
            }
        });

        if (this.countryID === 1) {
            drivingLicenseControl.setValidators([Validators.required]);
            ssnControl.setValidators([Validators.required]);
        } else if (this.countryID === 2) {
            drivingLicenseControl.setValidators(null);
            ssnControl.setValidators(null);
        }

        this.ownershipModal.get('OwnershipPercentage').valueChanges.subscribe((percentValue) => {
            if (parseInt(percentValue, 10) >= 100) {
                if (this.ownershipModal.controls['OwnershipPercentage'].value === 100) {
                    return;
                }
                this.ownershipModal.controls['OwnershipPercentage'].setValue(100);
                this.ownershipModal.get('ActiveFlag').patchValue(true);
            }
        });

        this.ownershipModal.get('ActiveFlag').valueChanges.subscribe((flagState) => {
            if (flagState === false) {
                this.ownershipModal.get('OwnershipPercentage').setValidators([Validators.required, Validators.pattern('^[0-9][0-9]?$|^100$')]);
            } else if (flagState === true) {
                this.ownershipModal.get('OwnershipPercentage').setValidators([Validators.required, Validators.pattern('^[1-9][0-9]?$|^100$')]);
            }
            this.ownershipModal.get('OwnershipPercentage').updateValueAndValidity();
        });
    }

    //  getter for easy access to form fields
    get ownershipInfoDialogFormControl() {
        return this.ownershipModal.controls;
    }
    // creation of owner/principal object
    public addOwnerForm(): FormGroup {
        const formObj = {
            OwnershipNumber: null,
            ID: this.ownerPrincipleStatus === false ? 2 : 3,
            OwnershipName: '',
            ContrEmployeeTypeId: null,
            ContactEmail: '',
            ContactPhone: '',
            VeteranEmployeeMilitaryAffiliation: null,
            MilitaryAffilationNumber: null,
            SocialSecurityNumber: '',
            DrivingLicense: null,
            DateOfBirth: null,
            OwnershipPercentage: '',
            ActiveFlag: true,
            VeteranFlag: false,
            VeteranEmployeeHireDate: null,
            LegalIssueFlag: false,
            IsContractorActive: 'Y',
            TimeStamp: '',
        };
        if (this.incomingData) {
            this.addItems = this.incomingData.VeteranMilitaryAffiliationData
                ? this.incomingData.VeteranMilitaryAffiliationData.filter((el) => el.RemovedResourceID === null || !el.hasOwnProperty('RemovedResourceID'))
                : [];
            this.removedItems = this.incomingData.VeteranMilitaryAffiliationData
                ? this.incomingData.VeteranMilitaryAffiliationData.filter((el) => el.RemovedResourceID !== null && el.hasOwnProperty('RemovedResourceID'))
                : [];
            const cues = {
                OwnershipNameCue: false,
                ContrEmployeeTypeIdCue: false,
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
            };
            if (this.loginDetails[0].ContrID > 0) {
                this.visualCues = this.incomingData['visualCues'] && this.incomingData['visualCues'].length > 0 ? this.incomingData['visualCues'][0] : cues;
            }
            formObj.OwnershipNumber = this.incomingData.OwnershipNumber;
            formObj.ID = this.incomingData.ID;
            formObj.OwnershipName = this.incomingData.OwnershipName;
            formObj.ContrEmployeeTypeId = this.incomingData.ContrEmployeeTypeId;
            formObj.ContactEmail = this.incomingData.ContactEmail;
            formObj.ContactPhone = this.incomingData.ContactPhone.replace(/-/g, '');
            formObj.VeteranEmployeeMilitaryAffiliation = this.incomingData.VeteranEmployeeMilitaryAffiliation !== null ? this.incomingData.VeteranEmployeeMilitaryAffiliation : null;
            this.temp = this.incomingData.VeteranEmployeeMilitaryAffiliation;
            formObj.SocialSecurityNumber = this.incomingData.SocialSecurityNumber;
            formObj.DrivingLicense = this.incomingData.DrivingLicense;
            const dateOfBirth = this.incomingData.DateOfBirth.replace(new RegExp(/-/gm), '/'); // Change all '-' to '/'
            formObj.DateOfBirth = this.incomingData.DateOfBirth !== null && this.incomingData.DateOfBirth !== 'Invalid date' ? new Date(dateOfBirth) : null;
            formObj.OwnershipPercentage = this.incomingData.OwnershipPercentage;
            formObj.ActiveFlag = this.incomingData.ActiveFlag;
            formObj.VeteranFlag = this.incomingData.VeteranFlag;
            if (this.incomingData.VeteranEmployeeHireDate === undefined) {
                this.incomingData.VeteranEmployeeHireDate = null;
            }
            if (this.incomingData.VeteranEmployeeHireDate === '') {
                this.incomingData.VeteranEmployeeHireDate = null;
            }
            if (this.incomingData.VeteranEmployeeHireDate !== null && this.incomingData.VeteranEmployeeHireDate !== 'Invalid date') {
                const veteranHireDate = this.incomingData.VeteranEmployeeHireDate.replace(new RegExp(/-/gm), '/'); // Change all '-' to '/'
                formObj.VeteranEmployeeHireDate = new Date(veteranHireDate);
            } else {
                formObj.VeteranEmployeeHireDate = null;
            }
            formObj.LegalIssueFlag = this.incomingData.LegalIssueFlag;
            formObj.IsContractorActive = this.incomingData.IsContractorActive;
            formObj.TimeStamp = this.incomingData.TimeStamp;
            // all emails in grid is editable in phase 2
            if (this.loginDetails[0].ContrID === 0 && this.loginDetails[0].Email === this.incomingData.ContactEmail && this.incomingData.ID === 2) {
                this.emailFromSignup = true;
            } else {
                this.emailFromSignup = false;
            }
            if (formObj.VeteranFlag === true) {
                this.ownershipModal.controls['VeteranFlag'].setValue(true);
                this.unchecked = true;
            } else {
                this.ownershipModal.controls['VeteranFlag'].setValue(false);
                this.unchecked = false;
            }
        }

        return this._formBuilder.group({
            OwnershipNumber: new FormControl(formObj.OwnershipNumber),
            ID: new FormControl(formObj.ID),
            OwnershipName: new FormControl(formObj.OwnershipName, Validators.required),
            ContrEmployeeTypeId: new FormControl(formObj.ContrEmployeeTypeId, Validators.required),
            ContactEmail: new FormControl(formObj.ContactEmail, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]),
            ContactPhone: new FormControl(formObj.ContactPhone, [Validators.required, Validators.pattern(this.mobileNumberRegex)]),
            VeteranEmployeeMilitaryAffiliation: new FormControl(formObj.VeteranEmployeeMilitaryAffiliation),
            SocialSecurityNumber: new FormControl(formObj.SocialSecurityNumber, [Validators.required, Validators.pattern(this.ssnRegex)]),
            DrivingLicense: new FormControl(formObj.DrivingLicense, Validators.required),
            DateOfBirth: new FormControl(formObj.DateOfBirth),
            OwnershipPercentage: new FormControl(formObj.OwnershipPercentage, [
                Validators.required,
                formObj.ActiveFlag === true ? Validators.pattern('^[1-9][0-9]?$|^100$') : Validators.pattern('^[0-9][0-9]?$|^100$'),
            ]),
            ActiveFlag: new FormControl(formObj.ActiveFlag),
            VeteranFlag: new FormControl(formObj.VeteranFlag),
            VeteranEmployeeHireDate: new FormControl(formObj.VeteranEmployeeHireDate),
            LegalIssueFlag: new FormControl(formObj.LegalIssueFlag),
            IsContractorActive: new FormControl(formObj.IsContractorActive),
            TimeStamp: new FormControl(formObj.TimeStamp),
        });
    }
    // on addition of veteran military affiliation
    public onAddMilitaryAff(addItems) {
        addItems = addItems.filter((el) => el !== undefined);
        addItems.forEach((element) => {
            if (this.removedItems.length) {
                const found = this.removedItems.findIndex((el) => element === el.MilitaryAffiliationNumber);
                if (found !== -1) {
                    // new changes
                    const removedItem = this.removedItems.splice(found, 1);
                    this.removedItems = [...this.removedItems, ...removedItem];
                    // new changes
                }
            }
        });
        addItems.forEach((element) => {
            this.addItems = this.addItems !== undefined ? this.addItems : [];
            const found = this.addItems.findIndex((el) => el.MilitaryAffiliationNumber === element);
            if (found === -1) {
                let militaryData: {
                    MilitaryAffiliationID: number;
                    MilitaryAffiliationBranch: string;
                };
                militaryData = this.militaryAffiliationsData.find((el) => el.MilitaryAffiliationID === element);
                const addObj = {
                    ContractorVeteranEmployeeNumber: null,
                    MilitaryAffiliationNumber: militaryData.MilitaryAffiliationID,
                    AddedDate: this.serverTime,
                    AddedResourceID: this.loggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID,
                    RemovedDate: null,
                    RemovedResourceID: null,
                    MilitaryAffiliationName: militaryData.MilitaryAffiliationBranch,
                };
                this.addItems.push(addObj);
            }
        });
        return this.addItems;
    }

    // on removal of veteran military affiliation
    public async onRemoveTag(removedItems) {
        this.serverTime = await this.fetchServerTime();
        let removeFromAddData;
        if (this.addItems.length) {
            const found = this.addItems.findIndex((el) => el.MilitaryAffiliationNumber === removedItems.MilitaryAffiliationNumber);
            if (found !== -1) {
                removeFromAddData = this.addItems.splice(found, 1);
                this.removedItems = [...this.removedItems, ...removeFromAddData];
            }
        }
        const elFound = this.removedItems.find((el) => el.MilitaryAffiliationNumber === removedItems.MilitaryAffiliationNumber);
        let removedObj: VeteranEmployeeData = {};
        if (!elFound) {
            removedObj = {
                ContractorVeteranEmployeeNumber: null,
                MilitaryAffiliationNumber: removedItems.MilitaryAffiliationNumber,
                AddedDate: null,
                AddedResourceID: null,
                RemovedDate: this.serverTime,
                RemovedResourceID: this.loggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID,
                MilitaryAffiliationName: removedItems.dataItem.MilitaryAffiliationBranch || removedItems.MilitaryAffiliationName,
            };
            this.removedItems.push(removedObj);
        } else {
            const elFoundIndex = this.removedItems.findIndex((el) => el.MilitaryAffiliationNumber === removedItems.MilitaryAffiliationNumber);
            this.removedItems[elFoundIndex].RemovedDate = this.serverTime;
            this.removedItems[elFoundIndex].RemovedResourceID = this.loggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID;
        }
    }

    public changeHireDate(val) {}

    public fetchServerTime(): Promise<Date> {
        return this._http.get<Date>(`${this.baseURL}JSON/GetServerTimeStamp`).pipe(catchError(this.handleError)).toPromise();
    }

    public veteranFlag(val, data) {}

    public checkDuplicateMail() {}

    // on form submit
    public async onSubmitModal(target: HTMLElement) {
        if (!this.ownershipModal.dirty && this.loggedInUserType === 'Internal') {
            this.dialog.close({});
            return;
        }
        if (this.incomingData && this.incomingData.ContactEmail && this.emailArray !== undefined) {
            this.emailArray = this.emailArray.filter((res) => res.toLowerCase() !== this.incomingData.ContactEmail.toLowerCase());
        }
        const checkMail: boolean = this.emailArray && this.emailArray.map((el) => el.toLowerCase()).includes(this.ownershipModal.value.ContactEmail.toLowerCase()) ? true : false;
        const chkInDeletedMails: boolean = this.deletedMails && this.deletedMails.map((el) => el.toLowerCase()).includes(this.ownershipModal.value.ContactEmail.toLowerCase()) ? true : false;
        if (checkMail || chkInDeletedMails) {
            const eventMailDelete = this.ownershipArrayList.some(
                (ele) =>
                    ele.hasOwnProperty('ContactEmail') &&
                    ele.ContactEmail.toLowerCase() === this.ownershipModal.value.ContactEmail.toLowerCase() &&
                    ele.IsRowDisable === true &&
                    ele.IsDeletedFlag === true
            );
            if (!eventMailDelete && (this.isDuplicateMail || (chkInDeletedMails && this.loggedInUserType !== 'Internal'))) {
                const dialogRef = this._dialog.open({
                    content: SaveAlertComponent,
                    width: 500,
                });
                const _srvDialogRef = dialogRef.content.instance;
                _srvDialogRef.header = 'Warning';
                const msg = chkInDeletedMails ? this.pageContent.Ownership_Info.Deleted_Email_Exist_In_grid : this.pageContent.Ownership_Info.Email_Exist_In_grid;
                _srvDialogRef.alertMessage = `
                            <div class="modal-alert info-alert">
                                <p>${msg}</p>
                            </div>
                        `;
                dialogRef.result.subscribe((result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        chkInDeletedMails === true
                            ? this._srvDialogRef.close({ button: 'IMPORTDELETED', email: this.ownershipModal.value.ContactEmail })
                            : this._srvDialogRef.close({ button: 'LOADGRID', email: this.ownershipModal.value.ContactEmail });
                    } else {
                        this.ownershipModal.controls['ContactEmail'].setValue(null);
                    }
                });
                return;
            } else {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const _srvDialogRef = dialogRef.content.instance;
                let msg: string;
                msg = chkInDeletedMails === true ? this.pageContent.Ownership_Info.Email_Contractor_Deleted : this.pageContent.Ownership_Info.Duplicate_Email;
                msg = eventMailDelete ? this.pageContent.Ownership_Info.event_Mail_duplicate : msg;
                _srvDialogRef.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${msg}</p>
                                </div>
                            `;
                dialogRef.result.subscribe((result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        this.ownershipModal.controls['ContactEmail'].setValue(null);
                    }
                });

                return;
            }
        }
        this.beforeFinalSubmit(target);
    }

    async beforeFinalSubmit(target: HTMLElement) {
        this.submitted = true;
        this.serverTime = await this.fetchServerTime();
        // stop here if form is invalid
        if (this.ownershipModal.invalid) {
            target.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (this.page !== 'Validation') {
            this._srvContractor.inactiveOwnerPrincipleDuplicacyCheck(this.ownershipArrayList, this.ownershipModal.controls.ContactEmail.value);
        }
        if (this.ownershipModal.value.VeteranFlag === true) {
            if (this.ownershipModal.value.VeteranEmployeeHireDate.getTime() <= this.ownershipModal.value.DateOfBirth.getTime()) {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const _srvDialogRef = dialogRef.content.instance;
                _srvDialogRef.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Valid_Hire_Date}</p>
                                </div>
                            `;

                this.ownershipModal.controls['VeteranEmployeeHireDate'].setValue(null);
                return;
            }
        }
        this.finalSubmission();
    }
    // check ownership percentage and give alert if its more than 100%
    checkOwnershipPercentage() {}

    // check primary owner on role type change
    public checkPrimaryOwner(data, event) {
        if (event === 9) {
            let checkPrimaryOwner: boolean = false;
            if (this.ownershipArrayList.length) {
                checkPrimaryOwner = this._srvContractor.checkPrimaryOwner(data && data.ID ? this.ownershipArrayList.filter((p) => p.ID !== data.ID) : this.ownershipArrayList, this.OwnerRoleData);
            }
            if (checkPrimaryOwner) {
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const _srvDialogRef = dialogRef.content.instance;
                _srvDialogRef.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Multiple_Primary_Owner}</p>
                                </div>
                            `;
                this.ownershipModal.controls['ContrEmployeeTypeId'].setValue(null);
                return;
            }
        }
    }
    // extension of form submit
    public async finalSubmission() {
        this.serverTime = await this.fetchServerTime();
        if (this.duplicacyCheck === false) {
            let finalObj = null;
            if (this.ownershipModal.value.VeteranFlag === true) {
                if (this.addItems.length) {
                    this.addItems.forEach((el) => {
                        el.RemovedDate = null;
                        el.RemovedResourceID = null;
                    });
                } else {
                    this.addItems = [];
                }
                const addVMData = this.onAddMilitaryAff(this.ownershipModal.value.VeteranEmployeeMilitaryAffiliation);
                this.addItems = [...addVMData, ...this.addItems];
                this.addItems = this.addItems.filter((element, index) => {
                    const _element = JSON.stringify(element);
                    return (
                        index ===
                        this.addItems.findIndex((obj) => {
                            return JSON.stringify(obj) === _element;
                        })
                    );
                });
            }
            if (this.removedItems.length) {
                const items = JSON.parse(JSON.stringify(this.removedItems));
                items.forEach((ele, i) => {
                    const findInd = this.addItems.findIndex((el) => el.MilitaryAffiliationNumber === ele.MilitaryAffiliationNumber);
                    if (findInd > -1) {
                        const ind = this.removedItems.findIndex((el) => el.MilitaryAffiliationNumber === ele.MilitaryAffiliationNumber);
                        this.removedItems.splice(ind, 1);
                    }
                });
            }
            finalObj = {
                ...this.ownershipModal.value,
                ContactPhone: this.ownershipModal.value.ContactPhone ? this.ownershipModal.value.ContactPhone : '',
                DateOfBirth: this.ownershipModal.value.DateOfBirth !== null && this.ownershipModal.value.DateOfBirth !== '' ? moment(this.ownershipModal.value.DateOfBirth).format('MM-DD-YYYY') : null,
                VeteranEmployeeHireDate:
                    this.ownershipModal.value.VeteranEmployeeHireDate !== 'Invalid Date'
                        ? this.ownershipModal.value.VeteranEmployeeHireDate && this.ownershipModal.value.VeteranEmployeeHireDate !== '' && this.ownershipModal.value.VeteranEmployeeHireDate !== null
                            ? moment(this.ownershipModal.value.VeteranEmployeeHireDate).format('MM-DD-YYYY')
                            : null
                        : null,
                VeteranMilitaryAffiliationData: [...this.addItems, ...this.removedItems],
                TimeStamp: this.serverTime,
            };
            if (this.loginDetails[0].ContrID > 0) {
                finalObj = {
                    ...finalObj,
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
                };
            }
            delete finalObj.VeteranEmployeeMilitaryAffiliation;

            // check ownership percentage, show alert if percentage is greater than 100%
            let ownershipPercentageCheck = 0;
            this.ownershipArrayList.forEach((ele) => {
                if (ele.ID !== finalObj.ID && ele.IsContractorActive === 'Y' && ((ele.hasOwnProperty('IsDeletedFlag') && ele.IsDeletedFlag === false) || !ele.hasOwnProperty('IsDeletedFlag'))) {
                    ownershipPercentageCheck = ownershipPercentageCheck + ele.OwnershipPercentage;
                }
            });

            ownershipPercentageCheck = ownershipPercentageCheck + parseInt(finalObj.OwnershipPercentage, 10);

            if (ownershipPercentageCheck > 100) {
                this.disableSavebutton = false;
                const dialogRef = this._dialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const _srvDialogRef = dialogRef.content.instance;
                _srvDialogRef.alertMessage = `
                        <div class="modal-alert info-alert">
                            <p>${this.pageContent.Ownership_Info.cant_enter_more_than_100}</p>
                        </div>
                    `;
                return;
            }

            this._srvDialogRef.close({ button: 'SUBMIT', insertedData: finalObj });
        } else if (this.duplicacyCheck === true) {
            const dialogRef = this._dialog.open({
                content: SaveAlertComponent,
                width: 500,
            });
            const _srvDialogRef = dialogRef.content.instance;
            _srvDialogRef.header = this.pageContent.Ownership_Info.Warning;
            _srvDialogRef.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Same_Email_Id}</p>
                                </div>
                            `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    this._srvContractor.inactiveOwnershipEmail.next(false);
                    this._srvContractor.emailIDRevival.next(this.ownershipModal.controls.ContactEmail.value);

                    this._srvContractor.isDuplicateEmail = false;
                    this._srvDialogRef.close();
                }
            });
        }
    }
    // converting mobile number format from int to string
    public convertMobileNumberFormat(mobileNumber: string) {
        let formatedNumber;
        formatedNumber = mobileNumber.slice(0, 3) + '-' + mobileNumber.slice(3, 6) + '-' + mobileNumber.slice(6, 10);
        return formatedNumber;
    }
    // closing popup function
    public onClose() {
        if (this.ownershipModal.dirty === false) {
            this._srvDialogRef.close({ button: 'CANCEL' });
        } else {
            const dialogRef = this._dialog.open({
                content: SaveAlertComponent,
                width: 500,
            });
            const _srvDialogRef = dialogRef.content.instance;
            _srvDialogRef.header = this.pageContent.Ownership_Info.Warning;
            _srvDialogRef.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.General_Keys.General_Sure}</p>
                                </div>
                            `;
            dialogRef.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this._srvDialogRef.close({ button: 'CANCEL' });
                }
            });
        }
    }

    // numeric character check
    public isNumber(evt, option: string) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (option === 'phone') {
            if (charCode > 31 && charCode !== 43 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        } else if (option === 'percentage') {
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            return true;
        }
    }

    // Ownership Filter
    public handleFilterOwner(value) {
        this.OwnerRole = this.OwnerRoleData.filter((s) => s.ContractorEmployeeTypeTranslated.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // Military Aff. Filter
    public handleFilterMilitary(value) {
        this.militaryAffiliationsData = this.militaryAffiliations.filter((s) => s.MilitaryAffiliationBranch.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // val change

    valChange(e) {
        if (this.temp === null) {
            this.temp = [];
        }
        if (this.temp.length < e.length) {
            const addMA = e.filter((MA) => !this.temp.includes(MA))[0];
            this.temp.push(addMA);
        } else {
            const removeMA = this.temp.filter((MA) => !e.includes(MA));
            if (removeMA.length) {
                removeMA.forEach((elem) => {
                    const vetranMilFound = this.incomingData.VeteranMilitaryAffiliationData.find((el) => el.MilitaryAffiliationNumber === elem);

                    if (vetranMilFound) {
                        // new change
                        const ele = this.temp.filter((element) => !e.includes(element));
                        this.temp = this.temp.filter((item) => item !== ele[0]);
                        // new change
                        this.onRemoveTag(vetranMilFound);
                    }
                });
            }
        }
    }

    // focus dropdown
    public onFocus(event) {
        // Close the list if the component is no longer focused
        setTimeout(() => {
            if (this.dropdownlist.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlist.toggle(true);
            }
            if (this.military && this.military.wrapper.nativeElement.contains(document.activeElement)) {
                this.military.toggle(true);
            }
        });
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}
