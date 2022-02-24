import { Component, OnInit, Input, HostListener, AfterViewInit } from '@angular/core';
import { DialogRef, DialogContentBase, DialogService } from '@progress/kendo-angular-dialog';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AddReference } from '../../models/data-model';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ReferenceDataService } from '../../components/references-information/reference.service';
import { JobTypeData, ReferenceInformation, ReferenceTypeData, ReferenceTypeServiceModel, VisualCueReferenceObj } from '../../components/references-information/model_reference';

@Component({
    selector: 'app-add-reference-dialog',
    templateUrl: './add-reference-dialog.component.html',
    styleUrls: ['./add-reference-dialog.component.scss'],
})
export class AddReferenceDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {
    public referenceForm: FormGroup = this.addReferenceForm();
    public objReference = new AddReference();
    public ReferenceType: Array<ReferenceTypeServiceModel> = [];
    public ReferenceTypeData: Array<ReferenceTypeServiceModel>;
    public JobType: Array<JobTypeData> = [];
    public JobTypeData: Array<JobTypeData>;
    public pageContent: any;
    form: FormGroup;
    // tslint:disable-next-line: member-ordering
    @Input() public maxCount: number;
    @Input() public incomingData: ReferenceInformation
    @Input() public disableSaveNext: boolean;
    @Input() public selectedTradeIds: string;
    @Input() public IsRowDisable: boolean = false;
    public submitted: boolean = false;
    public isJob: boolean = false;
    public isResidential: boolean = true;
    public isAdditionalContact: boolean = true;
    public mobileNumberMask: string = '000-000-0000';
    public phoneRegEx = /^(\([2-9]{1}[0-9]{2}\)[- ]?\d{3}[-]\d{4}$)|(([2-9]{1}[0-9]{2})[- ]\d{3}[-]\d{4}$)/;
    // tslint:disable-next-line: member-ordering
    public nameRegex: string = '^[a-zA-Z ,.\'-]+$';
    public srCounter: number = 0;
    // tslint:disable-next-line: member-ordering
    public isContractor: string;
    public header: string;
    public mobileNumberRegex: string = '^((\\+1-?)|0)?[0-9]{10}$';
    public refer: ReferenceTypeData;
    public resourceId: number;
    public newIncoming: VisualCueReferenceObj;
    public internalEmployee: boolean = false;
    public loggedInUserType: string;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public accessReadonly: boolean;
    public JobTypeName: string;
    public JobTypeNumber: number = null;

    constructor(
        public _DialogRef: DialogRef,
        private _formBuilder: FormBuilder,
        private _srvContrRegistration: ContractorRegistrationService,
        private _srvDialog: DialogService,
        private _srvAuthentication: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        public _srvReferenceData: ReferenceDataService
    ) {
        super(_DialogRef);
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.internalEmployee = this.loggedInUserType === 'Internal' ? true : false;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.referenceForm = this._formBuilder.group({
            ReferenceNumber: [''],
            SrNo: [''],
            ReferenceName: ['', [Validators.required]],
            ReferenceTypeNumber: ['', Validators.required],
            ReferenceCompanyName: ['', Validators.required],
            ReferencePosition: ['', Validators.required],
            ReferencePhoneNumber: ['', [Validators.required, Validators.pattern(this.mobileNumberRegex)]],
            ReferenceEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
            JobType: ['', Validators.required],
            AdditionalContactName: '',
            ReferenceComment: '',
        });
        this.pageContent = this._srvLanguage.getPageContentByLanguage();


    }

    async ngOnInit() {

        this.isContractor = this.loggedInUserType === 'Internal' ? 'false' : 'true';

        this.header = this.incomingData !== undefined ? `${this.pageContent.Reference_Info.Ref_Edit}` : `${this.pageContent.Reference_Info.Ref_Add}`;
        this.newIncoming = this.incomingData;

        this.referenceForm = this.addReferenceForm();
        if (this.incomingData) {
            this.JobTypeNumber = this.incomingData.JobTypeNumber;
            const obj = { ReferenceTypeCode: this.incomingData.ContractorReferenceTypeNumber, ReferenceTypeName: this.incomingData.ReferenceTypeNumber, ReferenceJobType: this.incomingData.ReferenceJobType };
            this.referenceRoleId(obj);
        }

        const typeResponse = await this._srvReferenceData.getReferenceTypeData(this.loginDetails[0], this.selectedTradeIds)
        this.ReferenceType = typeResponse.referenceTypeData;
        this.ReferenceTypeData = this.ReferenceType.slice();
        this.JobType = typeResponse.jobTypeData;
        this.JobTypeData = this.JobType.slice();
        this.checkPrivilage();

        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this.accessReadonly = true;
            this.referenceForm.disable();
        }

        if (this.IsRowDisable && this.loggedInUserType !== 'Internal' && this.IsRowDisable === true) {
            this.referenceForm.disable();
        }

    }

    private checkPrivilage(): void {
        if (this.loginDetails[0].ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Reference Information');
            if (!accessType.editAccess && accessType.readonlyAccess) {
                this.accessReadonly = true;
                this.referenceForm.disable();
            }

        }
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
        this.srCounter = this.maxCount + 1;
    }

    // Validation for selectionChange and  For Dialog Data Hide and show
    public referenceTypeValidation(element) {
        if (element.ReferenceTypeName === 'Residential' || element.ReferenceJobType === 'Residential') {
            this.isJob = true;
            this.isAdditionalContact = true;
            this.referenceForm.get('JobType').setValidators([Validators.required, Validators.minLength(1)]);
            this.referenceForm.get('ReferenceCompanyName').setValidators([Validators.required]);
            this.referenceForm.get('ReferencePosition').setValidators([Validators.required]);
            this.referenceForm.get('ReferencePhoneNumber').setValidators([Validators.required, Validators.pattern(this.mobileNumberRegex)]);
            this.referenceForm.get('ReferenceEmail').setValidators([Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]);
        } else {
            this.isJob = false;
            this.isAdditionalContact = false;
            this.referenceForm.get('JobType').setValidators(null);
            this.referenceForm.get('JobType').setValue(null);
            this.JobTypeNumber = null;
            this.referenceForm.get('ReferenceCompanyName').setValidators([Validators.required]);
            this.referenceForm.get('ReferencePosition').setValidators([Validators.required]);
            this.referenceForm.get('ReferencePhoneNumber').setValidators([Validators.required, Validators.pattern(this.mobileNumberRegex)]);
            this.referenceForm.get('ReferenceEmail').setValidators([Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]);

        }
    }

    changeJobType(event: JobTypeData) {
        this.JobTypeNumber = this.isJob ? event.TradeListID : null;
    }

    // Loading browser functionality
    @HostListener('window:beforeunload', ['$event'])
    public doSomething($event) {
        $event.preventDefault();
        if (this.preventDataOnCancel()) {
            $event.returnValue = 'true';
        }
    }

    public preventDataOnCancel(): boolean {
        if (this.referenceForm.value.ReferenceName !== '' || this.referenceForm.value.ReferenceTypeNumber !== '' || this.referenceForm.value.ReferenceCompanyName !== '' || this.referenceForm.value.ReferencePosition !== '' || this.referenceForm.value.ReferencePhoneNumber !== '' || this.referenceForm.value.ReferenceEmail !== '' || this.referenceForm.value.JobType !== '' || this.referenceForm.value.AdditionalContactName !== '' || this.referenceForm.value.ReferenceComment !== '') {
            return true;
        }
    }

    // numeric character validator
    public isNumber(evt) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // Close Add Reference Functionality
    public closeAddReference(data) {
        if (this.referenceForm.dirty === false) {
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

    // AddReference Form
    public addReferenceForm(): FormGroup {
        if (this.incomingData) {
            const formObj = {
                ReferenceNumber: 0,
                SrNo: 0,
                ReferenceName: '',
                ReferenceTypeNumber: '',
                ReferenceCompanyName: '',
                ReferencePosition: '',
                ReferencePhoneNumber: '',
                ReferenceEmail: '',
                JobType: '',
                JobTypeNumber: 0,
                AdditionalContactName: '',
                ReferenceCommentNumber: 0,
                ReferenceComment: '',
            };
            const obj = { ReferenceTypeNumber: this.incomingData.ContractorReferenceTypeNumber, ReferenceTypeName: this.incomingData.ReferenceTypeNumber };
            if (!this.incomingData) {
                this.referenceTypeValidation(obj);
                this.referenceRoleId(obj);
            }
            formObj.ReferenceNumber = this.incomingData.ReferenceNumber,
                formObj.SrNo = this.incomingData.SrNo,
                formObj.ReferenceName = this.incomingData.ReferenceName,
                formObj.ReferenceTypeNumber = this.incomingData.ReferenceTypeNumber,
                formObj.ReferenceCompanyName = this.incomingData.ReferenceCompanyName;
            formObj.ReferencePosition = this.incomingData.ReferencePosition;
            formObj.ReferencePhoneNumber = this.incomingData.ReferencePhoneNumber,
                formObj.ReferenceEmail = this.incomingData.ReferenceEmail,
                formObj.JobType = this.incomingData.JobType != null ? (this.incomingData.JobType.trim() === '' ? null : this.incomingData.JobType.trim()) : this.incomingData.JobType,
                formObj.JobTypeNumber = this.incomingData.JobTypeNumber,
                formObj.AdditionalContactName = this.incomingData.AdditionalContactName,
                formObj.ReferenceComment = this.incomingData.ReferenceComment;
            formObj.ReferenceCommentNumber = this.incomingData.ReferenceCommentNumber;

            return this._formBuilder.group({
                ReferenceNumber: new FormControl(formObj.ReferenceNumber),
                SrNo: new FormControl(formObj.SrNo),
                ReferenceName: new FormControl(formObj.ReferenceName, Validators.required),
                ReferenceTypeNumber: new FormControl(formObj.ReferenceTypeNumber, Validators.required),
                ReferenceCompanyName: new FormControl(formObj.ReferenceCompanyName, [Validators.required,
                Validators.minLength(1),
                ]),
                ReferencePosition: new FormControl(formObj.ReferencePosition, [Validators.required,
                Validators.minLength(1)]),
                ReferencePhoneNumber: new FormControl(formObj.ReferencePhoneNumber, Validators.required),
                ReferenceEmail: new FormControl(formObj.ReferenceEmail, [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]),
                JobType: new FormControl(formObj.JobType),
                JobTypeNumber: new FormControl(formObj.JobTypeNumber),
                AdditionalContactName: new FormControl(formObj.AdditionalContactName),
                ReferenceComment: new FormControl(formObj.ReferenceComment),
                ReferenceCommentNumber: new FormControl(formObj.ReferenceCommentNumber),

            });

        } else {
            return this.referenceForm;
        }

    }

    // Hide show code  For Refrence Type  and Reference  Position as well as Job Type
    public referenceRoleId(name) {
        this.referenceTypeValidation(name);
        this.refer = name;
    }
    // convenience getter for easy access to form fields
    get referenceFormControl() { return this.referenceForm.controls; }

    public onSubmit(target: HTMLElement) {
        this.submitted = true;
        if (!this.referenceForm.dirty) {
            this._DialogRef.close({ status: 'cancel', from: 'save' });
            return;
        }

        if (this.referenceForm.invalid) {
            target.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        else {
            const refNum = this.ReferenceTypeData.find(el => el.ReferenceTypeCode === this.refer.ReferenceTypeCode)
            this.objReference.ReferenceNumber = this.referenceForm.value.ReferenceNumber,
                this.objReference.SrNo = this.referenceForm.value.SrNo === '' ? this.srCounter : this.referenceForm.value.SrNo,
                this.objReference.ReferenceName = this.referenceForm.value.ReferenceName,
                this.objReference.ReferenceTypeNumber = this.refer.ReferenceTypeName,
                this.objReference.ContractorReferenceTypeNumber = refNum.ReferenceTypeCode,
                this.objReference.ReferenceTypeCode = refNum.ReferenceTypeCode,
                this.objReference.ReferenceCompanyName = this.referenceForm.value.ReferenceCompanyName || 'N/A',
                this.objReference.ReferencePosition = this.referenceForm.value.ReferencePosition || 'N/A',
                this.objReference.ReferencePhoneNumber = this.referenceForm.value.ReferencePhoneNumber,
                this.objReference.ReferenceEmail = this.referenceForm.value.ReferenceEmail,
                this.objReference.AdditionalContactName = this.referenceForm.value.AdditionalContactName,
                this.objReference.ReferenceComment = this.referenceForm.value.ReferenceComment,
                this.objReference.ReferenceCommentNumber = this.referenceForm.value.ReferenceCommentNumber || null;
            this.objReference.JobType = this.referenceForm.value.JobType || null,
                this.objReference.JobTypeNumber = this.JobTypeNumber,
                this.dialog.close({ status: this.objReference });
            this.JobTypeNumber = null;
        }
    }
    // Save and Next Functionality for adding more data in the grid
    public onSubmitAndNext() {
        this.submitted = true;
        if (this.referenceForm.invalid) {
            return;
        } else {
            const formData: AddReference = {
                ReferenceNumber: this.referenceForm.value.ReferenceNumber === '' ? null : this.referenceForm.value.ReferenceNumber,
                SrNo: this.referenceForm.value.SrNo === '' || this.referenceForm.value.SrNo == null ? this.srCounter : this.referenceForm.value.SrNo,
                ReferenceName: this.referenceForm.value.ReferenceName,
                ReferenceTypeNumber: this.refer.ReferenceTypeName,
                ContractorReferenceTypeNumber: this.refer.ReferenceTypeCode,
                ReferenceCompanyName: this.referenceForm.value.ReferenceCompanyName || 'N/A',
                ReferencePosition: this.referenceForm.value.ReferencePosition || 'N/A',
                ReferencePhoneNumber: this.referenceForm.value.ReferencePhoneNumber,
                ReferenceEmail: this.referenceForm.value.ReferenceEmail,
                JobType: this.referenceForm.value.JobType || null,
                AdditionalContactName: this.referenceForm.value.AdditionalContactName || null,
                ReferenceComment: this.referenceForm.value.ReferenceComment,
                ReferenceCommentNumber: this.referenceForm.value.ReferenceCommentNumber || null,
                ReferenceTypeCode: this.refer.ReferenceTypeCode,
                JobTypeNumber: this.JobTypeNumber,
            };

            this._srvContrRegistration.dataFromSaveNext.next(formData);

            let ctr = 0;
            this._srvContrRegistration.saveReponseNumber.subscribe(res => {
                if (res === 1) {
                    if (ctr < 1) {

                        const dialogRef = this._srvDialog.open({
                            content: DialogAlertsComponent,
                            width: 500
                        });
                        const dialog = dialogRef.content.instance;
                        dialog.alertMessage = `
                    <div class="modal-alert confirmation-alert">
                        <h2>${this.pageContent.Reference_Info.Ref_Success}</h2>
                        <p>${this.pageContent.Reference_Info.Ref_Data_Saved}</p>
                    </div>
                `;
                        ctr++;
                        this.submitted = false;
                        this.srCounter++;
                        this.removeValidators();

                    }
                }

            });
            this._srvContrRegistration.saveReponseNumber.next(0);
            this.JobTypeNumber = null;

        }

    }
    // Removing Validators from Save and Next Functionality
    public removeValidators() {
        this.referenceForm.reset(); /// Encoutered a bug of not removed validation on some fields show just reset the form and comment below code.
    }

    // Filter Type for handle filter Reference Type
    public handleFilterType(value) {
        this.ReferenceTypeData = this.ReferenceType.filter((s) => s.ReferenceTypeNameTranslated.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // Filter Type for handle Job Type
    public handleFilterJob(value) {
        this.JobTypeData = this.JobType.filter((s) => s.TradeName.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // Phone Number Custom Functionality
    public checkValidInput(event) {
        const val = event.target.value;
        const valLen = val.length;
        if (valLen === 12) {
            event.preventDefault();
        }
        const num = Number.parseInt(event.key, 10);
        if (isNaN(num)) {
            event.preventDefault();
        }
        if (valLen === 3 || valLen === 7) {
            event.target.value = val + '-';
        }

    }
}

