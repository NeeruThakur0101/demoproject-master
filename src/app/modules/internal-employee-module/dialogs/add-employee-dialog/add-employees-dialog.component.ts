import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from 'src/app/modules/contractor-Registration-module/services/contractor-Registration.service';
import * as moment from 'moment';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { EmpDetails, EmpType, MilitaryAffiliation, VeteranMilitaryAffiliationDialog } from '../../components/employee-information/employee-info-model';
import { EmployeeInfoDataService } from '../../components/employee-information/employee-info.service';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';

@Component({
    selector: 'app-add-employee-dialog',
    templateUrl: './add-employees-dialog.component.html',
    styleUrls: ['./add-employees-dialog.component.scss']
})
export class AddEmployeesDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {

    public EmailStatus: boolean = false;
    public loginDetails: Array<SessionUser> = [];
    public submitted: boolean = false;
    public employeeModal: FormGroup = this.addEmployeeForm();
    @Input() incomingData: EmpDetails;
    @Input() ActionType: string;
    public mobileNumberMask: string = '000-000-0000';
    public mobileNumberRegex: string = '^((\\+1-?)|0)?[0-9]{10}$';
    public nameRegex: string = '^[a-zA-Z ,.\'-]+$';
    public min: Date = new Date(1900, 0, 1);
    public max: Date = new Date(Date.now());
    public hireDateValue = null;
    public refer: EmpType;
    public EmployeeNumber: number;
    public isEmail: boolean = true;
    public isPhone: boolean = true;
    public unchecked: boolean = false;
    public dateCheckNext: string;
    public optionType: string;
    public EmailReadonly: boolean = false;
    public serverTime: Date;
    @ViewChild('dropdownlist', { static: false }) public dropdownlist;
    @ViewChild('military', { static: false }) public military;
    @ViewChild('email') emailElement: ElementRef;

    public militaryAffiliation: Array<{
        MilitaryAffiliation: string;
        MilitaryAffiliationID: string;
    }> = [];

    public militaryAffiliationData: Array<{
        MilitaryAffiliation: string;
        MilitaryAffiliationID: string;
    }>;
    public employeeType: Array<{ ContrEmployeeTypeID: number, EmployeeRole: string, EmployeeRoleTranslated: string }> = [];
    public employeeTypeData: Array<{ ContrEmployeeTypeID: number, EmployeeRole: string, EmployeeRoleTranslated: string }>;
    public VeteranEmployeeHireDate: Date = new Date();
    public loggedInUserType: string;
    public accountId: number;
    public resourceId: number;
    public ContrID: number;
    public pageContent: any;
    removedItems: VeteranMilitaryAffiliationDialog[] = [];
    addItems: VeteranMilitaryAffiliationDialog[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        public _dialog: DialogRef,
        private _srvDialog: DialogService,
        private _srvContrRegistration: ContractorRegistrationService,
        private _srvInternalUserDetails: InternalUserDetailsService,
        private _srvAuthentication: AuthenticationService,
        public _srvEmployeeInfoData: EmployeeInfoDataService
    ) {
        super(_dialog);

        this.employeeModal = this._formBuilder.group({
            EmployeeName: ['', [Validators.required, Validators.pattern(this.nameRegex)]],
            ContrEmployeeTypeID: ['', Validators.required],
            ContactEmail: [''],
            ContactPhone: [''],
            VeteranFlag: [null],
            VeteranEmployeeMilitaryAffiliation: [null],
            VeteranEmployeeHireDate: [null]

        })

        this.pageContent = this._srvInternalUserDetails.getPageContentByLanguage();
    }
    // auto scroll
    public ngAfterViewInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }, 5);
    }

    ngOnInit() {
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.ContrID = this.loginDetails[0].ContrID;
        this.getEmployeeDropdown();
        this.employeeModal = this.addEmployeeForm();
        this.setEmployeeStructureVeteranValidators();
        // for email readonly in case of Edit
        this.optionType = this.ActionType;
        if (this.optionType === 'EDIT') {
            this.EmailReadonly = true;

        }
    }
    public close(data) {
        // this._dialog.close({ button: 'Yes' });

        if (this.employeeModal.dirty === false) {
            this.dialog.close({ status: data });
        } else {
            const dialogRef = this._srvDialog.open({
                content: SaveAlertComponent,
                width: 500
            });
            const dialog = dialogRef.content.instance; dialog.header = this.pageContent.Reference_Info.Warning;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2> ${this.pageContent.Reference_Info.You_Sure_Want_Exit} </h2>
                <p>${this.pageContent.Reference_Info.Ref_Recover_Data}</p>
            </div>
        `;
            dialogRef.result.subscribe(result => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this.dialog.close({ status: data });
                }
            });
        }
    }
    // Role Filter
    public handleFilterRole(value) {
        this.employeeType = this.employeeTypeData.filter(
            s =>
                s.EmployeeRole.toLowerCase().indexOf(value.toLowerCase()) !== -1
        );
    }
    // Military Filter
    public handleFilterMilitary(value) {
        this.militaryAffiliation = this.militaryAffiliationData.filter(
            s =>
                s.MilitaryAffiliation.toLowerCase().indexOf(value.toLowerCase()) !== -1
        );
    }
    // focus dropdown
    public onFocus(event) {

        // Close the list if the component is no longer focused
        setTimeout(() => {
            if (this.dropdownlist && this.dropdownlist.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlist.toggle(true);
            }
            if (this.military && this.military.wrapper.nativeElement.contains(document.activeElement)) {
                this.military.toggle(true);
            }
        });
    }

    // validation for selection change and  for dialog data hide and show
    public employeeTypeValidation(element) {

        if (element.EmployeeRole === 'Technician') {
            this.isEmail = false;
            this.isPhone = false;
            if (this.optionType !== 'EDIT') {
                this.employeeModal.get('ContactEmail').setValidators(null);
                this.employeeModal.get('ContactPhone').setValidators(null);
                this.employeeModal.get('ContactEmail').setValue('');
                this.employeeModal.get('ContactPhone').setValue('');
            } else {
                this.employeeModal.get('ContactEmail').setValidators(null);
                this.employeeModal.get('ContactPhone').setValidators(null);
            }
        }
        else {
            this.isEmail = true;
            this.isPhone = true;
            this.employeeModal.get('EmployeeName').setValidators([Validators.required]);
            this.employeeModal.get('ContactEmail').setValidators([Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]);
            this.employeeModal.get('ContactPhone').setValidators([Validators.required, Validators.pattern(this.mobileNumberRegex)]);
            this.employeeModal.get('ContactEmail').updateValueAndValidity();
            this.employeeModal.get('ContactPhone').updateValueAndValidity();
            this.employeeModal.get('VeteranEmployeeMilitaryAffiliation').setValidators([Validators.required]);
            this.employeeModal.get('VeteranEmployeeHireDate').setValidators([Validators.required]);
        }
    }

    // check validation for on save for some control  hide and show
    public employeeTypeValidation1(ContrEmployeeTypeID: number) {

        if (ContrEmployeeTypeID === 6) {
            this.isEmail = false;
            this.isPhone = false;
            if (this.optionType !== 'EDIT') {
                this.employeeModal.get('ContactEmail').setValidators(null);
                this.employeeModal.get('ContactPhone').setValidators(null);
                this.employeeModal.get('ContactEmail').setValue('');
                this.employeeModal.get('ContactPhone').setValue('');
            } else {
                this.employeeModal.get('ContactEmail').setValidators(null);
                this.employeeModal.get('ContactPhone').setValidators(null);
            }
        }
        else {
            this.isEmail = true;
            this.isPhone = true;
            this.employeeModal.get('EmployeeName').setValidators([Validators.required]);
            this.employeeModal.get('ContactEmail').setValidators([Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]);
            this.employeeModal.get('ContactPhone').setValidators([Validators.required, Validators.pattern(this.mobileNumberRegex)]);
            this.employeeModal.get('ContactEmail').updateValueAndValidity();
            this.employeeModal.get('ContactPhone').updateValueAndValidity();
            this.employeeModal.get('VeteranEmployeeMilitaryAffiliation').setValidators([Validators.required]);
            this.employeeModal.get('VeteranEmployeeHireDate').setValidators([Validators.required]);
        }
    }

    // hide show for Role type and email and Phone.
    employeeRoleIDChange(name: EmpType) {
        this.employeeTypeValidation(name);

        if (name.ContrEmployeeTypeID === 6) {
            this.isEmail = false;
            this.isPhone = false;
        }
        else {
            this.isEmail = true;
            this.isEmail = true;
        }

        if (this.employeeModal.value.ContactEmail === '' && this.optionType === 'EDIT') {
            this.EmailReadonly = false;
        }

        this.refer = name;
    }

    // dynamic validation as per veteran toggle selection
    setEmployeeStructureVeteranValidators() {

        const militaryAffiliationControl = this.employeeModal.get(
            'VeteranEmployeeMilitaryAffiliation'
        );
        const veteraEmployeeHireDateControl = this.employeeModal.get(
            'VeteranEmployeeHireDate'
        )
        this.employeeModal.get('VeteranFlag').valueChanges.subscribe(veteranFlagState => {
            if (veteranFlagState === true) {
                militaryAffiliationControl.setValidators([Validators.required]);
                veteraEmployeeHireDateControl.setValidators([Validators.required]);
            } else {
                militaryAffiliationControl.setValidators(null);
                militaryAffiliationControl.setValue('');
                veteraEmployeeHireDateControl.setValidators(null);
                veteraEmployeeHireDateControl.setValue('');
            }
        })
    }

    //  getter for easy access to form fields
    get EmployeeDialogFormControl() {
        return this.employeeModal.controls;
    }

    public addEmployeeForm(): FormGroup {
        const formObj = {
            EmployeeNumber: 0,
            EmployeeName: '',
            ContrEmployeeTypeID: null,
            ContactEmail: '',
            ContactPhone: '',
            VeteranFlag: false,
            VeteranEmployeeMilitaryAffiliation: null,
            VeteranEmployeeHireDate: null
        };
        if (this.incomingData) {

            formObj.EmployeeNumber = this.incomingData.PRNL_ID;
            formObj.EmployeeName = this.incomingData.Name;
            formObj.ContrEmployeeTypeID = this.incomingData.ContrEmployeeTypeID;
            formObj.ContactEmail = this.incomingData.Email === 'N/A' ? '' : this.incomingData.Email,
                formObj.ContactPhone = this.incomingData.Phone;
            formObj.VeteranFlag = this.incomingData.VeteranFlg;

            if (formObj.ContrEmployeeTypeID === 6) {
                this.isEmail = false;
                this.isPhone = false;
            }
            else {
                this.isEmail = true;
                this.isEmail = true;
            }

            if (formObj.VeteranFlag === true) {
                formObj.VeteranEmployeeMilitaryAffiliation = this.incomingData.VeteranMilitaryAffiliationData.map(el => el.MilitaryAffiliationName);
                formObj.VeteranEmployeeHireDate = new Date(this.incomingData.VeteranEmployeeHireDate);
                this.addItems = this.incomingData.VeteranMilitaryAffiliationData;
                this.unchecked = true;

            } else {
                this.unchecked = false;
            }
        }

        // reutrn data with necessary validator
        return this._formBuilder.group({
            EmployeeName: new FormControl(formObj.EmployeeName, Validators.required),
            ContrEmployeeTypeID: new FormControl(formObj.ContrEmployeeTypeID, Validators.required),
            ContactEmail: formObj.ContrEmployeeTypeID === 6 ? new FormControl(formObj.ContactEmail) : new FormControl(formObj.ContactEmail, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]),
            ContactPhone: formObj.ContrEmployeeTypeID === 6 ? new FormControl(formObj.ContactPhone) : new FormControl(formObj.ContactPhone, [Validators.required, Validators.pattern(this.mobileNumberRegex)]),
            VeteranFlag: new FormControl(formObj.VeteranFlag),
            VeteranEmployeeMilitaryAffiliation: new FormControl(formObj.VeteranEmployeeMilitaryAffiliation),
            VeteranEmployeeHireDate: new FormControl(formObj.VeteranEmployeeHireDate)
        })
    }
    // numeric character check
    public isNumber(evt, option: string) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (option === 'phone') {
            if (
                charCode > 31 &&
                charCode !== 43 &&
                (charCode < 48 || charCode > 57)
            ) {
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
    // fetching dropdown values
    async getEmployeeDropdown() {

        const dropdownResponse = await this._srvEmployeeInfoData.getEmpInfoDropdown(this.loggedInUserType, this.loginDetails[0]);
        this.employeeType = dropdownResponse._empType;
        this.militaryAffiliation = dropdownResponse._militaryAffiliation;
        this.employeeTypeData = dropdownResponse._empType;
        this.militaryAffiliationData = dropdownResponse._militaryAffiliation;
    }

    // to set form as blank fields
    public resetForm() {
        this.EmailReadonly = false;
        this.optionType = '';
        this.employeeModal.patchValue({
            EmployeeName: null,
            ContrEmployeeTypeID: null,
            ContactEmail: null,
            ContactPhone: null,
            VeteranFlag: false,
            VeteranEmployeeMilitaryAffiliation: null,
            VeteranEmployeeHireDate: null,

        })
    }

    // Add Employee
    public async onSave() {
        this.submitted = true;
        let emailResponse;
        this.employeeTypeValidation1(this.employeeModal.value.ContrEmployeeTypeID);
        if (this.employeeModal.value.ContrEmployeeTypeID !== 6 && this.employeeModal.value.ContrEmployeeTypeID != null && this.employeeModal.value.ContactEmail !== '') {
            emailResponse = await this._srvInternalUserDetails.EmailExists(this.employeeModal.value.ContactEmail);
        }

        if (emailResponse === true && this.EmailReadonly === false) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
           <div class="modal-alert info-alert">
               <h2>${this.pageContent.Employee_Info.Same_Email}</h2>
               <p>${this.pageContent.Employee_Info.Same_Email_Stmt}</p>
            </div>
            `;
            this.submitted = false;

            dialogRef.result.subscribe((r) => {
                const clospopup = r['button'];
                if (clospopup === 'Yes') {
                    setTimeout(() => { // this will make the execution after the above boolean has changed
                        this.emailElement.nativeElement.focus();

                    }, 0);
                }
            });
        }
        else {
            this.SaveData();
        }

    }

    public async SaveData() {
        this.serverTime = await this._srvEmployeeInfoData.fetchServerTime();
        if (this.employeeModal.invalid) {
            return;
        }
        else {
            const objSave = {
                Contr_ID: this.loginDetails[0].ContrID,
                CCOpsID: this.loginDetails[0].CCOpsID,
                ContrEmployeeTypeID: this.employeeModal.value.ContrEmployeeTypeID,
                EmployeeNumber: this.incomingData == null ? 0 : this.incomingData.PRNL_ID,
                EmployeeName: this.employeeModal.value.EmployeeName,
                PhoneNumber: this.employeeModal.value.ContrEmployeeTypeID !== 6 ? this.employeeModal.value.ContactPhone : null,
                Email: this.employeeModal.value.ContrEmployeeTypeID !== 6 ? this.employeeModal.value.ContactEmail : null,
                VaternFlag: this.employeeModal.value.VeteranFlag,
                VeteranMilitaryAffiliationData: null,
                VeteranEmployeeHireDate: null,
                OldContrEmployeeTypeID: this.incomingData && this.incomingData.ContrEmployeeTypeID > 0 ? this.incomingData.ContrEmployeeTypeID : 0
            }
            if (this.employeeModal.value.VeteranFlag === true) {
                objSave.VeteranEmployeeHireDate = moment(this.employeeModal.value.VeteranEmployeeHireDate).format('MM-DD-YYYY');
                this.addItems = this.onAddMilitaryAfffiliation(this.employeeModal.value.VeteranEmployeeMilitaryAffiliation);
                objSave.VeteranMilitaryAffiliationData = [...this.addItems, ...this.removedItems];

                const response = await this._srvEmployeeInfoData.saveEmployeeInfo(objSave);

                if (response.body === 1) {
                    this._srvContrRegistration.addEmployeeDialog.next(1);
                    this._dialog.close();
                } else {
                    this._srvContrRegistration.addEmployeeDialog.next(2);
                    this._dialog.close();
                }

            }
            else {
                if ((this.addItems && this.addItems.length) || (this.removedItems && this.removedItems.length)) {
                    this.addItems.forEach(element => {
                        element.RemovedDate = this.serverTime;
                        element.RemovedResourceID = this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID
                    });
                    objSave.VeteranMilitaryAffiliationData = [...this.addItems, ...this.removedItems];
                } else {
                    objSave.VeteranMilitaryAffiliationData = null;
                }

                const response = await this._srvEmployeeInfoData.saveEmployeeInfo(objSave);
                if (response.body === 1) {
                    this._srvContrRegistration.addEmployeeDialog.next(1);
                    this._dialog.close();
                } else {
                    this._srvContrRegistration.addEmployeeDialog.next(2);
                    this._dialog.close();
                }
            }

        }
    }

    // on addition of veteran military affiliation
    public onAddMilitaryAfffiliation(addElItems) {

        addElItems.forEach(element => {
            if (this.removedItems.length) {
                let recoveredElement: VeteranMilitaryAffiliationDialog;

                const elFoundIndex = this.removedItems.findIndex(el => el.MilitaryAffiliationName === element);
                if (elFoundIndex !== -1) {
                    recoveredElement = this.removedItems.find(el => el.MilitaryAffiliationName === element);
                    recoveredElement.RemovedDate = null;
                    recoveredElement.RemovedResourceID = null;
                    this.addItems.push(recoveredElement);
                    const found = this.removedItems.findIndex(el => element === el.MilitaryAffiliationName);
                    if (found !== -1) {
                        this.removedItems.splice(found, 1);
                    }
                } else {
                    const addObj = this.processAddMilitary(element);
                    this.addItems.push(addObj)
                }
            } else {
                const addObj = this.processAddMilitary(element);
                this.addItems.push(addObj)
            }
        });
        return this.addItems;
    }

    // process of adding military aff. This returns an object.
    public processAddMilitary(element) {
        const found = this.addItems.findIndex(el => el.MilitaryAffiliationNumber === element.MilitaryAffiliationNumber);
        let addObj: VeteranMilitaryAffiliationDialog;

        if (found === -1) {
            let militaryData: MilitaryAffiliation;
            militaryData = this.militaryAffiliation.find(el => el.MilitaryAffiliation === element);
            addObj = {
                ContractorVeteranEmployeeNumber: null,
                MilitaryAffiliationNumber: militaryData.MilitaryAffiliationID,
                AddedDate: this.serverTime,
                AddedResourceID: this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID,
                RemovedDate: null,
                RemovedResourceID: null,
                MilitaryAffiliationName: element,
            };
        }
        return addObj;
    }

    // on removal of veteran military affiliation
    public async onRemoveTag(removedItems) {
        let removedElements: VeteranMilitaryAffiliationDialog[] = [];
        this.serverTime = await this._srvEmployeeInfoData.fetchServerTime();
        if (this.addItems.length) {
            const found = this.addItems.findIndex(el => el.MilitaryAffiliationNumber === removedItems.dataItem.MilitaryAffiliationID);
            if (found !== -1) {
                removedElements = this.addItems.splice(found, 1);
            }
        }

        // process of removing military aff and pushing it into removeItems array
        const elFound = removedElements.find(el => el.MilitaryAffiliationNumber === removedItems.dataItem.MilitaryAffiliationID);
        let removedObj: VeteranMilitaryAffiliationDialog = {} as VeteranMilitaryAffiliationDialog;
        // if not found create new object
        if (!elFound) {
            removedObj = {
                ContractorVeteranEmployeeNumber: null,
                MilitaryAffiliationNumber: removedItems.dataItem.MilitaryAffiliationID,
                AddedDate: null,
                AddedResourceID: null,
                RemovedDate: this.serverTime, RemovedResourceID: this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID,
                MilitaryAffiliationName: removedItems.dataItem.MilitaryAffiliation,
            }
            this.removedItems.push(removedObj);
        } else {
            // if  found update existing object
            const elFoundIndex = removedElements.findIndex(el => el.MilitaryAffiliationNumber === removedItems.dataItem.MilitaryAffiliationID);
            removedElements[elFoundIndex].RemovedDate = this.serverTime;
            removedElements[elFoundIndex].RemovedResourceID = this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID
            this.removedItems.push(removedElements[elFoundIndex]);
        }
    }


}

