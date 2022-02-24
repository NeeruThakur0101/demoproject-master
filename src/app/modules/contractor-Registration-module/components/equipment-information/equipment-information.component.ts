import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { Component, OnInit, ViewContainerRef, ViewChild, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { EquipmentService } from './equipment-information.service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { Equipment, EquipmentInfo, LoginUser, SavedEquipment } from './model';
import { CorrectionRequestComments, InternalLogin } from 'src/app/core/models/user.model';
import { SelectApplicationModel } from '../../models/data-model';
import { ElementRef } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';

@Component({
    selector: 'app-equipment-information',
    templateUrl: './equipment-information.component.html',
})
export class EquipmentInformationComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    private resourceId: number;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public loggedInUserType: string;
    private ccopsId: number;
    public contrID: number;
    public formGroup: FormGroup;
    public showControls: boolean;
    public objProgram = new SelectApplicationModel();
    private contractorFirstPageData: SavedEquipment;
    private allEquipments: Equipment[] = [];
    private revertData: SavedEquipment;
    private contJsonData = {};
    public ownVisualFlag: Array<boolean> = [];
    public leaseVisualFlag: Array<boolean> = [];

    public ownDisableFlag: Array<boolean> = [];
    public leaseDisableFlag: Array<boolean> = [];

    public vehicleVisualToggle: boolean;
    public vehicleDisableToggle: boolean;
    private masterEquipmentsData: EquipmentInfo;
    public saveAndNextBtn: string = 'Save & Next';
    public saveBtnDisable: boolean = false;
    public hidePage: boolean = false;
    public readonlyPrivilege: boolean = false;
    public pageContent: any;
    public crComments: CorrectionRequestComments[];
    public loginDetailsInternal: SessionUser;

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    constructor(
        private dialogService: DialogService,
        private route: Router,
        public _eqpSrv: EquipmentService,
        private contService: ContractorRegistrationService,
        public _auth: AuthenticationService,
        public _language: InternalUserDetailsService,
        private _contractorData: ContractorDataService,
        private _srvUniversal: UniversalService,
        private renderer: Renderer2
    ) {
        this.loggedInUserType = this._auth.LoggedInUserType;
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
        this.loginDetailsInternal = this._auth.ProfileInternal;
        this.crComments = await this._contractorData.getPageComments('Equipment Information');
        this.pageContent = this._language.getPageContentByLanguage();;
        if (this.loggedInUserType === 'Internal') {
            this.saveAndNextBtn = this.pageContent.Equip_Info.Global_Button_Next;
        } else {
            this.saveAndNextBtn = this.pageContent.Equip_Info.Global_Button_SaveAndNext;
        }
        this.getLoginInfo();
    }

    async getLoginInfo() {
        this._eqpSrv.PageObject.length = 0;
        this.loginDetails = Array(this._auth.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.contrID = this.loginDetails[0].ContrID;
            this.ccopsId = this.loginDetails[0].CCOpsID;
        }
        this.loggedInUserType = this._auth.LoggedInUserType;
        if (this.loggedInUserType === 'Internal') {
            const loginDetailsInternal = this.loginDetailsInternal;
            this.resourceId = loginDetailsInternal.ResourceID;
        }
        this.formGroup = new FormGroup({
            vehicleToggle: new FormControl(),
        });

        const response = this.checkPrivilegeForUser();
        if (response) { return; }
        await this.tabData();
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer, 2000)

        if (this.readonlyPrivilege === true) {
            this.formGroup.disable(); // Privilege read only for user
        }
        if (this.contrID > 0) {
            this.contractorYet();
        } else {
            this.notContractorYet();
        }
    }
    checkPrivilegeForUser(): boolean {
        // for user access Privilege
        if (this.contrID > 0) {
            const accessType = this._auth.getPageAccessPrivilege('Equipment Information');
            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.readonlyPrivilege = true;
                    this.saveBtnDisable = true;
                } else {
                    this.hidePage = true;
                    const dialogRef = this.dialogService.open({
                        content: DialogAlertsComponent,
                        appendTo: this.containerRef,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = ` <div class="modal-alert info-alert">
             <h2>${this.pageContent.Equip_Info.Equipment_Alert_Access_Denied}</h2>
             <p>${this.pageContent.Equip_Info.Equipment_Alert_Access_Denied_Stmt}</p>
            </div>`;
                    dialogRef.result.subscribe((val) => {
                        this.route.navigate(['contractorRegistration/company-information']);
                    });
                    return true;
                }
            }
        }
        return false;
    }
    async tabData() {
        if (!this._eqpSrv.PageObject.length) {
            this._eqpSrv.PageObject = await this._eqpSrv.GetEquipmentInfoTab({ resourceID: this.resourceId, userLanguageID: this._auth.currentLanguageID });
            for (const eq of this._eqpSrv.PageObject) {
                eq.Equipments = await this._eqpSrv.GetEquipmentInfoTabData({ equipmentTypeID: eq.EquipmentTypeID, resourceID: this.resourceId, userLanguageID: this._auth.currentLanguageID });
                eq.Equipments.forEach((value) => {
                    this.formGroup.addControl(`own_${value.EQPL_ID_NB}`, new FormControl());
                    this.formGroup.addControl(`lease_${value.EQPL_ID_NB}`, new FormControl());
                });

                this._eqpSrv.PageObject.forEach((x, i) => {
                    this._eqpSrv.PageObject[i].Count = 0;
                });
                this.allEquipments = [...this.allEquipments, ...eq.Equipments];
            }
            this.showControls = true;
        }
    }

    processEquipment(e, equipment: Equipment, action: string) {
        this._eqpSrv.PageObject.forEach((x, i) => {
            let count = 0;
            x.Equipments.forEach((y) => {
                if (this.formGroup.controls[`own_${y.EQPL_ID_NB}`].value || this.formGroup.controls[`lease_${y.EQPL_ID_NB}`].value) {
                    count++;
                }
            });
            this._eqpSrv.PageObject[i].Count = count;
        });
    }

    async notContractorYet() {
        if (this.loggedInUserType === 'Internal') {
            this.disableForInternalUser();
        }
        const res: SavedEquipment = await this._eqpSrv.getSavedData({ resourceID: this.resourceId, CCOpsId: this.loginDetails[0].CCOpsID });
        // to get saved json for phase 1
        let data = null;
        if (res) {
            data = res;
            this.contractorFirstPageData = Object.assign([], res);
            this.revertData = res;
        }
        if (this.loggedInUserType === 'Internal') {
            this.contService.funcInternalUserGoDirectlyToContractorPage(data.EquipmentInformation, 'EquipmentInformation');
        }
        if (this.contractorFirstPageData && this.contractorFirstPageData.EquipmentInformation !== null) {
            const formData = this.contractorFirstPageData.EquipmentInformation['EquipmentDetails'];
            const controls = this.formGroup.controls;
            controls.vehicleToggle.setValue(this.contractorFirstPageData.EquipmentInformation.IsMarkedCompanyVehicles);
            if (formData.length > 0) {
                formData.forEach((eq) => {
                    if (controls[`own_${eq.EquipmentNumber}`]) {
                        controls[`own_${eq.EquipmentNumber}`].setValue(eq['NumberOfEquipmentOwned']);
                    }
                    if (controls[`lease_${eq.EquipmentNumber}`]) {
                        controls[`lease_${eq.EquipmentNumber}`].setValue(eq['NumberOfEquipmentLease']);
                    }
                });
            }

            if (this._eqpSrv.PageObject.length > 0) {
                this._eqpSrv.PageObject.forEach((x, i) => {
                    let count = 0;
                    if (x && x.Equipments) {
                        x.Equipments.forEach((y) => {
                            if (this.formGroup.controls[`own_${y.EQPL_ID_NB}`].value || this.formGroup.controls[`lease_${y.EQPL_ID_NB}`].value) {
                                count++;
                            }
                        });
                    }
                    this._eqpSrv.PageObject[i].Count = count;
                });
            }
        }
    }

    // Phase 2
    public async contractorYet() {
        const param = {
            contrID: this.contrID,
            resourceID: this.resourceId,
            pageName: 'Equipment Information Page',
            CCOpsId: this.loginDetails[0].CCOpsID,
            EventName: this._auth.Profile.EventAlias ? this._auth.Profile.EventAlias : this._auth.Profile.EventName,
        };

        const response = await this._eqpSrv.getContractorApprovalData(param);
        this.contJsonData =
            response.length > 0 && JSON.parse(response[0].CCOpsData) && JSON.parse(response[0].CCOpsData).ContractorData.EquipmentInformation
                ? JSON.parse(response[0].CCOpsData).ContractorData.EquipmentInformation
                : [];
        const controls = this.formGroup.controls;
        const currLangId = this._auth.currentLanguageID;
        const value = await this._eqpSrv.getMasterEquipmentData({ contrID: this.contrID, pageName: 'Equipment Information Page', resourceID: this.resourceId, userLanguageID: currLangId });
        this.masterEquipmentsData = Object.assign({}, value.EquipmentInformation);
        if (value.EquipmentInformation) {
            if (value.EquipmentInformation.EquipmentDetails) {
                value.EquipmentInformation.EquipmentDetails.forEach((res) => {
                    if (controls[`own_${res.EquipmentNumber}`]) {
                        controls[`own_${res.EquipmentNumber}`].setValue(res.NumberOfEquipmentOwned);
                    }
                    if (controls[`lease_${res.EquipmentNumber}`]) {
                        controls[`lease_${res.EquipmentNumber}`].setValue(res.NumberOfEquipmentLease);
                    }
                });
            }
            if (value.EquipmentInformation.IsMarkedCompanyVehicles) {
                controls.vehicleToggle.setValue(value.EquipmentInformation.IsMarkedCompanyVehicles);
            }
        }
        if (this.contJsonData !== null && this.contJsonData !== undefined) {
            this.compareData().then(() => {
                if (this.loggedInUserType === 'Internal') {
                    this.disableContractorVisual();
                }
                else {
                    this.disableContractorVisual('contractor');
                }
            });
        } else {
            this.counterUpdate();
        }
    }

    private compareData(): Promise<void> {
        return new Promise((resolve, reject) => {
            const control = this.formGroup.controls;
            const masterData = {
                isVehicleToggle: control.vehicleToggle.value === true ? 'True' : 'False',
                equipments: this.allEquipments,
            };
            if (this.contJsonData.hasOwnProperty('IsMarkedCompanyVehicles')) {
                control.vehicleToggle.setValue(this.contJsonData[`IsMarkedCompanyVehicles`]);
                this.vehicleVisualToggle = true;
            }
            if (this.contJsonData.hasOwnProperty('IsMarkedCompanyVehiclesDisable')) {
                this.vehicleDisableToggle = this.contJsonData[`IsMarkedCompanyVehiclesDisable`];
            }
            if (this.contJsonData.hasOwnProperty('EquipmentDetails')) {
                masterData.equipments.forEach((val, i) => {
                    this.contJsonData['EquipmentDetails'].forEach((item, j) => {
                        if (val.EQPL_ID_NB === item.EquipmentNumber) {
                            if (item.hasOwnProperty('NumberOfEquipmentOwned')) {
                                if (control[`own_${item.EquipmentNumber}`]) {
                                    control[`own_${item.EquipmentNumber}`].setValue(item.NumberOfEquipmentOwned);
                                }
                                this.ownVisualFlag[item.EquipmentNumber] = true;
                            }

                            // add disable functionality
                            if (item.hasOwnProperty('NumberOfEquipmentOwned') && item.hasOwnProperty('IsNumberOfEquipmentOwnedDisable')) {
                                this.ownDisableFlag[item.EquipmentNumber] = item.IsNumberOfEquipmentOwnedDisable;
                            }
                            // end disable functionality

                            if (item.hasOwnProperty('NumberOfEquipmentLease')) {
                                if (control[`lease_${item.EquipmentNumber}`]) {
                                    control[`lease_${item.EquipmentNumber}`].setValue(item.NumberOfEquipmentLease);
                                }
                                this.leaseVisualFlag[item.EquipmentNumber] = true;
                            }
                            if (item.hasOwnProperty('NumberOfEquipmentLease') && item.hasOwnProperty('IsNumberOfEquipmentLeaseDisable')) {
                                this.leaseDisableFlag[item.EquipmentNumber] = item.IsNumberOfEquipmentLeaseDisable;
                            }
                        }
                    });
                });
            }
            this.counterUpdate();
            resolve();
        });
    }

    private counterUpdate() {
        this._eqpSrv.PageObject.forEach((x, i) => {
            let count = 0;
            let visualCounter = false;
            x.Equipments.forEach((y) => {
                if (this.formGroup.controls[`own_${y.EQPL_ID_NB}`].value || this.formGroup.controls[`lease_${y.EQPL_ID_NB}`].value) {
                    count++;
                }
                if (this.ownVisualFlag[y.EQPL_ID_NB] === true || this.leaseVisualFlag[y.EQPL_ID_NB] === true) {
                    visualCounter = true;
                }
            });
            this._eqpSrv.PageObject[i].Count = count;
            this._eqpSrv.PageObject[i].IsVisualFlag = visualCounter;
        });
    }
    public disableContractorVisual(text?) {
        const control = this.formGroup.controls;

        if (this.vehicleDisableToggle) control.vehicleToggle.disable();

        if ((this.vehicleVisualToggle === true && this.loggedInUserType === 'Internal')) {
            control.vehicleToggle.disable();
        }
        if (text === 'contractor') {
            this.ownDisableFlag.forEach((value, i) => {
                if (value === true) {
                    control[`own_${i}`].disable();
                }
            });
            this.leaseDisableFlag.forEach((value, i) => {
                if (value === true) {
                    control[`lease_${i}`].disable();
                }
            });
        }
        else {
            this.ownVisualFlag.forEach((value, i) => {
                if (value === true) {
                    control[`own_${i}`].disable();
                }
            });
            this.leaseVisualFlag.forEach((value, i) => {
                if (value === true) {
                    control[`lease_${i}`].disable();
                }
            });
        }
    }

    public onSave() {
        if (this.loggedInUserType !== 'Internal') {
            const EquipmentInformationObj = this.someEventDataToPut();
            const equipmentObj = {
                EquipmentInformation: EquipmentInformationObj,
            };
            const finalObj = Object.keys(EquipmentInformationObj).length > 0 ? equipmentObj : null;
            this.submitEquipment(finalObj);
            return;
        } else if (this.loggedInUserType === 'Internal') {
            const EquipmentInformation = this.submitForInternal();
            this.submitEquipment(EquipmentInformation);
        }
    }
    public submitForInternal() {
        const equipmentsObj = {};
        const control = this.formGroup.controls;
        const masterData = {
            IsMarkedCompanyVehicles: this.masterEquipmentsData.IsMarkedCompanyVehicles ? this.masterEquipmentsData.IsMarkedCompanyVehicles : false,
        };
        if (control.vehicleToggle.value === true) {
            control.vehicleToggle.setValue(true);
        } else {
            control.vehicleToggle.setValue(false);
        }
        if (this.vehicleVisualToggle === false) {
            if (masterData.IsMarkedCompanyVehicles !== control.vehicleToggle.value) {
                equipmentsObj['IsMarkedCompanyVehicles'] = control.vehicleToggle.value === true ? true : false;
            }
        }
        const equipmentsSelectObj = this.internalEquipmentsSelected();
        if (equipmentsSelectObj.length > 0) {
            equipmentsObj['EquipmentDetails'] = equipmentsSelectObj;
        } else {
            equipmentsObj['EquipmentDetails'] = null;
        }
        return equipmentsObj;
    }
    private internalEquipmentsSelected() {
        const equipObj = [];
        const control = this.formGroup.controls;
        if (this.masterEquipmentsData && this.masterEquipmentsData.EquipmentDetails) {
            this.allEquipments.forEach((val, i) => {
                const eq = this.masterEquipmentsData.EquipmentDetails.find((ele) => {
                    return ele.EquipmentNumber === val.EQPL_ID_NB;
                });
                const index = this.contJsonData['EquipmentDetails'] ? this.contJsonData['EquipmentDetails'].findIndex((el) => el.EquipmentNumber === val.EQPL_ID_NB) : -1;
                if (index > -1) {
                    return;
                }
                this.ownVisualFlag[val.EQPL_ID_NB] = this.ownVisualFlag[val.EQPL_ID_NB] === true ? true : false;
                this.leaseVisualFlag[val.EQPL_ID_NB] = this.leaseVisualFlag[val.EQPL_ID_NB] === true ? true : false;
                let valueOwn;
                let valueLease;
                if (control[`own_${val.EQPL_ID_NB}`].value === null || control[`own_${val.EQPL_ID_NB}`].value === '') {
                    valueOwn = null;
                } else {
                    valueOwn = parseInt(control[`own_${val.EQPL_ID_NB}`].value, 10);
                }
                if (control[`lease_${val.EQPL_ID_NB}`].value === null || control[`lease_${val.EQPL_ID_NB}`].value === '') {
                    valueLease = null;
                } else {
                    valueLease = parseInt(control[`lease_${val.EQPL_ID_NB}`].value, 10);
                }
                const element = {
                    EquipmentName: val.EQPL_TX.trim(),
                    NumberOfEquipmentOwned: valueOwn,
                    NumberOfEquipmentLease: valueLease,
                    EquipmentNumber: val.EQPL_ID_NB,
                };
                let ownLeaseObj = {};
                if (eq) {
                    ownLeaseObj = this._eqpSrv.FromEquipApproved(element, eq);
                } else {
                    if (valueOwn !== null && valueLease !== null) {
                        ownLeaseObj = {
                            EquipmentName: val.EQPL_TX.trim(),
                            NumberOfEquipmentOwned: valueOwn,
                            NumberOfEquipmentLease: valueLease,
                            EquipmentNumber: val.EQPL_ID_NB,
                        };
                    } else if (valueOwn !== null) {
                        ownLeaseObj = {
                            EquipmentName: val.EQPL_TX.trim(),
                            NumberOfEquipmentOwned: valueOwn,
                            EquipmentNumber: val.EQPL_ID_NB,
                        };
                    } else if (valueLease !== null) {
                        ownLeaseObj = {
                            EquipmentName: val.EQPL_TX.trim(),
                            NumberOfEquipmentLease: valueLease,
                            EquipmentNumber: val.EQPL_ID_NB,
                        };
                    }
                }
                if (Object.keys(ownLeaseObj).length > 0) {
                    equipObj.push(ownLeaseObj);
                }
            });
        }

        return equipObj;
    }
    private someEventDataToPut() {
        const equipmentObj = {};
        const control = this.formGroup.controls;
        const masterData = {
            vehicleToggle: this.masterEquipmentsData.IsMarkedCompanyVehicles ? this.masterEquipmentsData.IsMarkedCompanyVehicles : false,
        };
        if (control.vehicleToggle.value === undefined || control.vehicleToggle.value === null) {
            control.vehicleToggle.setValue(false);
        }
        if (this.contJsonData && this.contJsonData.hasOwnProperty('IsMarkedCompanyVehicles')) {
            if (this.contJsonData['IsMarkedCompanyVehicles'] !== control.vehicleToggle.value) {
                equipmentObj['IsMarkedCompanyVehicles'] = control.vehicleToggle.value;
            }
        } else if (masterData.vehicleToggle !== control.vehicleToggle.value) {
            equipmentObj['IsMarkedCompanyVehicles'] = control.vehicleToggle.value;
        }
        const equipmentNum = this.someEventEquipmentDetails();
        if (equipmentNum.length > 0) {
            equipmentObj['EquipmentDetails'] = equipmentNum;
        }
        return equipmentObj;
    }
    private someEventEquipmentDetails() {
        const equipEventObj = [];
        const control = this.formGroup.controls;
        this.allEquipments.forEach((val, i) => {
            let valueOwn;
            let valueLease;
            if (control[`own_${val.EQPL_ID_NB}`].value === null || control[`own_${val.EQPL_ID_NB}`].value === isNaN || control[`own_${val.EQPL_ID_NB}`].value === '') {
                valueOwn = null;
            } else {
                valueOwn = parseInt(control[`own_${val.EQPL_ID_NB}`].value, 10);
                if (isNaN(valueOwn)) {
                    valueOwn = null;
                }
            }
            if (control[`lease_${val.EQPL_ID_NB}`].value === null || control[`lease_${val.EQPL_ID_NB}`].value === isNaN || control[`lease_${val.EQPL_ID_NB}`].value === '') {
                valueLease = null;
            } else {
                valueLease = parseInt(control[`lease_${val.EQPL_ID_NB}`].value, 10);
                if (isNaN(valueLease)) {
                    valueLease = null;
                }
            }
            let oldJsondata: any;
            let dbData: any;
            const index = this.contJsonData['EquipmentDetails'] ? this.contJsonData['EquipmentDetails'].findIndex((eq) => eq.EquipmentNumber === val.EQPL_ID_NB) : -1;
            const dbindex = this.masterEquipmentsData && this.masterEquipmentsData.EquipmentDetails ? this.masterEquipmentsData.EquipmentDetails.findIndex((db) => db.EquipmentNumber === val.EQPL_ID_NB) : -1;
            if (index > -1) {
                oldJsondata = this.contJsonData['EquipmentDetails'][index];
            }
            if (dbindex > -1) {
                dbData = this.masterEquipmentsData['EquipmentDetails'][dbindex];
            }
            let ownLeaseObj = {};
            const element = {
                EquipmentName: val.EQPL_TX.trim(),
                NumberOfEquipmentOwned: valueOwn,
                NumberOfEquipmentLease: valueLease,
                EquipmentNumber: val.EQPL_ID_NB,
            };
            if (index > -1) {
                ownLeaseObj = this._eqpSrv.FromEquipApproval(element, dbData, oldJsondata);
            } else if (dbindex > -1) {
                ownLeaseObj = this._eqpSrv.FromEquipApproved(element, dbData);
            } else {
                if (valueOwn !== null && valueLease !== null) {
                    ownLeaseObj = {
                        EquipmentName: val.EQPL_TX.trim(),
                        NumberOfEquipmentOwned: valueOwn,
                        NumberOfEquipmentLease: valueLease,
                        EquipmentNumber: val.EQPL_ID_NB,
                    };
                } else if (valueOwn !== null) {
                    ownLeaseObj = {
                        EquipmentName: val.EQPL_TX.trim(),
                        NumberOfEquipmentOwned: valueOwn,
                        EquipmentNumber: val.EQPL_ID_NB,
                    };
                } else if (valueLease !== null) {
                    ownLeaseObj = {
                        EquipmentName: val.EQPL_TX.trim(),
                        NumberOfEquipmentLease: valueLease,
                        EquipmentNumber: val.EQPL_ID_NB,
                    };
                }
            }
            if (Object.keys(ownLeaseObj).length > 0) {
                equipEventObj.push(ownLeaseObj);
            }
        });
        return equipEventObj;
    }
    async submitEquipment(equipment) {
        const ccopsData = {
            EquipmentInformation: equipment,
        };
        if (this.loggedInUserType !== 'Internal') {
            await this._contractorData.saveContractorData({ currentPage: 'Equipment Information Page', nextPage: 'trade-information' }, equipment, 'EquipmentInformation/EditEquipmentEventJsonData');
            this.crComments = await this._contractorData.getPageComments('Equipment Information');
            if (this._auth.Profile.EventName !== 'No Event') {
                this.route.navigate(['/contractorRegistration/trade-information']);
            } else {
                this.resetPage();
            }
            return;
        }
        this.objProgram.ResourceId = this.resourceId;
        this.objProgram.PageName = 'Equipment Information Page';
        this.objProgram.CCOpsID = this.ccopsId;
        this.objProgram.Contr_ID = this.contrID;
        this.objProgram.ContractorResourceID = this.loginDetails[0].ContractorResourceID;
        this.objProgram.ContractorResourceNumber = this.loginDetails[0].ContractorResourceID;
        let url;

        if (this.loggedInUserType === 'Internal') {
            url = 'JSON/EditJsonDataInternal';
            this.objProgram.Contr_ID = this.contrID;
            this.objProgram.CCOpsData = JSON.stringify(ccopsData);
        }
        await this._eqpSrv.submitEquipmentChanges(url, this.objProgram);
        this.resetPage();
    }
    disableForInternalUser() {
        this.formGroup.disable();
    }
    resetPage() {
        this._eqpSrv.PageObject.length = 0;
        this.contJsonData = null;
        this.ownVisualFlag = [];
        this.leaseVisualFlag = [];

        this.ownDisableFlag = [];
        this.leaseDisableFlag = [];

        this.allEquipments = [];
        this.vehicleVisualToggle = false;
        this.masterEquipmentsData = null;
        this.formGroup.reset();
        this.getLoginInfo();
    }
    backButtonClick() {
        if (this.formGroup.dirty) {
            const dialogRef = this.dialogService.open({
                content: SaveAlertComponent,
            });
            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Equip_Info.Global_Alert_Header_Warning;
            dialog.alertMessage = ` <div class="modal-alert info-alert">
            <h2>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved} </h2>
            <p>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved_Stmt}</p>
            </div>`;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    this.onBackClickFunction();
                }
            });
        } else {
            this.onBackClickFunction();
        }
    }
    async onBackClickFunction() {
        if (this._auth.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._contractorData.saveContractorData({ currentPage: 'Equipment Information Page', nextPage: 'reference-information' }, null, 'EquipmentInformation/EditEquipmentEventJsonData');
            this.route.navigate(['/contractorRegistration/reference-information']);
            return;
        }
        await this.contService.saveLastPageVisited('reference-information');
        this.route.navigate(['/contractorRegistration/reference-information']);
    }
    async onSaveNext() {
        if (this.loggedInUserType === 'Internal') {
            this.route.navigate(['/contractorRegistration/trade-information']);
        }
        const equipArray = [];
        const controls = this.formGroup.controls;
        this.allEquipments.forEach((value) => {
            // if (controls[`own_${value.EQPL_ID_NB}`].value || controls[`lease_${value.EQPL_ID_NB}`].value) {
            if ((controls[`own_${value.EQPL_ID_NB}`].value !== null) || (controls[`lease_${value.EQPL_ID_NB}`].value !== null)) {
                const equipObj = {
                    NumberOfEquipmentOwned: parseInt(controls[`own_${value.EQPL_ID_NB}`].value, 10),
                    NumberOfEquipmentLease: parseInt(controls[`lease_${value.EQPL_ID_NB}`].value, 10),
                    EquipmentNumber: value.EQPL_ID_NB,
                    EquipmentName: value.EQPL_TX.trim(),
                };
                equipArray.push(equipObj);
            }
        });
        const submitData = {
            IsMarkedCompanyVehicles: this.formGroup.controls.vehicleToggle.value === true ? true : false,
            EquipmentDetails: equipArray,
            ResourceId: this.loginDetails[0].ResourceID,
            CCopsId: this.ccopsId,
            LastPageVisited: 'trade-information',
        };
        await this._eqpSrv.SaveEquipmentData(submitData);
        this.route.navigate(['/contractorRegistration/trade-information']);
    }
    public keyPress(event, value) {
        const pattern = /[0-9\+\-\ ]/;
        const inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode === 32 || (event.keyCode === 48 && value.length < 1) || inputChar === '-' || inputChar === '+') {
            return false;
        } else if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public onPaste(e) {
        let clipboardData;
        let pastedData;
        // Get pasted data via clipboard API
        clipboardData = e.clipboardData;
        pastedData = clipboardData.getData('Text');
        const isNumber = this.isStringOrNumber(pastedData);
        // Do whatever with pasteddata
        if (isNumber === true) {
            // Stop data actually being pasted into div
            e.stopPropagation();
            e.preventDefault();
        }
    }

    public isStringOrNumber(txt) {
        const regExp = /[a-zA-Z]/g;
        const testString = txt;
        if (regExp.test(testString)) {
            return true;
        } else {
            return false;
        }
    }

    tabClick() {
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer, 2000)
    }
}
