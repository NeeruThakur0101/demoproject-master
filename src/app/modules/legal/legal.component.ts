import { ContractorRegistrationService } from './../contractor-Registration-module/services/contractor-Registration.service';
import { AuthenticationService, PageAccess, SessionUser } from './../../core/services/authentication.service';
import { InternalUserDetailsService } from './../../shared-module/services/internal-userDetails.service';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { LegalIssueEntryItem } from './models';
import { DynamicFormPopupComponent } from './dynamic-form/dynamic-form-popup.component';
import { LegalService } from './legal.service';
import { ContractorLegalIssueItem, LegalIssueType, OwnershipInformation } from './models';
import * as moment from 'moment';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { OwnershipInformationService } from '../contractor-Registration-module/components/ownership-information/ownership-information.service';
import { SwitchComponent } from '@progress/kendo-angular-inputs';

@Component({
    selector: 'legal',
    template: `
        <main [class.internal-user]="_srvLegal.Profile.ContrID > 0">
            <div class="page-loader" *ngIf="_srvLegal.getLoadingState()"><span class="k-i-loading"></span></div>
            <div class="outer-block" *ngIf="showHtml">
                <div class="inner-block">
                    <!-- Header -->
                    <section class="top-section">
                        <app-header></app-header>
                        <app-page-title [pageName]="pageContent.Legal_Item_Information.Page_Header" [comments]="_srvLegal.crComments"></app-page-title>
                    </section>

                    <!-- Page -->
                    <section class="middle-section legal-page">
                        <div class="white-block legal-info-page">
                            <div class="scrollable-content-wrapper">
                                <div class="scrollable-content">
                                    <div class="white-block">
                                        <!-- Tabs Wrapper -->
                                        <ul class="vertical-accord" *ngIf="_srvLegal.LegalPage.PageObj">
                                            <!-- Tab -->
                                            <li
                                                *ngFor="let tab of _srvLegal.LegalPage.TabsToRender; let i = index"
                                                [ngClass]="{
                                                    active: activeTab === tab.LegalIssueTypeTitle || (!activeTab && tab.LegalIssueTypeTitle === _srvLegal.LegalPage.Tabs[0].LegalIssueTypeTitle)
                                                }"
                                            >
                                                <span>
                                                    <input
                                                        class="k-radio"
                                                        type="radio"
                                                        name="verticalAccord"
                                                        [id]="tab.LegalIssueTypeTitle"
                                                        [value]="tab.LegalIssueTypeID"
                                                        (change)="activeTab = tab.LegalIssueTypeTitle"
                                                        [checked]="i === 0"
                                                    />
                                                    <label class="k-radio-label" [for]="tab.LegalIssueTypeTitle">
                                                        <div class="counter {{ hasVisualCue(tab, null) ? 'visual-cue' : '' }}" [innerText]="countByActiveLegalIssueType(tab.LegalIssueTypeID)"></div>
                                                        <em [innerText]="tab.LegalIssueTypeTitle"></em>
                                                    </label>
                                                    <section>
                                                        <div class="vertical-accord-content">
                                                            <h3 [innerText]="tab.LegalIssueTypeTitle"></h3>
                                                            <h4 class="header-info" [innerText]="tab.LegalIssueTypeDescription"></h4>
                                                            <div class="d-table-wrapper">
                                                                <!-- List of owner/company -->
                                                                <section [ngClass]="[_srvLegal.LegalPage.PageObj.length > 4 ? 'd-table legal-table has-scroll' : 'd-table legal-table']">
                                                                    <div class="d-table-hd">
                                                                        <div class="d-col">{{ pageContent.Legal_Item_Information.Company_Owner_Principal }}</div>
                                                                        <div class="d-col">{{ pageContent.Legal_Item_Information.Legal_Issue_Answer }}</div>
                                                                        <div class="d-col">{{ pageContent.Legal_Item_Information.Details }}</div>
                                                                    </div>
                                                                    <div class="v-scroll">
                                                                        <div class="d-table-content">
                                                                            <!-- owner/company -->
                                                                            <ng-template ngFor let-owner [ngForOf]="_srvLegal.LegalPage.PageObj" let-j="index">
                                                                                <div
                                                                                    class="d-table-row {{ hasVisualCue(tab, owner) ? 'visual-cue' : '' }}"
                                                                                    *ngIf="!tab.CompanyExclFlg || (tab.CompanyExclFlg && j !== 0)"
                                                                                >
                                                                                    <div class="d-col">{{ owner.OwnershipName }}</div>
                                                                                    <div class="d-col">
                                                                                        <kendo-switch
                                                                                            [disabled]="
                                                                                                (_srvLegal.Profile.UserType == 'Internal' && _srvLegal.Profile.ContrID === 0) ||
                                                                                                this.disableInReadAccess ||
                                                                                                disableFunctionality(tab, owner)
                                                                                            "
                                                                                            class="{{ hasVisualCue(tab, owner) ? 'visual-cue' : '' }}"
                                                                                            #switch
                                                                                            [checked]="legalIssueAnswerState(tab, owner)"
                                                                                            (valueChange)="leganIssueAnswerSwitchChange(switch, tab, owner)"
                                                                                        ></kendo-switch>
                                                                                    </div>
                                                                                    <div class="d-col">
                                                                                        <a
                                                                                            *ngIf="legalIssueAnswerState(tab, owner)"
                                                                                            (click)="
                                                                                                _srvLegal.Profile.UserType == 'Internal' && _srvLegal.Profile.ContrID === 0
                                                                                                    ? null
                                                                                                    : openFormPopup(switch, tab, owner)
                                                                                            "
                                                                                            >{{ pageContent.Legal_Item_Information.Details }}</a
                                                                                        >
                                                                                    </div>
                                                                                </div>
                                                                            </ng-template>
                                                                        </div>
                                                                    </div>
                                                                </section>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <!-- bottom block open -->
                    <section class="bottom-section">
                        <section class="action-buttons">
                            <button
                                *ngIf="(_srvLegal.Profile.UserType != 'Internal' && _srvLegal.Profile.ContrID === 0) || (_srvLegal.Profile.ContrID > 0 && _srvLegal.Profile.EventName !== 'No Event')"
                                kendoButton
                                type="button"
                                (click)="prevPage()"
                            >
                                {{ pageContent.Legal_Item_Information.Back_Legal }}
                            </button>
                            <button
                                *ngIf="(_srvLegal.Profile.UserType != 'Internal' && _srvLegal.Profile.ContrID === 0) || (_srvLegal.Profile.ContrID > 0 && _srvLegal.Profile.EventName !== 'No Event')"
                                kendoButton
                                type="button"
                                primary="true"
                                (click)="nextPage()"
                            >
                                {{ pageContent.Legal_Item_Information.Save_Next_Legal }}
                            </button>
                            <button *ngIf="_srvLegal.Profile.ContrID === 0 && _srvLegal.Profile.UserType == 'Internal'" type="button" (click)="prevPage()" kendoButton [primary]="true">
                                {{ pageContent.Legal_Item_Information.Back_Legal }}
                            </button>
                            <button *ngIf="_srvLegal.Profile.ContrID === 0 && _srvLegal.Profile.UserType == 'Internal'" type="button" (click)="nextPage()" kendoButton [primary]="true">
                                {{ pageContent.Legal_Item_Information.Next }}
                            </button>
                        </section>
                    </section>
                </div>
            </div>
            <div kendoDialogContainer class="popup-loader"></div>
        </main>
    `,
})
export class LegalComponent implements OnInit {
    public pageContent: any;
    public activeTab: string;
    public loginDetailsInternal: SessionUser;
    public hideTab: boolean = false;
    public showHtml: boolean = true;
    public disableInReadAccess: boolean = false;
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };

    constructor(
        public _srvLegal: LegalService,
        private _dialog: DialogService,
        private _router: Router,
        public _language: InternalUserDetailsService,
        private _srvAuthentication: AuthenticationService,
        private _srvContactorRegistration: ContractorRegistrationService,
        private _ownerService: OwnershipInformationService
    ) {
        this._srvLegal.refreshUser();
    }

    async ngOnInit() {
        this.loginDetailsInternal = this._srvAuthentication.ProfileInternal;
        this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Legal Questions');
        // language code
        this.pageContent = this._language.getPageContentByLanguage();
        this._srvLegal.getLegalComments();
        // Get active vertical tabs data,
        await this.loadTabsData();
        // no access to legal page
        if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess && this._srvLegal.Profile.ContrID > 0) {
            this.showHtml = false;
            this.accessDenied();
            return;
        }
        // Get ownership information list
        await this.loadOwnershipInformation();
        this.readAccess();
    }

    // Get vertical tabs(legal issue types) data from api and filter active tabs only.
    async loadTabsData() {
        // Show page loader
        this._srvLegal.LegalPage.loadingState = true;
        const Tabs: LegalIssueType[] = await this._srvLegal.getLegalIssueTypes();
        this._srvLegal.LegalPage.Tabs = Tabs.filter((tab) => tab.ActiveFlg === true);
        // Hide page loader
        this._srvLegal.LegalPage.loadingState = false;
    }
    readAccess() {
        if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess && this._srvLegal.Profile.ContrID > 0) {
            this.disableInReadAccess = true;
        }
    }

    // Get ownership data from database
    async loadOwnershipInformation() {
        let count = 0;
        if (this._srvLegal.Profile.ContrID === 0) {
            let params = {
                params: {
                    resourceID: this._srvAuthentication.Profile.ResourceID,
                    CCOpsId: this._srvAuthentication.Profile.CCOpsID,
                },
            };
            const apiData = await this._srvLegal.getPageJSONData(params);
            //to hide aliases on nno data in ownership grid

            this._srvContactorRegistration.funcInternalUserGoDirectlyToContractorPage(apiData.OwnershipInformationList, 'LegalIssueDetails');
            if (apiData.OwnershipInformationList === null && this._srvLegal.Profile.UserType === 'Internal') {
                return;
            }
            this._srvLegal.LegalPage.DB_JSON = apiData.OwnershipInformationList;
            this._srvLegal.LegalPage.PageObj = JSON.parse(JSON.stringify(this._srvLegal.LegalPage.DB_JSON.filter((info) => info.IsContractorActive === 'Y')));
            // change in tab as per company excl flag
            this._srvLegal.LegalPage.TabsToRender = this._srvLegal.LegalPage.PageObj.length === 1 ? this._srvLegal.LegalPage.Tabs.filter((tab) => !tab.CompanyExclFlg) : this._srvLegal.LegalPage.Tabs;
        } else {
            // Get database update
            let params = {
                params: {
                    contrID: this._srvLegal.Profile.ContrID,
                    pageName: 'Legal Item Information Page',
                    resourceID: this._srvAuthentication.Profile.ResourceID,
                    userLanguageID: this._srvAuthentication.currentLanguageID,
                },
            };
            this._srvLegal.LegalPage.DB_JSON = (await this._srvLegal.getPageJSONData(params)).OwnershipDetails.OwnershipInformationList;
            this._srvLegal.LegalPage.PageObj = JSON.parse(JSON.stringify(this._srvLegal.LegalPage.DB_JSON.filter((info) => info.IsContractorActive === 'Y')));
            await this.ownerPending();
            const counts = this._srvLegal.LegalPage.PageObj.filter((res) => res.IsContractorActive === 'Y').length;
            this._srvLegal.LegalPage.TabsToRender = counts === 1 ? this._srvLegal.LegalPage.Tabs.filter((tab) => !tab.CompanyExclFlg) : this._srvLegal.LegalPage.Tabs;

            // Get contractor pending updates
            let contractorChanges = await this._srvLegal.getContractorChanges(
                this._srvAuthentication.Profile.ContrID,
                this._srvAuthentication.Profile.ResourceID,
                this._srvAuthentication.Profile.CCOpsID
            );
            contractorChanges = contractorChanges.length && contractorChanges[0].CCOpsData ? JSON.parse(contractorChanges[0].CCOpsData) : null;
            this._srvLegal.LegalPage.Contractor_JSON = contractorChanges ? JSON.parse(JSON.stringify(contractorChanges.ContractorData.LegalInformationPage.ContractorLegalIssue)) : null;
            if (contractorChanges) {
                contractorChanges.ContractorData.LegalInformationPage.ContractorLegalIssue.forEach((cChange: ContractorLegalIssueItem) => {
                    for (const entryItem of cChange.LegalIssueEntry) {
                        // Find db owner
                        const owner: OwnershipInformation = this._srvLegal.LegalPage.PageObj.find((o) => o.OwnershipNumber === cChange.OwnershipNumber);
                        // Find owner issue for same lititgation type
                        const ownerIssue = owner ? owner.ContractorLegalIssue.find((c) => c.LegalIssueTypeID === cChange.LegalIssueTypeID) : undefined;
                        if (cChange.pendingApproval) {
                            if (ownerIssue) {
                                // Update issue
                                ownerIssue.ActiveFlag = cChange.ActiveFlag;
                                ownerIssue.pendingApproval = cChange.pendingApproval;
                                // added for disable functionality
                                ownerIssue.IsContractorLegalIssueDisable = cChange.IsContractorLegalIssueDisable;

                                const foundEntry = ownerIssue.LegalIssueEntry.find((e) => (e.ID ? e.ID === entryItem.ID : e.LegalIssueEntryID === entryItem.LegalIssueEntryID));
                                if (foundEntry) {
                                    // added for disable functionality
                                    foundEntry.IsLegalIssueDetailDisable = entryItem.IsLegalIssueDetailDisable;

                                    foundEntry.pendingApproval = entryItem.pendingApproval;
                                    const index = ownerIssue.LegalIssueEntry.findIndex((e) => (e.ID ? e.ID === foundEntry.ID : e.LegalIssueEntryID === foundEntry.LegalIssueEntryID));
                                    // ownerIssue.LegalIssueEntry[index] = entryItem;
                                    ownerIssue.LegalIssueEntry[index].LegalIssueDetail.forEach((d, i) => {
                                        const field = entryItem.LegalIssueDetail.find((dt) => dt.LegalIssueFieldTypeID === d.LegalIssueFieldTypeID);
                                        if (field && field.pendingApproval) {
                                            ownerIssue.LegalIssueEntry[index].LegalIssueDetail[i] = field;
                                            ownerIssue.pendingApproval = true;
                                            ownerIssue.LegalIssueEntry[index].pendingApproval = true;
                                        }
                                    });

                                    if (ownerIssue.LegalIssueTypeID === 2) {
                                        entryItem.LegalIssueDetail.forEach((dt) => {
                                            const field = ownerIssue.LegalIssueEntry[index].LegalIssueDetail.find((d) => d.LegalIssueFieldTypeID === dt.LegalIssueFieldTypeID);
                                            if (!field) {
                                                ownerIssue.LegalIssueEntry[index].LegalIssueDetail.push(dt);
                                            }
                                        });
                                    }

                                    // In case deleted entry with empty detail array
                                    if (entryItem.DeletedFlag === true && entryItem.LegalIssueDetail.length === 0) {
                                        if (index !== -1) {
                                            // store fields from db
                                            const fields = ownerIssue.LegalIssueEntry[index].LegalIssueDetail;
                                            ownerIssue.LegalIssueEntry[index] = entryItem;
                                            ownerIssue.LegalIssueEntry[index].LegalIssueDetail = fields;
                                            ownerIssue.LegalIssueEntry[index].LegalIssueDetail.forEach((d) => (d.disable = true));
                                        }
                                    }
                                } else {
                                    ownerIssue.LegalIssueEntry.push(entryItem);
                                }
                            } else {
                                // Disable for Internal user
                                if (this._srvLegal.Profile.ResourceType === 'Internal') {
                                    cChange.LegalIssueEntry.forEach((e) => e.LegalIssueDetail.forEach((d) => (d.disable = true)));
                                }

                                // New issue and entry
                                if (cChange.ActiveFlag) {
                                    owner.LegalIssueFlag = 'Y';
                                }
                                owner.ContractorLegalIssue.push(cChange);
                            }
                        } else {
                            cChange.LegalIssueEntry.forEach((entry) => {
                                const dbEntry = ownerIssue ? ownerIssue.LegalIssueEntry.find((e) => (e.ID ? e.ID === entry.ID : e.LegalIssueEntryID === entry.LegalIssueEntryID)) : undefined;
                                if (entry.pendingApproval) {
                                    if (!entry.ID) {
                                        // Deleted entry
                                        const index = ownerIssue.LegalIssueEntry.findIndex((e) => (e.ID ? e.ID === entry.ID : e.LegalIssueEntryID === entry.LegalIssueEntryID));
                                        if (index !== -1) {
                                            const issueDetail = ownerIssue.LegalIssueEntry[index].LegalIssueDetail;
                                            issueDetail.forEach((d) => (d.disable = true));
                                            ownerIssue.LegalIssueEntry[index] = entry;
                                            ownerIssue.LegalIssueEntry[index].LegalIssueDetail = issueDetail;
                                            ownerIssue.pendingApproval = true;
                                        }
                                        const activeEntryIndex = ownerIssue.LegalIssueEntry.findIndex((e) => !e.DeletedFlag);
                                        if (activeEntryIndex === -1) {
                                            ownerIssue.ActiveFlag = false;
                                        }
                                    } else {
                                        // New entry
                                        // Disable for Internal user
                                        if (this._srvLegal.Profile.UserType === 'Internal') {
                                            entry.LegalIssueDetail.forEach((d) => (d.disable = true));
                                        }
                                        // included if condition to NOT include duplicate entry
                                        if (!ownerIssue.LegalIssueEntry.includes(entry)) {
                                            ownerIssue.LegalIssueEntry.push(entry);
                                            ownerIssue.pendingApproval = true;
                                        }
                                    }
                                } else {
                                    if (dbEntry) {
                                        // field updates only
                                        entry.LegalIssueDetail.forEach((detailItem) => {
                                            const index = dbEntry.LegalIssueDetail.findIndex((d) => d.LegalIssueFieldTypeID === detailItem.LegalIssueFieldTypeID);
                                            if (index) {
                                                // Disable for Internal user
                                                if (this._srvLegal.Profile.UserType === 'Internal') {
                                                    detailItem.disable = true;
                                                }
                                                dbEntry.LegalIssueDetail[index] = detailItem;
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        this._srvLegal.LegalPage.loadingState = false;
    }
    // getting owner pending data to hide deleted or recoverd owner
    async ownerPending() {
        const ownerPendingJSON = await this._ownerService.getEventPageJSON(this._srvLegal.Profile.ContrID, this._srvLegal.Profile.ResourceID, this._srvLegal.Profile.CCOpsID);
        if (ownerPendingJSON.length && ownerPendingJSON[0].CCOpsData) {
            const ownerPendingObject = JSON.parse(ownerPendingJSON[0].CCOpsData).ContractorData.OwnershipDetails;
            if (ownerPendingObject.OwnershipInformationList) {
                for (const ownerPen of ownerPendingObject.OwnershipInformationList) {
                    if (ownerPen.IsDeletedFlag || (ownerPen.hasOwnProperty('IsRecoveredFlag') && ownerPen.IsRecoveredFlag)) {
                        const index = this._srvLegal.LegalPage.PageObj.findIndex((DBObj) => ownerPen.OwnershipNumber === DBObj.OwnershipNumber);
                        if (index !== -1) this._srvLegal.LegalPage.PageObj.splice(index, 1);
                    }
                }
            }
        }
    }
    // to disable in case of event
    disableFunctionality(tab, owner) {
        if (this._srvLegal.LegalPage.Contractor_JSON) {
            for (const legalPending of this._srvLegal.LegalPage.Contractor_JSON) {
                if (legalPending.OwnershipNumber === owner.OwnershipNumber && legalPending.LegalIssueTypeID === tab.LegalIssueTypeID && legalPending.IsContractorLegalIssueDisable) return true;
            }
        }
        return false;
    }
    // Returns state of Legal issue answer switch
    legalIssueAnswerState(tab: LegalIssueType, owner: OwnershipInformation) {
        if (!owner.ContractorLegalIssue) {
            return false;
        }
        const legalAnswerItem = owner.ContractorLegalIssue.find((o) => o.LegalIssueTypeID === tab.LegalIssueTypeID);
        if (!legalAnswerItem) {
            return false;
        }
        return legalAnswerItem.ActiveFlag;
    }

    // Process for updating Legal issue answer
    leganIssueAnswerSwitchChange(toggle, tab: LegalIssueType, owner: OwnershipInformation) {
        if (toggle.checked) {
            this.openFormPopup(toggle.checked, tab, owner);
        } else {
            const dialogRef = this._dialog.open({ content: SaveAlertComponent, width: 500 });
            const dialog = dialogRef.content.instance;
            dialog.header = 'Warning';
            dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Legal_Item_Information.Are_You_Sure_Proceed_Your_Decision}</h2>
                </div>
            `;
            dialogRef.result.subscribe(async (res) => {
                if (res['button'] === 'Yes') {
                    this._srvLegal.LegalPage.loadingState = true;
                    // Considering contact email as unique key find owner information item
                    const obj = this._srvLegal.LegalPage.PageObj.find((own) => own.ContactEmail === owner.ContactEmail);
                    if (obj) {
                        const legalIssue: ContractorLegalIssueItem = obj.ContractorLegalIssue.find((issue) => issue.LegalIssueTypeID === tab.LegalIssueTypeID);
                        if (legalIssue) {
                            legalIssue.ActiveFlag = false;
                            legalIssue.RemoveResourceID = this._srvLegal.Profile.UserType !== 'Internal' ? this._srvLegal.Profile.ResourceID : this.loginDetailsInternal.ResourceID;
                            legalIssue.RemoveDate = moment().format('MM-DD-YYYY');
                            // Changes to legal issue entry items
                            legalIssue.LegalIssueEntry.forEach((entry: LegalIssueEntryItem) => {
                                entry.ActiveFlag = false;
                                entry.ModifyDate = moment().format('MM-DD-YYYY');
                                entry.ModifyResourceID = this._srvLegal.Profile.UserType !== 'Internal' ? this._srvLegal.Profile.ResourceID : this.loginDetailsInternal.ResourceID;
                                if (this._srvLegal.Profile.ContrID !== 0 && this._srvLegal.Profile.UserType !== 'Internal') {
                                    legalIssue.pendingApproval = true;
                                    entry.pendingApproval = true;
                                }
                            });
                        }
                        const index = obj.ContractorLegalIssue.findIndex((c) => c.ActiveFlag === true);
                        obj.LegalIssueFlag = index !== -1 ? 'Y' : 'N';

                        if (this._srvLegal.Profile.ContrID === 0) {
                            await this._srvLegal.SaveData();
                            this.loadOwnershipInformation();
                            this._srvLegal.LegalPage.loadingState = false;
                        } else {
                            const saveObj = { LegalInformationPage: { ContractorLegalIssue: [] } };
                            saveObj.LegalInformationPage.ContractorLegalIssue.push(JSON.parse(JSON.stringify(legalIssue)));

                            if (this._srvLegal.Profile.UserType !== 'Internal') {
                                obj.pendingApproval = true;
                                await this._srvLegal.ContractorDataOperation(saveObj, 'legal-questions');
                                this._srvLegal.getLegalComments();
                                this._srvLegal.LegalPage.loadingState = false;
                            } else {
                                // Save for internal user here
                                await this._srvLegal.EditInternalData(saveObj);
                            }
                            this.loadOwnershipInformation();
                        }
                    }
                } else {
                    toggle.checked = true;
                }
            });
        }
    }

    // Invoke legal answer issue form based on legal issue type id.
    async openFormPopup(answerState: SwitchComponent, tab: LegalIssueType, owner: OwnershipInformation) {
        if (!answerState) {
            // Set all entries for contractor leagal issue as soft delete.
            return false;
        }
        this._srvLegal.LegalPage.loadingState = true;
        const IssueItem = owner.ContractorLegalIssue ? owner.ContractorLegalIssue.find((o) => o.LegalIssueTypeID === tab.LegalIssueTypeID) : undefined;
        const formControlConfig = await this._srvLegal.getFormConfigByLegalIssueType(tab.LegalIssueTypeID);
        const formModal = this._dialog.open({ content: DynamicFormPopupComponent, width: 500 });
        const ins = formModal.content.instance;
        ins.config = { owner, tab, IssueItem, formControlConfig, updateBackgroundData: this.loadOwnershipInformation.bind(this) };

        formModal.result.subscribe(async (res) => {
            this._srvLegal.LegalPage.loadingState = true;
            this._srvLegal.crComments;
            setTimeout(() => {
                // Refresh data after popup close
                this.loadOwnershipInformation();
            }, 2000);
        });

        this._srvLegal.LegalPage.loadingState = false;
    }

    // Process active account as per legal issue type
    countByActiveLegalIssueType(legalIssueTypeID: number, count: number = 0) {
        this._srvLegal.LegalPage.PageObj.forEach((o) => {
            if (o.ContractorLegalIssue) {
                count += o.ContractorLegalIssue.filter((c) => c.LegalIssueTypeID === legalIssueTypeID && c.ActiveFlag).length;
            }
        });
        return count;
    }

    // Check for visual cue
    hasVisualCue(tab: LegalIssueType, owner: OwnershipInformation): boolean {
        if (owner === null) {
            for (const o of this._srvLegal.LegalPage.PageObj) {
                if (o.ContractorLegalIssue && o.ContractorLegalIssue instanceof Array) {
                    const IssueItem = o.ContractorLegalIssue.find((e) => e.LegalIssueTypeID === tab.LegalIssueTypeID && e.pendingApproval);
                    //modified condition for visual cue only on change
                    if (IssueItem) {
                        if (IssueItem.LegalIssueEntry.some((entry) => entry.DeletedFlag)) return true;
                        if (IssueItem.LegalIssueEntry.some((entry) => entry.LegalIssueDetail.some((legal) => legal.pendingApproval))) return true;
                        // to add visual cue on counter ===========
                        if (!IssueItem.ActiveFlag) return true;
                        // ===============
                    }
                }
            }
        } else {
            const ContractorLegalIssue =
                owner.ContractorLegalIssue && owner.ContractorLegalIssue instanceof Array ? owner.ContractorLegalIssue.find((e) => e.LegalIssueTypeID === tab.LegalIssueTypeID) : undefined;
            if (ContractorLegalIssue) {
                if (ContractorLegalIssue.pendingApproval && ContractorLegalIssue.LegalIssueEntry.some((entry) => entry.DeletedFlag)) return true; // added and condition to modify visual cue
                let pendingApprovalFlag = false;
                for (const entry of ContractorLegalIssue.LegalIssueEntry) {
                    for (const detail of entry.LegalIssueDetail) {
                        if (detail.pendingApproval) {
                            pendingApprovalFlag = true;
                        }
                    }
                }
                //added to add visual cue on toggling the switch to no
                if (!ContractorLegalIssue.ActiveFlag && ContractorLegalIssue.pendingApproval) return true;
                //======================================================
                return pendingApprovalFlag;
            }
        }
    }

    async prevPage() {
        if (this._srvLegal.Profile.ContrID === 0 && this._srvLegal.Profile.UserType !== 'Internal') {
            await this._srvContactorRegistration.saveLastPageVisited('ownership');
        } else if (this._srvLegal.Profile.EventName !== 'No Event') {
            await this._srvLegal.ContractorDataOperation(null, 'ownership');
        }
        this._router.navigate(['/contractorRegistration/ownership']);
    }

    async nextPage() {
        if (this._srvLegal.Profile.ContrID === 0 && this._srvLegal.Profile.UserType !== 'Internal') {
            await this._srvLegal.SaveData('contractor-location');
        } else if (this._srvLegal.Profile.EventName !== 'No Event') {
            await this._srvLegal.ContractorDataOperation(null, 'contractor-location');
        }
        this._router.navigate(['/contractorRegistration/contractor-location']);
    }

    public accessDenied() {
        const dialogRef = this._dialog.open({
            content: DialogAlertsComponent,
            appendTo: this.containerRef,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.header = this.pageContent.Coverage_Profile.Alert;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>${this.pageContent.Coverage_Profile.Access_Denied}</h2>
                                    <p>${this.pageContent.Legal_Item_Information.Access_Denied}</p>
                                </div>
                            `;
        dialogRef.result.subscribe((res) => {
            this.showHtml = true;
            this._router.navigate(['/contractorRegistration/company-information']);
        });
    }
}
