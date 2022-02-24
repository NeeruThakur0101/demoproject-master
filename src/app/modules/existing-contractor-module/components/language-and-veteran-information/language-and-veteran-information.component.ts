import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SelectApplicationModel } from 'src/app/modules/contractor-Registration-module/models/data-model';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { Router } from '@angular/router';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ApprovalVeteranData, ApprovalWorldLanguage, Languages, LangVeteranInfo, Veteran, VisualCue } from './veteran.model';
import { CorrectionRequestComments, InternalLogin, LoginUser } from 'src/app/core/models/user.model';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { LanguageVeteranService } from './language-veteran.service';
import { ElementRef } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';
import { Renderer2 } from '@angular/core';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-language-and-veteran-information',
    templateUrl: './language-and-veteran-information.component.html',
    styleUrls: ['./language-and-veteran-information.component.scss'],
})
export class LanguageAndVeteranInformationComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    public veteranLangInfo: LangVeteranInfo = null;
    public langInfo: Languages[] = [];
    public veteranInfo: Veteran[] = [];
    public languageForm: FormGroup;
    public loginDetails: Array<SessionUser> = []; //  Array<LoginUser> = [];
    public resourceId: number;
    public ccopsId: number;
    public objProgram = new SelectApplicationModel();
    public dataForApproval: ApprovalVeteranData;
    public oldJsonData: ApprovalVeteranData;
    private count: number = 0;
    private multiTimeClick: number = 0;
    public checkDuringFlag: Array<boolean> = [];
    public checkAfterFlag: Array<boolean> = [];
    public checkDuringFlagDisable: Array<boolean> = [];
    public checkAfterFlagDisable: Array<boolean> = [];
    public hammerData: Veteran = null;
    public minDate: Date;
    public addControlsFlag: boolean = false;
    public selectOneLangFlag: boolean;
    public pledgeError: boolean;
    public mandateFieldsFlag: boolean = false;
    public loggedInUserType: string;
    public contrId: number;
    public hidePage: boolean = false;
    public saveBtnDisable: boolean = false;
    public readonlyUserAccess = false;
    public pageContent: any;
    public crComments: CorrectionRequestComments[];
    public loginDetailsInternal: SessionUser;
    public visualCue: VisualCue = {
        minorityOwned: false,
        womanOwned: false,
        veteranOwned: false,
        disableOwned: false,
        newEmpNum: false,
        nonVeteranFlg: false,
        pledgeDate: false,
    };
    public disableCue: VisualCue = {
        minorityOwned: false,
        womanOwned: false,
        veteranOwned: false,
        disableOwned: false,
        newEmpNum: false,
        nonVeteranFlg: false,
        pledgeDate: false,
    };

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    constructor(
        private _datePipe: DatePipe,
        public _srvAuthentication: AuthenticationService,
        private _router: Router,
        private _dialogService: DialogService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvLanguageVeteran: LanguageVeteranService,
        private _srvUniversal: UniversalService,
        private renderer: Renderer2,
        public intlService: IntlService
    ) { }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    async ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.loginDetailsInternal = this._srvAuthentication.ProfileInternal;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.getVeteranInfo();
        this.crComments = await this._srvContractorData.getPageComments('Languages/Veterans/Minority Information');

        setTimeout(() => {
            this.heightCalculate();
        }, 2000);
    }
    initFormGroup() {
        this.languageForm = new FormGroup({
            minorityOwned: new FormControl(),
            womanOwned: new FormControl(),
            veteranOwned: new FormControl(),
            disableOwned: new FormControl(),
            oldEmpNum: new FormControl(),
            newEmpNum: new FormControl(null, Validators.maxLength(5)),
            fromDate: new FormControl(),
            nonVeteranFlag: new FormControl(),
        });
        this.visualCue = {
            minorityOwned: false,
            womanOwned: false,
            veteranOwned: false,
            disableOwned: false,
            newEmpNum: false,
            nonVeteranFlg: false,
            pledgeDate: false,
        };
        this.disableCue = {
            minorityOwned: false,
            womanOwned: false,
            veteranOwned: false,
            disableOwned: false,
            newEmpNum: false,
            nonVeteranFlg: false,
            pledgeDate: false,
        };
    }

    checkPrivilegeForUser(): boolean {
        // for user access Privilege
        if (this.contrId > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Language & Veteran Information');
            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.readonlyUserAccess = true;
                    this.saveBtnDisable = true;
                } else {
                    this.hidePage = true;
                    const dialogRef = this._dialogService.open({
                        content: DialogAlertsComponent,
                        appendTo: this.containerRef,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = ` <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Language_Veteran.Veteran_Alert_Access_Denied}</h2>
                    <p>${this.pageContent.Language_Veteran.Veteran_Alert_Access_Denied_Stmt}</p>
                   </div>`;
                    dialogRef.result.subscribe(() => {
                        // to show selected jump to value
                        // end
                        this._router.navigate(['contractorRegistration/company-information']);
                    });
                    return true;
                }
            }
        }
        return false;
    }

    public async getVeteranInfo() {
        this.initFormGroup();
        this.minDate = new Date();
        this.languageForm.controls.oldEmpNum.disable();
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.contrId = this.loginDetails[0].ContrID;
            this.ccopsId = this.loginDetails[0].CCOpsID;
        }
        if (this.loggedInUserType === 'Internal') {
            const loginDetailsInternal = this.loginDetailsInternal;
            this.resourceId = loginDetailsInternal.ResourceID;
        }
        const response = this.checkPrivilegeForUser();
        if (response) {
            return;
        }

        const param = {
            contrID: this.contrId,
            resourceID: this.resourceId,
            pageName: 'Language-Veteran Information Page',
            CCOpsId: this.loginDetails[0].CCOpsID,
            EventName: this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName,
        };
        const res: EditContractor[] = await this._srvLanguageVeteran.getContractorApprovalData(param);
        this.dataForApproval =
            res.length > 0 && JSON.parse(res[0].CCOpsData) && JSON.parse(res[0].CCOpsData).ContractorData.LanguageAndVeteranInformation
                ? JSON.parse(res[0].CCOpsData).ContractorData.LanguageAndVeteranInformation
                : [];
        this.oldJsonData = this.dataForApproval;
        const value: LangVeteranInfo = await this._srvLanguageVeteran.getVeteranMasterData({ CONTR_ID: this.contrId, userLanguageId: this._srvAuthentication.currentLanguageID });
        this.veteranLangInfo = value;
        this.langInfo = value.LangInfo;
        this.veteranInfo = value.VeteranInfo;
        if (value) {
            if (value.LangInfo) {
                value.LangInfo.forEach((val, i) => {
                    this.languageForm.addControl(`after_${i}`, new FormControl(val.AfterBusinessHoursMultiLanguageFlag));
                    this.languageForm.addControl(`during_${i}`, new FormControl(val.DuringBusinessHoursMultiLanguageFlag));
                });
                this.addControlsFlag = true;
            }
        }
        if (this.readonlyUserAccess) {
            this.languageForm.disable();
        }
        if (value) {
            if (value.VeteranInfo[0]) {
                this.hammerData = value.VeteranInfo[0];
                this.hammerData.MinorityOwnedBusinessHammerHower = this.pageContent.Language_Veteran.MinorityOwnedBusinessHammerHower;
                this.hammerData.VeteranOwnedBusinessHammerHower = this.pageContent.Language_Veteran.VeteranOwnedBusinessHammerHower;
                this.hammerData.DisabledOwnedBusinessHammerHower = this.pageContent.Language_Veteran.DisabledOwnedBusinessHammerHower;
                this.hammerData.WomanOwnedBusinessHammerHower = this.pageContent.Language_Veteran.WomanOwnedBusinessHammerHower;
                const control = this.languageForm.controls;
                control.minorityOwned.setValue(value.VeteranInfo[0].MinorityOwnedBusinessFlag === 'YES' ? true : false);
                control.womanOwned.setValue(value.VeteranInfo[0].WomanOwnedBusinessFlag === 'YES' ? true : false);
                control.veteranOwned.setValue(value.VeteranInfo[0].VeteranOwnedBusinessFlag === 'YES' ? true : false);
                control.disableOwned.setValue(value.VeteranInfo[0].DisabledOwnedBusinessFlag === 'YES' ? true : false);
                control.nonVeteranFlag.setValue(value.VeteranInfo[0].AffidavitFlg);
                control.oldEmpNum.setValue(value.VeteranInfo[0].CurrentVeteranCount);
                control.newEmpNum.setValue(value.VeteranInfo[0].VeteranPledgeCount);
                control.fromDate.setValue(value.VeteranInfo[0].VeteranPledgeDate ? new Date(value.VeteranInfo[0].VeteranPledgeDate) : null);
            }
        }

        if (this.dataForApproval !== null && this.dataForApproval !== undefined) {
            this.compareData(value).then(() => {
                if (this.loggedInUserType === 'Internal') {
                    this.disableContractorVisual(this.visualCue, this.checkDuringFlag, this.checkAfterFlag);
                } else {
                    this.disableContractorVisual(this.disableCue, this.checkDuringFlagDisable, this.checkAfterFlagDisable);
                }
            });
        }
    }
    public disableContractorVisual(visualCue, checkDuringFlag, checkAfterFlag) {
        const control = this.languageForm.controls;
        if (visualCue.minorityOwned === true) {
            control.minorityOwned.disable();
        }
        if (visualCue.womanOwned === true) {
            control.womanOwned.disable();
        }
        if (visualCue.veteranOwned === true) {
            control.veteranOwned.disable();
        }
        if (visualCue.disableOwned === true) {
            control.disableOwned.disable();
        }
        if (visualCue.newEmpNum === true) {
            control.newEmpNum.disable();
        }
        if (visualCue.nonVeteranFlg === true) {
            control.nonVeteranFlag.disable();
        }
        if (visualCue.pledgeDate === true) {
            control.fromDate.disable();
        }
        if (visualCue.newEmpNum || visualCue.pledgeDate) {
            control.nonVeteranFlag.disable();
        }
        checkDuringFlag.forEach((value, i) => {
            if (value === true) {
                control[`during_${i}`].disable();
            }
        });
        checkAfterFlag.forEach((value, i) => {
            if (value === true) {
                control[`after_${i}`].disable();
            }
        });
    }
    public compareData(langVetData): Promise<void> {
        return new Promise((resolve, reject) => {
            const control = this.languageForm.controls;
            const masterData = {
                MinorityOwnedBusinessFlag: langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].MinorityOwnedBusinessFlag === 'YES' ? 1 : 0,
                WomanOwnedBusinessFlag: langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].WomanOwnedBusinessFlag === 'YES' ? 1 : 0,
                VeteranOwnedBusinessFlag: langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].VeteranOwnedBusinessFlag === 'YES' ? 1 : 0,
                DisabledOwnedBusinessFlag: langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].DisabledOwnedBusinessFlag === 'YES' ? 1 : 0,
                NonVeteranFlag: langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].AffidavitFlg === true ? 1 : 0,
                VeteranPledgeCount: langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].VeteranPledgeCount ? langVetData.VeteranInfo[0].VeteranPledgeCount : 0,
                VeteranPledgeDate:
                    langVetData.VeteranInfo.length && langVetData.VeteranInfo[0].VeteranPledgeDate ? this._datePipe.transform(langVetData.VeteranInfo[0].VeteranPledgeDate, 'MM/dd/yyyy') : null,
                WorldLanguage: null,
            };

            if (this.dataForApproval.hasOwnProperty('MinorityOwnedBusinessFlag')) {
                control.minorityOwned.setValue(this.dataForApproval.MinorityOwnedBusinessFlag === 1 ? true : false);
                this.visualCue.minorityOwned = true;
                if (this.dataForApproval.hasOwnProperty('IsMinorityOwnedBusinessFlagDisable')) {
                    this.disableCue.minorityOwned = this.dataForApproval.IsMinorityOwnedBusinessFlagDisable === true ? true : false;
                }
            }
            if (this.dataForApproval.hasOwnProperty('WomanOwnedBusinessFlag')) {
                control.womanOwned.setValue(this.dataForApproval.WomanOwnedBusinessFlag === 1 ? true : false);
                this.visualCue.womanOwned = true;
                if (this.dataForApproval.hasOwnProperty('IsWomanOwnedBusinessFlagDisable')) {
                    this.disableCue.womanOwned = this.dataForApproval.IsWomanOwnedBusinessFlagDisable === true ? true : false;
                }
            }
            if (this.dataForApproval.hasOwnProperty('VeteranOwnedBusinessFlag')) {
                control.veteranOwned.setValue(this.dataForApproval.VeteranOwnedBusinessFlag === 1 ? true : false);
                this.visualCue.veteranOwned = true;
                if (this.dataForApproval.hasOwnProperty('IsVeteranOwnedBusinessFlagDisable')) {
                    this.disableCue.veteranOwned = this.dataForApproval.IsVeteranOwnedBusinessFlagDisable === true ? true : false;
                }
            }
            if (this.dataForApproval.hasOwnProperty('DisabledOwnedBusinessFlag')) {
                control.disableOwned.setValue(this.dataForApproval.DisabledOwnedBusinessFlag === 1 ? true : false);
                this.visualCue.disableOwned = true;
                if (this.dataForApproval.hasOwnProperty('IsDisabledOwnedBusinessFlagDisable')) {
                    this.disableCue.disableOwned = this.dataForApproval.IsDisabledOwnedBusinessFlagDisable === true ? true : false;
                }
            }
            if (this.dataForApproval.hasOwnProperty('NonVeteranFlag')) {
                this.visualCue.nonVeteranFlg = true;
                if (this.dataForApproval.hasOwnProperty('IsRowDisable')) {
                    this.disableCue.nonVeteranFlg = this.dataForApproval.IsRowDisable === true ? true : false;
                }
                control.nonVeteranFlag.setValue(this.dataForApproval.NonVeteranFlag === 1 || this.dataForApproval.NonVeteranFlag === true ? true : false);
            }
            if (this.dataForApproval.hasOwnProperty('VeteranPledgeCount')) {
                control.newEmpNum.setValue(this.dataForApproval.VeteranPledgeCount);
                this.visualCue.newEmpNum = true;
                if (this.dataForApproval.hasOwnProperty('IsRowDisable')) {
                    this.disableCue.newEmpNum = this.dataForApproval.IsRowDisable === true ? true : false;
                }
            }
            if (this.dataForApproval.hasOwnProperty('VeteranPledgeDate')) {
                control.fromDate.setValue(this.dataForApproval.VeteranPledgeDate !== null ? new Date(this.dataForApproval.VeteranPledgeDate) : '');
                this.visualCue.pledgeDate = true;
                if (this.dataForApproval.hasOwnProperty('IsRowDisable')) {
                    this.disableCue.pledgeDate = this.dataForApproval.IsRowDisable === true ? true : false;
                }
            }

            if (this.dataForApproval.hasOwnProperty('WorldLanguage')) {
                this.langInfo.forEach((val, i) => {
                    this.dataForApproval.WorldLanguage.forEach((item, j) => {
                        if (val.WorldLanguageID === item.WorldLanguageNumber) {
                            if (item.MultiLanguageTypeNumber === 1) {
                                if (item.MultiLanguageAnswer === 1) {
                                    item.MultiLanguageAnswer = true;
                                } else {
                                    item.MultiLanguageAnswer = false;
                                }
                                this.checkDuringFlag[i] = false;
                                this.languageForm.controls['during_' + i].setValue(item.MultiLanguageAnswer);
                                this.checkDuringFlag[i] = true;
                                if (item.hasOwnProperty('IsRowDisable')) {
                                    this.checkDuringFlagDisable[i] = item.IsRowDisable === true ? true : false;
                                }
                            } else if (item.MultiLanguageTypeNumber === 2) {
                                if (item.MultiLanguageAnswer === 1) {
                                    item.MultiLanguageAnswer = true;
                                } else {
                                    item.MultiLanguageAnswer = false;
                                }
                                this.checkAfterFlag[i] = false;
                                this.languageForm.controls['after_' + i].setValue(item.MultiLanguageAnswer);
                                this.checkAfterFlag[i] = true;
                                if (item.hasOwnProperty('IsRowDisable')) {
                                    this.checkAfterFlagDisable[i] = item.IsRowDisable === true ? true : false;
                                }
                            }
                        }
                    });
                });
            }
            resolve();
        });
    }
    public onSaveClick() {
        let countLang: number = 0;
        this.pledgeError = false;
        this.mandateFieldsFlag = false;
        this.langInfo.forEach((value, i) => {
            if (this.languageForm.controls['during_' + i].value === true) {
                countLang = 1;
            }
        });
        if (countLang === 0) {
            this.selectOneLangFlag = true;
        }
        if (this.languageForm.controls.nonVeteranFlag.value === false || this.languageForm.controls.nonVeteranFlag.value === null || this.languageForm.controls.oldEmpNum.value > 0) {
            if (!this.languageForm.controls.newEmpNum.value || !this.languageForm.controls.fromDate.value) {
                this.mandateFieldsFlag = true;
            } else if (this.languageForm.controls.newEmpNum.value <= this.languageForm.controls.oldEmpNum.value) {
                this.pledgeError = true;
            }
        }
        if (countLang === 1 && this.pledgeError === false && this.mandateFieldsFlag === false) {
            if (this.loggedInUserType === 'Internal') {
                const LanguageAndVeteranInformation = this.submitForInternal();
                this.submitLanguageAndVeteran(LanguageAndVeteranInformation);
            } else {
                this.count = 0;
                this.multiTimeClick = 0;
                this.langInfo.forEach((value, i) => {
                    if (this.languageForm.controls['during_' + i].value === true) {
                        this.count = 1;
                    }
                    if (value.DuringBusinessHoursMultiLanguageID !== 0) {
                        this.multiTimeClick = 1;
                    }
                });
                if (this.multiTimeClick === 1) {
                    if (this.count === 1) {
                        this.selectOneLangFlag = false;
                        const LanguageAndVeteranInformationObj = this.eventDataToPut();
                        this.submitLanguageAndVeteran(LanguageAndVeteranInformationObj);
                    } else {
                        this.selectOneLangFlag = true;
                        this.count = 0;
                        this.multiTimeClick = 0;
                    }
                } else {
                    if (this.count === 1) {
                        this.selectOneLangFlag = false;
                        const LanguageAndVeteranInformationObj = this.eventDataToPut();
                        this.submitLanguageAndVeteran(LanguageAndVeteranInformationObj);
                    } else {
                        this.selectOneLangFlag = true;
                        this.count = 0;
                        this.multiTimeClick = 0;
                    }
                }
            }
        }
    }

    private submitForInternal() {
        const langAndVetObj: ApprovalVeteranData = {};
        const control = this.languageForm.controls;
        const masterData = {
            MinorityOwnedBusinessFlag: this.veteranInfo[0].MinorityOwnedBusinessFlag === 'YES' ? true : false,
            WomanOwnedBusinessFlag: this.veteranInfo[0].WomanOwnedBusinessFlag === 'YES' ? true : false,
            VeteranOwnedBusinessFlag: this.veteranInfo[0].VeteranOwnedBusinessFlag === 'YES' ? true : false,
            DisabledOwnedBusinessFlag: this.veteranInfo[0].DisabledOwnedBusinessFlag === 'YES' ? true : false,
            NonVeteranFlag: this.veteranInfo[0].AffidavitFlg ? this.veteranInfo[0].AffidavitFlg : false,
            VeteranPledgeCount: this.veteranInfo[0].VeteranPledgeCount,
            VeteranPledgeDate: this.veteranInfo[0].VeteranPledgeDate ? this._datePipe.transform(this.veteranInfo[0].VeteranPledgeDate, 'MM/dd/yyyy') : null,
            WorldLanguage: null,
        };

        if (this.visualCue.minorityOwned === false) {
            if (masterData.MinorityOwnedBusinessFlag !== control.minorityOwned.value) {
                langAndVetObj['MinorityOwnedBusinessFlag'] = control.minorityOwned.value === true ? 1 : 0;
            }
        }
        if (this.visualCue.womanOwned === false) {
            if (masterData.WomanOwnedBusinessFlag !== control.womanOwned.value) {
                langAndVetObj['WomanOwnedBusinessFlag'] = control.womanOwned.value === true ? 1 : 0;
            }
        }
        if (this.visualCue.veteranOwned === false) {
            if (masterData.VeteranOwnedBusinessFlag !== control.veteranOwned.value) {
                langAndVetObj['VeteranOwnedBusinessFlag'] = control.veteranOwned.value === true ? 1 : 0;
            }
        }
        if (this.visualCue.disableOwned === false) {
            if (masterData.DisabledOwnedBusinessFlag !== control.disableOwned.value) {
                langAndVetObj['DisabledOwnedBusinessFlag'] = control.disableOwned.value === true ? 1 : 0;
            }
        }
        if (this.visualCue.nonVeteranFlg === false) {
            if (masterData.NonVeteranFlag !== control.nonVeteranFlag.value) {
                langAndVetObj['NonVeteranFlag'] = control.nonVeteranFlag.value === true ? 1 : 0;
            }
        }
        if (this.visualCue.newEmpNum === false && control.newEmpNum.value) {
            if (masterData.VeteranPledgeCount !== Number(control.newEmpNum.value) && control.nonVeteranFlag.value === false) {
                langAndVetObj['VeteranPledgeCount'] = Number(control.newEmpNum.value);
            }
        }
        if (this.visualCue.pledgeDate === false && control.fromDate.value) {
            if (masterData.VeteranPledgeDate !== this._datePipe.transform(control.fromDate.value, 'MM/dd/yyyy') && control.nonVeteranFlag.value === false) {
                langAndVetObj['VeteranPledgeDate'] = control.fromDate.value ? this._datePipe.transform(control.fromDate.value, 'MM/dd/yyyy') : null;
            }
        }
        const languageSelectObj = this.internalLanguageSelected();
        if (languageSelectObj.length > 0) {
            langAndVetObj['WorldLanguage'] = languageSelectObj;
        }
        return langAndVetObj;
    }

    private internalLanguageSelected() {
        const languageObj: ApprovalWorldLanguage[] = [];
        this.langInfo.forEach((val, i) => {
            if (val.DuringBusinessHoursMultiLanguageFlag !== this.languageForm.controls['during_' + i].value && this.checkDuringFlag[i] !== true) {
                const duringLanguage = {
                    MultiLanguageNumber: val.DuringBusinessHoursMultiLanguageID,
                    MultiLanguageTypeNumber: val.DuringBusinessHoursMultiLanguageTypeID,
                    WorldLanguageNumber: val.WorldLanguageID,
                    MultiLanguageAnswer: this.languageForm.controls['during_' + i].value === true ? 1 : 0,
                    LanguageName: val.LanguageName,
                };
                languageObj.push(duringLanguage);
            }
            if (val.AfterBusinessHoursMultiLanguageFlag !== this.languageForm.controls['after_' + i].value && this.checkAfterFlag[i] !== true) {
                const afterLanguage = {
                    MultiLanguageNumber: val.AfterBusinessHoursMultiLanguageID,
                    MultiLanguageTypeNumber: val.AfterBusinessHoursMultiLanguageTypeID,
                    WorldLanguageNumber: val.WorldLanguageID,
                    MultiLanguageAnswer: this.languageForm.controls['after_' + i].value === true ? 1 : 0,
                    LanguageName: val.LanguageName,
                };
                languageObj.push(afterLanguage);
            }
        });
        return languageObj;
    }
    // back button route logic
    public async backButtonClick() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData(
                { currentPage: 'Language-Veteran Information Page', nextPage: 'coverage-profile-information' },
                null,
                'LanguageAndVeteranInfo/EditLangVeteranEventJsonData'
            );
            this._router.navigate(['/contractorRegistration/coverage-profile-information']);
            return;
        }
    }

    public async submitLanguageAndVeteran(languageAndVeteranInformation: ApprovalVeteranData) {
        this.count = 0;
        this.multiTimeClick = 0;
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.PageName = 'Language-Veteran Information Page';
        this.objProgram.CCOpsID = this.ccopsId;
        this.objProgram.Contr_ID = this.contrId;
        let url;
        const ccopsData = {
            LanguageAndVeteranInformation: languageAndVeteranInformation,
        };

        if (this.loggedInUserType !== 'Internal') {
            const finalObj = Object.keys(languageAndVeteranInformation).length > 0 ? ccopsData : null;
            await this._srvContractorData.saveContractorData(
                { currentPage: 'Language-Veteran Information Page', nextPage: 'surge-info' },
                finalObj,
                'LanguageAndVeteranInfo/EditLangVeteranEventJsonData'
            );
            this.crComments = await this._srvContractorData.getPageComments('Languages/Veterans/Minority Information');
            if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                this._router.navigate(['/existing-contractor/surge-info']);
            } else {
                if (Object.keys(languageAndVeteranInformation).length > 0) {
                    this.resetPage();
                }
            }
            return;
        }
        if (this.loggedInUserType === 'Internal') {
            url = 'JSON/EditJsonDataInternal';
            this.objProgram.ContractorResourceID = this._srvAuthentication.Profile.ContractorResourceID;
            this.objProgram.Contr_ID = this.contrId;
            this.objProgram.CCOpsData = JSON.stringify(ccopsData);
        }
        await this._srvLanguageVeteran.saveVeteranInfo(url, this.objProgram);
        this.resetPage();
    }
    private resetPage() {
        this.dataForApproval = null;
        this.langInfo = [];
        this.veteranInfo = [];
        this.checkDuringFlag = [];
        this.checkAfterFlag = [];
        this.addControlsFlag = false;
        this.pledgeError = false;
        this.selectOneLangFlag = false;
        this.languageForm.reset();
        this.getVeteranInfo();
    }

    private eventDataToPut() {
        const langAndVetObj: ApprovalVeteranData = {};
        const control = this.languageForm.controls;
        const newFormValue = {
            MinorityOwnedBusinessFlag: control.minorityOwned.value === true ? 1 : 0,
            WomanOwnedBusinessFlag: control.womanOwned.value === true ? 1 : 0,
            VeteranOwnedBusinessFlag: control.veteranOwned.value === true ? 1 : 0,
            DisabledOwnedBusinessFlag: control.disableOwned.value === true ? 1 : 0,
            NonVeteranFlag: control.nonVeteranFlag.value,
            VeteranPledgeCount: control.newEmpNum.value ? Number(control.newEmpNum.value) : control.newEmpNum.value,
            VeteranPledgeDate: this._datePipe.transform(control.fromDate.value, 'MM/dd/yyyy'),
        };
        const masterData = {
            MinorityOwnedBusinessFlag: this.veteranInfo[0].MinorityOwnedBusinessFlag === 'YES' ? 1 : 0,
            WomanOwnedBusinessFlag: this.veteranInfo[0].WomanOwnedBusinessFlag === 'YES' ? 1 : 0,
            VeteranOwnedBusinessFlag: this.veteranInfo[0].VeteranOwnedBusinessFlag === 'YES' ? 1 : 0,
            DisabledOwnedBusinessFlag: this.veteranInfo[0].DisabledOwnedBusinessFlag === 'YES' ? 1 : 0,
            NonVeteranFlag: this.veteranInfo[0].AffidavitFlg ? this.veteranInfo[0].AffidavitFlg : false,
            VeteranPledgeCount: this.veteranInfo[0].VeteranPledgeCount,
            VeteranPledgeDate: this.veteranInfo[0].VeteranPledgeDate ? this._datePipe.transform(this.veteranInfo[0].VeteranPledgeDate, 'MM/dd/yyyy') : null,
        };
        for (const key in newFormValue) {
            if (key in this.oldJsonData) {
                if (newFormValue[key] !== this.oldJsonData[key]) {
                    langAndVetObj[key] = newFormValue[key];
                }
            } else {
                if (newFormValue[key] !== masterData[key]) {
                    langAndVetObj[key] = newFormValue[key];
                }
            }
        }
        const languageSelectObj = this.eventLanguageSelected();
        if (languageSelectObj.length > 0) {
            langAndVetObj['WorldLanguage'] = languageSelectObj;
        }
        return langAndVetObj;
    }

    private eventLanguageSelected() {
        let languageObj: ApprovalWorldLanguage[] = [];
        this.langInfo.forEach((val, i) => {
            const index = this.oldJsonData['WorldLanguage']
                ? this.oldJsonData['WorldLanguage'].findIndex((elem) => elem.WorldLanguageNumber === val.WorldLanguageID && elem.MultiLanguageTypeNumber === 1)
                : -1;
            languageObj = this.languageSelectChange(index, val, i, languageObj, 1);
            const ind = this.oldJsonData['WorldLanguage']
                ? this.oldJsonData['WorldLanguage'].findIndex((ele) => ele.WorldLanguageNumber === val.WorldLanguageID && ele.MultiLanguageTypeNumber === 2)
                : -1;
            languageObj = this.languageSelectChange(ind, val, i, languageObj, 2);
        });
        return languageObj;
    }
    private languageSelectChange(index: number, val: Languages, i: number, languageObj: ApprovalWorldLanguage[], id: number) {
        if (index > -1) {
            const WorldLanguage = this.oldJsonData['WorldLanguage'];
            if (WorldLanguage[index]['MultiLanguageTypeNumber'] === 1 && id === 1) {
                if (WorldLanguage[index]['MultiLanguageAnswer'] !== this.languageForm.controls['during_' + i].value) {
                    const duringLanguage = {
                        MultiLanguageNumber: val.DuringBusinessHoursMultiLanguageID,
                        MultiLanguageTypeNumber: val.DuringBusinessHoursMultiLanguageTypeID,
                        WorldLanguageNumber: val.WorldLanguageID,
                        MultiLanguageAnswer: this.languageForm.controls['during_' + i].value === true ? 1 : 0,
                        LanguageName: val.LanguageName,
                    };
                    languageObj.push(duringLanguage);
                }
            } else if (WorldLanguage[index]['MultiLanguageTypeNumber'] === 2 && id === 2) {
                if (WorldLanguage[index]['MultiLanguageAnswer'] !== this.languageForm.controls['after_' + i].value) {
                    const afterLanguage = {
                        MultiLanguageNumber: val.AfterBusinessHoursMultiLanguageID,
                        MultiLanguageTypeNumber: val.AfterBusinessHoursMultiLanguageTypeID,
                        WorldLanguageNumber: val.WorldLanguageID,
                        MultiLanguageAnswer: this.languageForm.controls['after_' + i].value === true ? 1 : 0,
                        LanguageName: val.LanguageName,
                    };
                    languageObj.push(afterLanguage);
                }
            }
        } else {
            if (val.DuringBusinessHoursMultiLanguageFlag !== this.languageForm.controls['during_' + i].value && id === 1) {
                const duringLanguage = {
                    MultiLanguageNumber: val.DuringBusinessHoursMultiLanguageID,
                    MultiLanguageTypeNumber: val.DuringBusinessHoursMultiLanguageTypeID,
                    WorldLanguageNumber: val.WorldLanguageID,
                    MultiLanguageAnswer: this.languageForm.controls['during_' + i].value === true ? 1 : 0,
                    LanguageName: val.LanguageName,
                };
                languageObj.push(duringLanguage);
            }
            if (val.AfterBusinessHoursMultiLanguageFlag !== this.languageForm.controls['after_' + i].value && id === 2) {
                const afterLanguage = {
                    MultiLanguageNumber: val.AfterBusinessHoursMultiLanguageID,
                    MultiLanguageTypeNumber: val.AfterBusinessHoursMultiLanguageTypeID,
                    WorldLanguageNumber: val.WorldLanguageID,
                    MultiLanguageAnswer: this.languageForm.controls['after_' + i].value === true ? 1 : 0,
                    LanguageName: val.LanguageName,
                };
                languageObj.push(afterLanguage);
            }
        }
        return languageObj;
    }
    public keyPress(event) {
        const pattern = /[0-9\+\-\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode === 32) {
            return false;
        } else if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }
    onDateKeyPress(event) {
        return false;
    }
    duringChange() {
        const x: any = document.getElementsByClassName('lang-chk');
        const boolCollect: boolean[] = [];
        for (const chk of x) {
            boolCollect.push(chk.checked);
        }
        const index = boolCollect.findIndex((b) => b === true);
        this.selectOneLangFlag = index >= 0 ? false : true;
    }
    onFocusNewEmp() {
        if (this.languageForm.controls.nonVeteranFlag.value === false) {
            if (this.languageForm.controls.newEmpNum.value <= this.languageForm.controls.oldEmpNum.value) {
                this.pledgeError = true;
            } else {
                this.pledgeError = false;
            }
        }
    }
    onBlurFromDate() {
        if (this.languageForm.controls.newEmpNum.value && this.languageForm.controls.fromDate.value) {
            this.mandateFieldsFlag = false;
        }
    }
    onBlurNewEmpNum() {
        if (this.languageForm.controls.newEmpNum.value && this.languageForm.controls.fromDate.value) {
            this.mandateFieldsFlag = false;
        }
    }
}
