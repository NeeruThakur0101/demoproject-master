import { Component, Input, OnInit } from '@angular/core';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractorLegalIssueItem, Control, ControlConfig, County, FormDialogConfig, LegalIssueDetailItem, LegalIssueEntryItem, OwnershipInformation } from '../models';
import { LegalService } from '../legal.service';
import * as moment from 'moment';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, PageAccess, SessionUser } from 'src/app/core/services/authentication.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
const controlMap = {
    Text: { value: 'FieldDetailText', type: 'Text' },
    TEXT: { value: 'FieldDetailText', type: 'Textarea' },
    INT: { value: 'FieldDetailInt', type: 'Dropdown' },
    DATE: { value: 'FieldDetailDate', type: 'Datepicker' },
    Boolean: { value: 'FieldDetailBoolean', type: 'Switch' },
    Textarea: { type: 'TEXT' },
    Dropdown: { type: 'INT' },
    Datepicker: { type: 'DATE' },
    Switch: { type: 'Boolean' },
};

@Component({
    selector: 'dynamic-form-popup',
    styleUrls: ['../legal.scss'],
    template: `
        <div class="page-loader" *ngIf="loadingState"><span class="k-i-loading"></span></div>
        <kendo-dialog-titlebar class="hasDialog">
            <h1>
                {{ pageContent.Legal_Item_Information.Legal_Issue_File_Details }} – <span style="text-transform: capitalize">{{ config.tab.LegalIssueTypeTitle }}</span>
            </h1>
            <button type="button" (click)="onClose()">&times;</button>
        </kendo-dialog-titlebar>
        <div class="popup-content">
            <div class="outer-block">
                <div class="inner-block">
                    <div class="white-block">
                        <div class="legal-popup-topbaar">
                            <h3 *ngIf="config.owner.ContrEmployeeTypeId !== 0">
                                {{ pageContent.Legal_Item_Information.Principal_Owner }}: <span>{{ config.owner.OwnershipName }}</span>
                            </h3>
                            <h3>
                                {{ pageContent.Legal_Item_Information.Contractor }}: <span>{{ _srvLegal.LegalPage.PageObj[0].OwnershipName }}</span>
                            </h3>
                            <div class="litigation-listing" *ngIf="isDocumentSectionAvailable(config.IssueItem?.LegalIssueEntry)">
                                <ul class="uploaded-documents">
                                    <ng-container *ngFor="let entry of config.IssueItem.LegalIssueEntry; let i = index">
                                        <li class="col" *ngIf="!entry.DeletedFlag || _srvLegal.Profile.ContrID !== 0">
                                            <div [ngClass]="[visualCueOnEntryCard(entry) ? 'visual-cue' : '']">
                                                <input
                                                    type="radio"
                                                    [id]="'entry-' + [entry.ID ? entry.ID : entry.LegalIssueEntryID]"
                                                    class="k-radio entry-item"
                                                    [value]="i"
                                                    name="LegalIssueEntryItem"
                                                    (change)="genratePageFormConfig(entry.ID || entry.LegalIssueEntryID)"
                                                    (click)="getEntry(entry)"
                                                />
                                                <label [for]="'entry-' + [entry.ID ? entry.ID : entry.LegalIssueEntryID]">
                                                    <small [innerHTML]="entry.selectedDate"></small>
                                                </label>
                                                <button
                                                    class="deleteBTN"
                                                    kendoButton
                                                    icon="delete"
                                                    *ngIf="
                                                        (this._srvLegal.Profile.ContrID !== 0 && entry.pendingApproval && entry.DeletedFlag) || disableInReadAccess
                                                            ? false
                                                            : true && buttonStatusInEvent(entry.ID)
                                                    "
                                                    (click)="deleteLegalIssueEntry(entry)"
                                                ></button>
                                            </div>
                                        </li>
                                    </ng-container>
                                </ul>
                            </div>
                        </div>
                        <form [formGroup]="form" *ngIf="form" novalidate>
                            <ng-container *ngFor="let control of controlSet">
                                <dynamic-form *ngIf="control" [Control]="control" [form]="form"></dynamic-form>
                            </ng-container>

                            <section class="rep-action-btn">
                                <button kendoButton type="button" [disabled]="!form.valid || disableInReadAccess || !buttonStatusInEvent(entry?.ID)" (click)="onSubmit(true)">
                                    {{ pageContent.Legal_Item_Information.Save_Add_Another }}
                                </button>
                                <button kendoButton type="button" [disabled]="!form.valid || disableInReadAccess || !buttonStatusInEvent(entry?.ID)" (click)="onSubmit(false)" [primary]="true">
                                    {{ pageContent.Legal_Item_Information.Legal_Save }}
                                </button>
                            </section>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class DynamicFormPopupComponent extends DialogContentBase implements OnInit {
    @Input() config: FormDialogConfig;
    form: FormGroup;
    loadingState: boolean = false;
    controlSet: Control[];
    initialControlSet: Control[];
    pageContent: any;
    entry: LegalIssueEntryItem;
    isDisableInEvent: boolean = false;
    hideDeleteInEvent: boolean = true;
    public loginDetailsInternal: SessionUser;
    public disableInReadAccess: boolean = false;
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };

    constructor(
        public _dialogRef: DialogRef,
        public _srvLegal: LegalService,
        private _formBuilder: FormBuilder,
        public _dialog: DialogService,
        public _language: InternalUserDetailsService,
        private _srvAuthentication: AuthenticationService,
        public intlService: IntlService
    ) {
        super(_dialogRef);
    }

    ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService>this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.loginDetailsInternal = this._srvAuthentication.ProfileInternal;
        this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Legal Questions');
        // language code
        this.pageContent = this._language.getPageContentByLanguage();
        this.genratePageFormConfig();
        this.readAccess();
    }
    // disable everything in read only access
    readAccess() {
        if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess && this._srvLegal.Profile.ContrID > 0) {
            this.disableInReadAccess = true;
            this.controlSet.forEach((control) => (control.disable = true));
        }
    }
    customDateFormat(dateStr: string) {
        return dateStr['replaceAll']('-', '/');
    }

    visualCueOnEntryCard(entry: LegalIssueEntryItem) {
        if (entry.pendingApproval && (entry.LegalIssueDetail.some((res) => res.hasOwnProperty('pendingApproval')) || entry.DeletedFlag)) return true;
        else return false;
    }

    isDocumentSectionAvailable(entries: LegalIssueEntryItem[]): boolean {
        if (entries === null) {
            return false;
        }

        // added to replace the above commented code
        const deletedEntryLength = entries.filter((e) => e.DeletedFlag && !e.pendingApproval).length;
        if (deletedEntryLength === entries.length) {
            return false;
        }
        return true;
    }

    // Genrate form
    async genratePageFormConfig(entryID: string | number = null) {
        // Show page loader
        this.loadingState = true;

        const fieldSet = {};
        this.controlSet = [];
        this.initialControlSet = [];
        for (const cnt of this.config.formControlConfig) {
            const control = this.genrateControlFromFieldConfig(cnt, entryID);
            if (control) {
                if (this._srvLegal.Profile.UserType !== 'Internal') {
                    if (control.contrExclFlg) {
                        continue;
                    }
                }

                if (control.type === 'Dropdown') {
                    control.handler = this.dropdownSelectionChange.bind(this);
                    if (control.options) {
                        control.value = control.options.find((o) => o.value === control.value);
                    } else {
                        if (control.labelForCondition === 'County') {
                            const state = this.controlSet.find((c) => c.labelForCondition === 'State/Province');
                            if (state && state.value) {
                                const counties: County[] = await this._srvLegal.getCountiesByStateID(state.value.value);
                                control.options = counties.map((o) => {
                                    return { text: o.Name, value: o.ID };
                                });
                                control.value = control.options.find((o) => o.value === control.value);
                            }
                        } else if (control.labelForCondition === 'Resolved') {
                            control.options = cnt.Option.map((o) => {
                                return { text: o.Name, value: o.ID };
                            });
                        } else {
                            control.value = undefined;
                        }
                    }
                }

                if (control.labelForCondition === 'Bankruptcy Discharged' && control.type === 'Switch') {
                    control.value = control.value || false;
                    control.handler = this.manageBankruptcyDischarged.bind(this);
                }

                if (control.labelForCondition === 'Discharge Date') {
                    const toggle = this.controlSet.find((c) => c.labelForCondition === 'Bankruptcy Discharged');
                    if (toggle && toggle.value !== true) {
                        continue;
                    }
                }

                this.controlSet = [...this.controlSet, control];

                if (control.type === 'Text' || control.type === 'Textarea') {
                    let field;
                    if (this._srvLegal.Profile.UserType === 'Internal') {
                        field = this._formBuilder.control(control.value);
                    } else {
                        field = this._formBuilder.control(control.value, [control.required ? Validators.required : null]);
                    }
                    fieldSet[control.label] = field;
                } else {
                    fieldSet[control.label] = this._formBuilder.control(control.value, control.required ? Validators.required : null);
                }
            }
            // to disable form in event disability functionality
            if (this.form !== undefined && entryID !== null && this._srvLegal.Profile.ContrID > 0 && this._srvLegal.Profile.UserType !== 'Internal') this.disableEntriesInEvent(entryID);
        }
        // to diasble form as per readacceess
        this.readAccess();
        // Insert unique identifier
        fieldSet['ID'] = this._formBuilder.control(entryID || this.genUID(), Validators.required);
        // Create form group from form fields
        this.form = this._formBuilder.group(fieldSet);
        // Hide parent component loader
        this.loadingState = false;
    }

    // Create control object from data and field config.
    genrateControlFromFieldConfig(cnt: ControlConfig, entryID: string | number = null) {
        const obj: Control = {};

        if (cnt.LegalIssueFieldTypeDescription === 'Submit') {
            return false;
        }
        obj.type = controlMap[cnt.LegalIssueFieldTypeDescription]['type'];
        obj.label = cnt.LegalIssueFieldTypeTitleTranslated;
        obj.required = cnt.MandatoryFlag;
        obj.fieldTypeID = cnt.LegalIssueFieldTypeID;
        obj.contrExclFlg = cnt.ContrExclFlg;
        obj.labelForCondition = cnt.LegalIssueFieldTypeTitle;

        if (entryID !== null) {
            const data = this.config.IssueItem.LegalIssueEntry.find((e) => (e.ID ? e.ID === entryID : e.LegalIssueEntryID === entryID)).LegalIssueDetail.find(
                (c) => c.LegalIssueFieldTypeID === cnt.LegalIssueFieldTypeID
            );
            if (data) {
                obj.readonly = data.disable;
                obj.value = data[controlMap[cnt.LegalIssueFieldTypeDescription]['value']] || null;
                if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                    obj.pendingApproval = data.pendingApproval;
                }
                if (this._srvLegal.Profile.UserType === 'Internal') {
                    obj.pendingApproval = data.pendingApproval;

                    //  marking field readonly in case changes in a field are pending for approval or the whole entry is deleted
                    obj.readonly = data.pendingApproval || data.disable ? true : false;
                }
                // Dropdown
                if (cnt.LegalIssueFieldTypeDescription === 'INT' && cnt.Option) {
                    obj.options = cnt.Option.map((o) => {
                        return { text: o.Name, value: o.ID };
                    });
                }
                // Datepicker
                if (cnt.LegalIssueFieldTypeDescription === 'DATE' && obj.value !== null) {
                    // to make date valid accross browsers-----------------------
                    const dateOfBirth = obj.value.replace(new RegExp(/-/gm), '/'); //Change all '-' to '/'
                    obj.value = obj.value !== null && obj.value !== 'Invalid date' ? new Date(dateOfBirth) : null;
                    //--------------------------------
                }
            }
        } else {
            if (cnt.Option) {
                obj.options = cnt.Option.map((o) => {
                    return { text: o.Name, value: o.ID };
                });
            }
        }

        if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal' && entryID) {
            const CntrLegalIssueItm = this._srvLegal.LegalPage.DB_JSON.find((i) => i.ContactEmail === this.config.owner.ContactEmail).ContractorLegalIssue.find(
                (i) => i.LegalIssueTypeID === this.config.tab.LegalIssueTypeID
            );
            if (CntrLegalIssueItm) {
                const entryItm = CntrLegalIssueItm.LegalIssueEntry.find((e) => (e.ID ? e.ID === entryID : e.LegalIssueEntryID === entryID));
                if (entryItm) {
                    const detailItm = entryItm.LegalIssueDetail.find((i) => i.LegalIssueFieldTypeID === obj.fieldTypeID);
                    if (detailItm) {
                        const iObj = JSON.parse(JSON.stringify(obj));
                        iObj.value = detailItm[controlMap[cnt.LegalIssueFieldTypeDescription]['value']];
                        this.initialControlSet.push(iObj);
                    }
                }
            }
        }

        return obj;
    }

    // Process for dropdown selection change
    async dropdownSelectionChange(control: Control) {
        // Show page loader
        this.loadingState = true;

        const countyControl = this.controlSet.find((c) => c.labelForCondition === 'County');
        if (control.labelForCondition === 'State/Province' && control.value && countyControl) {
            const counties: County[] = await this._srvLegal.getCountiesByStateID(control.value.value);
            countyControl.options = counties.map((o) => {
                return { text: o.Name, value: o.ID };
            });
            this.form.controls[countyControl.label].setValue(null);
        }

        // Hide page loader
        this.loadingState = false;
    }

    // Process for bankruptcy discharged toggle state change
    manageBankruptcyDischarged(control: Control) {
        if (control.value) {
            const { LegalIssueFieldTypeID, LegalIssueFieldTypeTitleTranslated, MandatoryFlag } = this.config.formControlConfig.find((field) => field.LegalIssueFieldTypeID === 12);
            // const field = { fieldTypeID: 12, label: 'Discharge Date', required: true, type: 'Datepicker' };
            const field = { fieldTypeID: LegalIssueFieldTypeID, label: LegalIssueFieldTypeTitleTranslated, required: MandatoryFlag, type: 'Datepicker' };
            this.controlSet.push(field);
            this.form.addControl(field.label, this._formBuilder.control(null, field.required ? Validators.required : null));
        } else {
            const dischargeControl = this.controlSet.find((c) => c.labelForCondition === 'Discharge Date');
            const index = this.controlSet.findIndex((c) => c.labelForCondition === 'Discharge Date');
            this.controlSet.splice(index, 1);
            this.form.removeControl(dischargeControl.label);
        }
    }

    getEntry(entry: LegalIssueEntryItem) {
        this.entry = entry;
    }

    // to disable in case of event
    disableEntriesInEvent(entryID: string | number = null) {
        for (const legalIssue of this.config.IssueItem.LegalIssueEntry) {
            if (legalIssue.IsLegalIssueDetailDisable && (legalIssue.ID === entryID || legalIssue.LegalIssueEntryID === entryID)) {
                this.controlSet.forEach((control) => (control.disable = true));
                this.isDisableInEvent = true;
            }
        }
    }
    // to hide delete button on load of dialog in case of event disability
    buttonStatusInEvent(entryId: string | number = null) {
        if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal' && this.config.IssueItem) {
            for (const legalIssue of this.config.IssueItem.LegalIssueEntry) {
                if (legalIssue.IsLegalIssueDetailDisable && legalIssue.ID === entryId) {
                    return false;
                }
            }
        }
        return true;
    }

    // Process for form submit
    async onSubmit(addMultipleEntry: boolean = false) {
        if (!this.form.dirty) {
            if (addMultipleEntry) {
                // Genrate new form
                this.genratePageFormConfig(null);
                this.loadingState = true;

                // Update Background data
                this.config.updateBackgroundData();
                setTimeout(() => {
                    for (const e of document.getElementsByClassName('entry-item') as any) {
                        e.checked = false;
                    }
                    this.loadingState = false;
                }, 200);
            } else {
                await this._srvLegal.ContractorDataOperation(null, 'legal-questions');
                this._srvLegal.getLegalComments();
                this.dialog.close({ result: true });
                this.loadingState = false;
            }
            return;
        }
        this.loadingState = true;
        let canSaveForm = true;
        this._srvLegal.LegalPage.DB_JSON.forEach((o) => {
            if (o.ContactEmail === this.config.owner.ContactEmail) {
                if (this.config.IssueItem && this.config.IssueItem.ContractorLegalIssueID === null) {
                    canSaveForm = false;
                }
            }
        });
        if (this.entry && this.entry.pendingApproval) {
            canSaveForm = false;
        }

        if (!canSaveForm && this._srvLegal.Profile.UserType === 'Internal') {
            this.loadingState = false;
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 500 });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Legal_Item_Information.Global_Alert_Header_Warning}</h2>
                    <p>${this.pageContent.Legal_Item_Information.Inserting_Updating_Entries}</p>
                </div>
            `;
            return;
        }

        // Check if already an entry for update or a new entry for save
        this.findOrGenrateContractorLegalIssueItem();
        // Grab ownership item for manipulation
        const owner: OwnershipInformation = this._srvLegal.LegalPage.PageObj.find((o) => o.ContactEmail === this.config.owner.ContactEmail);

        if (owner.ContractorLegalIssue) {
            const index = owner.ContractorLegalIssue.findIndex((item) => item.LegalIssueTypeID === this.config.tab.LegalIssueTypeID);
            if (index !== -1) {
                owner.ContractorLegalIssue[index] = this.config.IssueItem;
            } else {
                owner.ContractorLegalIssue.push(this.config.IssueItem);
            }
        } else {
            owner.ContractorLegalIssue = [this.config.IssueItem];
        }

        owner.LegalIssueFlag = 'Y';
        owner.ContractorLegalIssue.filter((c) => c.LegalIssueTypeID === this.config.tab.LegalIssueTypeID).forEach((c) => {
            c.LegalIssueEntry.forEach((e) => {
                if (!e.DeletedFlag) {
                    e.ActiveFlag = true;
                    c.ActiveFlag = true;
                }
            });
        });

        // Post data to db
        if (this._srvLegal.Profile.ContrID === 0) {
            await this._srvLegal.SaveData();
        }

        // Check if save or add another
        if (addMultipleEntry) {
            // Genrate new form
            this.genratePageFormConfig(null);
            this.loadingState = true;

            // Update Background data
            this.config.updateBackgroundData();
            setTimeout(() => {
                for (const e of document.getElementsByClassName('entry-item') as any) {
                    e.checked = false;
                }
                this.loadingState = false;
            }, 200);
        } else {
            this.dialog.close({ result: true });
            this.loadingState = false;
        }
    }

    // find or genrate new contractor legal issue item and its entry
    async findOrGenrateContractorLegalIssueItem() {
        let entry: LegalIssueEntryItem = this.config.IssueItem
            ? this.config.IssueItem.LegalIssueEntry.find((e) => (e.ID ? e.ID === this.form.value.ID : e.LegalIssueEntryID === this.form.value.ID))
            : undefined;

        // Return if user tries to save deleted entry;
        if (entry && entry.DeletedFlag) {
            return;
        }

        if (entry) {
            entry.ModifyDate = moment().format('MM-DD-YYYY');
            if (this._srvLegal.Profile.UserType === 'Internal') {
                entry.ModifyResourceID = this.loginDetailsInternal.ResourceID;
            } else {
                entry.ModifyResourceID = this._srvLegal.Profile.ResourceID;
            }
            entry.ActiveFlag = true;
            this.config.IssueItem.ActiveFlag = true;
            this.config.IssueItem.RemoveDate = null;
            this.config.IssueItem.RemoveResourceID = null;
            if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                this.config.IssueItem.pendingApproval = true;
                entry.pendingApproval = true;
            }
        } else {
            if (this.config.IssueItem) {
                this.config.IssueItem.ActiveFlag = true;
                // create new entry
                this.config.IssueItem.LegalIssueEntry.push({
                    ID: this.genUID(),
                    ActiveFlag: true,
                    ContractorLegalIssueID: null,
                    CreateDate: moment().format('MM-DD-YYYY'),
                    CreatedResourceID: this._srvLegal.Profile.UserType !== 'Internal' ? this._srvLegal.Profile.ResourceID : this.loginDetailsInternal.ResourceID,
                    DeletedFlag: false,
                    LegalIssueDetail: [],
                    LegalIssueEntryID: null,
                    LegalIssueTypeID: this.config.tab.LegalIssueTypeID,
                    ModifyDate: null,
                    ModifyResourceID: null,
                    ResolvedFlag: false,
                    selectedDate: moment(this.controlSet.find((c) => c.type === 'Datepicker').value).format('MM-DD-YYYY'),
                });
                const entries: LegalIssueEntryItem[] = this.config.IssueItem.LegalIssueEntry;
                entry = entries[entries.length - 1];

                if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                    entry.pendingApproval = true;
                }
            } else {
                // Create new contractor issue item for legal issue type
                this.config.IssueItem = {
                    OwnershipNumber: this.config.owner.OwnershipNumber,
                    OwnershipName: this.config.owner.OwnershipName,
                    LegalIssueTypeName: this.config.tab.LegalIssueTypeTitle,
                    LegalIssueTypeID: this.config.tab.LegalIssueTypeID,
                    ContractorLegalIssueID: null,
                    LegalIssueEntry: [
                        {
                            ID: this.genUID(),
                            ActiveFlag: true,
                            ContractorLegalIssueID: null,
                            CreateDate: moment().format('MM-DD-YYYY'),
                            CreatedResourceID: this._srvLegal.Profile.UserType !== 'Internal' ? this._srvLegal.Profile.ResourceID : this.loginDetailsInternal.ResourceID,
                            DeletedFlag: false,
                            LegalIssueDetail: [],
                            LegalIssueEntryID: null,
                            LegalIssueTypeID: this.config.tab.LegalIssueTypeID,
                            ModifyDate: null,
                            ModifyResourceID: null,
                            ResolvedFlag: false,
                            selectedDate: moment(this.controlSet.find((c) => c.type === 'Datepicker').value).format('MM-DD-YYYY'),
                        },
                    ],
                    CreatedResourceID: this._srvLegal.Profile.UserType !== 'Internal' ? this._srvLegal.Profile.ResourceID : this.loginDetailsInternal.ResourceID,
                    CreatedDate: moment().format('MM-DD-YYYY'),
                    RemoveResourceID: null,
                    RemoveDate: null,
                    ActiveFlag: true,
                };
                // Refer new entry created.
                entry = this.config.IssueItem.LegalIssueEntry[0];

                if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                    this._srvLegal.LegalPage.PageObj.find((owner) => owner.ContactEmail === this.config.owner.ContactEmail).pendingApproval = true;
                    this.config.IssueItem.pendingApproval = true;
                    entry.pendingApproval = true;
                }
            }
        }

        // Clone controls configuration and push control config for id as well
        const controlConfig = JSON.parse(JSON.stringify(this.controlSet));
        controlConfig.push({ type: 'Text', label: 'ID', required: true, fieldTypeID: 0, value: entry.ID ? entry.ID : entry.LegalIssueEntryID });

        // Flush current legal issue detail
        entry.LegalIssueDetail = [];

        // Gentrate legal issue detail item for controls configuration
        controlConfig.forEach((control) => {
            if (control.label === 'ID') {
                return;
            }
            entry.LegalIssueDetail.push(this.generateLegalIssueDetailItemFromControl(control, entry));
        });

        const findFirstDateValue = entry.LegalIssueDetail.find((d) => d.FieldDetailDate);
        if (findFirstDateValue) {
            entry.selectedDate = findFirstDateValue.FieldDetailDate;
        }

        const saveObj = { LegalInformationPage: { ContractorLegalIssue: [] } };
        const contrIssue: ContractorLegalIssueItem = JSON.parse(JSON.stringify(this.config.IssueItem));
        contrIssue.LegalIssueEntry = [entry];
        saveObj.LegalInformationPage.ContractorLegalIssue.push(JSON.parse(JSON.stringify(contrIssue)));

        // Save for Registered Contractor with or without event.
        if (this._srvLegal.Profile.UserType !== 'Internal' && this._srvLegal.Profile.ContrID !== 0) {
            await this._srvLegal.ContractorDataOperation(saveObj, 'legal-questions');
            this._srvLegal.getLegalComments();
        }

        // Save for internal user here
        if (this._srvLegal.Profile.UserType === 'Internal') {
            const legalIssueResult = await this._srvLegal.EditInternalData(saveObj);
            this.config.IssueItem.ContractorLegalIssueID = legalIssueResult[0].ContractorLegalIssueId;
            const getEntryItem = this.config.IssueItem.LegalIssueEntry.find((el) => el.LegalIssueEntryID === null && el.ID === entry.ID);
            if (getEntryItem) {
                getEntryItem.LegalIssueEntryID = legalIssueResult[0].LegalIssueEntryId;
                getEntryItem.ID = null;
            }
            // Update Contractor Legal Issue in ApplicationJSON after succesfull insertion of new Contractor Legal Issue Item
            const owner: OwnershipInformation = this._srvLegal.LegalPage.PageObj.find((o) => o.ContactEmail === this.config.owner.ContactEmail);
            owner.ContractorLegalIssue.push(this.config.IssueItem);
        }
    }

    // Genrate legal issue detail item from form control config.
    generateLegalIssueDetailItemFromControl(control: Control, entry: LegalIssueEntryItem): LegalIssueDetailItem {
        const obj = {
            FieldName: control.label,
            FieldDetailBoolean: control.type === 'Switch' ? control.value : null,
            FieldDetailDate: control.type === 'Datepicker' ? (control.value ? moment(control.value).format('MM-DD-YYYY') : null) : null,
            FieldDetailInt: control.type === 'Dropdown' ? control.value.value : null,
            FieldDetailIntText: control.type === 'Dropdown' ? control.value.text : null,
            FieldDetailText: control.type === 'Text' || control.type === 'Textarea' ? control.value : null,
            LegalIssueDetailDate: moment().format('MM-DD-YYYY'),
            LegalIssueDetailID: null,
            LegalIssueDetailResourceID: null,
            LegalIssueFieldTypeID: control.fieldTypeID,
            LegalIssueTypeID: this.config.tab.LegalIssueTypeID,
        };

        if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
            const ctrlDB = this.initialControlSet.find((cnt) => cnt.fieldTypeID === control.fieldTypeID);
            const ctrl = this.controlSet.find((cnt) => cnt.fieldTypeID === control.fieldTypeID);
            let changeDetected = false;
            if (ctrlDB) {
                if (ctrl.type === 'Datepicker') {
                    if (ctrlDB.value !== ctrl.value) {
                        if (ctrlDB.value !== moment(ctrl.value).format('MM-DD-YYYY')) {
                            changeDetected = true;
                        }
                    }
                } else if (ctrl.type === 'Dropdown') {
                    if (ctrlDB.value !== ctrl.value.value) {
                        changeDetected = true;
                    }
                } else {
                    if (ctrlDB.value !== ctrl.value) {
                        changeDetected = true;
                    }
                }

                // As per instruction not setting pending aproval to false again.
                if (changeDetected) {
                    obj['pendingApproval'] = changeDetected; // will change for true only
                }

                if (this._srvLegal.LegalPage.Contractor_JSON) {
                    let FieldInApprovalJson;
                    for (const contractorIssue of this._srvLegal.LegalPage.Contractor_JSON) {
                        for (const entryItem of contractorIssue.LegalIssueEntry) {
                            const rightEntry = entry.ID ? entry.ID === entryItem.ID : entry.LegalIssueEntryID === entryItem.LegalIssueEntryID;
                            if (rightEntry) {
                                FieldInApprovalJson = entryItem.LegalIssueDetail.find((d) => d.LegalIssueFieldTypeID === control.fieldTypeID);
                            }
                        }
                    }

                    if (FieldInApprovalJson) {
                        obj['pendingApproval'] = true;
                    }
                }
            } else {
                // added to avoid visual cue on non mandatory field
                if (!ctrl.required && obj.FieldDetailDate === null) {
                } else obj['pendingApproval'] = true;
            }
        }
        return obj;
    }

    // Genrate unique IDs
    genUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line: no-bitwise
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : r && 0x3 | 0x8;
            return v.toString(16);
        });
    }

    deleteLegalIssueEntry(entry: LegalIssueEntryItem) {
        if (entry.pendingApproval && this._srvLegal.Profile.UserType === 'Internal') {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 500 });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Legal_Item_Information.Global_Alert_Header_Warning}</h2>
                    <p>${this.pageContent.Legal_Item_Information.Deleting_Entries}</p>
                </div>
            `;
            return;
        }
        const dialogRef = this._dialog.open({ content: SaveAlertComponent, width: 500 });
        const dialog = dialogRef.content.instance;
        dialog.header = this.pageContent.Legal_Item_Information.Global_Alert_Header_Warning;
        dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <h2>${this.pageContent.Legal_Item_Information.Are_You_Sure_Proceed_Your_Decision}</h2>
            </div>
        `;
        dialogRef.result.subscribe(async (res) => {
            if (res['button'] === 'Yes') {
                // Show loader
                this.loadingState = true;
                // Find ownership information item
                const owner: OwnershipInformation = this._srvLegal.LegalPage.PageObj.find((o: OwnershipInformation) => o.ContactEmail === this.config.owner.ContactEmail);
                // Find contractor issue item
                const ContractorIssueItem = owner.ContractorLegalIssue.find((c) => c.LegalIssueTypeID === this.config.tab.LegalIssueTypeID);
                // Find legal issue entry item
                const legalEntryItem = ContractorIssueItem.LegalIssueEntry.find((e) => (e.ID ? e.ID === entry.ID : e.LegalIssueEntryID === entry.LegalIssueEntryID));

                let closeDialog = false;

                if (legalEntryItem) {
                    legalEntryItem.DeletedFlag = true;
                    legalEntryItem.ActiveFlag = false;
                    legalEntryItem.ModifyDate = moment().format('MM-DD-YYYY');
                    if (this._srvLegal.Profile.UserType === 'Internal') {
                        legalEntryItem.ModifyResourceID = this.loginDetailsInternal.ResourceID;
                    } else {
                        legalEntryItem.ModifyResourceID = this._srvLegal.Profile.ResourceID;
                    }
                    if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                        legalEntryItem.pendingApproval = true;
                    }
                    legalEntryItem.LegalIssueDetail.forEach((i) => (i.disable = true));

                    const index = ContractorIssueItem.LegalIssueEntry.findIndex((e) => !e.DeletedFlag);
                    if (index === -1) {
                        ContractorIssueItem.ActiveFlag = false;
                        if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                            ContractorIssueItem.pendingApproval = true;
                        }
                        ContractorIssueItem.RemoveDate = moment().format('MM-DD-YYYY');
                        if (this._srvLegal.Profile.UserType === 'Internal') {
                            ContractorIssueItem.RemoveResourceID = this.loginDetailsInternal.ResourceID;
                        } else {
                            ContractorIssueItem.RemoveResourceID = this._srvLegal.Profile.ResourceID;
                        }

                        if (owner.ContractorLegalIssue.findIndex((c) => c.ActiveFlag) === -1) {
                            owner.LegalIssueFlag = 'N';
                            if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                                owner.pendingApproval = true;
                            }
                        }
                        closeDialog = true;
                    } else {
                        this.config.IssueItem = ContractorIssueItem;
                        entry = this.config.IssueItem.LegalIssueEntry[index];
                        setTimeout(() => {
                            document.getElementById('entry-' + (entry.ID ? entry.ID : entry.LegalIssueEntryID)).click();
                        }, 500);
                    }

                    if (this._srvLegal.Profile.ContrID === 0) {
                        await this._srvLegal.SaveData();
                    } else {
                        const saveObj = { LegalInformationPage: { ContractorLegalIssue: [] } };
                        const contrIssue: ContractorLegalIssueItem = JSON.parse(JSON.stringify(ContractorIssueItem));
                        contrIssue.LegalIssueEntry = [legalEntryItem];
                        saveObj.LegalInformationPage.ContractorLegalIssue.push(JSON.parse(JSON.stringify(contrIssue)));

                        if (this._srvLegal.Profile.UserType !== 'Internal') {
                            await this._srvLegal.ContractorDataOperation(saveObj, 'legal-questions');
                            this._srvLegal.getLegalComments();
                        } else {
                            // Delete this entry for internal user
                            const legalEntryItemIndex = this.config.IssueItem.LegalIssueEntry.findIndex((e) => (e.ID ? e.ID === entry.ID : e.LegalIssueEntryID === entry.LegalIssueEntryID));
                            const deleteResponse = await this._srvLegal.EditInternalData(saveObj);
                            if (deleteResponse.length === 0) {
                                const entryList = this.config.IssueItem.LegalIssueEntry;
                                entryList.splice(legalEntryItemIndex, 1);
                                this.config.IssueItem.LegalIssueEntry = entryList;
                                // Update Contractor Legal Issue in ApplicationJSON after succesfull insertion of new Contractor Legal Issue Item
                                const contractorLegalIssueIndex = owner.ContractorLegalIssue.findIndex((ci) => ci.ContractorLegalIssueID === contrIssue.ContractorLegalIssueID);
                                owner.ContractorLegalIssue[contractorLegalIssueIndex] = contrIssue;
                            }
                        }
                    }
                    this.loadingState = false;
                    if (closeDialog) {
                        this.dialog.close({ result: true });
                    }
                }
            }
        });
    }
    onClose() {
        if (this.form.dirty === false) {
            this.dialog.close({ button: 'CANCEL' });
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
                    this.dialog.close({ button: 'CANCEL' });
                }
            });
        }
    }
}
