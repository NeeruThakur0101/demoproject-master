import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddCredit } from '../../models/data-model';
import * as moment from 'moment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { CreditService } from '../../components/credit-information/credit.service';
import { ActionRating, CreditList } from '../../components/credit-information/credit-interface.model';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
@Component({
    selector: 'app-add-credit-report',
    templateUrl: './add-credit-report.component.html',
    styleUrls: ['./add-credit-report.component.scss'],
})
export class AddCreditReportComponent extends DialogContentBase implements OnInit {
    public creditForm: FormGroup = this.addCreditForm();
    @Input() incomingData: CreditList; // data from financial information page
    public objCredit = new AddCredit();
    public submitted: boolean = false;
    public ddlActionRating: ActionRating[] = [];
    public pageContent: any;
    public loginDetails: Array<SessionUser> = []; //  Array<LoginUser> = [];
    public ContrID: number;
    constructor(
        private _srvDialog: DialogService,
        private _srvCredit: CreditService,
        private formBuilder: FormBuilder,
        public dialog: DialogRef,
        private _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService
    ) {
        super(dialog);
        this.creditForm = this.formBuilder.group({
            CONTR_ID: '',
            CRRPT_ID_NB: '',
            RunType: '',
            TypeofReport: ['', Validators.required],
            ReportsDate: ['', Validators.required],
            PaymentTrend: [null, Validators.required],
            NumberOfTradeLines: [null, Validators.required],
            HightestCredit: [null, Validators.required],
            CreditScore: ['', Validators.required],
            ActionRatingID: [null, Validators.required],
            Comments: [''],
        });
    }

    async ngOnInit() {
        this.loginDetails = Array(this._srvAuth.Profile);
        if (this.loginDetails) {
            this.ContrID = this.loginDetails[0].ContrID;
        }

        this.pageContent = this._srvLanguage.getPageContentByLanguage();

        this.creditForm = this.addCreditForm();
        this.ddlActionRating = await this._srvCredit.GetActionRatingDropdown();
    }

    addCreditForm(): FormGroup {
        if (this.incomingData) {
            const formObj = {
                CONTR_ID: 0,
                CRRPT_ID_NB: 0,
                TypeofReport: '',
                ReportsDate: null,
                PaymentTrend: 0,
                NumberOfTradeLines: 0,
                HightestCredit: 0,
                CreditScore: '',
                ActionRatingID: 0,
                Comments: '',
            };

            (formObj.CONTR_ID = this.incomingData.CONTR_ID),
                (formObj.CRRPT_ID_NB = this.incomingData.CRRPT_ID_NB),
                (formObj.TypeofReport = this.incomingData.ReportType),
                (formObj.ReportsDate = new Date(this.incomingData.ReportsDate)),
                (formObj.Comments = this.incomingData.Comments),
                (formObj.CreditScore = this.incomingData.creditScore),
                (formObj.HightestCredit = this.incomingData.HightestCredit),
                (formObj.NumberOfTradeLines = this.incomingData.TreadLines),
                (formObj.PaymentTrend = this.incomingData.PaymentTrend),
                (formObj.ActionRatingID = this.incomingData.actionRatingID);

            return this.formBuilder.group({
                CONTR_ID: new FormControl(formObj.CONTR_ID),
                CRRPT_ID_NB: new FormControl(formObj.CRRPT_ID_NB),
                TypeofReport: new FormControl(formObj.TypeofReport, Validators.required),
                ReportsDate: new FormControl(formObj.ReportsDate, Validators.required),
                Comments: new FormControl(formObj.Comments),
                CreditScore: new FormControl(formObj.CreditScore, Validators.required),
                HightestCredit: new FormControl(formObj.HightestCredit, Validators.required),
                NumberOfTradeLines: new FormControl(formObj.NumberOfTradeLines, Validators.required),
                PaymentTrend: new FormControl(formObj.PaymentTrend, Validators.required),
                ActionRatingID: new FormControl(formObj.ActionRatingID, Validators.required),
            });
        } else {
            return this.creditForm;
        }
    }

    // convenience getter for easy access to form fields
    get creditFormControl() {
        return this.creditForm.controls;
    }

    public close() {
        if (this.creditForm.dirty === false) {
            this.dialog.close({ status: 'close' });
        }
        else {
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
                    this.dialog.close({ status: 'close' });
                }
            });
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

    public onSubmit() {
        this.submitted = true;
        if (this.creditForm.invalid) {
            return;
        }

        (this.objCredit.RunType = this.creditForm.value.CRRPT_ID_NB === '' ? 'ADD' : 'EDIT'), (this.objCredit.CRRPT_ID_NB = this.objCredit.RunType === 'ADD' ? 0 : this.creditForm.value.CRRPT_ID_NB);
        (this.objCredit.CONTR_ID = this.objCredit.CRRPT_ID_NB === 0 ? this.ContrID : this.creditForm.value.CONTR_ID),
            (this.objCredit.ReportsDate = moment(this.creditForm.value.ReportsDate).format('YYYY-MM-DD')),
            (this.objCredit.TypeofReport = this.creditForm.value.TypeofReport),
            (this.objCredit.CreditScore = this.creditForm.value.CreditScore),
            (this.objCredit.HightestCredit = this.creditForm.value.HightestCredit),
            (this.objCredit.NumberOfTradeLines = this.creditForm.value.NumberOfTradeLines),
            (this.objCredit.ActionRatingID = this.creditForm.value.ActionRatingID),
            (this.objCredit.Comments = this.creditForm.value.Comments),
            (this.objCredit.PaymentTrend = this.creditForm.value.PaymentTrend),
            this.dialog.close({ status: this.objCredit });
    }
}
