import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, OnInit } from '@angular/core';
import { ContractorOperationAddEvent, EventGroup, EventTerritoryData, EventType, MetaDataEvent } from '../../components/contractor-operation/models';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { ContractorOperationService } from '../../components/contractor-operation/contractor-operation.service'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { OperationCorrectionRequestComponent } from 'src/app/shared-module/components/operation-correction-request/operation-correction-request.component';
@Component({
    selector: 'app-operation-add-event',
    templateUrl: './operation-add-event.component.html',
    styleUrls: ['./operation-add-event.component.scss']
})
export class OperationAddEventComponent extends DialogContentBase implements OnInit {

    public Page: ContractorOperationAddEvent = { eventGroupDDL: [], eventTypeDDL: [], loadingState: false };

    public value: Array<{ text: string, value: number }> = [{ text: 'Medium', value: 2 }];
    public addEventFrom: FormGroup;
    public submitted: boolean = false;
    public loader: boolean = false;
    public ResourceID1: number = 0;
    public EventGroup: EventGroup[];
    public EventType: EventType[];
    public EventTypeData: EventType[];
    public EventTerritoryData: EventTerritoryData[];
    public Status: boolean = false;
    public Status2: boolean = false;
    public EventTypeNamestr: string;
    public pageContent: any;
    public ContrId: number;
    public Territorycount: number = 0;
    public EventTerritoryId: number;
    public EventjsonObject: object;
    public InternalloginDetails: SessionUser;
    public CCOpsarr1: Array<{
        ContractorCentralDataTypeID: number;
        CCOpsID: string;
    }> = [];

    constructor(dialog: DialogRef,
        private _srvDialog: DialogService, public _srvAuth: AuthenticationService, private _srvOperation: ContractorOperationService,
        private formBuilder: FormBuilder, public _srvLanguage: InternalUserDetailsService) {
        super(dialog);
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }
    ngOnInit(): void {
        this.InternalloginDetails = this._srvAuth.ProfileInternal;
        this.ResourceID1 = this.InternalloginDetails.ResourceID;
        this.FillDDLData();
        this.addEventFrom = this.formBuilder.group({
            EventGroup: ['', Validators.required],
            EventType: ['', Validators.required],
            EventTerritory: ['']
        });
    }

    public get eventform() {
        return this.addEventFrom.controls;
    }
    public isItemSelected(itemText: string): boolean {
        return this.value.some(item => item.text === itemText);
    }
    async loadEmailData() {
        this.Page.loadingState = true;
        this.Page.eventTypeDDL = await this._srvOperation.BindEventTypeDDL();
        this.Page.loadingState = false;
    }

    // this method is use for bind drop down
    public async FillDDLData() {
        const result: MetaDataEvent = await this._srvOperation.BindEventGroupDDL(0, null);
        this.EventGroup = result.EventGroup;
        this.EventType = result.EventType;
    }

    // this method is use for bind Event Type DDL by pass Event Group Id
    public selectionChange(value: any): void {
        this.submitted = false
        this.EventTypeData = [];
        this.addEventFrom.controls['EventType'].setValue(null);
        this.addEventFrom.controls['EventType'].updateValueAndValidity();
        this.addEventFrom.controls['EventTerritory'].setValue(null);
        this.addEventFrom.controls['EventTerritory'].updateValueAndValidity();
        this.Territorycount = 0;
        this.EventTypeData = this.EventType.filter(x => x.EventGroupID === value.EventGroupID);
    }
    // this method is use to check Correction Request
    public async selectionChangeType(e) {
        this.submitted = false
        this.Status = e.EventTypeName.includes('Correction Request') && !e.EventTypeName.includes('Returned');
        this.Status2 = e.EventTypeName.includes('Correction Request Returned');
        if (this.Status === true) {
            this.addEventFrom.controls['EventGroup'].setValidators([Validators.required]);
            this.addEventFrom.controls['EventType'].setValidators([Validators.required]);
            this.addEventFrom.controls['EventTerritory'].setValidators([Validators.required]);
        }
        else if (this.Status === false && this.Status2 === true) {
            this.addEventFrom.controls['EventGroup'].setValidators([Validators.required]);
            this.addEventFrom.controls['EventType'].setValidators([Validators.required]);
            this.addEventFrom.controls['EventTerritory'].setValidators([Validators.required]);
        }
        else {
            this.addEventFrom.controls['EventTerritory'].clearValidators();
            this.addEventFrom.controls['EventTerritory'].updateValueAndValidity();
            this.addEventFrom.controls['EventGroup'].setValidators([Validators.required]);
            this.addEventFrom.controls['EventType'].setValidators([Validators.required]);

        }
        this.EventTypeNamestr = e.EventTypeName;
        const res: MetaDataEvent = await this._srvOperation.BindEventGroupDDL(e.DataTypeID, e.EventTypeName);
        this.EventTerritoryData = res.EventTerritory;
        this.Territorycount = res.EventTerritory.length;
    }

    public selectionChangeTerritory(ev) {
        if (ev) {
            this.CCOpsarr1 = [];
            ev.forEach((val) => {
                this.CCOpsarr1.push(
                    {
                        ContractorCentralDataTypeID: val.ContractorCentralDataTypeID,
                        CCOpsID: val.CCOpsID
                    }
                );
            });

        }
    }

    public onRemoveTag(removedItems) {

        if (this.CCOpsarr1.length) {
            this.CCOpsarr1 = this.CCOpsarr1.filter(el => el.CCOpsID === removedItems.dataItem.CCOpsID && el.ContractorCentralDataTypeID === removedItems.dataItem.ContractorCentralDataTypeID);

        }
    }
    // on Submit button click
    public async onSubmit(eventTypeid) {
        let eventTypeName;
        const selectedEventType: any = this.EventTypeData.find(x => x.EventTypeID === eventTypeid);
        eventTypeName = selectedEventType.EventTypeName;
        this.submitted = true;
        if (this.addEventFrom.invalid) {
            if (this.addEventFrom.controls.EventGroup.invalid) {
                return;
            }
        }
        else {
            if (this.Status === true) {

                const jsonObject = {
                    ResourceId: this.ResourceID1,
                    ContrId: this._srvAuth.Profile.ContrID,
                    EventGroupId: this.addEventFrom.value.EventGroup,
                    EventTypeId: this.addEventFrom.value.EventType,
                    EventTypeName: eventTypeName,
                    CorrectionDetail: this.CCOpsarr1

                };
                this.EventjsonObject = jsonObject;
                this.openCorReq(2);
                this.loader = false;
            }
            else if (this.Status === false && this.Status2 === false) {
                const jsonObject1 = {
                    ResourceId: this.ResourceID1,
                    ContrId: this._srvAuth.Profile.ContrID,
                    EventGroupId: this.addEventFrom.value.EventGroup,
                    EventTypeId: this.addEventFrom.value.EventType,
                    EventTypeName: eventTypeName,
                    CCOpsID: 0,
                    userLanguageID: this._srvAuth.currentLanguageID
                };

                const res1: number = await this._srvOperation.AddEvent(jsonObject1);
                if (res1 > 0) {
                    this.loader = true;
                    if (this.Status === false) {
                        this.OpenDialogAlertsComponent();
                        this.dialog.close({ status: 'save' });
                    }
                    ;
                }
            }
            else if (this.Status === false && this.Status2 === true) // data save for Correction Request Returned
            {
                const jsonObject2 = {
                    ResourceId: this.ResourceID1,
                    ContrId: this._srvAuth.Profile.ContrID,
                    EventGroupId: this.addEventFrom.value.EventGroup,
                    EventTypeId: this.addEventFrom.value.EventType,
                    EventTypeName: eventTypeName,
                    CorrectionDetail: this.CCOpsarr1

                };
                const res1 = await this._srvOperation.InsertCorrectionRequestReturn(jsonObject2);
                if (res1 > 0) {
                    this.loader = true;
                    if (this.Status === false && this.Status2 === true) {
                        this.OpenDialogAlertsComponent();
                        this.dialog.close({ status: 'save' });
                    }
                    ;
                }
            }
        }
    }

    public OpenDialogAlertsComponent() {
        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
  <div class="modal-alert confirmation-alert">
      <h2>${this.pageContent.Contaractor_Operation.Inserted}</h2>
      <p>${this.pageContent.Contaractor_Operation.successfully_Added}</p>
  </div> `;
        this.loader = false;
        this.Status = false;
        return dialogRef
    }

    public close() {
        this.dialog.close({ button: 'Yes' });
    }

    openCorReq(value) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }, 5);
        const alertDialog = this._srvDialog.open({
            content: OperationCorrectionRequestComponent,
            width: 900
        });
        const addeventInfo = alertDialog.content.instance;
        addeventInfo.CrrRequestType = this.EventTypeNamestr
        addeventInfo.DataTypeID = this.EventTerritoryId;
        addeventInfo.EventjsonObject = this.EventjsonObject;
        alertDialog.result.subscribe((r) => {
            if (r['status'] === 'save') {
                this.dialog.close({ status: 'save' })
            }
        })
    }
}
