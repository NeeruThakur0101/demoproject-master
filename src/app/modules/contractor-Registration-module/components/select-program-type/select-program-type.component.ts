import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { DialogService } from '@progress/kendo-angular-dialog';
import { FinancialDefferalProcessDialogComponent } from '../../dialogs/financial-defferal-process-dialog/financial-defferal-process-dialog.component';
import { SelectApplicationModel } from '../../models/data-model';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ApplicationType, FinancialDeferralGuidelines } from './application-model';
import { SelectProgramService } from './select-program.service';
import { UniversalService } from 'src/app/core/services/universal.service';
@Component({
    selector: 'app-select-program-type',
    templateUrl: './select-program-type.component.html',
    styleUrls: ['./select-program-type.component.scss'],
})
export class SelectProgramTypeComponent implements OnInit {

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    form: FormGroup;
    public submitted: boolean = false;
    public finalData: ApplicationType;
    public currentDate: string;
    public isfinancialDeferralOpen: boolean = false;
    public isCheckedFinancialDeferral: boolean = false;
    public data = [];
    public objProgram: SelectApplicationModel;
    public federalData: FinancialDeferralGuidelines;
    public forwardedData: ApplicationType;
    public accountId: number;
    public resourceId: number;
    public loginDetails: Array<SessionUser> = []; //  Array<LoginUser> = [];
    public arrayData = new Array();
    public appTypeArray = Array<number>();
    public message: string = '';
    public arrayReferenceInfo: Array<{ Id: number; Name: string; Checked: boolean }> = [];
    public ContrID: number | string;
    public loggedInUserType: string;
    public pageContent: any;
    public setClass: boolean = false;
    constructor(
        private _srvContractor: ContractorRegistrationService,
        private _route: Router,
        private _srvDialog: DialogService,
        private _srvApp: SelectProgramService,
        private _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        public _srvUniversal: UniversalService,
        public renderer: Renderer2

    ) {
        const todayDate = new Date().toISOString().slice(0, 10);
        this.loggedInUserType = this._srvAuth.LoggedInUserType;
        this.currentDate = todayDate.split('-')[1] + '-' + todayDate.split('-')[2] + '-' + todayDate.split('-')[0];
        this.loginDetails = Array(this._srvAuth.Profile);
        this.resourceId = this.loginDetails[0].ResourceID;
        this.ContrID = this.loginDetails[0].ContrID;
        this.loadMasterData();
    }
    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        $event.preventDefault();
        if (this.arrayData.length > 1) {
            $event.returnValue = 'true';
        }
    }
    ngOnInit() {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    // calculate height on page load
    checkHeight() {
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer, 100);
    }

    // bind programes and trades in html
    public async loadMasterData() {
        this.data = await this._srvApp.GetAppTypeMasterData();
        this.data = this.data.map((item) => {
            const tradesItem = Object.assign([], item.Trades);
            const tradesChunk = [];
            for (let i = 0; i <= item.Trades.length; i = i + 6) {
                tradesChunk.push(tradesItem.splice(0, 6));
            }
            item.Trades = tradesChunk;
            return item;
        });
        this.getPageData();
    }

    public async getPageData() {
        this.forwardedData = await this._srvApp.GetApplicationType();
        if (this.forwardedData !== null) {
            if (this.forwardedData.hasOwnProperty('CompleteApplication')) {
                this.finalData = this.forwardedData;
                this.fillTradesData(this.finalData);
            }
        }
    }
    // to map master data and recieved data and checked saved data
    fillTradesData(tradesData) {
        if (tradesData.CompleteApplication !== null) {
            if (tradesData.CompleteApplication.FinancialDeferralGuidelines != null) {
                this.federalData = tradesData.CompleteApplication.FinancialDeferralGuidelines;
                this.isCheckedFinancialDeferral =
                    tradesData.CompleteApplication.FinancialDeferralGuidelines.FinancialDeferralRemoveDate === 'null' ||
                        tradesData.CompleteApplication.FinancialDeferralGuidelines.FinancialDeferralRemoveDate == null
                        ? true
                        : false;
            }
            this.arrayData = tradesData.CompleteApplication.ApplicationAndProgramTypes;
            const jsonData = tradesData.CompleteApplication.ApplicationAndProgramTypes;
            for (const x of this.data) {
                for (const k of jsonData) {
                    let tradeLength = 0;
                    for (const chunk of x.Trades) {
                        tradeLength = tradeLength + chunk.length;
                        const index = chunk.findIndex((e) => e.TradeListID === k.TradeNumber && e.ContrAppTypeID === k.ContractorApplicationTypeNumber);
                        if (index !== -1) {
                            if (k.TradeRemovedDate === 'null' || k.TradeRemovedDate === null) {
                                chunk[index]['Checked'] = true;

                                // // create array for used in reference info page
                                // this condition is used to calculate how much trades are selected
                                if (chunk[index]['Checked'] === true && x.ContrAppTypeID === k.ContractorApplicationTypeNumber) {
                                    x['count'] = x['count'] !== undefined ? x['count'] + 1 : 1;
                                }
                                // end of condition
                            } else {
                                chunk[index]['Checked'] = false;
                            }
                        }
                    }
                    x['tradeLength'] = tradeLength;
                }
                const indToRemove = this.arrayData.findIndex((e) => e.ContractorApplicationTypeNumber === x.contAppTypeId && e.TradeRemovedDate === 'null');
                if (indToRemove === -1) {
                    this.appTypeArray.splice(indToRemove, 1);
                }

                // create array for used in reference info page
            }
        }
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer)
    }

    // create array for used in reference info page
    public createArrayForReferencePage(contrTypeId, contrTypeName, isChecked): void {
        const refInd = this.arrayReferenceInfo.findIndex((e) => e.Id === contrTypeId);
        if (refInd === -1) {
            const refObj = {
                Id: contrTypeId,
                Name: contrTypeName,
                Checked: isChecked,
            };
            this.arrayReferenceInfo.push(refObj);
        }
    }

    // this function is used for update trades
    public async updateTrades(event) {
        let arrayIndex = -1; // define the index of array on which the selected event value is found
        const id = event.target.id; // identity of checked checkbox of contappType_trades
        const contAppTypeId: number = parseInt(id.split('_')[1], 10); // 10 defined decimal number in Tslint
        const tradeId: number = parseInt(id.split('_')[0], 10);

        // this is used to check program should not select without trades when click on final save buton
        // so create a array of select programs
        const existIndex = this.appTypeArray.indexOf(contAppTypeId);
        if (existIndex === -1) {
            this.appTypeArray.push((contAppTypeId));
        }

        if (this.finalData.CompleteApplication) {
            this.arrayData = this.finalData.CompleteApplication.ApplicationAndProgramTypes;
            arrayIndex = this.arrayData.findIndex((e) => e.ContractorApplicationTypeNumber === contAppTypeId && e.TradeNumber === tradeId);
        }
        this.finalData = this.getObjectToUpdateData(arrayIndex, event, this.arrayData, contAppTypeId, tradeId);

        // this condition is used to remove the program id from array if all the trades of particular program are removed
        const indToRemove = this.arrayData.findIndex((e) => e.ContractorApplicationTypeNumber === contAppTypeId && e.TradeRemovedDate === 'null');
        if (indToRemove === -1) {
            this.appTypeArray.splice(indToRemove, 1);
        }

        await this._srvContractor.getSelectProgramType(JSON.stringify(this.finalData));
    }

    // this function is used to get object(trade) which we want to update and this is internally used in updateTrades() funtion and return object
    getObjectToUpdateData(arrayIndex, event, arrayData, contAppTypeId, tradeId) {
        if (arrayIndex !== -1) {
            const element = event.target;
            if (element.checked === false) {
                // this condition is used for de select main check box if even a single trades is not selected
                if (element.checked === false) {
                    const ind = this.data.findIndex((e) => e.ContrAppTypeID === contAppTypeId);
                    // this loop is used to find the trade index an update trade.
                    for (const ele of this.data[ind].Trades) {
                        const indTrade = ele.findIndex((e) => e.TradeListID === tradeId);
                        if (indTrade !== -1) {
                            ele[indTrade].Checked = false;
                            break;
                        }
                    }

                    this.data[ind].count = this.data[ind].count - 1;
                }
                // end of condition

                arrayData[arrayIndex].TradeSelectedDate = this.currentDate;
                arrayData[arrayIndex].TradeRemovedDate = this.currentDate;
            } else {
                // this condition is used for select main check box if all trades are selected
                if (element.checked === true) {
                    const ind = this.data.findIndex((e) => e.ContrAppTypeID === contAppTypeId);
                    // this loop is used to find the trade index an update trade.
                    for (const ele of this.data[ind].Trades) {
                        const indTrade = ele.findIndex((e) => e.TradeListID === tradeId);
                        if (indTrade !== -1) {
                            ele[indTrade].Checked = true;
                            break;
                        }
                    }
                    this.data[ind].count = this.data[ind].count !== undefined ? this.data[ind].count + 1 : 1;
                    if (this.data[ind].count > 0) {
                        this.data[ind].checked = true;
                    }
                }
                // end of condition

                arrayData[arrayIndex].TradeRemovedDate = 'null';
            }
        } else {
            const element = event.target;
            const json = {
                ContractorApplicationTypeNumber: contAppTypeId,
                TradeNumber: tradeId,
                TradeSelectedDate: this.currentDate,
                TradeRemovedDate: 'null',
            };
            arrayData.push(json);

            const ind = this.data.findIndex((e) => e.ContrAppTypeID === contAppTypeId);

            // this loop is used to find the trade index an update trade.
            for (const ele of this.data[ind].Trades) {
                const indTrade = ele.findIndex((e) => e.TradeListID === tradeId);
                if (indTrade !== -1) {
                    ele[indTrade].Checked = true;
                    break;
                }
            }
            this.data[ind].count = this.data[ind].count !== undefined ? this.data[ind].count + 1 : 1;
        }

        const newObj = this.createUpdateObject(arrayData);
        return newObj;
    }

    // this function is used to create or update json object and return to getObjectToUpdateData() function
    createUpdateObject(ArrayData) {
        const obj = {
            ResourceId: 0,
            CCopsId: 0,
            LastPageVisited: null,
            CompleteApplication: {
                ApplicationAndProgramTypes: ArrayData,
                FinancialDeferralGuidelines: {
                    FinancialDeferralGuidelineNumber: null,
                    FinancialDeferralUpdateDate: this.currentDate,
                    FinancialDeferralUpdateResourceNumber: this.resourceId,
                    FinancialDeferralRemoveDate: this.currentDate,
                    FinancialDeferralRemoveResourceNumber: this.resourceId,
                },
            }
        };
        return obj;
    }

    // this function is used when after checking the trade user unchenck the contractor type id
    // then remove all the trades related to that
    removeTrades(contAppTypeId) {
        const ind = this.data.findIndex((e) => e.ContrAppTypeID === contAppTypeId);
        this.data[ind].checked = false;
        this.data[ind].count = 0;
        const removedTradesArray = this.arrayData.filter((e) => e.ContractorApplicationTypeNumber === contAppTypeId);
        removedTradesArray.forEach((element) => {
            element.TradeRemovedDate = this.currentDate;
        });

        for (const ele of this.data[ind].Trades) {
            ele.forEach((element) => {
                element.Checked = false;
                element.count = this.data[ind].count - 1;
            });
        }
    }

    selectApplicationTypeId(val, event) {
        if (event.target.checked === true) {
            this.appTypeArray.push(val);
        } else {
            const indToRemove = this.appTypeArray.indexOf(val);
            this.appTypeArray.splice(indToRemove, 1);

            // remove trades if uncheck the cont type id
            this.removeTrades(val);
        }
    }
    public onNext(): void {
        this._route.navigate(['/contractorRegistration/company-information']);
    }
    async onSaveNext() {
        this.data.forEach((element) => {
            const indexJson = this.arrayData.findIndex((x) => x.ContractorApplicationTypeNumber === element.ContrAppTypeID && x.TradeRemovedDate === 'null');
            if (indexJson === -1) {
                this.createArrayForReferencePage(element.ContrAppTypeID, element.ContrAppTypeDesc, false);
            } else {
                this.createArrayForReferencePage(element.ContrAppTypeID, element.ContrAppTypeDesc, true);
            }
        });
        this._srvContractor.getRefDataFromSelect.next(this.arrayReferenceInfo);

        let count = 0;

        if (this.arrayData.findIndex((e) => e.TradeRemovedDate === 'null') !== -1) {
            for (const ele of this.appTypeArray) {
                const index = this.arrayData.findIndex((e) => e.ContractorApplicationTypeNumber === ele && e.TradeRemovedDate === 'null');
                if (index === -1) {
                    count = count + 1;
                    const dialogRef = this._srvDialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                    <div class="modal-alert info-alert">
                    <p>${this.pageContent.Application_Type.Please_Add}</p>
                </div>`;
                    break;
                }
            }
            if (count === 0) {
                if (this.federalData !== undefined && Object.keys(this.federalData).length !== 0) {
                    this.finalData.CompleteApplication.FinancialDeferralGuidelines = this.federalData;
                }

                const sendingObj = {
                    CCopsId: this.loginDetails[0].CCOpsID,
                    ResourceId: this.loginDetails[0].ResourceID,
                    LastPageVisited: 'company-information',
                    CompleteApplication: {
                        FinancialDeferralGuidelines: this.federalData,
                        ApplicationAndProgramTypes: this.finalData.CompleteApplication.ApplicationAndProgramTypes
                    }
                }

                const response = await this._srvApp.SaveData(sendingObj);
                if (response === 1) {
                    this._route.navigate(['/contractorRegistration/company-information']);
                }
            }
        } else {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `<div class="modal-alert info-alert">
            <p>${this.pageContent.Application_Type.Please_Select}</p>
                 </div>`;
        }
    }

    // toggle value yes or no for financial defferal option process
    toggleFinancialDefferal(val) {
        val === true ? (this.isfinancialDeferralOpen = true) : (this.isfinancialDeferralOpen = false);
        if (this.isfinancialDeferralOpen === true) {
            const dialogRef = this._srvDialog.open({
                content: FinancialDefferalProcessDialogComponent,
                width: 580,
            });

            dialogRef.result.subscribe((r) => {
                const dialogResult = r;
                if (dialogResult['status'] === 'cancel') {
                    this.isCheckedFinancialDeferral = false;
                    const objfast = {
                        FinancialDeferralGuidelineNumber: null,
                        FinancialDeferralUpdateDate: this.currentDate,
                        FinancialDeferralUpdateResourceNumber: this.resourceId,
                        FinancialDeferralRemoveDate: this.currentDate,
                        FinancialDeferralRemoveResourceNumber: this.resourceId,
                    };
                    this.federalData = objfast;
                } else {
                    this.isCheckedFinancialDeferral = true;
                    const objfast = {
                        FinancialDeferralGuidelineNumber: null,
                        FinancialDeferralUpdateDate: this.currentDate,
                        FinancialDeferralUpdateResourceNumber: this.resourceId,
                        FinancialDeferralRemoveDate: 'null',
                        FinancialDeferralRemoveResourceNumber: null,
                    };
                    this.federalData = objfast;
                }
            });
        } else {
            const objfast = {
                FinancialDeferralGuidelineNumber: null,
                FinancialDeferralUpdateDate: this.currentDate,
                FinancialDeferralUpdateResourceNumber: this.resourceId,
                FinancialDeferralRemoveDate: this.currentDate,
                FinancialDeferralRemoveResourceNumber: this.resourceId,
            };
            this.federalData = objfast;
        }
    }
}
