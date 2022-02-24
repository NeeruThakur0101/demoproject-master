import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { UniversalService } from './../../../../core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/core/services/http-service';
import { DOCUMENT } from '@angular/common';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { DeleteAlertComponent } from 'src/app/shared-module/components/delete-alert/delete-alert.component';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import {
    ContractorList,
    SaveMultiLocationData,
    UserRights,
    AssignLiscenceData,
    LicenseData,
    LicenseModel,
    LiscenseDropdown,
    StateProvinceDropdown,
    EquipmentType,
    EquipmentSelect,
} from './admin-interface.model';
import { AdminService } from './admin.service';
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
    constructor(
        @Inject(DOCUMENT) private document: Document,

        private _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        public dialog: DialogRef,
        private $dialog: DialogService,
        private apiService: ApiService,
        private _srvUniversal: UniversalService,
        private dialogSrv: DialogService,
        private renderer: Renderer2,
        private _srvAdmin: AdminService
    ) { }

    public locationTab: boolean = true;
    public equipmentTab: boolean;
    public licenseTab: boolean;
    public assignLicenseTab: boolean;
    public lastTabIndex: number = 1;
    public pageContentData: any;
    public liscenseSelect: string | number;
    public equipmentTypeSelect: number;
    public equipmentTypeSelectCtr: number = 0;
    public EquipmentData: EquipmentType[];
    public EquipmentSelectData: EquipmentSelect[];
    public selectedOption: number | string = null;
    public selectedOptionType: number | string = null;
    public equipmentTypeFilterData: EquipmentType[];
    public equipmentSelectFilterData: EquipmentSelect[];
    public equipTypeActionID: number;
    public equipmentActionID: number;
    public allowCustom: boolean = true;
    public equipCtr: number = 0;
    public equipSelect: number;
    public assignLiscenseData: AssignLiscenceData;
    public stateProvinceDropdown: StateProvinceDropdown[] = [];
    public assignLicenseDropdown: LiscenseDropdown[] = [];
    public filterAssignLiscenseStateData: StateProvinceDropdown[] = [];
    public filterAssignLiscenseData: LiscenseDropdown[] = [];
    public liscenseDisableSaveCtr: number = 0;
    public editLiscenseActionId: number;
    public assignClick: boolean = true;
    public enableEquipmentTypeSave: boolean = false;
    public enableEquipmentSave: boolean = false;
    public licenceBtnClick: boolean = true;
    public virtual: any = {
        itemHeight: 10,
    };
    // Liscense
    public group: FormGroup;
    public liscenceData: LicenseData[] = [];
    public filterLiscenseData: LicenseData[] = [];
    public liscenseField: string;
    public liscenceCtr: number = 0;
    // Liscense
    public liscenceModel: any = {};
    public stateProvince: string;
    public assignLiscenseName: string;
    public programSelect: string;
    public tradeSelect: string;
    // #region multi-location
    public model: any = {};
    public pageContent: any;

    // multi-location tab
    public frmDisabled: boolean = true;
    public readonlyLead: boolean = false;
    public selectedLeadId: number;
    public selectedBlock: string = '';
    public selectedChildIs: string = '';
    public diabledChild: boolean = true;
    public userRights: UserRights[] = [];
    public fromPage: string = 'internal';
    public leadContractors: ContractorList[] = [];
    public childContractorList: ContractorList[] = [];
    public isLeadReadOnly: boolean = false;
    public enableLocationSave: boolean = true;
    public loginDetailsInternal: SessionUser;
    public isHideLicense: boolean = false;
    public isHideEquipment: boolean = false;
    // #endregion  multi-location

    public filterSettings: DropDownFilterSettings = {
        caseSensitive: false,
        operator: 'contains',
    };

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    async ngOnInit() {
        this.group = new FormGroup({
            liscenseDes: new FormControl(),
        });
        this.loginDetailsInternal = this._srvAuth.ProfileInternal;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.pageContentData = this._srvLanguage.getPageContentByLanguage();
        this.getLicenseTabData();
        this.getEquipmentType();
        this.getAssignLiscenseDropdown();
    }

    // height calculator

    heightCalculate() {
        if (document.body) {
            this.renderer.removeClass(this.commentBlock.nativeElement, 'has-scroll');
            this.renderer.removeClass(this.commentBlock.nativeElement, 'none');

            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');

                if (className === 'has-scroll') {
                    this.renderer.addClass(this.commentBlock.nativeElement, className);
                } else {
                    this.renderer.removeClass(this.commentBlock.nativeElement, 'has-scroll');
                    this.renderer.removeClass(this.commentBlock.nativeElement, 'none');
                }
            }
        }
    }

    //#region multilocation tab
    public getLeadId(obj, f) {
        // this block of code is used for when we type
        // number but not select the data from dropdown and come out the box
        if (typeof obj === 'string') {
            f.form.reset();
            return false;
        }
        this.selectedLeadId = obj;
        if (this.selectedLeadId > 0) {
            this.diabledChild = false;
            this.readonlyLead = true;
        }
    }

    // call api for searching lead contractors
    public async searchLeadContractor(event) {
        const contrIdOrName = event;
        if (event !== '') {
            if (event.length > 2) {
                this.document.body.classList.remove('noPopup');
            } else {
                if (isNaN(event)) this.document.body.classList.add('noPopup');
            }
            if ((isNaN(event) && event.length > 2) || !isNaN(event)) {
                this.leadContractors = await this._srvAdmin.GetLeadMultiLocationRights(contrIdOrName);
                this.leadContractors.forEach((e) => {
                    e['showValue'] = '(' + e.Contr_ID + ')' + ' ' + e.ContractorName;
                });
            }
        }
    }

    public getChildId(id) {
        this.selectedChildIs = id;
    }

    public getHeight() {
        setTimeout(() => {
            this.heightCalculate();
        }, 1);
    }
    public async searchChildContractor(text) {
        if (text !== '') {
            if (isNaN(text)) {
                if (text.length > 2) {
                    this.document.body.classList.remove('noPopup');
                    this.childContractorList = await this._srvAdmin.GetChildMultiLocationRights(this.selectedLeadId, text, this.loginDetailsInternal.ResourceID);
                    this.childContractorList.forEach((e) => {
                        e['showValue'] = '(' + e.Contr_ID + ')' + ' ' + e.ContractorName;
                    });
                } else {
                    this.document.body.classList.add('noPopup');
                }
            } else {
                this.document.body.classList.remove('noPopup');
                this.childContractorList = await this._srvAdmin.GetChildMultiLocationRights(this.selectedLeadId, text, this.loginDetailsInternal.ResourceID);
                this.childContractorList.forEach((e) => {
                    e['showValue'] = '(' + e.Contr_ID + ')' + ' ' + e.ContractorName;
                });
            }
        }
    }

    public async searchUserRight(text) {
        if (text) {
            if (text.length > 4) {
                this.userRights = await this._srvAdmin.GetSearchAssignUserName(text);
                this.userRights.forEach((e) => {
                    if (e.WebLogin == null) {
                        e['showValue'] = e.Email;
                    } else {
                        e['showValue'] = e.WebLogin;
                    }
                });
            } else {
                this.userRights = null;
            }
        } else {
        }
    }

    public selectUserRight(val) {
        this.model.userRight = val;
    }
    public resetMultilocation() {
        this.readonlyLead = false;
        this.diabledChild = true;
        this.selectedLeadId = null;
        this.leadContractors = [];
        this.childContractorList = [];
        this.userRights = [];
        this.model.selectedLeadId = null;
        this.model.selectedChildIs = null;
    }
    public onBlockChange(val, f) {
        this.readonlyLead = false;
        if (val === 'rights') {
            this.frmDisabled = false;
            f.form.controls['selectedLeadId'].reset();
            f.form.controls['selectedChildIs'].reset();
            this.model.selectedLeadId = null;
            this.leadContractors = null;
            this.diabledChild = true;
            this.model.selectedChildIs = null;
            this.childContractorList = null;
        } else if (val === 'multi-location') {
            f.form.controls['userRight'].reset();
            this.model.userRight = null;
            this.userRights = null;
        }
        this.selectedBlock = val;
    }
    public async saveMultiLocation(f) {
        this.enableLocationSave = false;
        if (this.selectedBlock === '') {
            this.alert('block', 0);
            return false;
        }

        if (f.form.valid) {
            if (this.selectedBlock === 'multi-location') {
                const obj: SaveMultiLocationData = {
                    LeadContrId: this.selectedLeadId,
                    ChildContrId: this.selectedChildIs.toString(),
                };
                const res: number = await this._srvAdmin.SaveMultiLocationData('AdminPage/AddMultiLocationRightsTab', obj);
                if (res === 1) {
                    const text = 'multi-location';
                    this.alert(text, res);
                    f.form.reset();
                    this.resetMultilocation();
                }
            } else {
                const obj: SaveMultiLocationData = {
                    AssignUserRightsResourceID: this.model.userRight,
                };
                const res1: number = await this._srvAdmin.SaveMultiLocationData('AdminPage/AddMultiLocationAssignUserRights', obj);
                const text = 'user-right';
                this.alert(text, res1);
                f.form.reset();
                this.resetMultilocation();
                // });
            }
        }
    }

    public focus(text) {
        if (text === 'child') {
            this.document.body.classList.add('clsChild');
        } else {
            this.document.body.classList.add('clsLead');
        }
    }

    public blurMultiLocation(text) {
        const id = this.selectedLeadId;
        if (text === 'child') {
            this.document.body.classList.remove('clsChild');
        } else {
            this.document.body.classList.remove('clsLead');
        }
    }
    public cancelMultilocation(f) {
        if (this.selectedBlock === 'rights') {
            f.form.controls['userRight'].reset();
        }
        else {
            f.form.controls['selectedLeadId'].reset();
            f.form.controls['selectedChildIs'].reset();
        }
        this.resetMultilocation();
    }

    public alert(text, res) {
        const cancelRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
        const cancelIns: DialogAlertsComponent = cancelRef.content.instance;

        this.enableLocationSave = true;
        if (text === 'multi-location') {
            if (res === 1) {
                cancelIns.alertMessage = `
        <div class="modal-alert confirmation-alert">
            <h2>${this.pageContent.Admin.Multi_Location.Success}</h2>
            <p>${this.pageContent.Admin.Multi_Location.Lead_Subscription_saved}</p>
        </div>`;
            }
        } else if (text === 'user-right') {
            if (res === -1) {
                cancelIns.alertMessage = `
        <div class="modal-alert info-alert">
        <p>${this.pageContent.Admin.Multi_Location.Something_wrong}</p>
        </div>`;
            } else if (res === 0) {
                cancelIns.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${this.pageContent.Admin.Multi_Location.User_ID_already_exist}</p>

        </div>`;
            } else if (res === 1) {
                cancelIns.alertMessage = `
        <div class="modal-alert confirmation-alert">
            <h2>${this.pageContent.Admin.Multi_Location.Success}</h2>
            <p>${this.pageContent.Admin.Multi_Location.User_Saved}</p>
        </div>`;
            }
        } else if (text === 'block') {
            cancelIns.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${this.pageContent.Admin.Multi_Location.select_lead_child_or_user_right}</p>
        </div>`;
        }
    }
    //#endregion
    openCRPop() {
        const alertDialog = this.dialogSrv.open({
            width: 500,
        });
    }
    private async getLicenseTabData() {
        const res: LicenseData[] = await this._srvAdmin.GetLicenseTabData();
        this.liscenceData = res;
        this.filterLiscenseData = res;
    }

    public async actionLiscence(id: number | string, txt: string | number, desc: string, action: string) {
        txt = txt.toString();
        if (!txt) return;
        this.licenceBtnClick = false;
        this.liscenseDisableSaveCtr++;
        const postObj = {
            LogedInResourceID: this.loginDetailsInternal.ResourceID,
            ContrLicenseID: this.liscenseSelect,
            ContrLicenseName: txt.toString(),
            ContrLicenseDesc: desc,
            ActionType: action,
        };
        const objNew = this.liscenceData.findIndex((x) => x.ContrLicenseID === this.liscenseSelect);

        if (action !== 'DELETE') {
            if (this.liscenceData[objNew] && txt.trim() === this.liscenceData[objNew].ContrLicenseName.trim() && desc.trim() === this.liscenceData[objNew].ContrLicenseDesc) {
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                const dialog = dialogRef.content.instance;

                dialog.alertMessage = `
          <div class="modal-alert info-alert">
              <p>${this.pageContent.Admin.Licenses.Liscence_Type} - "${txt}" ${this.pageContent.Admin.Licenses.data_exist}</p>
         </div> `;
                this.liscenseDisableSaveCtr = 0;
                this.licenceBtnClick = true;
                return;
            }
        }
        if (this.liscenseSelect > 0) {
            const dialogAlert = this.$dialog.open({ content: DeleteAlertComponent, width: 500 });
            const dialogData = dialogAlert.content.instance;
            dialogData.header = this.pageContentData.Event_Selection.Alert;
            if (action === 'DELETE') {
                dialogData.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContentData.Admin.Licenses.are_you_sure_delete} - "${txt}"? </p>
           </div> `;

                dialogAlert.result.subscribe((result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        this.apiService.post('AdminPage/InsertLicense', postObj).subscribe((res) => {
                            const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                            const dialog = dialogRef.content.instance;
                            dialog.alertMessage = `
                         <div class="modal-alert confirmation-alert">
                             <h2>${this.pageContent.Admin.Licenses.deleted}</h2>
                             <p>${this.pageContent.Admin.Licenses.Liscence_Type} - "${txt}" ${this.pageContent.Admin.Licenses.successfully_deleted}</p>
                        </div> `;

                            this.getLicenseTabData();
                            this.resetLiscense();
                            this.liscenseDisableSaveCtr = 0;
                        });
                    } else {
                        this.liscenseDisableSaveCtr = 0;
                    }
                });
            } else {
                dialogData.alertMessage = `
      <div class="modal-alert info-alert">
          <p *ngIf="liscenceData[objNew]">${this.pageContentData.Admin.Licenses.are_you_sure_update} - "${this.liscenceData[objNew].ContrLicenseName}"?</p>
     </div> `;

                dialogAlert.result.subscribe((result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        this.apiService.post('AdminPage/InsertLicense', postObj).subscribe((res) => {
                            const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                            const dialog = dialogRef.content.instance;
                            dialog.alertMessage = `
                <div class="modal-alert confirmation-alert">
                    <h2>${this.pageContent.Admin.Licenses.Updated}</h2>
                    <p>${this.pageContent.Admin.Licenses.Liscence_Type} - "${txt}" ${this.pageContent.Admin.Licenses.updated_successfully}</p>
               </div> `;

                            this.getLicenseTabData();

                            this.resetLiscense();
                            this.liscenseDisableSaveCtr = 0;
                        });
                    } else {
                        this.liscenseDisableSaveCtr = 0;
                    }
                });
            }
        } else {
            if (action === 'DELETE') {
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                      <div class="modal-alert info-alert">
                          <p>${this.pageContent.Admin.Licenses.Liscence_Type} - "${txt}"  ${this.pageContent.Admin.Licenses.data_no_exist}</p>
                      </div> `;
                this.liscenseDisableSaveCtr = 0;
            } else {
                await this._srvAdmin.SaveLicenseData(postObj);
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                    <div class="modal-alert confirmation-alert">
                        <h2>${this.pageContent.Admin.Licenses.Inserted}</h2>
                        <p>${this.pageContent.Admin.Licenses.Liscence_Type} - "${txt}" ${this.pageContent.Admin.Licenses.successfully_Added}</p>
                   </div> `;
                this.getLicenseTabData();
                this.resetLiscense();
                this.liscenseDisableSaveCtr = 0;
            }
        }

        this.licenceBtnClick = true;
    }
    public changeLiscenseDesc(ev): void {
        if (typeof ev === 'object') {
            this.editLiscenseActionId = ev.ContrLicenseID;
        }
        // ContrLicenseID
        this.liscenseDisableSaveCtr = 0;
        if (ev) {
            this.group.controls.liscenseDes.setValue(ev.ContrLicenseDesc);
        }
    }
    public resetLiscense(): void {
        this.liscenseField = null;
        this.group.controls.liscenseDes.setValue(null);
        this.equipSelect = null;
        this.equipCtr = 0;
        this.liscenseSelect = null;
        this.liscenceCtr = 0;
        this.liscenseDisableSaveCtr = 0;
    }

    // code for 'Add Equipment Types & Equipment' Starts here....
    public async getEquipmentType() {
        const reponse = await this._srvAdmin.GetEquipmentType();
        this.EquipmentData = reponse;
        this.equipmentTypeFilterData = reponse;
    }
    public async getEquipmentSelectType(val): Promise<EquipmentSelect[]> {
        return new Promise(async (resolve, reject) => {
            const response = await this._srvAdmin.GetEquipmentSelectType(val);
            this.EquipmentSelectData = response;
            this.equipmentSelectFilterData = response;
            resolve(response);
        });
    }

    EquipmentTypeSelectionChange(val) {
        if (typeof val === 'object') {
            this.selectedOptionType = null;
            this.getEquipmentSelectType(val);
            this.equipTypeActionID = val.EquipmentTypeID;
        }
    }

    EquipmentSelectionChange(val) {
        if (typeof val === 'object') {
            this.equipmentActionID = val.EquipmentListID;
        }
    }

    // Add-Equipment Type
    public async AddEquipmentType(EquipmentTypeName) {
        this.enableEquipmentTypeSave = true;
        let ccopsData = {};
        ccopsData = {
            EquipmentTypeID: this.equipmentTypeSelect,
            EquipmentTypeName: EquipmentTypeName.trim(),
            ActionType: 'ADD',
        };
        if (Object.keys(ccopsData).length > 0) {
            const objNew = this.EquipmentData.findIndex((x) => x.EquipmentTypeID === this.equipmentTypeSelect);

            if (objNew > -1 && (EquipmentTypeName.trim() === this.EquipmentData[objNew].EquipmentTypeName.trim())) {
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                const dialog = dialogRef.content.instance;

                dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Admin.Equipment.Equip_Type} - "${EquipmentTypeName}" ${this.pageContent.Admin.Equipment.data_exist}</p>
           </div> `;
                this.enableEquipmentTypeSave = false;
                return;
            }

            if (this.equipmentTypeSelect > 0) {
                const dialogAlert = this.$dialog.open({ content: DeleteAlertComponent, width: 600 });
                const dialogData = dialogAlert.content.instance;
                dialogData.header = this.pageContentData.Event_Selection.Alert;

                dialogData.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${this.pageContentData.Admin.Equipment.are_you_sure_update1} - "${this.EquipmentData[objNew].EquipmentTypeName}" to "${EquipmentTypeName.trim()}"?</p>
       </div> `;

                dialogAlert.result.subscribe(async (result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        await this._srvAdmin.SaveEquipmentType(ccopsData);
                        const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                        const dialog = dialogRef.content.instance;
                        dialog.alertMessage = `
                  <div class="modal-alert confirmation-alert">
                      <h2>${this.pageContent.Admin.Equipment.Updated}</h2>
                      <p>${this.pageContent.Admin.Equipment.Equip_Type} - "${EquipmentTypeName}" ${this.pageContent.Admin.Equipment.updated_successfully1}</p>
                 </div> `;

                        this.OnResetEquipment();
                        this.getEquipmentType();
                        this.enableEquipmentTypeSave = false;
                    } else {
                        this.enableEquipmentTypeSave = false;
                    }
                });
            } else {
                await this._srvAdmin.SaveEquipmentType(ccopsData);
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                const dialog = dialogRef.content.instance;

                dialog.alertMessage = `
              <div class="modal-alert confirmation-alert">
                  <h2>${this.pageContent.Admin.Equipment.Inserted}</h2>
                  <p>${this.pageContent.Admin.Equipment.Equip_Type} - "${EquipmentTypeName}" ${this.pageContent.Admin.Equipment.successfully_Added1}</p>
             </div> `;

                this.OnResetEquipment();
                this.getEquipmentType();
                this.enableEquipmentTypeSave = false;
            }
        }
    }

    // Add-Equipment
    public async AddEquipment(EquipmentTypeID, EquipmentListName) {
        this.enableEquipmentSave = true;
        let ccopsData = {};
        if (EquipmentTypeID > 0 && typeof EquipmentTypeID === 'number') {
            ccopsData = {
                EquipmentTypeID: EquipmentTypeID > 0 ? EquipmentTypeID : 0,
                EquipmentID: this.equipSelect,
                EquipmentName: EquipmentListName,
                ActionType: 'ADD',
            };
        }

        if (Object.keys(ccopsData).length > 0) {
            const objNew = this.EquipmentSelectData.findIndex((x) => x.EquipmentListID === this.equipSelect);

            if (objNew > -1 && (EquipmentListName.trim() === this.EquipmentSelectData[objNew].EquipmentListName.trim())) {
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                const dialog = dialogRef.content.instance;

                dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.Admin.Equipment.Equip} - "${EquipmentListName}" ${this.pageContent.Admin.Equipment.data_exist}</p>
           </div> `;
                this.enableEquipmentSave = false;
                return;
            }

            if (this.equipSelect > 0) {
                const dialogUpdate = this.$dialog.open({ content: DeleteAlertComponent, width: 600 });
                const dialogData = dialogUpdate.content.instance;
                dialogData.header = this.pageContentData.Event_Selection.Alert;
                dialogData.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${this.pageContentData.Admin.Equipment.are_you_sure_update2} - "${this.EquipmentSelectData[objNew].EquipmentListName}" to "${EquipmentListName.trim()}"?</p>
       </div> `;

                dialogUpdate.result.subscribe(async (result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        await this._srvAdmin.SaveEquipmentSelectType(ccopsData);
                        const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                        const dialog = dialogRef.content.instance;

                        dialog.alertMessage = `
                     <div class="modal-alert confirmation-alert">
                         <h2>${this.pageContent.Admin.Equipment.Updated}</h2>
                         <p>${this.pageContent.Admin.Equipment.Equip} - "${EquipmentListName}" ${this.pageContent.Admin.Equipment.updated_successfully2}</p>
                    </div> `;

                        this.OnResetEquipment();
                        this.enableEquipmentSave = false;
                        const val = { EquipmentTypeID };
                    } else {
                        this.enableEquipmentSave = false;
                    }
                });
            } else {
                await this._srvAdmin.SaveEquipmentSelectType(ccopsData);
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
              <div class="modal-alert confirmation-alert">
                  <h2>${this.pageContent.Admin.Equipment.Inserted}</h2>
                  <p>${this.pageContent.Admin.Equipment.Equip} - "${EquipmentListName}" ${this.pageContent.Admin.Equipment.successfully_Added2}</p>
             </div> `;

                this.OnResetEquipment();
                this.enableEquipmentSave = false;
                const val = { EquipmentTypeID };
            }
        } else {
            const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

            const dialog = dialogRef.content.instance;

            dialog.alertMessage = `
         <div class="modal-alert info-alert">
             <p>${this.pageContent.Admin.Equipment.please_select_equiptype}</p>
        </div> `;
            this.enableEquipmentSave = false;
        }
    }

    // Remove Equipment Type and Equipment
    public async OnRemoveEquipment(id, name, text, listID) {
        let ccopsData = {};
        if (text === 'DropDownOne') {
            if (id > 0 && typeof id === 'number') {
                ccopsData = {
                    EquipmentTypeID: id,
                    EquipmentTypeName: name,
                    ActionType: 'DELETE',
                };
            }

            if (Object.keys(ccopsData).length > 0) {
                const dialog = this.$dialog.open({ content: DeleteAlertComponent, width: 500 });
                const dialogData = dialog.content.instance;

                dialogData.header = this.pageContentData.Event_Selection.Alert;
                dialogData.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${this.pageContentData.Admin.Equipment.are_you_sure_delete1} - "${name}"? </p>
       </div> `;

                dialog.result.subscribe(async (result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        await this._srvAdmin.SaveEquipmentType(ccopsData);
                        const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                        const dialogs = dialogRef.content.instance;
                        dialogs.alertMessage = `
                     <div class="modal-alert confirmation-alert">
                         <h2>${this.pageContent.Admin.Equipment.deleted}</h2>
                         <p>${this.pageContent.Admin.Equipment.Equip_Type} - "${name}" ${this.pageContent.Admin.Equipment.successfully_deleted1}</p>
                    </div> `;

                        this.equipmentTypeSelect = null;
                        this.equipmentTypeSelectCtr = 0;
                        this.OnResetEquipment();
                        this.getEquipmentType();
                    }
                });
            } else {
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                  <div class="modal-alert info-alert">
                      <p>${this.pageContent.Admin.Equipment.Equip_Type} - "${name}"  ${this.pageContent.Admin.Equipment.data_no_exist1}</p>
                  </div> `;
            }
        } else if (text === 'DropDownTwo') {
            if (id > 0 && typeof id === 'number' && listID > 0 && typeof listID === 'number') {
                ccopsData = {
                    EquipmentTypeID: id > 0 ? id : 0,
                    EquipmentID: listID > 0 ? listID : 0,
                    EquipmentName: name,
                    ActionType: 'DELETE',
                };
            }

            if (Object.keys(ccopsData).length > 0) {
                const dialog = this.$dialog.open({ content: DeleteAlertComponent, width: 500 });
                const dialogData = dialog.content.instance;

                dialogData.header = 'Alert';
                dialogData.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${this.pageContentData.Admin.Equipment.are_you_sure_delete2} - "${name}"? </p>
       </div> `;

                dialog.result.subscribe(async (result) => {
                    const resultFromDialog = result;
                    if (resultFromDialog['button'] === 'Yes') {
                        await this._srvAdmin.SaveEquipmentSelectType(ccopsData);
                        const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

                        const dialogs = dialogRef.content.instance;
                        dialogs.alertMessage = `
                     <div class="modal-alert confirmation-alert">
                         <h2>${this.pageContent.Admin.Equipment.deleted}</h2>
                         <p>${this.pageContent.Admin.Equipment.Equip} - "${name}" ${this.pageContent.Admin.Equipment.successfully_deleted2}</p>
                    </div> `;

                        this.OnResetEquipment();
                        this.EquipmentSelectData = null;
                        this.equipSelect = null;
                        this.equipCtr = 0;
                        const val = { EquipmentTypeID: id };
                    }
                });
            } else {
                const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                  <div class="modal-alert info-alert">
                      <p>${this.pageContent.Admin.Equipment.Equip} - "${name}" ${this.pageContent.Admin.Equipment.data_no_exist2}</p>
                  </div> `;
            }
        }
    }

    OnResetEquipment() {
        this.selectedOption = null;
        this.selectedOptionType = null;
        this.EquipmentSelectData = null;
        this.equipmentTypeSelect = null;
        this.equipmentTypeSelectCtr = 0;
        this.equipmentSelectFilterData = [];
        this.equipSelect = null;
        this.equipCtr = 0;
        this.getEquipmentType();
    }

    async getAssignLiscenseDropdown() {
        const res: AssignLiscenceData = await this._srvAdmin.GetAssignLicenseDropdown(this.loginDetailsInternal);
        this.assignLiscenseData = res;
        this.stateProvinceDropdown = res.stateProvinceDropdown;
        this.assignLicenseDropdown = res.licenseDropdown;
        this.filterAssignLiscenseData = res.licenseDropdown;
        this.filterAssignLiscenseStateData = res.stateProvinceDropdown;

        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }
    async saveAssignLiscense(f) {
        this.assignClick = false;
        const value = f.value;
        if (!value) {
            return;
        }
        let pgmType: string = '';
        let tradeList: string = '';
        f.value.assignProgram.forEach((x) => {
            pgmType = pgmType ? pgmType + ',' + x.ProgramTypeID : x.ProgramTypeID;
        });
        f.value.tradeSelect.forEach((x) => {
            tradeList = tradeList ? tradeList + ',' + x.tradeListID : x.tradeListID;
        });
        const obj = {
            USStateAbbr: f.value.stateProvince.StateAbbreviationCode,
            ContrLicenseID: f.value.assignLiscenseName.ContrLicenseID,
            ProgramTypeID: pgmType.toString(),
            TradeListID: tradeList.toString(),
            LogedInResourceID: this.loginDetailsInternal.ResourceID,
            ActionType: 'ADD',
        };
        await this._srvAdmin.SaveAssignLicenseData(obj);
        f.form.reset();
        const dialogRef = this.$dialog.open({ content: DialogAlertsComponent, width: 500 });

        const dialog = dialogRef.content.instance;

        dialog.alertMessage = `
      <div class="modal-alert confirmation-alert">
          <h2>${this.pageContent.Admin.Assign_Required_Liscenses.Inserted}</h2>
          <p>${this.pageContent.Admin.Assign_Required_Liscenses.Data_Added_Successfully}</p>
     </div> `;
        this.assignClick = true;
    }

    onLiscenseChange(ev) {
        if (!isNaN(ev) && ev !== '') {
            this.liscenceCtr++;
            if (this.liscenseSelect !== this.editLiscenseActionId) {
                this.liscenseSelect = ev;
                if (typeof this.liscenseSelect === 'string') {
                    this.liscenseSelect = 0;
                    this.liscenceCtr = 0;
                }
            }
        } else if (this.liscenceCtr === 0 || ev === '') {
            this.liscenseSelect = 0;
            this.liscenceCtr = 0;
        }
    }

    onEquipmentTypeChange(ev) {
        if (!isNaN(ev) && ev !== '') {
            this.equipmentTypeSelectCtr++;
            if (this.equipmentTypeSelect !== this.equipTypeActionID) {
                this.equipmentTypeSelect = ev;
                if (typeof this.equipmentTypeSelect === 'string') {
                    this.equipmentTypeSelect = 0;
                    this.equipmentTypeSelectCtr = 0;
                }
            }
        } else if (this.equipmentTypeSelectCtr === 0 || ev === '') {
            this.equipmentTypeSelect = 0;
            this.equipmentTypeSelectCtr = 0;
        }
    }

    dataUnsavedAlert(e) {
        e.preventDefault();
        const dialogRef = this.$dialog.open({
            content: DialogAlertsComponent,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                            <div class="modal-alert info-alert">
                                <p>${this.pageContent.General_Keys.Please_save_changes}</p>
                            </div>
                        `;
    }

    resertAssignLicense() {
        this.liscenceModel.stateProvince = null;
        this.liscenceModel.assignLiscenseName = null;
        this.liscenceModel.assignProgram = null;
        this.liscenceModel.tradeSelect = null;
    }
    cancelAssignLicense(f) {
        f.form.reset();
    }

    isAdminDataExist() {
        if (
            (this.model.selectedLeadId !== undefined && this.model.selectedLeadId !== '' && this.model.selectedLeadId !== 0 && this.model.selectedLeadId !== null) ||
            (this.model.selectedChildIs !== undefined && this.model.selectedChildIs !== '' && this.model.selectedChildIs != null) ||
            (this.userRights != null && this.userRights.length > 0)
        ) {
            return true;
        } else if ((this.selectedOption !== null && this.selectedOption !== '') || (this.selectedOptionType != null && this.selectedOptionType !== '')) {
            return true;
        } else if (this.liscenseField !== undefined && this.liscenseField != null && this.liscenseField !== '') {
            return true;
        } else if (
            this.liscenceModel &&
            ((this.liscenceModel.stateProvince != null && this.liscenceModel.stateProvince !== undefined) ||
                (this.liscenceModel.assignLiscenseName !== undefined && this.liscenceModel.assignLiscenseName != null) ||
                (this.liscenceModel.assignProgram != null && this.liscenceModel.assignProgram !== '') ||
                (this.liscenceModel.tradeSelect !== undefined && this.liscenceModel.tradeSelect != null && this.liscenceModel.tradeSelect !== ''))
        ) {
            return true;
        } else {
            return false;
        }
    }
    getAdminBtnValue(event) {
        let value;
        if (event === true) {
            value = this.isAdminDataExist();
        }
        if (value === true) {
            this._srvLanguage.adminMsg.next(true);
        } else {
            this._srvLanguage.adminMsg.next(false);
        }
    }
    onTabSelect(ev) {
        if (ev.index === 2) {
            this.document.body.classList.add('manage-license');
        } else {
            this.document.body.classList.remove('manage-license');
        }
        let liscenseDesCtr = 0;
        if (
            (this.model.selectedLeadId !== undefined && this.model.selectedLeadId !== '' && this.model.selectedLeadId !== 0 && this.model.selectedLeadId !== null) ||
            (this.model.selectedChildIs !== undefined && this.model.selectedChildIs !== '' && this.model.selectedChildIs != null) || (this.userRights && this.userRights.length > 0)
        ) {
            this.dataUnsavedAlert(ev);
        } else if ((this.selectedOption != null && this.selectedOption !== '') || (this.selectedOptionType != null && this.selectedOptionType !== '')) {
            this.dataUnsavedAlert(ev);
        } else if (this.liscenseField != null && this.liscenseField !== '') {
            this.dataUnsavedAlert(ev);
            liscenseDesCtr++;
        } else if (
            this.liscenceModel &&
            (this.liscenceModel.stateProvince != null ||
                this.liscenceModel.assignLiscenseName != null ||
                (this.liscenceModel.assignProgram != null && this.liscenceModel.assignProgram !== '') ||
                (this.liscenceModel.tradeSelect != null && this.liscenceModel.tradeSelect !== ''))
        ) {
            this.dataUnsavedAlert(ev);
        }
        if (liscenseDesCtr <= 0) {
            this.group.controls.liscenseDes.setValue(null);
        }
        if (ev.index === 3) {
            this.getAssignLiscenseDropdown();
        }

        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }

    onEquipmentChange(ev) {
        if (!isNaN(ev) && ev !== '') {
            this.equipCtr++;
            if (this.equipSelect !== this.equipmentActionID) {
                this.equipSelect = ev;
                if (typeof this.equipSelect === 'string') {
                    this.equipSelect = 0;
                    this.equipCtr = 0;
                }
            }
        } else if (this.equipCtr === 0 || ev === '') {
            this.equipSelect = 0;
            this.equipCtr = 0;
        }
    }

    equipmentTypeFilter(ev) {
        this.EquipmentData = this.equipmentTypeFilterData.slice().filter((value) => value.EquipmentTypeName.toLowerCase().indexOf(ev.toLowerCase()) !== -1);
    }
    equipmentSelectFilter(ev) {
        if (this.equipmentSelectFilterData) {
            this.EquipmentSelectData = this.equipmentSelectFilterData.slice().filter((value) => value.EquipmentListName.toLowerCase().indexOf(ev.toLowerCase()) !== -1);
        }
    }
    manageLicenseFilter(ev) {
        this.liscenceData = this.filterLiscenseData.slice().filter((value) => value.ContrLicenseName.toLowerCase().indexOf(ev.toLowerCase()) !== -1);
    }
    public assignLiscenseFilter(ev) {
        this.assignLicenseDropdown = this.filterAssignLiscenseData.slice().filter((value) => value.ContrLicenseName.toLowerCase().indexOf(ev.toLowerCase()) !== -1);
    }
    public assignLiscenseStateFilter(ev) {
        this.stateProvinceDropdown = this.filterAssignLiscenseStateData.slice().filter((value) => value.StateProvinceName.toLowerCase().indexOf(ev.toLowerCase()) !== -1);
    }
    public onKeyPress(e, value) {
        if (e.keyCode === 32 && !value.length) e.preventDefault();
    }
}
