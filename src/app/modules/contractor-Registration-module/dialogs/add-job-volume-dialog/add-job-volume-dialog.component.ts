import { Component, OnInit, Input, HostListener, AfterViewInit } from '@angular/core';
import { DialogRef, DialogContentBase, DialogService } from '@progress/kendo-angular-dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { JobVolume } from '../../models/data-model';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { GridData } from '../../components/job-volume-information/model';

@Component({
    selector: 'app-add-job-volume-dialog',
    templateUrl: './add-job-volume-dialog.component.html',
    styleUrls: ['./add-job-volume-dialog.component.scss'],
})
export class AddJobVolumeDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {
    public jobForm: FormGroup = this.addJobForm();
    public objJob = new JobVolume();
    public submitted: true;
    public isNumeric: boolean;
    public sumErrMsg: boolean = false; // error message variable
    public diffYears: number = 0;
    @Input() openingYear: number;
    @Input() currentYear: number;
    @Input() disableInternalAccess: boolean;
    @Input() wholeGridData: GridData[] = [];
    public isYearDiabled: boolean = false;
    public newIncomingData: GridData;
    public internalEmployee: boolean = false;
    public loggedInUserType: string;
    public pageContent: any;
    public header: string;
    @Input() IsRowDisable: boolean = false;

    @Input() incomingData: GridData; // data from job volume information page
    constructor(
        public _dialog: DialogRef,
        private _formBuilder: FormBuilder,
        private _dialogService: DialogService,
        public _srvAuthentication: AuthenticationService,
        public $language: InternalUserDetailsService
    ) {
        super(_dialog);

        this.jobForm = this._formBuilder.group({
            serial_no: [],
            JobVolumeNumber: [],
            year: ['', Validators.required],
            residentialInsurance: ['', Validators.required],
            commercialInsurance: ['', Validators.required],
            residentialRemodeling: ['', Validators.required],
            commercialRemodeling: ['', Validators.required],
            largetSingleJob: ['', Validators.required],
            avgJobAmount: ['', Validators.required],
        });
    }

    @HostListener('window:beforeunload', ['$event'])
    doSomething($event: Event) {
        $event.preventDefault();
        if (this.preventDataOnCancel()) {
            $event.returnValue = true;
        }
    }
    ngOnInit() {
        this.pageContent = this.$language.getPageContentByLanguage();

        this.diffYears = this.currentYear - this.openingYear;
        this.jobForm = this.addJobForm();
        // check if user is internal or contractor
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.internalEmployee = this.loggedInUserType === 'Internal' ? true : false;
        this.header = this.incomingData !== undefined ? `${this.pageContent.Job_Volume_Info.Job_Volume_Dialog_Edit}` : `${this.pageContent.Job_Volume_Info.Job_Volume_Dialog_Add}`;
        this.newIncomingData = this.incomingData;
        if (this.IsRowDisable && this.loggedInUserType !== 'Internal' && this.IsRowDisable === true) {
            this.jobForm.disable();
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }

    // function used to validate how many years data will be entered
    public validateYear(year: string | number) {

        if (this.wholeGridData.find(index => index.Year === parseInt(this.jobForm.value.year, 10))) {
            const dialogRef = this._dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
            ${this.pageContent.Job_Volume_Info.Same_Year_Inserted}
            </div>`
            return dialogRef;
        }

        if (typeof year === 'string') { year = parseInt(year, 10) };
        if (year < this.openingYear || year > this.currentYear) {
            const dialogRef = this._dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                ${this.pageContent.Job_Volume_Info.Data_Between_Company_Opening_Date_And_Current_Date}
            </div>
        `;
            return dialogRef;
        }
        if (this.diffYears > 0 && this.currentYear === year) {
            const dialogRef = this._dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
					${this.pageContent.Job_Volume_Info.Data_Between_Company_Opening_Date_And_Current_Date}

            </div>
        `;
            return dialogRef;
        }
    }

    public addJobForm(): FormGroup {
        if (this.incomingData) {
            this.isYearDiabled = true;
            const formObj = {
                serial_no: 0,
                year: 0,
                JobVolumeNumber: 0,
                residentialInsurance: 0,
                commercialInsurance: 0,
                residentialRemodeling: 0,
                commercialRemodeling: 0,
                largetSingleJob: 0,
                avgJobAmount: 0,
            };

            (formObj.serial_no = this.incomingData.serial_no),
                (formObj.JobVolumeNumber = this.incomingData.JobVolumeNumber),
                (formObj.year = this.incomingData.Year),
                (formObj.residentialInsurance = this.incomingData.ResidentialInsuranceRestorationInPercentage),
                (formObj.commercialInsurance = this.incomingData.CommercialInsuranceRestorationInPercentage),
                (formObj.residentialRemodeling = this.incomingData.ResidentialRemodellingInPercentage),
                (formObj.commercialRemodeling = this.incomingData.CommercialRemodellingInPercentage),
                (formObj.largetSingleJob = this.incomingData.LargestSingleJobInYear),
                (formObj.avgJobAmount = this.incomingData.AverageJobAmountInYear);

            return this._formBuilder.group({
                serial_no: new FormControl(formObj.serial_no),
                JobVolumeNumber: new FormControl(formObj.JobVolumeNumber),
                year: new FormControl(formObj.year, Validators.required),
                residentialInsurance: new FormControl(formObj.residentialInsurance, Validators.required),
                commercialInsurance: new FormControl(formObj.commercialInsurance, Validators.required),
                residentialRemodeling: new FormControl(formObj.residentialRemodeling, Validators.required),
                commercialRemodeling: new FormControl(formObj.commercialRemodeling, Validators.required),
                largetSingleJob: new FormControl(formObj.largetSingleJob, Validators.required),
                avgJobAmount: new FormControl(formObj.avgJobAmount, Validators.required),
            });
        } else {
            return this.jobForm;
        }
    }
    // convenience getter for easy access to form fields
    get jobFormControl() {
        return this.jobForm.controls;
    }

    public onSubmit() {
        this.submitted = true;
        if (this.jobForm.invalid) {
            return;
        }
        if (!this.jobForm.dirty && this.loggedInUserType === 'Internal') {
            this.dialog.close({});
            return;
        }
        const total =
            parseInt(this.jobForm.value.residentialInsurance, 10) +
            parseInt(this.jobForm.value.commercialInsurance, 10) +
            parseInt(this.jobForm.value.residentialRemodeling, 10) +
            parseInt(this.jobForm.value.commercialRemodeling, 10);

        if (this.checkPercentageValue(this.jobForm.value.residentialInsurance)) {
            return false;
        }
        if (this.checkPercentageValue(this.jobForm.value.residentialRemodeling)) {
            return false;
        }
        if (this.checkPercentageValue(this.jobForm.value.commercialInsurance)) {
            return false;
        }
        if (this.checkPercentageValue(this.jobForm.value.commercialRemodeling)) {
            return false;
        }
        if (this.validateYear(this.jobForm.value.year)) return false;

        if (total > 100 || total < 100) {
            const dialogRef = this._dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
			${this.pageContent.Job_Volume_Info.Job_Volume_Year_Hundred}

            </div>
        `;
            return dialogRef;
        } else {
            if (this.currentYear === parseInt(this.jobForm.value.year, 10)) {
                if (this.diffYears > 0) {
                    const dialogRef = this._dialogService.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                    <div class="modal-alert info-alert">
					${this.pageContent.Job_Volume_Info.Job_Volume_Error}
                `;
                    return dialogRef;
                }
            }
            this.objJob.serial_no = this.jobForm.value.serial_no;
            (this.objJob.JobVolumeNumber = this.jobForm.value.JobVolumeNumber), (this.objJob.year = this.jobForm.value.year);
            this.objJob.residentialInsurance = this.jobForm.value.residentialInsurance;
            this.objJob.commercialInsurance = this.jobForm.value.commercialInsurance;
            this.objJob.residentialRemodeling = this.jobForm.value.residentialRemodeling;
            this.objJob.commercialRemodeling = this.jobForm.value.commercialRemodeling;
            this.objJob.largetSingleJob = this.jobForm.value.largetSingleJob;
            this.objJob.avgJobAmount = this.jobForm.value.avgJobAmount;
            this.dialog.close({ status: this.objJob });
        }
    }

    // used to asked to save unsaved data
    public preventDataOnCancel(): boolean {
        if (
            this.jobForm.value.year !== '' ||
            this.jobForm.value.residentialInsurance !== '' ||
            this.jobForm.value.commercialInsurance !== '' ||
            this.jobForm.value.residentialRemodeling !== '' ||
            this.jobForm.value.commercialRemodeling !== '' ||
            this.jobForm.value.largetSingleJob !== '' ||
            this.jobForm.value.avgJobAmount !== ''
        ) {
            return true;
        }
    }

    // function used to check percentage should not exeed 100
    public checkPercentageValue(value: string | number) {
        if (value > 100) {
            const dialogRef = this._dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
			${this.pageContent.Job_Volume_Info.Job_Volume_Not_More_Than_Hundred}

            </div>
        `;
            return dialogRef;
        }
    }

    // close dialog
    public closePopupAddJob(status: string) {
        if (!this.jobForm.dirty) {
            this.dialog.close({});
        } else
            if (
                this.jobForm.value.year === '' &&
                this.jobForm.value.residentialInsurance === '' &&
                this.jobForm.value.commercialInsurance === '' &&
                this.jobForm.value.residentialRemodeling === '' &&
                this.jobForm.value.commercialRemodeling === '' &&
                this.jobForm.value.largetSingleJob === '' &&
                this.jobForm.value.avgJobAmount === ''
            ) {
                this.dialog.close({});
            } else {
                const dialogRef = this._dialogService.open({
                    content: SaveAlertComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.header = this.pageContent.Job_Volume_Info.Warning;
                dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2> ${this.pageContent.Job_Volume_Info.Job_Volume_Are_You_Sure} </h2>
                <p>	${this.pageContent.Job_Volume_Info.Job_Volume_Recover_Data}</p>
            </div>
        `;
                dialogRef.result.subscribe((result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        this.dialog.close({});
                    }
                });
            }
    }

    // function returns only numnbers
    public numberOnly(evt): boolean {
        evt = evt ? evt : window.event;
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // function stop pasting
    public onPaste() {
        return false;
    }
}
