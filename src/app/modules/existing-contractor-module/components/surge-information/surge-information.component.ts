import { Component, OnInit, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild, Renderer2, Inject } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ManageSurgeLicenseComponent } from './../../dialogs/manage-surge-license/manage-surge-license.component';
import { DocumentUploadComponent } from '../../dialogs/document-upload/document-upload.component';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { CoverageListDetails, SurgeData, SurgeDetailDropdownData, SurgeDropDownData, SurgeJSONData, SurgeReason, SurgeResponseDetail, SurgeResponseInformation, TradeList, TradeListDetails } from './model-surge';
import { CorrectionRequestComments, LoginUser } from 'src/app/core/models/user.model';
import { SurgeInfoDataService } from './surge-info.service';

@Component({
    selector: 'app-surge-information',
    templateUrl: './surge-information.component.html'
})
export class SurgeInformationComponent implements OnInit, OnDestroy {
    private destroyed$: Subject<any> = new Subject();
    private multiselectDropdownValue: SurgeResponseDetail[] = [];
    private mutiselectDropDownsData: SurgeReason[];
    public removedSurgeDetails: SurgeResponseDetail[] = [];
    public originalDBdata: SurgeData;
    public hostNetworkData: SurgeDetailDropdownData[] = [];
    public sharedNetworkData: SurgeDetailDropdownData[] = [];
    public reasonsData: SurgeDetailDropdownData[] = [];
    public formGroup: FormGroup;
    public showMinimumNumber: boolean = false;
    public showWillToExpand: boolean;
    public showWillToMObilize: boolean;
    public sharedNetworkValue: SurgeDetailDropdownData[] = [];
    public surgeInfoData: SurgeData | SurgeResponseInformation;
    public loggedInUserType: string;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public reasonFields: SurgeDetailDropdownData[] = [];
    public networksFields: SurgeDetailDropdownData[] = [];
    public SurgeResponseDetail: SurgeResponseDetail[] = [];
    public tradesData: TradeListDetails[] = [];
    public tradesFields: TradeList[] = [];
    public showMainPage: boolean = false;
    public minimumChecked: boolean;
    public checkedHostNetwork: boolean = false;
    public checkedSharedNetwork: boolean;
    public showHostNetworkInput: boolean;
    public showSharedNetworkInput: boolean;
    public formSubmitted: boolean = false;
    public showPage: boolean = false;
    public ContrID: number;
    public pageContent: any;
    public jsonData: SurgeJSONData;
    public ResourceId: number;
    public isRemoved: boolean = false;
    public accessReadonly: boolean = false;
    public jsonDataObject: SurgeResponseInformation;
    public blockGroup1: boolean = false;
    public blockGroup2: boolean = false;
    public blockGroup3: boolean = false;
    public coverageListDetails: CoverageListDetails;

    public visualCue = {
        WillingToMobilizeFlag: false,
        WillingToExpandFlag: false,
        MobilizeMinimum: false,
        HoursToMobilize: false,
        ExpandTrades: false,
        ExpandDistance: false,
        MobilizeTrades: false,
        ReasonFields: false,
        ContingencyFileYesNo: false,
        HostNetwork: false,
        SharedNetwork: false,
    };

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    crComments: CorrectionRequestComments[];

    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _changeDetectorRef: ChangeDetectorRef,
        private _srvDialog: DialogService,
        private _srvSurgeInfoData: SurgeInfoDataService,
        private _router: Router,
        public _srvAuthentication: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvUniversal: UniversalService,
        private _renderer: Renderer2
    ) {

    }

    async ngOnInit() {
        this.getSurgeData();
    }


    heightCalculate() {
        if (document.body)

            this._renderer.removeClass(this.commentBlock.nativeElement, 'has-scroll');
        this._renderer.removeClass(this.commentBlock.nativeElement, 'none');

        if (this.commentBlock && this.commentArea) {
            const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
            if (className === 'has-scroll') {
                this._renderer.addClass(this.commentBlock.nativeElement, className);
            }
            else {
                this._renderer.removeClass(this.commentBlock.nativeElement, 'has-scroll');
                this._renderer.removeClass(this.commentBlock.nativeElement, 'none');
            }
        }
    }


    async getSurgeData() {
        Object.keys(this.visualCue).forEach((v) => (this.visualCue[v] = false));
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        if (this.loginDetails) {
            this.ContrID = this.loginDetails[0].ContrID;
            this.ResourceId = this.loginDetails[0].ResourceID
        }
        this.initForm();
        this.getMasterData().then(() => {
            this.setDropdownData();
            this.updateVisualCue();
        });

        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.crComments = await this._srvContractorData.getPageComments('Surge/CAT Response');

        this.checkPrivilage();

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    public checkPrivilage(): void {
        if (this.ContrID > 0) {

            const accessType = this._srvAuthentication.getPageAccessPrivilege('Surge Response Information Page');

            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.accessReadonly = true;
                    this.formGroup.disable();
                } else {
                    this.showPage = true
                    const dialogRef = this._srvDialog.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });

                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `<div class="modal-alert info-alert">
                <h2>${this.pageContent.Surge_Info.Access_Denied}</h2>
                <p>${this.pageContent.Surge_Info.Access_Denied_Text}</p>
               </div>`;
                    dialogRef.result.subscribe(val => {
                        this._router.navigate(['contractorRegistration/company-information'])
                    })
                }
            }
        }
    }

    private initForm(): void {
        this.formGroup = new FormGroup({
            willingToMobilizeFlg: new FormControl(),
            willingToExpandFlg: new FormControl(),
            mobilizeMinimum: new FormControl(),
            hourstoMobilize: new FormControl(),
            expandDistance: new FormControl(),
            trades: new FormControl(),
            contingencyFileFlg: new FormControl(),
            hostNetworkMultiSelect: new FormControl(),
            sharedResorceMultiSelect: new FormControl(),
            reasonsMultiselect: new FormControl(),
            hostControlSwitch: new FormControl(),
            tradeMultiselect: new FormControl(),
            minimizeFlag: new FormControl(),
            sharedResources: new FormControl(),
        });
        this.formGroup.controls.willingToExpandFlg.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((val) => {
                if (val === true) {
                    this.showWillToExpand = true;

                    this.formGroup.controls.expandDistance.setValidators([Validators.required, Validators.maxLength(5)]);
                    this.formGroup.controls.expandDistance.updateValueAndValidity();
                } else if (val === false) {
                    this.showWillToExpand = false;

                    this.formGroup.controls.expandDistance.clearValidators();
                    this.formGroup.controls.expandDistance.updateValueAndValidity();
                }
                this.validateTradesMultiselect();

                setTimeout(() => {
                    this.heightCalculate();
                }, 100);


            });
        this.formGroup.controls.willingToMobilizeFlg.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((val) => {
                if (val === true) {
                    this.surgeDetailToggleRemove(this.reasonFields)
                    this.formGroup.controls.hourstoMobilize.setValidators([Validators.required, Validators.maxLength(5), Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')]);
                    this.formGroup.controls.hourstoMobilize.updateValueAndValidity();
                    this.formGroup.controls.reasonsMultiselect.clearValidators();
                    this.formGroup.controls.reasonsMultiselect.updateValueAndValidity();
                    this.formGroup.controls.reasonsMultiselect.setValue(null);

                } else if (val === false) {
                    this.formGroup.controls.mobilizeMinimum.clearValidators();
                    this.formGroup.controls.mobilizeMinimum.updateValueAndValidity();
                    this.formGroup.controls.hourstoMobilize.clearValidators();
                    this.formGroup.controls.hourstoMobilize.updateValueAndValidity();
                    this.formGroup.controls.reasonsMultiselect.clearValidators();
                    this.formGroup.controls.reasonsMultiselect.setValidators([Validators.required]);
                    this.formGroup.controls.reasonsMultiselect.updateValueAndValidity();
                }
                this.validateTradesMultiselect();
                setTimeout(() => {
                    this.heightCalculate();
                }, 100);
            });
        this.formGroup.controls.minimizeFlag.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((ev) => {
                if (ev === true) {
                    this.showMinimumNumber = true;
                    this.formGroup.controls.mobilizeMinimum.setValidators([Validators.required, Validators.maxLength(5)]);
                    this.formGroup.controls.mobilizeMinimum.updateValueAndValidity();
                } else if (ev === false) {
                    this.showMinimumNumber = false;
                    this.formGroup.controls.mobilizeMinimum.clearValidators();
                    this.formGroup.controls.mobilizeMinimum.updateValueAndValidity();
                }
            });

    }

    private validateTradesMultiselect(): void {
        if (this.formGroup.controls.willingToMobilizeFlg.value || this.formGroup.controls.willingToExpandFlg.value) {
            this.formGroup.controls.tradeMultiselect.setValidators([Validators.required]);
            this.formGroup.controls.tradeMultiselect.updateValueAndValidity();
        } else {
            this.formGroup.controls.tradeMultiselect.clearValidators();
            this.formGroup.controls.tradeMultiselect.updateValueAndValidity();
            this.formGroup.controls.tradeMultiselect.setValue(null);
        }
    }

    // GET-API of dropdown data
    private async getMasterData(): Promise<SurgeDropDownData> {
        return new Promise(async (resolve, reject) => {
            const dropDownResponse = await this._srvSurgeInfoData.getDropDownData(this.loginDetails[0])
            this.mutiselectDropDownsData = dropDownResponse.SurgeReason;
            this.tradesData = dropDownResponse.TradeListDetails;
            this.coverageListDetails = dropDownResponse.CoverageListDetails[0];
            this.mutiselectDropDownsData.forEach(element => {
                element.SurgeResponseDetailTypeNumber = element.TypeTitleID
            });
            resolve(null);
        });
    }

    // GET-API of DB data
    private async getDBSurgeRes(): Promise<SurgeData> {
        return new Promise(async (resolve, reject) => {
            const DbDataRespose = await this._srvSurgeInfoData.getDBData(this.loginDetails[0])
            this.originalDBdata = Object.assign({}, DbDataRespose);
            this.multiselectDropdownValue = DbDataRespose.SurgeResponseDetail;
            resolve(Object.assign({}, this.originalDBdata));

        });
    }

    // GET-API of JSON data
    private async getJsonSurgeRes(): Promise<SurgeJSONData> {
        return new Promise(async (resolve, reject) => {
            const jsonDataReponse = await this._srvSurgeInfoData.getEventPageJSON(this.loginDetails[0]);

            if (jsonDataReponse[0] && jsonDataReponse[0].CCOpsData) {
                this.jsonData = JSON.parse(jsonDataReponse[0].CCOpsData).ContractorData;
                this.jsonDataObject = this.jsonData.SurgeResponseInformation;
                await this.disableSurgeResponseDetail(this.jsonDataObject);
                resolve(this.jsonData);
            } else {
                resolve(null);
            }
        });

    }

    async disableSurgeResponseDetail(jsonDataObject) {
        if (jsonDataObject.SurgeResponseDetail) {
            jsonDataObject.SurgeResponseDetail.forEach(element => {
                if (element.GroupID === 1 && element.IsGroupIDDisable === true) {
                    this.blockGroup1 = true;
                } else if (element.GroupID === 2 && element.IsGroupIDDisable === true) {
                    this.blockGroup2 = true;
                } else if (element.GroupID === 3 && element.IsGroupIDDisable === true) {
                    this.blockGroup3 = true;
                }
            });
        }

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

    public updateHostNetworkFlag(ev) {
        if (ev === true) {
            this.showHostNetworkInput = true;
            this.formGroup.controls.hostNetworkMultiSelect.setValidators([Validators.required]);
            this.formGroup.controls.hostNetworkMultiSelect.updateValueAndValidity();
        } else if (ev === false) {
            this.showHostNetworkInput = false;
            this.surgeDetailToggleRemove(this.networksFields)
            this.formGroup.controls.hostNetworkMultiSelect.clearValidators();
            this.formGroup.controls.hostNetworkMultiSelect.updateValueAndValidity();
            this.formGroup.controls.hostNetworkMultiSelect.setValue(null);

        }
    }
    public updateSharedResources(ev) {
        if (ev === true) {
            this.showSharedNetworkInput = true;
            this.formGroup.controls.sharedResorceMultiSelect.setValidators([Validators.required]);
            this.formGroup.controls.sharedResorceMultiSelect.updateValueAndValidity();
        } else if (ev === false) {
            this.showSharedNetworkInput = false;
            this.surgeDetailToggleRemove(this.sharedNetworkValue)
            this.formGroup.controls.sharedResorceMultiSelect.clearValidators();
            this.formGroup.controls.sharedResorceMultiSelect.updateValueAndValidity();
            this.formGroup.controls.sharedResorceMultiSelect.setValue(null);;
        }
    }

    // here data is being merged and value is being set to for data binding
    private mapContractorData(): void {
        this.networksFields = [];
        this.sharedNetworkValue = [];
        this.reasonFields = [];
        let tempArr = [];

        tempArr = this.multiselectDropdownValue
        if (tempArr) {
            tempArr.forEach((value, i) => {
                if (value) {
                    if (value.GroupID === 1) {
                        this.networksFields.push({
                            SurgeResponseDetailNumber: value.SurgeResponseDetailNumber,
                            HostNetworkID: value.SurgeResponseDetailTypeNumber,
                            HostNetwork: value.TypeTitleName,
                            GroupID: value.GroupID,
                            GroupName: value.GroupName
                        });
                    } else if (value.GroupID === 2) {
                        this.sharedNetworkValue.push({
                            SurgeResponseDetailNumber: value.SurgeResponseDetailNumber,
                            SharedNetworkID: value.SurgeResponseDetailTypeNumber,
                            SharedNetwork: value.TypeTitleName,
                            GroupID: value.GroupID,
                            GroupName: value.GroupName
                        });
                    } else if (value.GroupID === 3) {
                        this.reasonFields.push({
                            SurgeResponseDetailNumber: value.SurgeResponseDetailNumber,
                            ReasonID: value.SurgeResponseDetailTypeNumber,
                            Reason: value.TypeTitleName,
                            GroupID: value.GroupID,
                            GroupName: value.GroupName
                        });
                    }
                    if (this.networksFields.length > 0) {
                        this.checkedHostNetwork = true;
                        this.showHostNetworkInput = true;
                    } else {
                        this.checkedHostNetwork = false;
                        this.showHostNetworkInput = false;
                    }
                    if (this.sharedNetworkValue.length > 0) {
                        this.checkedSharedNetwork = true;
                        this.showSharedNetworkInput = true;
                    } else {
                        this.checkedSharedNetwork = false;
                        this.showSharedNetworkInput = false;
                    }
                }
            });
        }

        if (this.surgeInfoData) {
            if (this.surgeInfoData.MobilizeMinimum) {
                this.minimumChecked = true;
                this.formGroup.controls.minimizeFlag.setValue(true);
            } else {
                this.minimumChecked = false;
                this.formGroup.controls.minimizeFlag.setValue(false);
            }

            this.formGroup.controls.hostControlSwitch.setValue(this.checkedHostNetwork);
            this.formGroup.controls.sharedResources.setValue(this.checkedSharedNetwork);
            this.formGroup.controls.mobilizeMinimum.setValue(this.surgeInfoData.MobilizeMinimum ? this.surgeInfoData.MobilizeMinimum : null);

            // set ContingencyFileYesNo data
            if (this.jsonData && this.jsonData.SurgeResponseInformation.hasOwnProperty('ContingencyFileYesNo')) {
                if (this.jsonData.SurgeResponseInformation.ContingencyFileYesNo === 'Yes') {
                    this.formGroup.controls.contingencyFileFlg.setValue(true);
                } else {
                    this.formGroup.controls.contingencyFileFlg.setValue(false);
                }
            }
            else if (this.originalDBdata.hasOwnProperty('ContingencyFileYesNo')) {
                if (this.originalDBdata.ContingencyFileYesNo === 'Yes') {
                    this.formGroup.controls.contingencyFileFlg.setValue(true);
                } else {
                    this.formGroup.controls.contingencyFileFlg.setValue(false);
                }
            }


            // set WillingToMobilizeFlag data
            if (this.jsonData && this.jsonData.SurgeResponseInformation.hasOwnProperty('WillingToMobilizeFlag')) {
                if (this.jsonData.SurgeResponseInformation.WillingToMobilizeFlag === 1) {
                    this.formGroup.controls.willingToMobilizeFlg.setValue(true);
                } else {
                    this.formGroup.controls.willingToMobilizeFlg.setValue(false);
                }
            }
            else if (this.originalDBdata.hasOwnProperty('WillingToMobilizeFlag')) {
                if (this.originalDBdata.WillingToMobilizeFlag === 1) {
                    this.formGroup.controls.willingToMobilizeFlg.setValue(true);
                } else {
                    this.formGroup.controls.willingToMobilizeFlg.setValue(false);
                }
            }

            // set WillingToExpandFlag data
            if (this.jsonData && this.jsonData.SurgeResponseInformation.hasOwnProperty('WillingToExpandFlag')) {
                if (this.jsonData.SurgeResponseInformation.WillingToExpandFlag === 1) {
                    this.formGroup.controls.willingToExpandFlg.setValue(true);
                } else {
                    this.formGroup.controls.willingToExpandFlg.setValue(false);
                }
            }
            else if (this.originalDBdata.hasOwnProperty('WillingToMobilizeFlag')) {
                if (this.originalDBdata.WillingToExpandFlag === 1) {
                    this.formGroup.controls.willingToExpandFlg.setValue(true);
                } else {
                    this.formGroup.controls.willingToExpandFlg.setValue(false);
                }
            }


            if (this.surgeInfoData.hasOwnProperty('HoursToMobilize')) {
                this.formGroup.controls.hourstoMobilize.setValue(this.surgeInfoData.HoursToMobilize);
            } else {
                this.formGroup.controls.hourstoMobilize.setValue(this.originalDBdata.HoursToMobilize);

            }

            if (this.surgeInfoData.hasOwnProperty('ExpandDistance')) {
                this.formGroup.controls.expandDistance.setValue(this.surgeInfoData.ExpandDistance);
            } else {
                this.formGroup.controls.expandDistance.setValue(this.originalDBdata.ExpandDistance);
            }

            if (this.surgeInfoData.hasOwnProperty('MobilizeMinimum')) {
                this.formGroup.controls.mobilizeMinimum.setValue(this.surgeInfoData.MobilizeMinimum);
            } else {
                this.formGroup.controls.mobilizeMinimum.setValue(this.originalDBdata.MobilizeMinimum);
            }

            // bind trades data according to its combination
            if (this.jsonDataObject && (this.jsonDataObject.hasOwnProperty('MobilizeTrades') || this.jsonDataObject.hasOwnProperty('ExpandTrades'))) {

                if ((this.jsonDataObject.hasOwnProperty('MobilizeTrades') && this.jsonDataObject.MobilizeTrades == null) && (this.jsonDataObject.hasOwnProperty('ExpandTrades') && this.jsonDataObject.ExpandTrades == null)) {
                    this.formGroup.controls.trades.setValue(null);
                } else if ((this.jsonDataObject.hasOwnProperty('MobilizeTrades') && this.jsonDataObject.MobilizeTrades == null) && (this.jsonDataObject.hasOwnProperty('ExpandTrades') && this.jsonDataObject.ExpandTrades != null)) {
                    this.formGroup.controls.trades.setValue(this.jsonDataObject.ExpandTrades);
                    this.setTradesDataForVisual(this.jsonDataObject.ExpandTrades);
                } else if ((this.jsonDataObject.hasOwnProperty('MobilizeTrades') && this.jsonDataObject.MobilizeTrades != null) && (this.jsonDataObject.hasOwnProperty('ExpandTrades') && this.jsonDataObject.ExpandTrades == null)) {
                    this.formGroup.controls.trades.setValue(this.jsonDataObject.MobilizeTrades);
                    this.setTradesDataForVisual(this.jsonDataObject.MobilizeTrades);
                } else if ((this.jsonDataObject.hasOwnProperty('MobilizeTrades') && this.jsonDataObject.MobilizeTrades == null) && (!this.jsonDataObject.hasOwnProperty('ExpandTrades'))) {
                    this.formGroup.controls.trades.setValue(this.originalDBdata.ExpandTrades);
                    this.setTradesDataForVisual(this.originalDBdata.ExpandTrades);
                } else if ((this.jsonDataObject.hasOwnProperty('ExpandTrades') && this.jsonDataObject.ExpandTrades == null) && (!this.jsonDataObject.hasOwnProperty('MobilizeTrades'))) {
                    this.formGroup.controls.trades.setValue(this.originalDBdata.MobilizeTrades);
                    this.setTradesDataForVisual(this.originalDBdata.MobilizeTrades);
                } else if ((this.jsonDataObject.hasOwnProperty('MobilizeTrades') && this.jsonDataObject.MobilizeTrades != null)) {
                    this.formGroup.controls.trades.setValue(this.jsonDataObject.MobilizeTrades);
                    this.setTradesDataForVisual(this.jsonDataObject.MobilizeTrades);
                } else if ((this.jsonDataObject.hasOwnProperty('ExpandTrades') && this.jsonDataObject.ExpandTrades != null)) {
                    this.formGroup.controls.trades.setValue(this.jsonDataObject.ExpandTrades);
                    this.setTradesDataForVisual(this.jsonDataObject.ExpandTrades);
                } else {
                    this.formGroup.controls.trades.setValue(this.jsonDataObject.MobilizeTrades);
                    this.setTradesDataForVisual(this.jsonDataObject.MobilizeTrades);
                }

            } else if (this.originalDBdata.hasOwnProperty('MobilizeTrades') || this.originalDBdata.hasOwnProperty('ExpandTrades')) {

                if (this.originalDBdata.MobilizeTrades == null && this.originalDBdata.ExpandTrades == null) {
                    this.formGroup.controls.trades.setValue(null);
                } else if (this.originalDBdata.MobilizeTrades == null && this.originalDBdata.ExpandTrades != null) {
                    this.formGroup.controls.trades.setValue(this.originalDBdata.ExpandTrades);
                    this.setTradesDataForVisual(this.originalDBdata.ExpandTrades);
                } else if (this.originalDBdata.MobilizeTrades != null && this.originalDBdata.ExpandTrades == null) {
                    this.formGroup.controls.trades.setValue(this.originalDBdata.MobilizeTrades);
                    this.setTradesDataForVisual(this.originalDBdata.MobilizeTrades);
                } else {
                    this.formGroup.controls.trades.setValue(this.originalDBdata.MobilizeTrades);
                    this.setTradesDataForVisual(this.originalDBdata.MobilizeTrades);
                }
            }

        }
        this._changeDetectorRef.detectChanges();
    }

    setTradesDataForVisual(tradesData) {
        this.tradesFields = [];
        tradesData.split(',').forEach((el, i) => {
            this.tradesFields.push({
                TradeListID: parseInt(el.split('^')[0], 10),
                tradeDesc: el.split('^')[1],
            });
        });
    }

    // setting the dropdown data into their respsective groups
    private setDropdownData() {
        this.hostNetworkData = [];
        this.sharedNetworkData = [];
        this.reasonsData = [];
        this.mutiselectDropDownsData.forEach((el, i) => {
            if (el.GroupID === 1) {
                this.hostNetworkData.push({
                    HostNetwork: el.TypeTitleName,
                    HostNetworkID: el.TypeTitleID,
                    GroupID: el.GroupID,
                    GroupName: el.GroupName
                });
            } else if (el.GroupID === 2) {
                this.sharedNetworkData.push({
                    SharedNetwork: el.TypeTitleName,
                    SharedNetworkID: el.TypeTitleID,
                    GroupID: el.GroupID,
                    GroupName: el.GroupName
                });
            } else if (el.GroupID === 3) {
                this.reasonsData.push({
                    Reason: el.TypeTitleName,
                    ReasonID: el.TypeTitleID,
                    GroupID: el.GroupID,
                    GroupName: el.GroupName
                });
            }
        });
    }

    public tradeTypeUpdate(ev) {
        if (ev) {
            const tempArr = [];
            ev.forEach((val) => {
                tempArr.push(`${val.TradeListID}^${val.tradeDesc}`);
            });
            this.formGroup.controls.trades.setValue(tempArr.join(','));
        }
    }

    public uploadFile() {
        const dialogRef = this._srvDialog.open({
            content: DocumentUploadComponent,
            width: 600,
        });
        const contractorInfo = dialogRef.content.instance;
        contractorInfo.pageOrigin = 'surgeResponse';
    }

    public openLicenseDialog() {
        this._document.body.classList.add('manage-surge');
        const dialogRef = this._srvDialog.open({
            content: ManageSurgeLicenseComponent,
            width: 1200,
        });
    }

    async openCoverage(tradesName) {
        const id: number = tradesName === 'Mobilize' ? this.coverageListDetails.MobilizedCoverageID : this.coverageListDetails.ExpandedCoverageID;
        await this._srvContractorData.saveContractorData({ currentPage: 'Surge Information Page', nextPage: 'coverage-profile-information' }, null, 'SurgeResponseInfo/EditSurgeEventJsonData');
        this._router.navigate([`/contractorRegistration/coverage-profile-information/${id}`]);
    }

    // this function does addtion of data in SurgeResponseDetails and updation of data in RemovedSurgeResponseDetails
    valueChange(val, idType, valueType) {

        if (!this.isRemoved) {

            const addedItem = val[val.length - 1];

            this.removedSurgeDetails.forEach((ele, index) => {
                if (addedItem && ele.SurgeResponseDetailTypeNumber === addedItem[idType]) {
                    this.removedSurgeDetails.splice(index, 1)
                }
            });

            if (addedItem && addedItem.GroupID === 1) {
                this.SurgeResponseDetail.push({
                    SurgeResponseDetailNumber: addedItem.SurgeResponseDetailNumber ? addedItem.SurgeResponseDetailNumber : null,
                    SurgeResponseDetailTypeNumber: addedItem.HostNetworkID,
                    TypeTitleName: addedItem.HostNetwork,
                    GroupID: addedItem.GroupID,
                    GroupName: addedItem.GroupName
                });
            }
            else if (addedItem && addedItem.GroupID === 2) {
                this.SurgeResponseDetail.push({
                    SurgeResponseDetailNumber: addedItem.SurgeResponseDetailNumber ? addedItem.SurgeResponseDetailNumber : null,
                    SurgeResponseDetailTypeNumber: addedItem.SharedNetworkID,
                    TypeTitleName: addedItem.SharedNetwork,
                    GroupID: addedItem.GroupID,
                    GroupName: addedItem.GroupName
                });
            }
            else if (addedItem && addedItem.GroupID === 3) {
                this.SurgeResponseDetail.push({
                    SurgeResponseDetailNumber: addedItem.SurgeResponseDetailNumber ? addedItem.SurgeResponseDetailNumber : null,
                    SurgeResponseDetailTypeNumber: addedItem.ReasonID,
                    TypeTitleName: addedItem.Reason,
                    GroupID: addedItem.GroupID,
                    GroupName: addedItem.GroupName
                });
            }
        }
    }

    // this function remove individual data/element from SurgeResponseDetails
    public onRemoveTag(val, text) {

        if (text === 'HostNetworkGroup') {
            const detailNumber = this.updateSurgeNumber(val.dataItem.HostNetworkID);
            this.removedSurgeDetails.push({
                SurgeResponseDetailNumber: detailNumber ? detailNumber : null,
                SurgeResponseDetailTypeNumber: val.dataItem.HostNetworkID,
                TypeTitleName: val.dataItem.HostNetwork,
                GroupID: 1,
                GroupName: val.dataItem.GroupName
            });

            this.updateSurgeDetail(val, 'HostNetworkID');
        }
        else if (text === 'SharedNetworkGroup') {
            const detailNumber = this.updateSurgeNumber(val.dataItem.SharedNetworkID);
            this.removedSurgeDetails.push({
                SurgeResponseDetailNumber: detailNumber ? detailNumber : null,
                SurgeResponseDetailTypeNumber: val.dataItem.SharedNetworkID,
                TypeTitleName: val.dataItem.SharedNetwork,
                GroupID: 2,
                GroupName: val.dataItem.GroupName
            });

            this.updateSurgeDetail(val, 'SharedNetworkID');

        }
        else if (text === 'ReasonGroup') {
            const detailNumber = this.updateSurgeNumber(val.dataItem.ReasonID);
            this.removedSurgeDetails.push({
                SurgeResponseDetailNumber: detailNumber ? detailNumber : null,
                SurgeResponseDetailTypeNumber: val.dataItem.ReasonID,
                TypeTitleName: val.dataItem.Reason,
                GroupID: 3,
                GroupName: val.dataItem.GroupName
            });

            this.updateSurgeDetail(val, 'ReasonID');

        }

    }

    updateSurgeNumber(data) {
        const result = this.multiselectDropdownValue.find(el => el.SurgeResponseDetailTypeNumber === data);
        if (result !== undefined) return result.SurgeResponseDetailNumber
    }

    updateSurgeDetail(val, idType) {
        this.SurgeResponseDetail.forEach((ele, index) => {
            if (val.dataItem && ele.SurgeResponseDetailTypeNumber === val.dataItem[idType]) {
                this.SurgeResponseDetail.splice(index, 1)
            }
        });

    }


    // this function remove whole data/element from SurgeResponseDetails
    public surgeDetailToggleRemove(SurgeDetailArray) {

        if (SurgeDetailArray && SurgeDetailArray.length > 0) {
            if (!this.formGroup.controls.hostControlSwitch.value) {
                SurgeDetailArray.forEach((val) => {
                    if (val.HostNetworkID) {
                        const detailNumber = this.updateSurgeNumber(val.HostNetworkID);
                        this.removedSurgeDetails.push({
                            SurgeResponseDetailNumber: detailNumber ? detailNumber : null,
                            SurgeResponseDetailTypeNumber: val.HostNetworkID,
                            TypeTitleName: val.HostNetwork,
                            GroupID: 1,
                            GroupName: val.GroupName
                        });
                    }

                });

                this.updateSurgeOnToggleAction();
            }
            if (!this.checkedSharedNetwork) {
                SurgeDetailArray.forEach((val) => {
                    if (val.SharedNetworkID) {
                        const detailNumber = this.updateSurgeNumber(val.SharedNetworkID);
                        this.removedSurgeDetails.push({
                            SurgeResponseDetailNumber: detailNumber ? detailNumber : null,
                            SurgeResponseDetailTypeNumber: val.SharedNetworkID,
                            TypeTitleName: val.SharedNetwork,
                            GroupID: 2,
                            GroupName: val.GroupName
                        });
                    }
                });

                this.updateSurgeOnToggleAction();
            }
            if (this.formGroup.controls.willingToMobilizeFlg.value) {
                SurgeDetailArray.forEach((val) => {
                    if (val.ReasonID) {
                        const detailNumber = this.updateSurgeNumber(val.ReasonID);
                        this.removedSurgeDetails.push({
                            SurgeResponseDetailNumber: detailNumber ? detailNumber : null,
                            SurgeResponseDetailTypeNumber: val.ReasonID,
                            TypeTitleName: val.Reason,
                            GroupID: 3,
                            GroupName: val.GroupName
                        });
                    }
                });

                this.updateSurgeOnToggleAction();
            }
        }
    }

    updateSurgeOnToggleAction() {
        this.removedSurgeDetails.forEach(el => {
            const removeIndex = this.SurgeResponseDetail.findIndex(x => x.GroupID === el.GroupID)
            this.SurgeResponseDetail.splice(removeIndex, 1);
        });
    }

    // this function create object of page data
    private updateSurgeDetailToSave(): Promise<SurgeResponseInformation> {
        const controls = this.formGroup.controls;
        return new Promise((resolve, reject) => {

            const removedSurgeObject: SurgeResponseInformation = {};
            if (this.removedSurgeDetails.length) {
                removedSurgeObject.RemovedSurgeReponseDetail = this.removedSurgeDetails;
            }
            const finalJSONObj = {
                SurgeResponseNumber: this.originalDBdata.SurgeResponseNumber,
                WillingToMobilizeFlag: controls.willingToMobilizeFlg.value ? 1 : 0,
                MobilizeTrades: controls.willingToMobilizeFlg.value && controls.trades.value ? controls.trades.value : null,
                MobilizeMinimum: this.formGroup.controls.minimizeFlag.value && controls.mobilizeMinimum.value ? parseInt(controls.mobilizeMinimum.value, 10) : null,
                HoursToMobilize: this.formGroup.controls.willingToMobilizeFlg.value && controls.hourstoMobilize.value ? parseInt(controls.hourstoMobilize.value, 10) : null,
                WillingToExpandFlag: controls.willingToExpandFlg.value ? 1 : 0,
                ExpandDistance: this.formGroup.controls.willingToExpandFlg.value && controls.expandDistance.value ? parseInt(controls.expandDistance.value, 10) : null,
                ExpandTrades: controls.willingToExpandFlg.value && controls.trades.value ? controls.trades.value : null,
                SurgeResponseDetail: this.SurgeResponseDetail,
                ContingencyFileYesNo: controls.contingencyFileFlg.value ? 'Yes' : 'No',
                ...removedSurgeObject
            };
            resolve(finalJSONObj);

        });

    }

    // this function shows the updated/merged data on screen
    surgeResponseDetailFrontView(pendingData, DBData: []) {
        let mergerdArray
        mergerdArray = pendingData.SurgeResponseDetail ? DBData.concat(pendingData.SurgeResponseDetail) : DBData

        mergerdArray = mergerdArray.filter((v, i, a) => a.findIndex(t => (t.SurgeResponseDetailTypeNumber === v.SurgeResponseDetailTypeNumber)) === i)

        if (pendingData.RemovedSurgeReponseDetail) {
            pendingData.RemovedSurgeReponseDetail.forEach((el) => {
                const index = mergerdArray.findIndex(ap => ap.SurgeResponseDetailTypeNumber === el.SurgeResponseDetailTypeNumber)
                if (index > -1) {
                    mergerdArray.splice(index, 1);
                }
            });
        }

        if (pendingData.SurgeResponseDetail) {
            pendingData.SurgeResponseDetail.forEach((val, i) => {
                if (val) {
                    if (val.GroupID === 1) {
                        this.visualCue.HostNetwork = true;
                    } else if (val.GroupID === 2) {
                        this.visualCue.SharedNetwork = true;
                    } else if (val.GroupID === 3) {
                        this.visualCue.ReasonFields = true;
                    } else {
                        return;
                    }
                }
            });
        }

        if (pendingData.RemovedSurgeReponseDetail) {
            pendingData.RemovedSurgeReponseDetail.forEach((val, i) => {
                if (val) {
                    if (val.GroupID === 1) {
                        this.visualCue.HostNetwork = true;
                    } else if (val.GroupID === 2) {
                        this.visualCue.SharedNetwork = true;
                    } else if (val.GroupID === 3) {
                        this.visualCue.ReasonFields = true;
                    } else {
                        return;
                    }
                }
            });
        }

        return mergerdArray;

    }



    // this function does the comparison between DB and JSON data to apply visualCue
    private updateVisualCue() {
        Object.keys(this.visualCue).forEach((v) => (this.visualCue[v] = false));
        Promise.all([this.getDBSurgeRes(), this.getJsonSurgeRes()]).then((values) => {

            if (values[1] && values[1].SurgeResponseInformation) {

                this._srvSurgeInfoData.compareToApplyVisualCue(values[1].SurgeResponseInformation).then((diff) => {

                    const pendingData = values[1].SurgeResponseInformation;
                    const DBData = this.multiselectDropdownValue;
                    let mergerdArray = []

                    if (values[1].SurgeResponseInformation) {
                        // @ts-ignore
                        mergerdArray = this.surgeResponseDetailFrontView(pendingData, DBData)
                    } else {
                        // @ts-ignore
                        mergerdArray = this.surgeResponseDetailFrontView([], DBData)
                    }

                    this.multiselectDropdownValue = mergerdArray

                    Object.keys(diff).forEach((val, i) => {
                        if (this.visualCue.hasOwnProperty(val) === true) {
                            values[0][val] = values[1].SurgeResponseInformation[val];
                            this.visualCue[val] = true;
                        }
                    });

                    this.surgeInfoData = values[1].SurgeResponseInformation;
                    this.mapContractorData();
                });
            } else {
                this.surgeInfoData = this.originalDBdata;
                this.mapContractorData();
            }
        });
    }

    // route to previous page
    public async backButtonClick() {
        if (this._srvAuthentication.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            await this._srvContractorData.saveContractorData({ currentPage: 'Surge Information Page', nextPage: 'veteran-info' }, null, 'SurgeResponseInfo/EditSurgeEventJsonData');
            await this._router.navigate(['/existing-contractor/veteran-info']);
            return;
        }
    }

    // PUT-API
    async SaveEditEventJSON(finalObj, approvalObject) {
        await this._srvContractorData.saveContractorData({ currentPage: 'Surge Information Page', nextPage: 'questionnaire' }, finalObj, 'SurgeResponseInfo/EditSurgeEventJsonData');
        this.crComments = await this._srvContractorData.getPageComments('Surge/CAT Response');
        this.SurgeResponseDetail = [];
        this.removedSurgeDetails = [];
        this.getSurgeData();
        if (this._srvAuthentication.Profile.EventName !== 'No Event') {
            await this._router.navigate(['/existing-contractor/questionnaire'])
        } else {
            if (Object.keys(approvalObject).length > 0) {
                this.getSurgeData();
            }
        }
    }

    public save() {
        this.formGroup.controls.reasonsMultiselect.markAllAsTouched();
        this.formGroup.controls.hostNetworkMultiSelect.markAllAsTouched();
        this.formGroup.controls.sharedResorceMultiSelect.markAllAsTouched();
        this.formGroup.controls.tradeMultiselect.markAllAsTouched();
        this.formGroup.controls.mobilizeMinimum.markAllAsTouched();
        if (!this.formGroup.valid) {
            this.formSubmitted = true;
            this.formGroup.updateValueAndValidity();
            return;
        }

        this.updateSurgeDetailToSave().then((finalJSONObj) => {
            this._srvSurgeInfoData.compareToApplyVisualCue(finalJSONObj).then(async (val) => {
                val.SurgeResponseNumber = this.originalDBdata.SurgeResponseNumber ? this.originalDBdata.SurgeResponseNumber : null;
                val.LoggedInResourceID = this.ResourceId ? this.ResourceId : null;
                val.ContractorNumber = this.originalDBdata.ContractorNumber ? this.originalDBdata.ContractorNumber : null;

                if (val.SurgeResponseNumber === null) {
                    val.WillingToMobilizeFlag = this.formGroup.controls.willingToMobilizeFlg.value ? 1 : 0;
                    val.WillingToExpandFlag = this.formGroup.controls.willingToExpandFlg.value ? 1 : 0;
                }

                let approvalObject: SurgeResponseInformation;

                const oldData = this.jsonData === undefined ? {} : this.jsonData;
                const DbData = this.originalDBdata === undefined ? null : this.originalDBdata;

                approvalObject = this._srvSurgeInfoData.differenceSurge(finalJSONObj, DbData, oldData);
                const SurgeResponseDetailObj = []

                if (finalJSONObj.hasOwnProperty('SurgeResponseDetail')) {
                    finalJSONObj.SurgeResponseDetail.forEach(element => {
                        let obj = {};

                        if ((oldData.SurgeResponseInformation && oldData.SurgeResponseInformation.SurgeResponseDetail) || DbData.SurgeResponseDetail.length) {

                            // here it compares page data with JSON data
                            if (oldData.SurgeResponseInformation && oldData.SurgeResponseInformation.SurgeResponseDetail) {

                                const surgeResponseDetailIndex = oldData.SurgeResponseInformation.SurgeResponseDetail.findIndex(ap => ap.SurgeResponseDetailTypeNumber === element.SurgeResponseDetailTypeNumber)

                                if (surgeResponseDetailIndex === -1) {
                                    obj = {
                                        SurgeResponseDetailNumber: val.SurgeResponseDetailNumber ? val.SurgeResponseDetailNumber : null,
                                        SurgeResponseDetailTypeNumber: element.SurgeResponseDetailTypeNumber,
                                        TypeTitleName: element.TypeTitleName,
                                        GroupID: element.GroupID,
                                        GroupName: element.GroupName
                                    };

                                }

                            }

                            // here it compares page data with DB data
                            else if (DbData.SurgeResponseDetail.find(db => db.SurgeResponseDetailTypeNumber === element.SurgeResponseDetailTypeNumber)) {
                                const surgeResponseDetailIndex = DbData.SurgeResponseDetail.findIndex(db => db.SurgeResponseDetailTypeNumber === element.SurgeResponseDetailTypeNumber);

                                if (surgeResponseDetailIndex === -1) {
                                    obj = {
                                        SurgeResponseDetailNumber: element.SurgeResponseDetailNumber ? element.SurgeResponseDetailNumber : null,
                                        SurgeResponseDetailTypeNumber: element.SurgeResponseDetailTypeNumber,
                                        TypeTitleName: element.TypeTitleName,
                                        GroupID: element.GroupID,
                                        GroupName: element.GroupName
                                    };

                                }

                                if (Object.keys(oldData).length && oldData.SurgeResponseInformation.RemovedSurgeReponseDetail) {
                                    DbData.SurgeResponseDetail.forEach(el => {
                                        const RemovedIndex = oldData && oldData.SurgeResponseInformation.RemovedSurgeReponseDetail.findIndex(x => x.SurgeResponseDetailTypeNumber === el.SurgeResponseDetailTypeNumber)

                                        if (RemovedIndex !== -1 && RemovedIndex !== undefined) {
                                            obj = {
                                                SurgeResponseDetailNumber: element.SurgeResponseDetailNumber ? element.SurgeResponseDetailNumber : null,
                                                SurgeResponseDetailTypeNumber: element.SurgeResponseDetailTypeNumber,
                                                TypeTitleName: element.TypeTitleName,
                                                GroupID: element.GroupID,
                                                GroupName: element.GroupName
                                            };
                                        }
                                    });
                                }
                            }
                            else {
                                obj = {
                                    SurgeResponseDetailNumber: element.SurgeResponseDetailNumber ? element.SurgeResponseDetailNumber : null,
                                    SurgeResponseDetailTypeNumber: element.SurgeResponseDetailTypeNumber,
                                    TypeTitleName: element.TypeTitleName,
                                    GroupID: element.GroupID,
                                    GroupName: element.GroupName
                                };

                            }
                        }

                        else {
                            obj = {
                                SurgeResponseDetailNumber: val.SurgeResponseDetailNumber ? val.SurgeResponseDetailNumber : null,
                                SurgeResponseDetailTypeNumber: element.SurgeResponseDetailTypeNumber,
                                TypeTitleName: element.TypeTitleName,
                                GroupID: element.GroupID,
                                GroupName: element.GroupName
                            };

                        }

                        if (obj && Object.keys(obj).length) {
                            SurgeResponseDetailObj.push(obj);
                        }

                    })

                }

                // formation of objects based on changed page data
                if (SurgeResponseDetailObj.length > 0 && finalJSONObj.RemovedSurgeReponseDetail) {
                    approvalObject = { ...approvalObject, SurgeResponseDetail: SurgeResponseDetailObj, RemovedSurgeReponseDetail: finalJSONObj.RemovedSurgeReponseDetail }
                }
                else if (SurgeResponseDetailObj.length > 0) {
                    approvalObject = { ...approvalObject, SurgeResponseDetail: SurgeResponseDetailObj }
                }
                else if (finalJSONObj.RemovedSurgeReponseDetail) {
                    approvalObject = { ...approvalObject, RemovedSurgeReponseDetail: finalJSONObj.RemovedSurgeReponseDetail }
                }
                else {
                    approvalObject = { ...approvalObject }
                }

                // If its contractor, then this code will execute and for internal-else condition
                if (this.loggedInUserType !== 'Internal') {
                    const ccopsData = { SurgeResponseInformation: approvalObject }
                    const finalObj = Object.keys(approvalObject).length > 0 ? ccopsData : null;
                    this.SaveEditEventJSON(finalObj, approvalObject);
                    return;
                } else {
                    // final object formation for internal-user
                    const ccopsData = { SurgeResponseInformation: approvalObject }
                    const reqObj = {
                        CCOpsID: this.loginDetails[0].CCOpsID,
                        ResourceId: this.ResourceId,
                        ContractorResourceNumber: this._srvAuthentication.Profile.ContractorResourceID,
                        ContractorResourceID: this._srvAuthentication.Profile.ContractorResourceID,
                        CCOpsData: JSON.stringify(ccopsData),
                        Contr_ID: this.ContrID,
                        LoginUserEmail: this.loginDetails[0].Email,
                        PageName: 'Surge Information Page',
                    };
                    await this._srvSurgeInfoData.saveInternalData(reqObj);
                    this.SurgeResponseDetail = [];
                    this.removedSurgeDetails = [];
                    this.formGroup.reset();
                    this.updateVisualCue();
                }

            });
        });
    }
}
