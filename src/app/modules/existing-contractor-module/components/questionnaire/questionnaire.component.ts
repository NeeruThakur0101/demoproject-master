import { Component, ElementRef, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { CorrectionRequestComments } from 'src/app/core/models/user.model';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { QuestionnariresModel, QuestionnariresPageModel, QuestionnariresDataModel, QuestionnariresDBDataModel } from './model';
import { QuestionnaireDataService } from './questionnaire.service';

@Component({
    selector: 'app-questionnaire',
    templateUrl: './questionnaire.component.html',
    styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;

    public pageContent: any;
    public checked = false;
    public QuestionnarireFormGroup: FormGroup;
    public loginDetails: Array<SessionUser> = [];
    public resourceId: number;
    public ContrID: number;
    public originalDBdata: QuestionnariresDBDataModel = {} as QuestionnariresDBDataModel;
    public switchQuestionAnswer: any = false;
    public Page: QuestionnariresPageModel = {};
    public jsonData: QuestionnariresDataModel = {};
    public showData: boolean = false;
    public loggedInUserType: string;
    public ChildParentVisualCue: boolean = false;
    public submitted: boolean = false;
    public crComments: CorrectionRequestComments[];
    public toggleDisable: boolean = false;
    public isInternal: boolean = false;

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    public accessReadonly: boolean;

    constructor(
        public _srvAuthentication: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _srvContractorData: ContractorDataService,
        private _srvQuestionnaireData: QuestionnaireDataService,
        private renderer: Renderer2,
        private _srvUniversal: UniversalService,
        private _srvDialog: DialogService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.loginDetails = Array(this._srvAuthentication.Profile);
    }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    async ngOnInit() {
        this.isInternal = this._srvAuthentication.LoggedInUserType === 'Internal' ? true : false;
        await this.pageData();
        this.crComments = await this._srvContractorData.getPageComments('Contractor Questionnaire Page');
        this.checkPrivilage();
        setTimeout(() => {
            this.heightCalculate();
        }, 1000);
    }

    async pageData() {
        this.showData = true;
        this.Page.PAGEJSON = {}; // this is your single source of data
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.ContrID = this.loginDetails[0].ContrID;
        }

        this.originalDBdata = await this.getDBJson();
        this.Page.DBJSON = JSON.parse(JSON.stringify(this.originalDBdata)); // this is DB Data

        this.jsonData = await this.getContractorJson();
        this.Page.ContractorJSON = this.jsonData; // this is Contr JSON Pending for Approval

        // if contractor data exist, then call merge function else add DB data to the page
        if (this.Page.ContractorJSON != null) {
            this.Page.PAGEJSON = this.mergeData(this.Page.DBJSON, this.Page.ContractorJSON.ContractorQuestionnaire); // mergeData will return an array/object
        } else {
            this.Page.PAGEJSON = this.originalDBdata;
        }

        this.QuestionnarireFormGroup = this._formBuilder.group({
            ContractorQuestionnaire: this._formBuilder.group({
                ParentContractorQuestions: this._formBuilder.array([]),
                ChildContractorQuestions: this._formBuilder.array([]),
            }),
        });
        this.patch();
        this.parentPatch();
        this.toggleValidator();
        this.showData = false;
    }

    private checkPrivilage(): void {
        if (this.ContrID > 0) {
            const accessType = this._srvAuthentication.getPageAccessPrivilege('Contractor Questionnaire');

            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.accessReadonly = true;
                    this.QuestionnarireFormGroup.disable();
                } else {
                    this.showData = true;
                    const dialogRef = this._srvDialog.open({
                        appendTo: this.containerRef,
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `<div class="modal-alert info-alert">
          <h2>${this.pageContent.Questionnaire.Access_Denied}</h2>
          <p>${this.pageContent.Questionnaire.Access_Permission}</p>
         </div>`;
                    dialogRef.result.subscribe((val) => {
                        // to show selected jump to value
                        // end
                        this._router.navigate(['contractorRegistration/company-information']);
                    });
                }
            }
        }
    }

    toggleValidator() {
        if (this.formParentDetails.value[0].QuestionAnswer) {
            const groupItems: any = (this.QuestionnarireFormGroup.controls.ContractorQuestionnaire.get('ChildContractorQuestions') as FormArray).controls;
            for (const item of groupItems) {
                item.controls['QuestionAnswer'].setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(5)]);
                item.controls['QuestionAnswer'].updateValueAndValidity();
            }
        }
        this.formParentDetails.valueChanges.subscribe((checked) => {
            const groupItems: any = (this.QuestionnarireFormGroup.controls.ContractorQuestionnaire.get('ChildContractorQuestions') as FormArray).controls;
            if (!checked[0].QuestionAnswer) {
                this.submitted = false;
                for (const item of groupItems) {
                    item.controls['QuestionAnswer'].setValue(null);
                    item.controls['QuestionAnswer'].clearValidators();
                    item.controls['QuestionAnswer'].updateValueAndValidity();
                }
            } else {
                for (const item of groupItems) {
                    item.controls['QuestionAnswer'].clearValidators();
                    item.controls['QuestionAnswer'].setValue(null);
                    item.controls['QuestionAnswer'].setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(5)]);
                    item.controls['QuestionAnswer'].updateValueAndValidity();
                }
            }
        });
    }

    public getDBJson(): Promise<QuestionnariresDBDataModel> {
        return new Promise(async (resolve, reject) => {
            const DBResponse = await this._srvQuestionnaireData.getDbData(this.loginDetails[0]);
            resolve(DBResponse);
        });
    }

    public getContractorJson(): Promise<QuestionnariresDataModel> {
        return new Promise(async (resolve, reject) => {
            const jsonReponse = await this._srvQuestionnaireData.getEventPageJSON(this.loginDetails[0]);
            if (jsonReponse && jsonReponse[0] && jsonReponse[0].CCOpsData) {
                this.jsonData = JSON.parse(jsonReponse[0].CCOpsData).ContractorData;

                this.toggleDisable = this.jsonData.ContractorQuestionnaire.IsToggleValueDisable;
                resolve(this.jsonData);
            } else {
                resolve(null);
            }
        });
    }

    public numberOnly(event) {
        const pattern = /[0-9\+\-\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode === 32 || inputChar === '-' || inputChar === '+') {
            return false;
        } else if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    // this code map or merges the Contractor-Data and DB-Data
    public mergeData(dbInfo, contractorData): QuestionnariresDataModel {
        const dbData = JSON.parse(JSON.stringify(dbInfo));
        const ParentContractorQuestions: QuestionnariresModel[] = [];
        const ChildContractorQuestions: QuestionnariresModel[] = [];
        let result = {};

        dbData.ParentContractorQuestions.map((el, i) => {
            const parent =
                contractorData.ParentContractorQuestions &&
                contractorData.ParentContractorQuestions.find((val) => {
                    return val.QuestionTypeNumber === el.QuestionTypeNumber;
                });
            if (parent) {
                parent.visualCue = true;
                parent.QuestionTypeName = el.QuestionTypeName;
                ParentContractorQuestions.push(parent);
            } else {
                el.visualCue = false;
                ParentContractorQuestions.push(el);
            }
        });

        dbData.ChildContractorQuestions.map((el, i) => {
            const childKey = contractorData.ChildContractorQuestions ? 'ChildContractorQuestions' : 'RemovedContractorQuestions';
            const child = contractorData[childKey].find((val) => {
                return val.QuestionTypeNumber === el.QuestionTypeNumber;
            });
            if (child) {
                child.visualCue = true;
                child.QuestionTypeName = el.QuestionTypeName;
                this.ChildParentVisualCue = true;
                ChildContractorQuestions.push(child);
            } else {
                el.visualCue = false;
                ChildContractorQuestions.push(el);
            }
        });

        result = { ParentContractorQuestions, ChildContractorQuestions };
        return result;
    }

    patch() {
        const control = this.QuestionnarireFormGroup.get('ContractorQuestionnaire.ChildContractorQuestions') as FormArray;
        this.Page.PAGEJSON.ChildContractorQuestions.forEach((x) => {
            control.push(this.patchValues(x.QuestionTypeName, x.QuestionAnswer, x.QuestionTypeNumber, x.visualCue, false, x.IsQuestionAnswerDisable));
        });
    }

    parentPatch() {
        const controlP = this.QuestionnarireFormGroup.get('ContractorQuestionnaire.ParentContractorQuestions') as FormArray;
        this.Page.PAGEJSON.ParentContractorQuestions.forEach((x) => {
            controlP.push(this.patchValues(x.QuestionTypeName, (x.QuestionAnswer = x.QuestionAnswer === 'true' ? true : false), x.QuestionTypeNumber, x.visualCue, false, x.IsQuestionAnswerDisable));
        });
    }

    patchValues(label, value, id, toggle, validate, IsDisable) {
        return this._formBuilder.group({
            QuestionTypeNumber: [id],
            QuestionTypeName: [label],
            QuestionAnswer: [value, validate ? [Validators.required, Validators.minLength(1), Validators.maxLength(5)] : null],
            visualCue: [toggle],
            IsQuestionAnswerDisable: IsDisable,
        });
    }

    get formDetails() {
        return this.QuestionnarireFormGroup.get('ContractorQuestionnaire.ChildContractorQuestions') as FormArray;
    }
    get formParentDetails() {
        return this.QuestionnarireFormGroup.get('ContractorQuestionnaire.ParentContractorQuestions') as FormArray;
    }

    public backButtonClick() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            this._srvContractorData.saveContractorData({ currentPage: 'Contractor Questionnaire', nextPage: 'surge-info' }, null, 'QuestionnaireAnswer/EditQuestionnaireAnswerEventJsonData');
            this._router.navigate(['/existing-contractor/surge-info']);
            return;
        }
    }

    async OnSubmit(value, valid) {
        if (!valid) {
            this.submitted = true;
            return;
        }

        let oldData = this.Page.ContractorJSON && this.Page.ContractorJSON.ContractorQuestionnaire ? this.Page.ContractorJSON.ContractorQuestionnaire : null;
        const DbData = this.Page.DBJSON;
        const ParentContractorQuestionsArray: QuestionnariresModel[] = [];
        const ChildContractorQuestionsArray: QuestionnariresModel[] = [];

        // this code represent the comparison logic of old and DB data of Parent-Contractor-Question
        if (value.ContractorQuestionnaire.hasOwnProperty('ParentContractorQuestions')) {
            value.ContractorQuestionnaire.ParentContractorQuestions.forEach((element) => {
                let obj: QuestionnariresModel = {};

                if (oldData || DbData) {
                    if (oldData != null && oldData.ParentContractorQuestions) {
                        const parentQuestionIndex = oldData.ParentContractorQuestions.findIndex((ap) => ap.QuestionTypeNumber === element.QuestionTypeNumber);

                        if (oldData.ParentContractorQuestions[parentQuestionIndex].QuestionAnswer !== element.QuestionAnswer) {
                            obj = {
                                QuestionTypeNumber: element.QuestionTypeNumber,
                                QuestionTypeName: element.QuestionTypeName,
                                QuestionAnswer: String(element.QuestionAnswer),
                            };
                            ParentContractorQuestionsArray.push(obj);
                        }
                    } else if (DbData.ParentContractorQuestions.find((db) => db.QuestionTypeNumber === element.QuestionTypeNumber)) {
                        const parentQuestionDBIndex = DbData.ParentContractorQuestions.findIndex((db) => db.QuestionTypeNumber === element.QuestionTypeNumber);
                        const elementData = String(element.QuestionAnswer);
                        if (DbData.ParentContractorQuestions[parentQuestionDBIndex].QuestionAnswer !== elementData) {
                            obj = {
                                QuestionTypeNumber: element.QuestionTypeNumber,
                                QuestionTypeName: element.QuestionTypeName,
                                QuestionAnswer: String(element.QuestionAnswer),
                            };
                            ParentContractorQuestionsArray.push(obj);
                        }
                    }
                }
            }); // end of parent-foreach
        } // end of master parent-if

        // here we are fetching flag value of Parent-Contractor-Question
        const parentFlagValue = value.ContractorQuestionnaire.ParentContractorQuestions.find((ap) => ap.QuestionTypeNumber);

        // if the flag value is 'true' then only it creates Child-Contractor-Question array otherwise it won't
        if (parentFlagValue.QuestionAnswer === true) {
            // this code represent the comparison logic of old and DB data of Child-Contractor-Question
            if (value.ContractorQuestionnaire.hasOwnProperty('ChildContractorQuestions')) {
                value.ContractorQuestionnaire.ChildContractorQuestions.forEach((element) => {
                    let obj: QuestionnariresModel = {};

                    if (oldData || DbData) {
                        if (oldData != null && oldData.ChildContractorQuestions) {
                            const childQuestionIndex = oldData.ChildContractorQuestions.findIndex((ap) => ap.QuestionTypeNumber === element.QuestionTypeNumber);
                            if (childQuestionIndex !== -1) {
                                if (oldData.ChildContractorQuestions[childQuestionIndex].QuestionAnswer !== element.QuestionAnswer) {
                                    obj = {
                                        QuestionTypeNumber: element.QuestionTypeNumber,
                                        QuestionTypeName: element.QuestionTypeName,
                                        QuestionAnswer: element.QuestionAnswer,
                                    };
                                    ChildContractorQuestionsArray.push(obj);
                                }
                            } else {
                                const childQuestionElseIndex = DbData.ChildContractorQuestions.findIndex((db) => db.QuestionTypeNumber === element.QuestionTypeNumber);
                                if (DbData.ChildContractorQuestions[childQuestionElseIndex].QuestionAnswer !== element.QuestionAnswer) {
                                    obj = {
                                        QuestionTypeNumber: element.QuestionTypeNumber,
                                        QuestionTypeName: element.QuestionTypeName,
                                        QuestionAnswer: element.QuestionAnswer,
                                    };
                                    ChildContractorQuestionsArray.push(obj);
                                }
                            }
                        } else if (DbData.ChildContractorQuestions.find((db) => db.QuestionTypeNumber === element.QuestionTypeNumber)) {
                            const childQuestionDBIndex = DbData.ChildContractorQuestions.findIndex((db) => db.QuestionTypeNumber === element.QuestionTypeNumber);

                            if (DbData.ChildContractorQuestions[childQuestionDBIndex].QuestionAnswer !== element.QuestionAnswer) {
                                obj = {
                                    QuestionTypeNumber: element.QuestionTypeNumber,
                                    QuestionTypeName: element.QuestionTypeName,
                                    QuestionAnswer: element.QuestionAnswer,
                                };
                                ChildContractorQuestionsArray.push(obj);
                            }
                        }
                    }
                }); // end of child-foreach
            } // end of master child-if
        } // end of master flag if

        oldData = {};
        if (parentFlagValue.QuestionAnswer === true) {
            if (ParentContractorQuestionsArray.length > 0 && ChildContractorQuestionsArray.length > 0) {
                oldData = { ContractorNumber: this.ContrID, ParentContractorQuestions: ParentContractorQuestionsArray, ChildContractorQuestions: ChildContractorQuestionsArray };
            } else if (ChildContractorQuestionsArray.length > 0) {
                oldData = { ChildContractorQuestions: ChildContractorQuestionsArray };
            }
        } else if (ParentContractorQuestionsArray.length > 0 && (this.Page.ContractorJSON || this.Page.DBJSON.ParentContractorQuestions[0].QuestionAnswer !== null)) {
            value.ContractorQuestionnaire.ChildContractorQuestions.forEach((element) => {
                delete element.visualCue;
                element.QuestionAnswer = null;
            });
            oldData = { ContractorNumber: this.ContrID, ParentContractorQuestions: ParentContractorQuestionsArray, RemovedContractorQuestions: value.ContractorQuestionnaire.ChildContractorQuestions };
        }

        if (this.loggedInUserType !== 'Internal') {
            const ccopsData = { ContractorQuestionnaire: oldData };
            const finalObj = Object.keys(oldData).length > 0 ? ccopsData : null;
            await this._srvContractorData.saveContractorData({ currentPage: 'Contractor Questionnaire', nextPage: 'credential' }, finalObj, 'QuestionnaireAnswer/EditQuestionnaireAnswerEventJsonData');
            this.crComments = await this._srvContractorData.getPageComments('Contractor Questionnaire Page');
            await this.pageData();

            if (this._srvAuthentication.Profile.EventName !== 'No Event') {
                this._router.navigate(['/existing-contractor/credentialing-info']);
            }
        } else {
            const ccopsData = { ContractorQuestionnaire: oldData };
            const reqObj: any = {
                ResourceId: this.resourceId,
                CCOpsData: JSON.stringify(ccopsData),
                Contr_ID: this.ContrID,
                PageName: 'Contractor Questionnaire',
            };
            await this._srvQuestionnaireData.saveInternalData(reqObj);
            this.pageData();
        }
    }
}
