import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';

import { EmailTemplateService } from './email-template.service';

@Component({
    selector: 'app-email-template',
    templateUrl: './email-template.component.html',
    styleUrls: ['./email-template.component.scss'],
})
export class EmailTemplateComponent extends DialogContentBase implements OnInit {
    constructor(
        dialog: DialogRef,
        private formBuilder: FormBuilder,
        private dialogService: DialogService,
        public $auth: AuthenticationService,
        public $language: InternalUserDetailsService,
        public _srvEmailTemplate: EmailTemplateService
    ) {
        super(dialog);
        this.pageContent = this.$language.getPageContentByLanguage();
    }
    @Input() receiverMail: string[];
    @Input() pdfLink: string;
    public emailTemplate: FormGroup;
    public submitted: boolean = false;
    public toMail: string;
    public ccMail: string;
    public loadingState: boolean = false;
    public showEditor: boolean = false;
    public toCcDuplicacy: boolean = false;
    public ccBccDuplicacy: boolean = false;
    public bccToDuplicacy: boolean = false;
    public pageContent: any;

    ngOnInit(): void {
        this.toMail = this.receiverMail.toString();
        this.emailTemplate = this.formBuilder.group({
            email: [this.toMail, [Validators.required, this.multiEmail]],
            cc: ['', this.multiEmail],
            bcc: ['', this.multiEmail],
            subject: ['', Validators.required],
            body: ['', Validators.required],
        });
        this.loadingState = true;
        setTimeout(() => {
            this.loadingState = false;
            this.showEditor = true;
        });
    }
    public get emailform() {
        return this.emailTemplate.controls;
    }
    public close() {
        this.dialog.close({ button: 'Yes' });
    }

    // custom validator to validate multiple emails in single input field
    multiEmail(control: AbstractControl): { [key: string]: any } | null {
        const emails = control.value;
        let emailsToCheck;
        if (typeof emails === 'string') {
            emailsToCheck = emails ? emails.split(',') : [];
        } else {
            emailsToCheck = emails ? emails : [];
        }
        const patt = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let count = 0;
        emailsToCheck.map((res) => {
            if (patt.test(res)) {
                count = count + 1;
            }
        });
        if (emailsToCheck.length === count) {
            return null;
        } else {
            return { emailsPattern: true };
        }
    }
    mailDuplicacyCheck() {
        const toMail: string[] = this.emailTemplate.value.email ? this.emailTemplate.value.email.split(',') : undefined;
        const ccMail: string[] = this.emailTemplate.value.cc ? this.emailTemplate.value.cc.split(',') : undefined;
        const bccMail: string[] = this.emailTemplate.value.bcc ? this.emailTemplate.value.bcc.split(',') : undefined;
        this.toCcDuplicacy = toMail && ccMail ? toMail.some((item) => ccMail.includes(item)) : false;
        this.ccBccDuplicacy = ccMail && bccMail ? ccMail.some((item) => bccMail.includes(item)) : false;
        this.bccToDuplicacy = bccMail && toMail ? toMail.some((item) => bccMail.includes(item)) : false;
    }

    // made to avoid submit function huge
    validationObject() {
        const validationObj = { subjectRequired: false, bodyRequired: false, toRequired: false, toMailPattern: false, ccMailPattern: false, bccMailPattern: false };
        if (this.emailform.subject.errors) {
            validationObj.subjectRequired = this.emailform.subject.errors.required;
        }
        if (this.emailform.body.errors) {
            validationObj.bodyRequired = this.emailform.body.errors.required;
        }
        if (this.emailform.email.errors) {
            validationObj.toMailPattern = this.emailform.email.errors.emailsPattern;
            validationObj.toRequired = this.emailform.email.errors.required;
        }
        if (this.emailform.cc.errors) {
            validationObj.ccMailPattern = this.emailform.cc.errors.emailsPattern;
        }
        if (this.emailform.bcc.errors) {
            validationObj.bccMailPattern = this.emailform.bcc.errors.emailsPattern;
        }
        return validationObj;
    }
    public async onSubmit() {
        const { subjectRequired, bodyRequired, toRequired, toMailPattern, ccMailPattern, bccMailPattern } = this.validationObject();
        this.mailDuplicacyCheck();
        this.submitted = true;
        this.loadingState = true;
        if (
            this.submitted &&
            (this.emailform.email.errors ||
                ccMailPattern ||
                bccMailPattern ||
                subjectRequired ||
                bodyRequired ||
                this.toCcDuplicacy ||
                this.ccBccDuplicacy ||
                this.bccToDuplicacy ||
                !this.emailTemplate.value.subject.trim())
        ) {
            if (toRequired) {
                const messageTemplate = `
                            <div class="modal-alert info-alert">
                                <p>${this.pageContent.EmailTemplate.Specify_Atleast_One_Recipient}</p>
                            </div>
                        `;
                this.alertDialog(messageTemplate);
            }
            if ((toMailPattern || ccMailPattern || bccMailPattern) && !toRequired) {
                const messageTemplate = `
                            <div class="modal-alert info-alert">
                                <p>${this.pageContent.EmailTemplate.Enter_Valid_Email_Pattern}</p>
                            </div>
                        `;
                this.alertDialog(messageTemplate);
            }
            if (!(toMailPattern || ccMailPattern || bccMailPattern) && !(this.toCcDuplicacy || this.ccBccDuplicacy || this.bccToDuplicacy) && !toRequired) {
                if ((subjectRequired || !this.emailTemplate.value.subject.trim()) && bodyRequired) {
                    const messageTemplate = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.EmailTemplate.Subject_And_Body_Are_Required}</p>
                                </div>
                            `;
                    this.alertDialog(messageTemplate);
                } else if (bodyRequired) {
                    const messageTemplate = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.EmailTemplate.Body_Is_Required}</p>
                                </div>
                            `;
                    this.alertDialog(messageTemplate);
                } else if (subjectRequired || !this.emailTemplate.value.subject.trim()) {
                    const messageTemplate = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.EmailTemplate.Subject_Is_Required}</p>
                                </div>
                            `;
                    this.alertDialog(messageTemplate);
                }
            }
            if (!(toRequired || toMailPattern || ccMailPattern) && (this.toCcDuplicacy || this.ccBccDuplicacy || this.bccToDuplicacy)) {
                const messageTemplate = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.EmailTemplate.Enter_Unique_Mail_Addresses}</p>
                                </div>
                            `;
                this.alertDialog(messageTemplate);
            }
            return;
        } else {
            const obj = {
                To: this.emailTemplate.value.email,
                Cc: this.emailTemplate.value.cc,
                Bcc: this.emailTemplate.value.bcc,
                Subject: this.emailTemplate.value.subject.trim(),
                Body: this.emailTemplate.value.body,
                Attachment: this.pdfLink,
            };
            const response = await this._srvEmailTemplate.sendContractorOperationEmail(obj);
            if (response.body === 1) {
                this.loadingState = false;
                const messageTemplate = `
                    <div class="modal-alert confirmation-alert">
                        <p>${this.pageContent.EmailTemplate.Mail_Sent_Successfully}</p>
                    </div>
                `;
                this.alertDialog(messageTemplate);
                this.dialog.close({ button: 'Yes' });
                this.emailTemplate.reset();
            } else {
                this.loadingState = false;
                const messageTemplate = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.EmailTemplate.Something_Went_Wrong}</p>
            </div>
        `;
                this.alertDialog(messageTemplate);
            }
        }
    }
    public alertDialog(message) {
        this.loadingState = false;
        const dialogRef = this.dialogService.open({
            content: DialogAlertsComponent,
            width: '400px',
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = message;
    }
}
