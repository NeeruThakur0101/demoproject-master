import { Component, OnInit, Input, HostListener, Injectable, AfterViewInit } from '@angular/core';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AddFinancial } from '../../models/data-model';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { HttpResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { delay } from 'rxjs/operators';
import { of, concat } from 'rxjs';
import { SelectEvent, RemoveEvent, FileInfo, FileRestrictions, FileState } from '@progress/kendo-angular-upload';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { FinancialInformation } from '../../components/financial-information/model_financial';

@Component({
    selector: 'app-add-financial-info-dialog',
    templateUrl: './add-financial-info-dialog.component.html',
    styleUrls: ['./add-financial-info-dialog.component.scss'],
})
export class AddFinancialInfoDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {
    public financialForm: FormGroup = this.addFinancialForm();
    public checked: boolean = false;
    @Input() incomingData: FinancialInformation; // data from financial information page
    public objFinancial = new AddFinancial();
    public submitted: boolean = false;
    public uploadSaveUrl = '';
    public uploadRemoveUrl = 'removeUrl';
    public isFiscalYear: boolean = false;
    public isCheckedFiscalYear: boolean = false;
    public uploadProgressValue: number = 0;
    public diffYears: number = 0;
    @Input() openingYear: number;
    @Input() currentYear: number;
    @Input() wholeGridData: FinancialInformation[] = [];
    @Input() IsRowDisable: boolean = false;
    public selectedFiles: any = [];
    public isYearDiabled: boolean = false;
    public imageArray: Array<any[]> = [];
    public min: Date = new Date(1900, 0, 1);
    public max: Date = new Date(Date.now());
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public CCOpsID: number;
    public isValid: boolean = false;
    public newIncomingData: any;
    public internalEmployee: boolean = false;
    public loggedInUserType: string;
    public header: string;
    public pageContent: any;
    public accessReadonly: boolean;
    public fileRestriction: FileRestrictions = {
        allowedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.png', '.bmp'],
        maxFileSize: 5242880
    };

    constructor(private _DialogRef: DialogRef, private _formBuilder: FormBuilder,
        private _srvDialog: DialogService, private _srvAuthentication: AuthenticationService,
        private _srvLanguage: InternalUserDetailsService) {
        super(_DialogRef);
        this.financialForm = this._formBuilder.group({
            ROW_NO: '',
            FINST_YR_DT: ['', Validators.required],
            FISCALYEARFLG: [null, Validators.required],
            FISCALYEARSTART: [''],
            FISCALYEAREND: '',
            FINST_TOT_REVN_AM: ['', Validators.required],
            FINST_TOT_EXP_AM: ['', Validators.required],
            FINST_NET_INCM_AM: ['', Validators.required],
            FINST_CURR_AST_AM: ['', Validators.required],
            FINST_CURR_LIAB_AM: ['', Validators.required],
            FINST_LNG_TRM_DEBT_AM: ['', Validators.required],
            FINST_TOT_EQTY_AM: ['', Validators.required],
            CRPercent: '',
            DTEPercent: '',
        });

        this.loginDetails = Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.CCOpsID = this.loginDetails[0].CCOpsID;
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        $event.preventDefault();
        if (this.preventDataOnCancel()) {
            $event.returnValue = 'true';
        }
    }

    // used to disable datepicker field from typing
    @HostListener('document:keydown', ['$event.target.value']) onKeydownHandler(value: string) {
        if (value === undefined) {
            return false;
        } else {
            return true;
        }
    }

    ngOnInit() {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        if (this.loginDetails) {
            this.uploadSaveUrl = environment.api_url + 'UploadDocument/InsertFile/Financial' + '/' + this.loginDetails[0].ResourceID + '/' + this.CCOpsID + '/' + this.loginDetails[0].ContrID;
        }
        this.diffYears = this.currentYear - this.openingYear;
        this.financialForm = this.addFinancialForm();
        if (this.financialForm.controls.FISCALYEARFLG.value) {
            this.financialForm.controls.FISCALYEARSTART.setValidators([Validators.required]);
            this.financialForm.controls.FISCALYEARSTART.updateValueAndValidity();
        }
        // check if user is internal or contractor
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType; // if 'Internal'
        this.internalEmployee = this.loggedInUserType === 'Internal' ? true : false;
        this.header = this.incomingData !== undefined ? `${this.pageContent.Financial_Information.Financial_Edit}` : `${this.pageContent.Financial_Information.Financial_Add}`;
        this.newIncomingData = this.incomingData;
        this.checkPrivilage();

        if (this.loginDetails[0].ContrID === 0 && this.loggedInUserType === 'Internal') {
            this.accessReadonly = true;
            this.financialForm.disable();
        }

        if (this.IsRowDisable && this.loggedInUserType !== 'Internal' && this.IsRowDisable === true) {
            this.financialForm.disable();
        }
    }

    private checkPrivilage(): void {
        if (this.loginDetails[0].ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Financial Information');
            if (!accessType.editAccess && accessType.readonlyAccess) {
                this.accessReadonly = true;
                this.financialForm.disable();
            }

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

    // function called on toggle yes or no for fiscal year
    toggleFiscalYear(val) {
        val === true ? (this.isFiscalYear = true) : (this.isFiscalYear = false);
        if (this.isFiscalYear === true) {
            this.financialForm.get('FISCALYEARSTART').setValidators([Validators.required]);
            this.financialForm.get('FISCALYEARSTART').setValue('');
        } else {
            this.financialForm.get('FISCALYEARSTART').setValidators(null);
            this.financialForm.get('FISCALYEARSTART').setValue('');
        }
    }

    // function used to validate how many years data will be entered
    validateYear(year) {
        if (this.wholeGridData.find(index => index.FinancialYear === parseInt(this.financialForm.value.FINST_YR_DT, 10))) {
            const dialogRef = this._srvDialog.open({
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
        if (typeof year === 'string') { year = parseInt(year, 10) }
        if (year < this.openingYear || year > this.currentYear) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Financial_Information.Data_Between_Company_Opening_Current}</p>
            </div>
        `;
            return dialogRef;
        }
        if (this.diffYears > 0 && this.currentYear === year) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Financial_Information.Financial_Alert_Resubmit_Next_Year}</p>
            </div>
        `;
            return dialogRef;
        }
    }

    // close dialog
    closeAddFinancial(data) {
        if (this.financialForm.dirty === false) {
            this._DialogRef.close({ status: data });
        } else {
            const dialogRef = this._srvDialog.open({
                content: SaveAlertComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Financial_Information.Global_Alert_Header_Warning;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Financial_Information.Global_Alert_Are_You_Sure} </h2>
                <p>${this.pageContent.Financial_Information.Global_Alert_Not_Recover_Data}</p>
            </div>
        `;
            dialogRef.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this._DialogRef.close({ status: data });
                }
            });
        }
    }

    public preventDataOnCancel(): boolean {
        if (
            this.financialForm.value.FINST_YR_DT !== '' ||
            this.financialForm.value.FINST_TOT_REVN_AM !== '' ||
            this.financialForm.value.FINST_TOT_EXP_AM !== '' ||
            this.financialForm.value.FINST_NET_INCM_AM !== '' ||
            this.financialForm.value.FINST_CURR_LIAB_AM !== '' ||
            this.financialForm.value.FINST_CURR_AST_AM !== '' ||
            this.financialForm.value.FINST_LNG_TRM_DEBT_AM !== ''
        ) {
            return true;
        }
    }

    addFinancialForm(): FormGroup {
        if (this.incomingData) {
            this.isYearDiabled = true;
            const formObj = {
                ROW_NO: 0,
                FINST_YR_DT: 0,
                FISCALYEARFLG: false,
                FISCALYEARSTART: '',
                FISCALYEAREND: 0,
                FINST_TOT_REVN_AM: 0,
                FINST_TOT_EXP_AM: 0,
                FINST_NET_INCM_AM: 0,
                FINST_CURR_AST_AM: 0,
                FINST_CURR_LIAB_AM: 0,
                FINST_LNG_TRM_DEBT_AM: 0,
                FINST_TOT_EQTY_AM: 0,
                CRPercent: 0,
                DTEPercent: 0,
            };

            (formObj.ROW_NO = this.incomingData.ROW_NO),
                (formObj.FINST_YR_DT = this.incomingData.FinancialYear),
                (formObj.FISCALYEARFLG = this.incomingData.FiscalYearFlag),
                (formObj.FISCALYEARSTART = this.incomingData.FiscalYearFlag === true ? this.incomingData.FiscalYearStartDate : ''),
                (formObj.FINST_TOT_REVN_AM = this.incomingData.TotalRevenue),
                (formObj.FINST_TOT_EXP_AM = this.incomingData.TotalExpenses),
                (formObj.FINST_NET_INCM_AM = this.incomingData.NetIncome),
                (formObj.FINST_CURR_AST_AM = this.incomingData.TotalCurrentAssets),
                (formObj.FINST_CURR_LIAB_AM = this.incomingData.TotalCurrentLiabilities),
                (formObj.FINST_LNG_TRM_DEBT_AM = this.incomingData.LongTermDebt),
                (formObj.FINST_TOT_EQTY_AM = this.incomingData.Equity),
                (formObj.CRPercent = this.incomingData.CreditRatio),
                (formObj.DTEPercent = this.incomingData.DebtToEquityRatio);

            this.isCheckedFiscalYear = this.incomingData.FiscalYearFlag;
            this.isFiscalYear = this.isCheckedFiscalYear;

            return this._formBuilder.group({
                ROW_NO: new FormControl(formObj.ROW_NO),
                FISCALYEARFLG: new FormControl(formObj.FISCALYEARFLG),
                FISCALYEARSTART: new FormControl(new Date(formObj.FISCALYEARSTART.replace(/-/gm, '/'))),
                FINST_YR_DT: new FormControl(formObj.FINST_YR_DT, Validators.required),
                FINST_TOT_REVN_AM: new FormControl(formObj.FINST_TOT_REVN_AM, Validators.required),
                FINST_TOT_EXP_AM: new FormControl(formObj.FINST_TOT_EXP_AM, Validators.required),
                FINST_NET_INCM_AM: new FormControl(formObj.FINST_NET_INCM_AM, Validators.required),
                FINST_CURR_AST_AM: new FormControl(formObj.FINST_CURR_AST_AM, Validators.required),
                FINST_CURR_LIAB_AM: new FormControl(formObj.FINST_CURR_LIAB_AM, Validators.required),
                FINST_LNG_TRM_DEBT_AM: new FormControl(formObj.FINST_LNG_TRM_DEBT_AM, Validators.required),
                FINST_TOT_EQTY_AM: new FormControl(formObj.FINST_TOT_EQTY_AM, Validators.required),
                CRPercent: new FormControl(formObj.CRPercent),
                DTEPercent: new FormControl(formObj.DTEPercent),
            });
        } else {
            return this.financialForm;
        }
    }

    // convenience getter for easy access to form fields
    get financialFormControl() {
        return this.financialForm.controls;
    }

    public onSubmit() {

        this.submitted = true;
        if (!this.financialForm.dirty && this.financialForm.controls['FINST_YR_DT'].value) {
            this._DialogRef.close({ status: 'cancel', from: 'save' });
        }
        if (this.isValid === true) {
            return false;
        }
        if (this.financialForm.invalid) {
            return;
        }
        if (this.validateYear(this.financialForm.value.FINST_YR_DT)) {
            return;
        }
        if (this.currentYear === this.financialForm.value.FINST_YR_DT) {
            if (this.diffYears > 0) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Financial_Information.Financial_Alert_Resubmit_Next_Year}</p>
                </div>
            `;
                return dialogRef;
            }
        }
        (this.objFinancial.ROW_NO = this.financialForm.value.ROW_NO),
            (this.objFinancial.FINST_YR_DT = this.financialForm.value.FINST_YR_DT),
            (this.objFinancial.FISCALYEARFLG = this.financialForm.controls.FISCALYEARFLG.value),
            (this.objFinancial.FISCALYEARSTART = this.financialForm.value.FISCALYEARSTART === '' ? null : moment(this.financialForm.value.FISCALYEARSTART).format('MM-DD-YYYY')),
            (this.objFinancial.FINST_TOT_REVN_AM = this.financialForm.value.FINST_TOT_REVN_AM),
            (this.objFinancial.FINST_TOT_EXP_AM = this.financialForm.value.FINST_TOT_EXP_AM),
            (this.objFinancial.FINST_NET_INCM_AM = this.financialForm.value.FINST_NET_INCM_AM),
            (this.objFinancial.FINST_CURR_AST_AM = this.financialForm.value.FINST_CURR_AST_AM),
            (this.objFinancial.FINST_CURR_LIAB_AM = this.financialForm.value.FINST_CURR_LIAB_AM),
            (this.objFinancial.FINST_LNG_TRM_DEBT_AM = this.financialForm.value.FINST_LNG_TRM_DEBT_AM),
            (this.objFinancial.FINST_TOT_EQTY_AM = this.financialForm.value.FINST_TOT_EQTY_AM),
            (this.objFinancial.CRPercent = parseFloat(((this.financialForm.value.FINST_CURR_AST_AM * 100) / this.financialForm.value.FINST_CURR_LIAB_AM).toFixed(2))),
            (this.objFinancial.DTEPercent = parseFloat(((this.financialForm.value.FINST_LNG_TRM_DEBT_AM * 100) / this.financialForm.value.FINST_TOT_EQTY_AM).toFixed(2))),
            this._DialogRef.close({ status: this.objFinancial });
    }

    numberTest(evt) {
        evt.srcElement.classList.remove('err');
        const value = evt.target.value;

        const keycode = evt.which ? evt.which : evt.keyCode;
        if (!(keycode === 8 || keycode === 46) && (keycode < 48 || keycode > 57) && keycode !== 189 && keycode !== 190) {
            evt.srcElement.classList.add('err');
            this.isValid = true;
            return false;
        }
        const minusCount = value.split('-').length - 1;
        const dotCount = value.split('.').length - 1;
        const parts = evt.srcElement.value.split('.');
        if (value !== '') {
            if (minusCount !== 0) {
                if (minusCount === 1 && value.indexOf('-') === 0) {
                    evt.srcElement.classList.remove('err');
                    this.isValid = false;
                } else {
                    evt.srcElement.classList.add('err');
                    this.isValid = true;
                    return false;
                }
            }
            if (dotCount !== 0) {
                if (dotCount === 1) {
                    if (parts[1].length > 2) {
                        evt.srcElement.classList.add('err');
                        this.isValid = true;
                        return false;
                    } else {
                        evt.srcElement.classList.remove('err');
                        this.isValid = false;
                    }
                } else {
                    evt.srcElement.classList.add('err');
                    this.isValid = true;
                    return false;
                }
            }
        }
    }

    numberOnly(evt): boolean {
        const pattern = /[0-9\.\ ]/;
        const inputChar = String.fromCharCode(evt.charCode);
        if (evt.keyCode === 32) {
            return false;
        } else if (!pattern.test(inputChar)) {
            evt.preventDefault();
        }
    }

    public numberOnlyLongTerm(evt: any): boolean {
        // getting key code of pressed key
        const keycode = evt.which ? evt.which : evt.keyCode;
        const pattern = /[0-9\.\ ]/;
        const inputChar = String.fromCharCode(evt.charCode);

        // comparing pressed keycodes
        if (!pattern.test(inputChar)) {
            evt.srcElement.classList.add('err');
            return false;
        }

        if (!(keycode === 8 || keycode === 46) && (keycode < 48 || keycode > 57)) {
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

    // File DropZone
    selectEventHandler(e: SelectEvent) {
        let extensions;
        let restrictionFlag: boolean = false;

        e.files.forEach((file: FileInfo) => {
            if (file.rawFile) {
                extensions = this.fileRestriction.allowedExtensions;

                if (extensions.includes(file.extension.toLowerCase())) {
                    this.readImage(file);
                } else {
                    restrictionFlag = true;
                }
            }
        });

        if (restrictionFlag) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Company_Info.File_Validation}</p>
            </div>
        `;
        }
    }

    readImage(input) {
        const parentThis = this;
        if (input.rawFile) {
            const reader = new FileReader();

            reader.onload = function (e) {

                let previewImg;
                if ((this.result as string).split(';')[0] === 'data:application/pdf') {
                    previewImg = 'assets/images/ico-pdf.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:text/plain') {
                    previewImg = 'assets/images/ico-txt.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    (this.result as string).split(';')[0] === 'data:application/vnd.ms-excel') {
                    previewImg = 'assets/images/ico-excel.svg';
                }
                else if ((this.result as string).split(';')[0] === 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    (this.result as string).split(';')[0] === 'data:application/msword') {
                    previewImg = 'assets/images/ico-doc.svg';
                }
                else {
                    previewImg = this.result;
                }

                parentThis.selectedFiles.push({
                    preview: previewImg, // this.result,
                    name: input.name,
                    size: input.size,
                    uid: input.uid,
                    uploadProgress: 0,
                });
            };
            reader.readAsDataURL(input.rawFile);
        }
    }

    clearEventHandler(e) {
        this.selectedFiles = [];
    }

    // remove or delete method
    public remove(upload, uid: string) {
        upload.removeFilesByUid(uid);
    }

    removeEventHandler(e: RemoveEvent) {
        this.selectedFiles = this.selectedFiles.filter((img) => img.uid !== e.files[0].uid);
    }

    uploadProgressEvent(e) {
        const index = this.selectedFiles.findIndex((element) => element.uid === e.files[0].uid);
        this.selectedFiles[index]['uploadProgress'] = e.percentComplete;
        if (e.percentComplete === 100) {
            this.imageArray.push(this.selectedFiles[index]);
        }
    }

    onPaste() {
        return true;
    }

    onKeyDown() {
        return false;
    }
}
@Injectable()
export class UploadInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url === 'saveUrl') {
            const events: Observable<HttpEvent<any>>[] = [0, 10, 30, 60, 100].map((x) =>
                of({
                    type: HttpEventType.UploadProgress,
                    loaded: x,
                    total: 100,
                } as HttpProgressEvent).pipe(delay(1000))
            );
            const success = of(new HttpResponse({ status: 200 })).pipe(delay(1000));
            events.push(success);
            return concat(...events);
        }
        if (req.url === 'removeUrl') {
            return of(new HttpResponse({ status: 200 }));
        }
        return next.handle(req);
    }
}
