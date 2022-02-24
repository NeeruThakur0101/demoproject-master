import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, Input, OnInit } from '@angular/core';
import { ContractorOperationService } from '../../components/contractor-operation/contractor-operation.service';
import { ContractorOperationEmail, OperationEmailDropDownOption } from '../../components/contractor-operation/models';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
// import { EmailTemplateComponent } from '../email-template/email-template.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { EmailTemplateComponent } from '../email-template/email-template.component';
//import { Item } from '@progress/kendo-angular-charts/dist/es2015/common/collection.service';
@Component({
    selector: 'app-select-email-address',
    templateUrl: './select-email-address.component.html',
    styleUrls: ['./select-email-address.component.scss'],
})
export class SelectEmailAddressComponent extends DialogContentBase implements OnInit {
    public Page: ContractorOperationEmail = { email: [], loadingState: false };

    public selectedItems: OperationEmailDropDownOption[];

    public sendEmailForm: FormGroup;
    public submitted: boolean = false;
    @Input() pdfLink: string;
    public pageContent: any;
    constructor(
        dialog: DialogRef,
        private deviceService: DeviceDetectorService,
        private universal: UniversalService,
        private dialogSrv: DialogService,
        private $OperationSrv: ContractorOperationService,
        private route: Router,
        private formBuilder: FormBuilder,
        public $language: InternalUserDetailsService,
        public $auth: AuthenticationService
    ) {
        super(dialog);
        this.pageContent = this.$language.getPageContentByLanguage();
    }

    ngOnInit(): void {
        this.loadEmailData();

        this.sendEmailForm = this.formBuilder.group({
            Email: ['', Validators.required],
        });
    }
    public get emailform() {
        return this.sendEmailForm.controls;
    }

    public close() {
        this.dialog.close({ button: 'Yes' });
    }

    async loadEmailData() {
        this.Page.loadingState = true;
        this.Page.email = await this.$OperationSrv.getEmailDetails();
        this.Page.loadingState = false;
    }

    public onSubmit(): void {
        this.submitted = true;
        if (this.sendEmailForm.invalid) {
            return;
        } else {
            const emailaddress = this.sendEmailForm.value.Email;

            setTimeout(() => {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth',
                });
            }, 5);
            const alertDialog = this.dialogSrv.open({
                content: EmailTemplateComponent,
                width: 800,
            });
            const dialogRef = alertDialog.content.instance;
            dialogRef.receiverMail = this.sendEmailForm.value.Email;
            dialogRef.pdfLink = this.pdfLink;
            this.dialog.close({ button: 'Yes' });
        }
    }
}
