import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from './../../services/contractor-Registration.service';
import { Component, OnInit, ViewChildren, QueryList, ElementRef, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { SelectApplicationModel } from '../../models/data-model';
import { Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { TradeService } from './trade.service';
import { InvalidCountArray, TradeGroupList, TradeJsonResult, TradeListJson, TradeListJsonApproval } from './trade-model';
import { CorrectionRequestComments, LoginUser } from 'src/app/core/models/user.model';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { UniversalService } from 'src/app/core/services/universal.service';
import { Renderer2 } from '@angular/core';
@Component({
    selector: 'app-trade-information',
    templateUrl: './trade-information.component.html',
    styleUrls: ['./trade-information.component.scss'],
})
export class TradeInformationComponent implements OnInit {
    public masterData: TradeGroupList[];
    public saveandNext: string;
    public TradeType: string = '';
    public loader: boolean = false;
    public TradeFlag: boolean = false;
    public tradeArray: TradeListJson[] = [];
    public internalArray: TradeListJson[] = [];
    public internalTempArray: TradeListJson[] = [];
    public arrayData: TradeListJson[] = [];
    public forwardedData: TradeJsonResult;
    public finalResult: TradeJsonResult;
    public resourceId: number;
    public countTrade: number = 0;
    public objProgram = new SelectApplicationModel();
    public updatedDataChangeCount: number = 0;
    @ViewChildren('subs') textSubs: QueryList<ElementRef>;
    @ViewChildren('trades') tradeList: QueryList<ElementRef>;
    @ViewChildren('subOutReason') ddlsubOutReason: QueryList<DropDownListComponent>;
    @ViewChildren('subOutComments') subComments: QueryList<ElementRef>;
    public textList: any[];
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public invalidCount: number = 0;
    public invalidCountArray: InvalidCountArray[] = [];
    public dataForApproval: TradeListJsonApproval[] = [];
    public oldData: TradeListJson[] = [];
    public oldDataToKeep: TradeListJson[] = [];
    public internalEmployee: boolean = false;
    public pageAccess: boolean = true;
    public readonlyMode: boolean = false;
    public crComments: CorrectionRequestComments[];
    public pageContent: any;
    public loggedInUserType: string;
    public showScroll: boolean = false;
    public dataForApprovalContractor: TradeListJsonApproval[] = [];
    public dataForApprovalContractorApproval: TradeListJsonApproval[] = [];
    public titleCSTrade: string;
    public titleSingleTrade: string;
    public ContrID: number;
    public ddlReasonCount: number = 0;
    public rowSize: number = 1;
    public ddlReasonCountArr: Array<string> = [];
    public saveClick: boolean = false;
    public expandType: string = 'single'

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    constructor(
        private _srvReg: ContractorRegistrationService,
        private _srvTrade: TradeService,
        private _route: Router,
        private _srvDialog: DialogService,
        private _srvContractor: ContractorRegistrationService,
        public _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvUniversal: UniversalService,
        private renderer: Renderer2
    ) {
        this.loginDetails = Array(this._srvAuth.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.ContrID = this.loginDetails[0].ContrID;
        // check if user is internal or contractor
        this.loggedInUserType = this._srvAuth.LoggedInUserType; // if 'Internal'
        this.internalEmployee = this.loggedInUserType === 'Internal' ? true : false;
    }

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    public keyupComment(groupId, tradeid, type, event) {
        let value;
        value = event !== null ? (typeof event === 'string' ? event : event.target.value) : null;
        const objMaster = this.masterData.find((x) => x.TradeGroupID === groupId);
        const objTrade = objMaster.TradeNameList.find((x) => x.TradeGroupID === groupId && x.TradeListID === tradeid);
        const charcount = value !== null ? value.length : 0;
        objTrade['rowSize'] = charcount <= 34 ? 1 : charcount > 34 && charcount < 68 ? 2 : charcount > 68 && charcount < 102 ? 3 : charcount > 102 && charcount < 136 ? 4 : 4;
        this.rowSize = charcount <= 34 ? 1 : charcount > 34 && charcount < 68 ? 2 : charcount > 68 && charcount < 102 ? 3 : charcount > 102 && charcount < 136 ? 4 : 4;
        // called this function on keyup to collect complete value of comment box(when we want to save data)
        if (type !== '') {
            this.updateTrades(groupId, tradeid, type, event);
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        $event.preventDefault();
        if (this.preventDataOnCancel('')) {
            $event.returnValue = 'true';
        }
    }

    async ngOnInit() {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.crComments = await this._srvContractorData.getPageComments('Trades');
        this.titleSingleTrade = this.pageContent.Trade_Info.SingleTrade_Tooltip;
        this.titleCSTrade = this.pageContent.Trade_Info.CS_Tooltip;
        if (this.ContrID > 0) {
            this._srvAuth.$pagePrivilege = this._srvAuth.getPageAccessPrivilege('Trade Information');
        }
        if (!this._srvAuth.$pagePrivilege.editAccess && !this._srvAuth.$pagePrivilege.readonlyAccess && this.loginDetails[0].ContrID > 0) {
            this.accessDenied();
            return;
        }
        if (this.loginDetails[0].ContrID > 0) {
            if (!this._srvAuth.$pagePrivilege.editAccess && this._srvAuth.$pagePrivilege.readonlyAccess) {
                this.readonlyMode = true;
            }
        }
        if (this.loggedInUserType === 'Internal') {
            this.saveandNext = this.pageContent.Trade_Info.Global_Button_Next;
        } else {
            this.saveandNext = this.pageContent.Trade_Info.Trade_Information_Save;
        }
        this.loadMasterData();
    }

    // this function gets the data which we have already sent for approval
    public async getJsonForApprovalData() {
        // get changes json
        const res: EditContractor[] = await this._srvTrade.GetEventPageJson(this.loginDetails[0].ContrID, this.resourceId, this.loginDetails[0].CCOpsID);
        if (res[0] && JSON.parse(res[0].CCOpsData) != null) {
            this.dataForApproval =
                res.length > 0 && res[0].CCOpsData && JSON.parse(res[0].CCOpsData).TradeInformation
                    ? JSON.parse(res[0].CCOpsData).TradeInformation
                    : res.length > 0 && JSON.parse(res[0].CCOpsData).ContractorData && JSON.parse(res[0].CCOpsData).ContractorData.TradeInformation
                        ? JSON.parse(res[0].CCOpsData).ContractorData.TradeInformation
                        : [];
            this.dataForApprovalContractorApproval = JSON.parse(JSON.stringify(this.dataForApproval));
        } else {
            // this._srvStorage.removeStorage('approvalJsonTrade');
        }
        this.fillTradesProgramData(this.finalResult);
    }

    // to map master data and recieved data and checked saved data
    public fillTradesProgramData(jsonResult) {
        const jsonData = jsonResult.TradeInformation == null ? [] : jsonResult.TradeInformation;
        let oldJsonArray = [];
        oldJsonArray = jsonResult.TradeInformation;

        // match old json with json for approval and show visual cue
        if (this.dataForApproval !== undefined) {
            this.dataForApproval.forEach((element) => {
                // tslint:disable-next-line: forin
                const ind = oldJsonArray.findIndex((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                if (ind !== -1) {
                    // tslint:disable-next-line: forin
                    for (const key in element) {
                        const objGrid = oldJsonArray[ind];
                        for (const appKey in objGrid) {
                            if (appKey === key) {
                                objGrid[appKey] = element[key];
                                objGrid['is' + appKey] = true;
                            }
                        }
                    }
                } else {
                    let obj;
                    obj = {
                        TradeGroupID: element.TradeGroupID,
                        ContrTradeID: element.ContrTradeID,
                        TradeListID: element.TradeListID,
                        SingleTradeFlg: element.SingleTradeFlg,
                        PrimaryFlg: element.PrimaryFlg,
                        SubOutPct: element.SubOutPct,
                        SubOutComment: element.SubOutComment,
                        ContractorSubOutReasonNumber: element.ContractorSubOutReasonNumber,
                        ContractorSubOutReasonName: element.ContractorSubOutReasonName,
                        ConsumerFlg: element.ConsumerFlg,

                        isSingleTradeFlg: true,
                        isPrimaryFlg: true,
                        isSubOutPct: true,
                        isConsumerFlg: true,
                        isContractorSubOutReasonNumber: true,
                        isSubOutComment: true,
                    };
                    oldJsonArray.push(obj);
                }
            });
        }

        // this block of code is used to reset all visual cue at false
        // because sometimes it remain true due to the approval data and the trade data are different
        this.masterData.forEach((x) => {
            x.TradeNameList.forEach((element) => {
                element['isSubOutPct'] = false;
                element['isSingleTradeFlg'] = false;
                element['isPrimaryFlg'] = false;
                element['isConsumerFlg'] = false;
                element['isSubOutComment'] = false;
                element['isContractorSubOutReasonNumber'] = false;
                x['iscount'] = false;
            });
        });
        // end block

        // end match json for visual cue
        for (const x of this.masterData) {
            x['count'] = 0;
            for (const k of jsonData) {
                const index = x.TradeNameList.findIndex((e) => e.TradeListID === k.TradeListID && e.TradeGroupID === k.TradeGroupID);
                if (index !== -1) {
                    this.showSubOutComments(k.TradeGroupID, k.TradeListID, k.SubOutPct, 'get');
                    x.TradeNameList[index]['checkedTrade'] = k.PrimaryFlg;
                    x.TradeNameList[index]['SubOutPct'] = k.SubOutPct;
                    x.TradeNameList[index]['ContractorSubOutReasonNumber'] = k.ContractorSubOutReasonNumber;
                    x.TradeNameList[index]['ContractorSubOutReasonName'] = k.ContractorSubOutReasonName;
                    // for disable functionality
                    const obj = this.dataForApprovalContractorApproval.find((e) => e.TradeListID === k.TradeListID && e.TradeGroupID === k.TradeGroupID);
                    x.TradeNameList[index]['IsRowDisable'] = obj !== undefined && obj['IsRowDisable'] ? obj['IsRowDisable'] : false;
                    // end disable functionality
                    x.TradeNameList[index]['SubOutComment'] = k.SubOutComment === undefined ? null : k.SubOutComment;
                    this.keyupComment(k.TradeGroupID, k.TradeListID, '', k.SubOutComment === undefined ? null : k.SubOutComment);
                    x.TradeNameList[index]['checkedSingle'] = k.SingleTradeFlg;
                    x.TradeNameList[index]['checkedConsumer'] = k.ConsumerFlg;
                    x.TradeNameList[index]['isSubOutPct'] = k.isSubOutPct !== undefined ? k.isSubOutPct : false;
                    x.TradeNameList[index]['isSingleTradeFlg'] = k.isSingleTradeFlg !== undefined ? k.isSingleTradeFlg : false;
                    x.TradeNameList[index]['isPrimaryFlg'] = k.isPrimaryFlg !== undefined ? k.isPrimaryFlg : false;
                    x.TradeNameList[index]['isConsumerFlg'] = k.isConsumerFlg !== undefined ? k.isConsumerFlg : false;
                    x.TradeNameList[index]['isSubOutComment'] = k.isSubOutComment !== undefined ? k.isSubOutComment : false;
                    x.TradeNameList[index]['isContractorSubOutReasonNumber'] = k.isContractorSubOutReasonNumber !== undefined ? k.isContractorSubOutReasonNumber : false;
                    if (x.TradeNameList[index]['checkedTrade'] === true) {
                        x['count'] = x['count'] !== undefined ? x['count'] + 1 : 1;
                    }
                    //#region  Code changed by Vivek Sharma on 27-08-2020.
                    if (
                        x.TradeNameList[index]['isSubOutPct'] === true ||
                        x.TradeNameList[index]['isSingleTradeFlg'] === true ||
                        x.TradeNameList[index]['isPrimaryFlg'] === true ||
                        x.TradeNameList[index]['isConsumerFlg'] === true ||
                        x.TradeNameList[index]['isSubOutComment'] === true ||
                        x.TradeNameList[index]['isContractorSubOutReasonNumber'] === true
                    ) {
                        x['iscount'] = true;
                    }
                    //#endregion
                }
            }
        }
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer);
    }

    // bind master programes and trades data in html
    public async loadMasterData() {
        const res: TradeGroupList[] = await this._srvTrade.GetTradeMasterData();
        this.masterData = res;
        this.masterData.forEach((element) => {
            element['count'] = 0;
            element['showSubOutReason'] = false;
            if (element.TradeNameList.length <= 5) {
                element['setHeight'] = true;
            }
        });

        // get all json data to bind
        this.getJSON();
    }

    public async getJSON() {
        const res: TradeJsonResult = await this._srvTrade.GetTradeDetails();
        if (this.loginDetails[0].ContrID > 0) {
            this.forwardedData = res;
            if (this.forwardedData.hasOwnProperty('TradeInformation')) {
                this.finalResult = this.forwardedData;
                this.tradeArray = this.finalResult.TradeInformation;
                const old = this.finalResult.TradeInformation;
                this.oldData = old;
                this.oldDataToKeep = JSON.parse(JSON.stringify(this.finalResult.TradeInformation));
                this.getJsonForApprovalData();
            }
        } else {
            this._srvContractor.funcInternalUserGoDirectlyToContractorPage(res.TradeInformation, 'TradeInformation');
            this.forwardedData = res;
            if (this.forwardedData.TradeInformation === null && this.loggedInUserType === 'Internal') return;
            if (this.forwardedData != null && this.forwardedData.hasOwnProperty('TradeInformation')) {
                this.finalResult = res;
                this.tradeArray = this.finalResult.TradeInformation === null ? [] : this.finalResult.TradeInformation;
                this.fillTradesProgramData(this.finalResult);
            }
        }
    }
    // update and add trades programs
    public updateTrades(groupId, tradeid, type, event?, subevt?, subValue?) {
        if (type === 'reasonComment' && event.target.value.length > 1000) {
            event.target.value = event.target.value.substring(0, 1000);
        }
        if (type === 'sub' && subValue === null && (subevt.code === 'Backspace' || subevt.code === 'Delete')) {
            return false;
        }
        if (type === 'reason') {
            const id = 'reason' + '-' + groupId + '-' + tradeid;
            const index = this.ddlReasonCountArr.indexOf(id);
            if (index > -1) {
                this.ddlReasonCountArr.splice(index, 1);
            }
            const ddl = this.ddlsubOutReason['_results'].find((x) => x.wrapper.nativeElement.parentElement.id === id);
            ddl.wrapper.nativeElement.parentElement.classList.remove('err');
        }
        this.TradeType = type;
        this.TradeFlag = false;
        const tradeGroupId = parseInt(groupId, 10);
        const tradeId = parseInt(tradeid, 10);
        if (type === 'reason') {
            const arrayIndex = this.tradeArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
            if (arrayIndex !== -1) {
                this.tradeArray[arrayIndex]['ContractorSubOutReasonNumber'] = event.ContractorSubOutReasonNumber;
                this.tradeArray[arrayIndex]['ContractorSubOutReasonName'] = event.ContractorSubOutReasonName;
            }
        }
        if (type === 'reasonComment') {
            const arrayIndex = this.tradeArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
            if (arrayIndex !== -1) {
                this.tradeArray[arrayIndex]['SubOutComment'] = event.target.value;
            }
        }
        if (this.loggedInUserType === 'Internal') {
            if (type === 'reason') {
                const arrayIndex = this.internalArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
                if (arrayIndex !== -1) {
                    this.internalArray[arrayIndex]['ContractorSubOutReasonNumber'] = event.ContractorSubOutReasonNumber;
                    this.internalArray[arrayIndex]['ContractorSubOutReasonName'] = event.ContractorSubOutReasonName;
                }
            }
            if (type === 'reasonComment') {
                const arrayIndex = this.internalArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
                if (arrayIndex !== -1) {
                    this.internalArray[arrayIndex]['SubOutComment'] = event.target.value;
                }
            }
        }
        if (type === 'sub') {
            this.textSubs.forEach((input: ElementRef) => {
                const groupid = parseInt(input.nativeElement.id.split('-')[1], 10);
                const trade = parseInt(input.nativeElement.id.split('-')[2], 10);
                if (groupid === tradeGroupId && trade === tradeId) {
                    const inputVal = Number.isNaN(input.nativeElement.value) || input.nativeElement.value === '' || input.nativeElement.value === undefined ? null : input.nativeElement.value;
                    const inputValue = inputVal !== null ? parseInt(inputVal, 10) : null;
                    if (inputValue > 100) {
                        const dialogRef = this._srvDialog.open({
                            content: DialogAlertsComponent,
                            width: 500,
                        });
                        const dialog = dialogRef.content.instance;
                        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Trade_Info.Alert_Enter_0to100}</p>
                                </div>
                            `;
                        this.countTrade = this.countTrade + 1;
                        this.showSubOutComments(groupid, trade, inputValue, 'post');
                        return false;
                    } else {
                        // enhancement to add new column
                        this.showSubOutComments(groupid, trade, inputValue, 'post');
                        // end
                        this.createJsonObjectToSave(tradeGroupId, tradeId, type, inputValue);
                    }
                }
            });
        } else {
            const index = this.tradeArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
            const inputValue = index !== -1 ? this.tradeArray[index].SubOutPct : null;
            this.createJsonObjectToSave(tradeGroupId, tradeId, type, inputValue); // value = -1 is sent to differentiate NaN is used when no entry fill in text and 0 is when user remove the Sub text value
        }
    }

    public async showSubOutComments(groupid, trade, subValue, text) {
        if (subValue > 0 && subValue < 101) {
            const obj = this.masterData.find((x) => x.TradeGroupID === groupid);
            const objTrade = obj.TradeNameList.find((x) => x.TradeListID === trade);
            const res = objTrade.ReasonList;
            if (res.length > 0) {
                obj['showScroll'] = true;
                obj.showSubOutReason = true;
                if (text === 'post' && objTrade['showTradeReason'] === undefined) {
                    const id = 'reason-' + groupid + '-' + trade;
                    this.ddlReasonCountArr.push(id);
                }
                objTrade['showTradeReason'] = true;
                // add this function here to show comment area and to calculate the row size of text are
                this.keyupComment(groupid, trade, '', null);
                objTrade['ReasonListNew'] = res;
            }
        } else {
            const obj = this.masterData.find((x) => x.TradeGroupID === groupid);
            obj['showScroll'] = false;
            const objTrade = obj.TradeNameList.find((x) => x.TradeListID === trade);
            if (text === 'post' && objTrade['showTradeReason'] !== undefined) {
                const id = 'reason' + '-' + groupid + '-' + trade;
                const index = this.ddlReasonCountArr.indexOf(id);
                if (index > -1) {
                    this.ddlReasonCountArr.splice(index, 1);
                }
            }
            delete objTrade['showTradeReason'];
            objTrade['ReasonListNew'] = [];
            let isHide: boolean = false;
            const ind = obj.TradeNameList.findIndex((x) => x['ReasonListNew'] && x['ReasonListNew'].length > 0);
            isHide = ind > -1 ? true : false;
            if (!isHide) {
                obj.showSubOutReason = false;
            }
        }
    }

    public createTempArray(tradeGroupId, tradeId, type, value) {
        if (this.internalTempArray.length > 0) {
            let objNew;
            const existIndex = this.internalTempArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
            if (existIndex !== -1) {
                if (type !== '') {
                    if (type === 'trade') {
                        const primaryFlag = this.internalTempArray[existIndex].PrimaryFlg === true ? false : true;
                        objNew = {
                            TradeGroupID: tradeGroupId,
                            ContrTradeID: this.internalTempArray[existIndex].ContrTradeID,
                            TradeListID: tradeId,
                            SingleTradeFlg: primaryFlag === false ? false : this.internalTempArray[existIndex].SingleTradeFlg,
                            PrimaryFlg: this.internalTempArray[existIndex].PrimaryFlg === true ? false : true,
                            SubOutPct: primaryFlag === false ? null : this.internalTempArray[existIndex].SubOutPct,
                            ConsumerFlg: primaryFlag === false ? false : this.internalTempArray[existIndex].ConsumerFlg,
                            SubOutComment: primaryFlag === false ? '' : this.internalTempArray[existIndex].SubOutComment,
                            ContractorSubOutReasonNumber: primaryFlag === false ? 0 : this.internalTempArray[existIndex].ContractorSubOutReasonNumber,
                            ContractorSubOutReasonName: primaryFlag === false ? '' : this.internalTempArray[existIndex].ContractorSubOutReasonName,
                        };
                        this.showSubOutComments(tradeGroupId, tradeId, objNew.SubOutPct == null ? 0 : objNew.SubOutPct, 'post');
                    } else if (type === 'single') {
                        objNew = {
                            TradeGroupID: tradeGroupId,
                            ContrTradeID: this.internalTempArray[existIndex].ContrTradeID,
                            TradeListID: tradeId,
                            SingleTradeFlg: this.internalTempArray[existIndex].SingleTradeFlg === true ? false : true,
                            PrimaryFlg: true,
                            SubOutPct: value,
                            ConsumerFlg: this.internalTempArray[existIndex].ConsumerFlg,
                        };
                    } else if (type === 'consumer') {
                        objNew = {
                            TradeGroupID: tradeGroupId,
                            ContrTradeID: this.internalTempArray[existIndex].ContrTradeID,
                            TradeListID: tradeId,
                            SingleTradeFlg: this.internalTempArray[existIndex].SingleTradeFlg,
                            PrimaryFlg: true,
                            SubOutPct: this.internalTempArray[existIndex].SubOutPct,
                            ConsumerFlg: this.internalTempArray[existIndex].ConsumerFlg === true ? false : true,
                        };
                    } else if (type === 'sub') {
                        const PrimaryFlag = value == null ? false : true;
                        objNew = {
                            TradeGroupID: tradeGroupId,
                            ContrTradeID: this.internalTempArray[existIndex].ContrTradeID,
                            TradeListID: tradeId,
                            SingleTradeFlg: PrimaryFlag === false ? false : this.internalTempArray[existIndex].SingleTradeFlg,
                            PrimaryFlg: value == null ? false : true,
                            SubOutPct: value,
                            ConsumerFlg: PrimaryFlag === false ? false : this.internalTempArray[existIndex].ConsumerFlg,
                        };
                    } else if (type === 'reason' || type === 'reasonComment') {
                        objNew = {
                            TradeGroupID: this.internalTempArray[existIndex].TradeGroupID,
                            ContrTradeID: this.internalTempArray[existIndex].ContrTradeID,
                            TradeListID: this.internalTempArray[existIndex].TradeListID,
                            SingleTradeFlg: this.internalTempArray[existIndex].SingleTradeFlg,
                            PrimaryFlg: this.internalTempArray[existIndex].PrimaryFlg,
                            SubOutPct: this.internalTempArray[existIndex].SubOutPct,
                            ConsumerFlg: this.internalTempArray[existIndex].ConsumerFlg,
                            SubOutComment: this.internalTempArray[existIndex].SubOutComment,
                            ContractorSubOutReasonNumber: this.internalTempArray[existIndex].ContractorSubOutReasonNumber,
                            ContractorSubOutReasonName: this.internalTempArray[existIndex].ContractorSubOutReasonName,
                        };
                    }
                }
            } else {
                objNew = {
                    TradeGroupID: tradeGroupId,
                    ContrTradeID: null,
                    TradeListID: tradeId,
                    SingleTradeFlg: type === 'single' ? true : false,
                    PrimaryFlg: type === 'trade' || (type === 'sub' && value != null) || type === 'consumer' || type === 'single' ? true : false,
                    SubOutPct: value,
                    ConsumerFlg: type === 'consumer' ? true : false,
                    SubOutComment: null,
                    ContractorSubOutReasonNumber: 0,
                    ContractorSubOutReasonName: null,
                };
            }
            this.internalArray.push(objNew);
        }
        return this.internalArray;
    }
    // commonly used to create object in final format
    public createJsonObjectToSave(tradeGroupId, tradeId, type, subValue) {
        const value = subValue != null ? parseInt(subValue, 10) : null;
        let obj;
        const masterIndex = this.masterData.findIndex((e) => e.TradeGroupID === tradeGroupId);
        const tradeInd = this.masterData[masterIndex].TradeNameList.findIndex((e) => e.TradeListID === tradeId && e.TradeGroupID === tradeGroupId);
        //#region  db internal employee..
        this.internalTempArray = this.tradeArray;
        if (this.loggedInUserType === 'Internal') {
            if (this.internalArray.length > 0) {
                let existIndex: number;
                existIndex = this.internalArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
                if (existIndex !== -1) {
                    if (type !== '') {
                        if (type === 'trade') {
                            const primaryFlag = this.internalArray[existIndex].PrimaryFlg === true ? false : true;
                            obj = {
                                TradeGroupID: tradeGroupId,
                                TradeListID: tradeId,
                                ContrTradeID: this.internalArray[existIndex].ContrTradeID,
                                SingleTradeFlg: primaryFlag === false ? false : this.internalArray[existIndex].SingleTradeFlg,
                                PrimaryFlg: this.internalArray[existIndex].PrimaryFlg === true ? false : true,
                                SubOutPct: primaryFlag === false ? null : this.internalArray[existIndex].SubOutPct,
                                ConsumerFlg: primaryFlag === false ? false : this.internalArray[existIndex].ConsumerFlg,
                            };
                            this.internalArray[existIndex] = obj;
                        } else if (type === 'single') {
                            obj = {
                                TradeGroupID: tradeGroupId,
                                TradeListID: tradeId,
                                ContrTradeID: this.internalArray[existIndex].ContrTradeID,
                                SingleTradeFlg: this.internalArray[existIndex].SingleTradeFlg === true ? false : true,
                                PrimaryFlg: true,
                                SubOutPct: value,
                                ConsumerFlg: this.internalArray[existIndex].ConsumerFlg,
                            };
                            this.internalArray[existIndex] = obj;
                        } else if (type === 'consumer') {
                            obj = {
                                TradeGroupID: tradeGroupId,
                                TradeListID: tradeId,
                                ContrTradeID: this.internalArray[existIndex].ContrTradeID,
                                SingleTradeFlg: this.internalArray[existIndex].SingleTradeFlg,
                                PrimaryFlg: true,
                                SubOutPct: this.internalArray[existIndex].SubOutPct,
                                ConsumerFlg: this.internalArray[existIndex].ConsumerFlg === true ? false : true,
                            };
                            this.internalArray[existIndex] = obj;
                        } else if (type === 'sub') {
                            const PrimaryFlag = value == null ? false : true;
                            obj = {
                                TradeGroupID: tradeGroupId,
                                TradeListID: tradeId,
                                ContrTradeID: this.internalArray[existIndex].ContrTradeID,
                                SingleTradeFlg: PrimaryFlag === false ? false : this.internalArray[existIndex].SingleTradeFlg,
                                PrimaryFlg: PrimaryFlag,
                                SubOutPct: value,
                                ConsumerFlg: PrimaryFlag === false ? false : this.internalArray[existIndex].ConsumerFlg,
                            };
                            this.internalArray[existIndex] = obj;
                        }
                    }
                } else {
                    this.internalArray = this.createTempArray(tradeGroupId, tradeId, type, subValue);
                }
            } else {
                this.internalArray = this.createTempArray(tradeGroupId, tradeId, type, subValue);
            }
            this.internalTempArray = [];
        }
        //#endregion
        if (this.tradeArray.length > 0) {
            const arrayIndex = this.tradeArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);

            if (arrayIndex !== -1) {
                // this parameter is used when already added data is updated and before save
                // back button is pressed so it stops and ask to save data or not

                if (type !== '') {
                    if (type === 'trade') {
                        this.TradeFlag = this.tradeArray[arrayIndex].PrimaryFlg;
                        this.tradeArray[arrayIndex].PrimaryFlg = this.tradeArray[arrayIndex].PrimaryFlg === true ? false : true;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedTrade'] = this.tradeArray[arrayIndex].PrimaryFlg;

                        // after client change

                        const primaryFlag = this.tradeArray[arrayIndex].PrimaryFlg;
                        // if uncheck the trade and it exists in dataApprovaljson
                        // then also remove it from that json
                        if (this._srvAuth.Profile.EventName === 'No Event' && primaryFlag === false) {
                            const indApp = this.dataForApproval.findIndex((x) => x.TradeGroupID === tradeGroupId && x.TradeListID === tradeId);
                            if (indApp !== -1) {
                                this.dataForApproval.splice(indApp, 1);
                            }
                        }
                        this.mendateSub(tradeGroupId, tradeId, primaryFlag);
                        // end
                    }
                    if (type === 'single') {
                        this.tradeArray[arrayIndex].SingleTradeFlg = this.tradeArray[arrayIndex].SingleTradeFlg === true ? false : true;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedSingle'] = this.tradeArray[arrayIndex].SingleTradeFlg;

                        // after client change
                        this.TradeFlag = this.tradeArray[arrayIndex].PrimaryFlg === true ? true : false;
                        if (this.tradeArray[arrayIndex].SingleTradeFlg === true) {
                            this.tradeArray[arrayIndex].PrimaryFlg = true;
                        }

                        if (this.tradeArray[arrayIndex].PrimaryFlg === true) {
                            this.mendateSub(tradeGroupId, tradeId, this.tradeArray[arrayIndex].PrimaryFlg);
                        }
                        // end

                        this.updatedDataChangeCount = this.tradeArray[arrayIndex].SingleTradeFlg === true ? this.updatedDataChangeCount + 1 : this.updatedDataChangeCount - 1;
                    }
                    if (type === 'consumer') {
                        this.tradeArray[arrayIndex].ConsumerFlg = this.tradeArray[arrayIndex].ConsumerFlg === true ? false : true;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedConsumer'] = this.tradeArray[arrayIndex].ConsumerFlg;

                        this.TradeFlag = this.tradeArray[arrayIndex].PrimaryFlg === true ? true : false;
                        // after client change
                        if (this.tradeArray[arrayIndex].ConsumerFlg === true) {
                            this.tradeArray[arrayIndex].PrimaryFlg = true;
                        }

                        if (this.tradeArray[arrayIndex].PrimaryFlg === true) {
                            this.mendateSub(tradeGroupId, tradeId, this.tradeArray[arrayIndex].PrimaryFlg);
                        }
                        // end

                        this.updatedDataChangeCount = this.tradeArray[arrayIndex].ConsumerFlg === true ? this.updatedDataChangeCount + 1 : this.updatedDataChangeCount - 1;
                    }
                    if (type === 'sub') {
                        this.tradeArray[arrayIndex].SubOutPct = value;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['SubOutPct'] = this.tradeArray[arrayIndex].SubOutPct;

                        // after client change
                        this.TradeFlag = this.tradeArray[arrayIndex].PrimaryFlg === true ? true : false;

                        this.tradeArray[arrayIndex].PrimaryFlg = value == null ? false : true;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedTrade'] = this.tradeArray[arrayIndex].PrimaryFlg;
                        this.mendateSub(tradeGroupId, tradeId, this.tradeArray[arrayIndex].PrimaryFlg);
                        // end

                        if (this.tradeArray.length > arrayIndex) {
                            this.updatedDataChangeCount =
                                this.tradeArray[arrayIndex].SubOutPct !== 0 && this.tradeArray[arrayIndex].SubOutPct != null ? this.updatedDataChangeCount + 1 : this.updatedDataChangeCount - 1;
                        }
                    }
                }
                if (this.tradeArray.length > arrayIndex) {
                    if (this.loginDetails[0].ContrID <= 0) {
                        if (
                            this.tradeArray[arrayIndex].SingleTradeFlg === false &&
                            this.tradeArray[arrayIndex].PrimaryFlg === false &&
                            this.tradeArray[arrayIndex].ConsumerFlg === false &&
                            this.tradeArray[arrayIndex].SubOutPct == null
                        ) {
                            this.tradeArray.splice(arrayIndex, 1);
                            this.masterData[masterIndex]['count'] = this.masterData[masterIndex]['count'] !== undefined ? this.masterData[masterIndex]['count'] - 1 : 0;
                        }
                    }
                }
            } else {
                obj = {
                    TradeGroupID: tradeGroupId,
                    ContrTradeID: null,
                    TradeListID: tradeId,
                    SingleTradeFlg: type === 'single' ? true : false,
                    PrimaryFlg: type === 'trade' || (type === 'sub' && value != null) || type === 'consumer' || type === 'single' ? true : false,
                    SubOutPct: value,
                    ConsumerFlg: type === 'consumer' ? true : false,
                    SubOutComment: null,
                    ContractorSubOutReasonNumber: 0,
                    ContractorSubOutReasonName: null,
                };
                if (type === 'trade' || type === 'sub' || type === 'consumer' || type === 'single') {
                    this.mendateSub(tradeGroupId, tradeId, obj.PrimaryFlg);
                }
                if (obj.SingleTradeFlg !== false || obj.PrimaryFlg !== false || obj.SubOutPct != null || obj.ConsumerFlg !== false) {
                    this.tradeArray.push(obj);
                    this.arrayData.push(obj);

                    this.masterData[masterIndex].TradeNameList[tradeInd]['checkedTrade'] = obj.PrimaryFlg;
                    this.masterData[masterIndex].TradeNameList[tradeInd]['SubOutPct'] = obj.SubOutPct;
                    this.masterData[masterIndex].TradeNameList[tradeInd]['checkedSingle'] = obj.SingleTradeFlg;
                    this.masterData[masterIndex].TradeNameList[tradeInd]['checkedConsumer'] = obj.ConsumerFlg;
                    this.masterData[masterIndex]['count'] = this.masterData[masterIndex]['count'] !== undefined ? this.masterData[masterIndex]['count'] + 1 : 1;
                }
            }
        } else {
            obj = {
                TradeGroupID: tradeGroupId,
                ContrTradeID: null,
                TradeListID: tradeId,
                SingleTradeFlg: type === 'single' ? true : false,
                PrimaryFlg: type === 'trade' || (type === 'sub' && value != null) || type === 'consumer' || type === 'single' ? true : false,
                SubOutPct: value,
                ConsumerFlg: type === 'consumer' ? true : false,
                SubOutComment: null,
                ContractorSubOutReasonNumber: 0,
                ContractorSubOutReasonName: null,
            };
            if (type === 'trade' || type === 'sub' || type === 'consumer' || type === 'single') {
                this.mendateSub(tradeGroupId, tradeId, obj.PrimaryFlg);
            }
            if (obj.SingleTradeFlg !== false || obj.PrimaryFlg !== false || obj.SubOutPct != null || obj.ConsumerFlg !== false) {
                this.tradeArray.push(obj);
                this.arrayData.push(obj);

                this.masterData[masterIndex].TradeNameList[tradeInd]['checkedTrade'] = obj.PrimaryFlg;
                this.masterData[masterIndex].TradeNameList[tradeInd]['SubOutPct'] = obj.SubOutPct;
                this.masterData[masterIndex].TradeNameList[tradeInd]['checkedSingle'] = obj.SingleTradeFlg;
                this.masterData[masterIndex].TradeNameList[tradeInd]['checkedConsumer'] = obj.ConsumerFlg;
                this.masterData[masterIndex]['count'] = this.masterData[masterIndex]['count'] !== undefined ? this.masterData[masterIndex]['count'] + 1 : 1;
            }
        }
    }

    public mendateSub(tradeGroupId, tradeId, primaryFlag) {
        //#region  Code done by Vivek Sharma on 20-08-2020...
        // this code is using to manage singleTrade check and consumerTrade check when uncheck on trade
        // also this code managing counter when uncheck on trade ....
        const masterIndex = this.masterData.findIndex((e) => e.TradeGroupID === tradeGroupId);
        const tradeInd = this.masterData[masterIndex].TradeNameList.findIndex((e) => e.TradeListID === tradeId && e.TradeGroupID === tradeGroupId);
        const arrayIndex = this.tradeArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
        if (primaryFlag === false) {
            if (this.masterData[masterIndex]['count'] !== undefined) {
                if (parseInt(this.masterData[masterIndex]['count'], 10) <= 0) {
                    this.masterData[masterIndex]['count'] = 0;
                } else {
                    this.masterData[masterIndex]['count'] = parseInt(this.masterData[masterIndex]['count'], 10) - 1;
                }
            }

            this.masterData[masterIndex].TradeNameList[tradeInd]['checkedSingle'] = false;
            this.masterData[masterIndex].TradeNameList[tradeInd]['checkedConsumer'] = false;

            this.masterData[masterIndex].TradeNameList[tradeInd]['checkedTrade'] = false;
            this.masterData[masterIndex].TradeNameList[tradeInd]['SubOutPct'] = null;

            this.masterData[masterIndex].TradeNameList[tradeInd]['SubOutComment'] = '';
            this.masterData[masterIndex].TradeNameList[tradeInd]['ContractorSubOutReasonNumber'] = 0;
            this.masterData[masterIndex].TradeNameList[tradeInd]['ContractorSubOutReasonName'] = '';
            this.showSubOutComments(tradeGroupId, tradeId, 0, 'post');

            const ind = this.tradeArray.findIndex((e) => e.TradeGroupID === tradeGroupId && e.TradeListID === tradeId);
            this.tradeArray.splice(ind, 1);
        } else {
            if (this.loginDetails[0].ContrID > 0) {
                if (arrayIndex !== -1) {
                    if (
                        (this.dataForApproval.length > 0 && this.TradeType === 'sub' && primaryFlag === true && this.TradeFlag === false) ||
                        (this.dataForApproval.length > 0 && this.TradeType === 'single' && primaryFlag === true && this.TradeFlag === false) ||
                        (this.dataForApproval.length > 0 && this.TradeType === 'consumer' && primaryFlag === true && this.TradeFlag === false) ||
                        (this.dataForApproval.length > 0 && this.TradeType === 'trade' && primaryFlag === true && this.TradeFlag === false)
                    ) {
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedTrade'] = primaryFlag;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['SubOutPct'] = this.tradeArray[arrayIndex].SubOutPct;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedSingle'] = this.tradeArray[arrayIndex].SingleTradeFlg;
                        this.masterData[masterIndex].TradeNameList[tradeInd]['checkedConsumer'] = this.tradeArray[arrayIndex].ConsumerFlg;
                        this.masterData[masterIndex]['count'] = this.masterData[masterIndex]['count'] !== undefined ? this.masterData[masterIndex]['count'] + 1 : 1;
                    }
                }
            }
        }
        //#endregion

        this.textSubs.forEach((input: ElementRef) => {
            const groupid = parseInt(input.nativeElement.id.split('-')[1], 10);
            const trade = parseInt(input.nativeElement.id.split('-')[2], 10);
            if (groupid === tradeGroupId && trade === tradeId) {
                const inputValue = Number.isNaN(input.nativeElement.value) || input.nativeElement.value === '' || input.nativeElement.value === undefined ? null : input.nativeElement.value;
                if (inputValue != null) {
                    if (primaryFlag === true) {
                        if (inputValue == null) {
                            input.nativeElement.classList.add('err');
                            // manage count to for use at save next
                            this.isFormValid(groupid, trade, 'add');
                        } else {
                            input.nativeElement.classList.remove('err');
                            // manage count to for use at save next
                            this.isFormValid(groupid, trade, 'remove');
                        }
                    } else {
                        input.nativeElement.classList.remove('err');
                        this.isFormValid(groupid, trade, 'remove');
                        input.nativeElement.value = null;
                    }
                } else {
                    if (primaryFlag === true) {
                        input.nativeElement.classList.add('err');
                        this.isFormValid(groupid, trade, 'add');
                    } else {
                        input.nativeElement.classList.remove('err');
                        this.isFormValid(groupid, trade, 'remove');
                    }
                }
            }
        });
    }

    // this function is used to save last visited page on save & next and back button
    async funcToSavePageData(lastPage) {
        const res = await this._srvTrade.SaveData(this.finalResult);
        if (res === 1) {
            this._route.navigate(['/contractorRegistration/' + lastPage]);
        }
    }

    public isFormValid(groupid, trade, addOrRemove) {
        if (addOrRemove === 'add') {
            const inv = this.invalidCountArray.findIndex((e) => e.groupId === groupid && e.tradeId === trade);
            if (inv === -1) {
                const obj = {
                    groupId: groupid,
                    tradeId: trade,
                    count: 1,
                };
                this.invalidCountArray.push(obj);
            } else {
                this.invalidCountArray[inv]['count'] = 1;
            }
        } else if (addOrRemove === 'remove') {
            const inv = this.invalidCountArray.findIndex((e) => e.groupId === groupid && e.tradeId === trade);
            if (inv !== -1) {
                this.invalidCountArray[inv]['count'] = 0;
            }
        }
    }

    public saveApprovalJson() {
        this.saveClick = true;
        this.oldData = this.oldDataToKeep;
        let isSubmit = 0;
        this.textSubs.forEach((input: ElementRef) => {
            const tradeGroupId = input.nativeElement.id.split('-')[1];
            const tradeId = input.nativeElement.id.split('-')[2];
            const inputValue = Number.isNaN(input.nativeElement.value) || input.nativeElement.value === '' || input.nativeElement.value === undefined ? null : input.nativeElement.value;
            if (inputValue > 100) {
                isSubmit = 1;
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Trade_Info.Alert_Enter_0to100}</p>
                                </div>
                            `;
                this.countTrade = this.countTrade + 1;
                return false;
            }
        });

        let invalidCount = 0;
        invalidCount = this.invalidCountArray.findIndex((e) => e.count === 1);
        if (invalidCount !== -1) {
            isSubmit = 1;
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Trade_Info.Alert_Enter_All_Trades}</p>
                                </div>
                            `;
            this.countTrade = this.countTrade + 1;
            return false;
        }
        if (isSubmit === 0) {
            const isError = this.validateSubOutReason();
            if (isError === 0) {
                this.matchAndSaveEditedJson();
            }
        }
    }

    // save final data in json
    public saveNext() {
        this.saveClick = true;
        if (this.loggedInUserType === 'Internal') {
            this._route.navigate(['/contractorRegistration/coverage-profile-information']);
        } else {
            let isSubmit = 0;
            this.textSubs.forEach((input: ElementRef) => {
                const tradeGroupId = input.nativeElement.id.split('-')[1];
                const tradeId = input.nativeElement.id.split('-')[2];
                const inputValue = Number.isNaN(input.nativeElement.value) || input.nativeElement.value === '' || input.nativeElement.value === undefined ? null : input.nativeElement.value;
                if (inputValue > 100) {
                    isSubmit = 1;
                    const dialogRef = this._srvDialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Trade_Info.Alert_Enter_0to100}</p>
                                </div>
                            `;
                    this.countTrade = this.countTrade + 1;
                    return false;
                }
            });
            let invalidCount = 0;
            invalidCount = this.invalidCountArray.findIndex((e) => e.count === 1);
            if (invalidCount !== -1) {
                isSubmit = 1;
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Trade_Info.Alert_Enter_All_Trades}</p>
                                </div>
                            `;
                this.countTrade = this.countTrade + 1;
                return false;
            }
            if (isSubmit === 0) {
                const isError = this.validateSubOutReason();

                if (this.tradeArray.length < 1) {
                    const dialogRef = this._srvDialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                } else {
                    if (isError === 0) {
                        {
                            this.finalResult.TradeInformation = this.tradeArray;
                            this.finalResult.ResourceId = this.loginDetails[0].ResourceID;
                            this.finalResult.CCopsId = this.loginDetails[0].CCOpsID;
                            this.finalResult.LastPageVisited = 'coverage-profile-information';

                            this.funcToSavePageData('coverage-profile-information');
                        }
                    }
                }
            }
        }
    }

    public validateSubOutReason() {
        let isError = 0;
        this.ddlsubOutReason.forEach((input: DropDownListComponent) => {
            const tradeGroupId = parseInt(input.wrapper.nativeElement.parentElement.id.split('-')[1], 10);
            const tradeId = parseInt(input.wrapper.nativeElement.parentElement.id.split('-')[2], 10);
            const objarrInd = this.tradeArray.findIndex((x) => x.TradeGroupID === tradeGroupId && x.TradeListID === tradeId);
            if (input.value > 0) {
                if (objarrInd > -1) {
                    this.tradeArray[objarrInd]['ContractorSubOutReasonNumber'] = input.value;
                    this.tradeArray[objarrInd]['ContractorSubOutReasonName'] = input['text'];
                }
            } else {
                input.wrapper.nativeElement.parentElement.classList.add('err');
                isError = 1;
            }
        });
        if (this.ddlReasonCountArr.length !== 0) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                            <div class="modal-alert info-alert">
                                <p>Please fill all sub-out reasons.</p>
                            </div>
                        `;
            isError = 1;
            return false;
        }

        this.subComments.forEach((input: ElementRef) => {
            const tradeGroupId = parseInt(input.nativeElement.id.split('-')[1], 10);
            const tradeId = parseInt(input.nativeElement.id.split('-')[2], 10);
            const objarrInd = this.tradeArray.findIndex((x) => x.TradeGroupID === tradeGroupId && x.TradeListID === tradeId);
            if (objarrInd > -1) {
                this.tradeArray[objarrInd]['SubOutComment'] = input.nativeElement.value;
            }
        });

        return isError;
    }

    public async preventDataOnCancel(status) {
        if (status === '') {
            if (this.arrayData.length > 0) {
                return true;
            }
        } else if (status === 'back') {
            if (this._srvAuth.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
                const res = await this._srvContractorData.saveContractorData({ currentPage: 'Trades', nextPage: 'equipment-information' }, null, 'TradeInformation/EditTradeEventJsonData');
                if (res === 1) {
                    this._route.navigate(['/contractorRegistration/equipment-information']);
                }
                return;
            }
            if ((this.arrayData.length > 0 && this.tradeArray.length > 0) || this.countTrade > 0 || this.updatedDataChangeCount > 0) {
                const dialogRef = this._srvDialog.open({
                    content: SaveAlertComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.header = this.pageContent.Trade_Info.Warning; // 'Warning';
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <h2>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved} </h2>
                                    <p>${this.pageContent.Trade_Info.Global_Alert_Data_Unsaved_Stmt}</p>
                                </div>
                            `;

                dialogRef.result.subscribe((r) => {
                    const resultFromDialog = r;
                    if (resultFromDialog['button'] === 'Yes') {
                        this.saveLastPage();
                    }
                });
            } else {
                this.saveLastPage();
            }
        }
    }

    public async saveLastPage() {
        const res: number = await this._srvReg.saveLastPageVisited('equipment-information');
        if (res === 1) {
            this._route.navigate(['/contractorRegistration/equipment-information']);
        }
    }
    public panelBar(value) {
        let tradeList;
        let mainGroupId;
        let mainTradeId;
        for (let i = 0; i < this.masterData.length; i++) {
            if (i === value) {
                tradeList = this.masterData[i].TradeNameList;
                for (const objTrade of tradeList) {
                    mainGroupId = objTrade.TradeGroupID;
                    mainTradeId = objTrade.TradeListID;
                    const tradeInd = tradeList.findIndex((e) => e.TradeListID === mainTradeId && e.TradeGroupID === mainGroupId);
                    const PrimaryFlg = tradeList[tradeInd]['checkedTrade'];

                    this.textSubs.forEach((input: ElementRef) => {
                        const groupid = parseInt(input.nativeElement.id.split('-')[1], 10);
                        const trade = parseInt(input.nativeElement.id.split('-')[2], 10);
                        if (groupid === mainGroupId && trade === mainTradeId) {
                            const inputValue =
                                Number.isNaN(input.nativeElement.value) || input.nativeElement.value === '' || input.nativeElement.value === undefined ? null : input.nativeElement.value;
                            if (PrimaryFlg === true && inputValue == null) {
                                input.nativeElement.classList.add('err');
                                this.isFormValid(groupid, trade, 'add');
                            }
                        }
                    });

                    if (this.ddlReasonCountArr.length !== 0) {
                        this.ddlReasonCountArr.forEach((e) => {
                            const ddl = this.ddlsubOutReason['_results'].find((x) => x.wrapper.nativeElement.parentElement.id === e);
                            if (ddl !== undefined) {
                                if (ddl.value === 0 && this.saveClick) {
                                    ddl.wrapper.nativeElement.parentElement.classList.add('err');
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    public makeCurrentArrayData() {
        const arrayTemp = [];
        this.tradeArray.forEach((element) => {
            arrayTemp.push(element);
        });

        this.oldData.forEach((element) => {
            const ind = arrayTemp.findIndex((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
            if (ind !== -1) {
            } else {
                const obj = {
                    ConsumerFlg: false,
                    SubOutPct: null,
                    TradeGroupID: element.TradeGroupID,
                    ContrTradeID: element.ContrTradeID,
                    PrimaryFlg: false,
                    SingleTradeFlg: false,
                    TradeListID: element.TradeListID,
                    ContractorSubOutReasonName: null,
                    ContractorSubOutReasonNumber: 0,
                    SubOutComment: null,
                };
                arrayTemp.push(obj);
            }
        });

        return arrayTemp;
    }

    public differenceTrades(tgt, src, approvalJSON) {
        if (Array.isArray(tgt)) {
            return tgt;
        }
        const rst: any = {};

        for (const k in tgt) {
            if (tgt.hasOwnProperty(k)) {
                if (
                    k !== 'isContractorSubOutReasonNumber' &&
                    k !== 'isContractorSubOutReasonName' &&
                    k !== 'isSubOutComment' &&
                    k !== 'isConsumerFlg' &&
                    k !== 'isPrimaryFlg' &&
                    k !== 'isSingleTradeFlg' &&
                    k !== 'isSubOutPct' &&
                    k !== 'isTradeGroupID' &&
                    k !== 'isContrTradeID' &&
                    k !== 'isTradeListID' &&
                    k !== 'rowSize' &&
                    k !== 'IsRowDisable'

                ) {
                    if (approvalJSON.hasOwnProperty(k)) {
                        if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                            rst[k] = this.differenceTrades(tgt[k], src[k], approvalJSON[k]);
                        } else if (approvalJSON[k] !== tgt[k]) {
                            rst[k] = tgt[k];
                        }
                    } else {
                        if (src[k] !== null && typeof src[k] === 'object') {
                            rst[k] = this.differenceTrades(tgt[k], src[k], approvalJSON[k]);
                        } else if (src[k] !== tgt[k]) {
                            rst[k] = tgt[k];
                        }
                    }
                }
                rst.TradeGroupID = tgt['TradeGroupID'];
                rst.TradeListID = tgt['TradeListID'];
                rst.ContrTradeID = tgt['ContrTradeID'];
            }
        }

        return rst;
    }

    public async matchAndSaveEditedJson() {
        if (this.loggedInUserType !== 'Internal') {
            const currentData = this.makeCurrentArrayData();

            const finalData = [];
            currentData.forEach((el) => {
                if (!el.PrimaryFlg) {
                    el.ConsumerFlg = false;
                    el.SubOutPct = null;
                    el.isConsumerFlg = false;
                    el.isSubOutPct = false;
                    el.isPrimaryFlg = false;
                    el.isSingleTradeFlg = false;
                    el.SingleTradeFlg = false;
                    el.isContractorSubOutReasonNumber = false;
                    el.isContractorSubOutReasonName = false;
                    el.isSubOutComment = false;
                }
            });
            currentData.forEach((element) => {
                let obj = {};
                let approvalData = this.dataForApproval.find((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                let dbData: any = this.oldData.find((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                const changeData = currentData.find((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);

                approvalData = approvalData === undefined ? {} : approvalData;
                dbData = dbData === undefined ? {} : dbData;

                obj = this.differenceTrades(changeData, dbData, approvalData);
                let ind = -1;
                if (finalData.length) {
                    ind = finalData.findIndex((x) => x.TradeGroupID === obj['TradeGroupID'] && x.TradeListID === obj['TradeListID']);
                }

                if (Object.keys(obj).length > 3) {
                    finalData.push(obj);
                }
            });
            this.dataForApproval = finalData;
        }

        // this function is used only when logged in user is internal
        // employee and wants to updated the form.
        if (this.loggedInUserType === 'Internal') {
            if (this.internalArray.length > 0) {
                this.dataForApproval = this.internalArray;
                this.internalArray = [];
            } else {
                this.dataForApprovalContractor = this.dataForApprovalContractorApproval;
                this.dataForApprovalContractor.forEach((element) => {
                    for (const key in element) {
                        if (element.hasOwnProperty(key)) {
                            const ind = this.oldData.findIndex((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                            if (ind !== -1) {
                                const index = this.tradeArray.findIndex((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                                const objGrid = this.oldData[ind];
                                for (const appKey in objGrid) {
                                    if (appKey === key) {
                                        if (objGrid[appKey] !== element[key]) {
                                            this.tradeArray.splice(index, 1);
                                        }
                                    }
                                }
                            } else {
                                const index = this.tradeArray.findIndex((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                                if (index !== -1) {
                                    this.tradeArray.splice(index, 1);
                                }
                            }
                        }
                    }
                });
                this.dataForApproval = this.tradeArray;
            }
        }

        const ccopsData = {
            TradeInformation: this.dataForApproval,
        };

        if (this.loggedInUserType === 'Internal') {
            this.objProgram.Contr_ID = this.ContrID;
        }
        this.objProgram.ResourceId = this.loginDetails[0].ResourceID;
        this.objProgram.CCOpsID = this.loginDetails[0].CCOpsID;
        this.objProgram.Contr_ID = this.ContrID;
        this.objProgram.ContractorResourceNumber = this._srvAuth.Profile.ContractorResourceID;
        this.objProgram.ContractorResourceID = this._srvAuth.Profile.ContractorResourceID;
        this.objProgram.CCOpsData = JSON.stringify(this.dataForApproval.length > 0 ? ccopsData : null);
        this.objProgram.PageName = 'Trades';

        if (this.loggedInUserType !== 'Internal') {
            this.objProgram.ContractorResourceID = this._srvAuth.Profile.ContractorResourceID;
            this.objProgram.ContractorResourceNumber = this._srvAuth.Profile.ContractorResourceID;
        }
        if (this.loggedInUserType !== 'Internal') {
            if (this.dataForApproval.length > 0) {
                const response = await this._srvContractorData.saveContractorData(
                    { currentPage: 'Trades', nextPage: 'coverage-profile-information' },
                    ccopsData,
                    'TradeInformation/EditTradeEventJsonData'
                );
                this.crComments = await this._srvContractorData.getPageComments('Trades');

                if (this._srvAuth.Profile.EventName === 'No Event') {
                    if (response === 1) {
                        this.dataForApproval = [];
                        this.getJSON();
                    }
                } else {
                    if (response === 1) {
                        this._route.navigate(['/contractorRegistration/coverage-profile-information']);
                    }
                }
                return;
            } else {
                await this._srvContractorData.saveContractorData({ currentPage: 'Trades', nextPage: 'coverage-profile-information' }, null, 'TradeInformation/EditTradeEventJsonData');
                this.crComments = await this._srvContractorData.getPageComments('Trades');
                if (this._srvAuth.Profile.EventName !== 'No Event') {
                    this._route.navigate(['/contractorRegistration/coverage-profile-information']);
                }
            }
        } else {
            const res: number = await this._srvTrade.saveInternalData(this.objProgram);
            if (res === 1) {
                this.dataForApproval = [];
                this.getJSON();
            }
        }
    }

    // this bunch of code is used to make json which is not updated by contractor and different from the master json
    public sendJsonInternalEmployee() {
        // dataForApprovalContractor is used when internal employee log in
        // and wants to updated some value but contractor already have some visual cue

        this.dataForApprovalContractor = this.dataForApprovalContractorApproval;
        if (this.loggedInUserType === 'Internal') {
            const arrayInternal = [];
            this.dataForApproval.forEach((element) => {
                let index;
                if (this.dataForApprovalContractor != null || this.dataForApprovalContractor !== undefined) {
                    index = this.dataForApprovalContractor.findIndex((x) => x.TradeGroupID === element.TradeGroupID && x.TradeListID === element.TradeListID);
                } else {
                    index = -1;
                }
                let objInternal = {};
                if (index !== -1) {
                    const oldDataContractor = this.dataForApprovalContractor[index];
                    if (Object.keys(this.dataForApprovalContractor[index]).length !== Object.keys(element).length) {
                        for (const Key in element) {
                            if (!oldDataContractor.hasOwnProperty(Key) || Key === 'TradeGroupID' || Key === 'TradeListID' || Key === 'ContrTradeID') {
                                objInternal[Key] = element[Key];
                            }
                        }
                        arrayInternal.push(objInternal);
                    }
                } else {
                    objInternal = element;
                    arrayInternal.push(objInternal);
                }

                this.dataForApproval = arrayInternal;
            });
        }
    }

    numberOnly(evt: any, text: number = 0): boolean {
        evt.target.classList.remove('err');
        // evt = (evt) ? evt : window.event;
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    onPaste() {
        return false;
    }

    public handleFilterReason(value, tradeGroupId, tradeId) {
        const ind = this.masterData.findIndex((x) => x.TradeGroupID === tradeGroupId);
        const obj = this.masterData[ind];
        const indTrade = obj.TradeNameList.findIndex((x) => x.TradeGroupID === tradeGroupId && x.TradeListID === tradeId);
        const reasonList = this.masterData[ind].TradeNameList[indTrade]['ReasonListNew'];
        this.masterData[ind].TradeNameList[indTrade]['ReasonList'] = reasonList.slice();
        this.masterData[ind].TradeNameList[indTrade]['ReasonList'] = reasonList.filter((s) => s.ContractorSubOutReasonName.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // deny access and _route to company infoif access not granted
    public accessDenied() {
        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
            appendTo: this.containerRef,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                      <h2>${this.pageContent.Trade_Info.Access_Denied}</h2>
                                    <p>${this.pageContent.Trade_Info.Access_Denied_Stmt}</p>
                                </div>
                            `;
        dialogRef.result.subscribe((res) => {
            this._route.navigate(['/contractorRegistration/company-information']);
        });
        this.pageAccess = false;
    }
}
