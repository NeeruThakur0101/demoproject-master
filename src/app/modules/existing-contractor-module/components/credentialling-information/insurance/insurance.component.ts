import { Component, Input, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import * as moment from 'moment';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { CompositeFilterDescriptor, filterBy, distinct } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent, RowClassArgs } from '@progress/kendo-angular-grid';
import { DatePipe } from '@angular/common';
import { ApprovalApiJson, InsuranceList } from '../credentialing.model';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { CredentialService } from '../credential.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-insurance',
    templateUrl: './insurance.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./insurance.component.scss'],
})
export class InsuranceComponent implements OnInit {
    @Input() containerRef: any;
    @Input() pageObj: any;
    @Input() pageSize: number;
    @Input() readonlyUserAccess: boolean;
    public tabId: number = 1;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public insuranceGrid: InsuranceList[] = [];
    public storedInsuranceGrid: InsuranceList[] = [];
    public approvalApiJson: ApprovalApiJson[] = [];
    public pageContent: any;
    public loggedInUserType: string;
    public gridView: GridDataResult;
    public skip: number = 0;
    public submittedRow: number = null;
    public internalEmployee: boolean = false;
    public loginDetailsInternal: SessionUser;
    public filter: CompositeFilterDescriptor = null;
    public minDate: Date = new Date();
    public serverDateTime: string;
    @Output() Comments = new EventEmitter();

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    public gridDataGrid: InsuranceList[] = filterBy(this.insuranceGrid, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.insuranceGrid, filter);
    }

    public distinctPrimitive(fieldName: string): any {
        this.insuranceGrid.forEach((element) => {
            if (element['ExpirationDate'] !== null) element['ExpirationDate'] = moment(element['ExpirationDate']).format('MM/DD/yyyy');
        });
        return distinct(this.insuranceGrid, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private credentialSrv: CredentialService,
        private router: Router,
        private _datePipe: DatePipe,
        public _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContractorData: ContractorDataService,
        private _srvDialog: DialogService,
        private renderer: Renderer2,
        private _srvUniversal: UniversalService,
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

    ngOnInit(): void {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.credentialSrv.tabNow.next('Insurance');
        // get all the required content
        if (this._srvAuth.ProfileInternal) {
            this.loginDetailsInternal = this._srvAuth.ProfileInternal;
        }
        this.loginDetails = Array(this._srvAuth.Profile);
        this.loggedInUserType = this._srvAuth.LoggedInUserType;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.onLoad();

        setTimeout(() => {
            this.heightCalculate();
        }, 1000);

        this.credentialSrv.tabChanged.subscribe((value) => {
            if (value === 'Insurance') {
                let flag = 0;
                for (const [i, ele] of this.storedInsuranceGrid.entries()) {
                    const approvalData = this.approvalApiJson.find((x) => x.MetricTypeNumber === ele.MetricTypeNumber);
                    const coverageAmount = this.insuranceGrid[i].CoverageAmount === 0 ? null : this.insuranceGrid[i].CoverageAmount;
                    const insuranceCarrier = this.insuranceGrid[i].InsuranceCarrier === '' ? null : this.insuranceGrid[i].InsuranceCarrier;
                    const newDate = this.insuranceGrid[i]['ExpirationDate'] !== null ? moment(this.insuranceGrid[i].ExpirationDate).format('MM-DD-YYYY') : null;
                    const oldDate = ele.ExpirationDate !== null ? moment(ele.ExpirationDate).format('MM-DD-YYYY') : null;
                    if (
                        oldDate !== newDate ||
                        (ele.CoverageAmount !== coverageAmount && (this.insuranceGrid[i].isCoverageAmount === false || this.insuranceGrid[i].isCoverageAmount === undefined)) ||
                        (approvalData && approvalData.hasOwnProperty('CoverageAmount') && coverageAmount !== approvalData.CoverageAmount && this.insuranceGrid[i].isCoverageAmount === true) ||
                        (ele.InsuranceCarrier !== insuranceCarrier && (this.insuranceGrid[i].isInsuranceCarrier === false || this.insuranceGrid[i].isInsuranceCarrier === undefined)) ||
                        (approvalData && approvalData.hasOwnProperty('InsuranceCarrier') && insuranceCarrier !== approvalData.InsuranceCarrier && this.insuranceGrid[i].isInsuranceCarrier === true)
                    ) {
                        flag++;
                        this.credentialSrv.changesExist.next(true);
                        break;
                    }
                    if (flag === 0 && i === this.storedInsuranceGrid.length - 1) {
                        this.credentialSrv.changesExist.next(false);
                    }
                }
            }
        });
    }

    // function to get DB data for binding grid
    async onLoad() {
        const obj = await this.credentialSrv.getTabsGridData(this.tabId);
        const grid = obj.InsuranceInformation;
        // convert mm-dd-yyyy date into new Date to bind in kendo-datepicker
        grid.forEach((element) => {
            const val: any = element['ExpirationDate'];
            element['ExpirationDate'] = val !== null ? val.replace(new RegExp(/-/gm), '/') : null;
            if (element.ExpirationDate === null) {
                element['ExpirationDateNew'] = null;
            } else {
                element['ExpirationDateNew'] = new Date(element.ExpirationDate);
            }
        });
        // end
        this.insuranceGrid = grid;
        this.storedInsuranceGrid = JSON.parse(JSON.stringify(this.insuranceGrid));
        this.getJsonForApprovalData();
    }

    public sortChangeInsurance() {
        this.insuranceGrid.forEach((element) => {
            element['ExpirationDate'] = element['ExpirationDate'] !== null ? new Date(element['ExpirationDate']) : null;
        });
    }
    // function to get approval json data which is pending for approval
    public async getJsonForApprovalData() {
        // get changes json
        const res: EditContractor[] = await this.credentialSrv.getApprovalData();
        this.approvalApiJson =
            res.length > 0 && JSON.parse(res[0].CCOpsData) != null && JSON.parse(res[0].CCOpsData).ContractorData.CredentialingInformation.InsuranceInformation
                ? JSON.parse(res[0].CCOpsData).ContractorData.CredentialingInformation.InsuranceInformation
                : [];
        this.matchDataToshowVisualCue();
        this.gridView = {
            data: this.insuranceGrid.slice(this.skip, this.skip + this.pageSize),
            total: this.insuranceGrid.length,
        };
        // check if user is internal or contractor
        this.internalEmployee = this.loggedInUserType === 'Internal' ? true : false;
        // this.loader = false;
    }

    // function  to show visual cue on the fields
    public matchDataToshowVisualCue() {
        if (this.approvalApiJson !== undefined) {
            this.approvalApiJson.forEach((element) => {
                for (const key in element) {
                    if (element.hasOwnProperty(key)) {
                        const ind = this.insuranceGrid.findIndex((x) => x.MetricTypeNumber === element.MetricTypeNumber);
                        if (ind !== -1) {
                            const objGrid: any = this.insuranceGrid[ind];
                            if ((key === 'InsuranceCarrier' || key === 'CoverageAmount') && objGrid.hasOwnProperty(key)) {
                                objGrid[key] = element[key];
                                objGrid['is' + key] = true;
                            }
                            if (key === 'IsRowDisable') {
                                objGrid[key] = element[key];
                            }
                        }
                    }
                }
            });
        }
        // for dynamic height

        this.heightCalculate();
    }

    public isNumber(evt: any): boolean {
        // getting key code of pressed key
        const keycode = evt.which ? evt.which : evt.keyCode;
        if (!(keycode === 8 || keycode === 46) && (keycode < 48 || keycode > 57) && keycode !== 45) {
            return false;
        } else {
            const parts = evt.srcElement.value.split('.');
            if (parts.length > 1 && keycode === 46) {
                return false;
            }
            if (evt.srcElement.value !== '' && keycode === 45) {
                return false;
            }
            if (isNaN(parseFloat(parts))) {
                return;
            } else {
                if (parts.length > 1) {
                    if (parts[1].length > 1) return false;
                }
            }
            return true;
        }
    }

    public amountFocusOut(evt) {
        if (evt.target.value !== '') {
            const val = parseFloat(evt.target.value);
            if (Number.isInteger(val) === false) {
                evt.target.value = val.toFixed(2);
            }
        }
    }
    public rowCallback = (context: RowClassArgs) => {
        if (context.dataItem.MetricTypeName === this.submittedRow) {
            if (
                (context.dataItem.InsuranceCarrier === null || context.dataItem.InsuranceCarrier.trim() === '') &&
                (context.dataItem.CoverageAmount === null || context.dataItem.CoverageAmount === '')
            ) {
                return { gold: true };
            }
            if (
                !(context.dataItem.InsuranceCarrier === null || context.dataItem.InsuranceCarrier.trim() === '') &&
                (context.dataItem.CoverageAmount === null || context.dataItem.CoverageAmount === '')
            ) {
                return { green: true };
            }
            if (
                (context.dataItem.InsuranceCarrier === null || context.dataItem.InsuranceCarrier.trim() === '') &&
                !(context.dataItem.CoverageAmount === null || context.dataItem.CoverageAmount === '')
            ) {
                return { red: true };
            }
        }
    };


    // to save insurance data rowwise
    public async onSaveData(dataItem) {
        dataItem['ExpirationDate'] = dataItem['ExpirationDateNew'];
        this.submittedRow = dataItem.MetricTypeName;

        if (!((dataItem.InsuranceCarrier === null) || (dataItem.InsuranceCarrier.trim() === '')) &&
            !(dataItem.CoverageAmount === null || dataItem.CoverageAmount === '')) {

            const expireDate: string = dataItem['ExpirationDate'] !== null ? this._datePipe.transform(dataItem.ExpirationDate, 'MM-dd-yyyy') : null;
            const dateValidate: boolean = this.credentialSrv.validateDate(expireDate);
            if (!dateValidate && this.loggedInUserType === 'Internal' && dataItem['ExpirationDate'] !== null) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                    appendTo: this.containerRef,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
              <div class="modal-alert info-alert">
                  <p>${this.pageContent.Credentialing_Information.Invalid_Date}</p>
              </div>
          `;
                return;
            }
            delete dataItem['ExpirationDateNew'];
            dataItem['CoverageAmount'] = parseFloat(dataItem.CoverageAmount).toFixed(2);
            this.serverDateTime = await this.credentialSrv.getServerTime();

            const insuranceGrid = this.storedInsuranceGrid;
            const updatedData = dataItem;
            const index = insuranceGrid.findIndex((x) => x.MetricTypeNumber === updatedData.MetricTypeNumber);
            let approvalObject: any;
            const oldData = this.approvalApiJson.find((x) => x.MetricTypeNumber === updatedData.MetricTypeNumber);
            const DbData = insuranceGrid[index];
            approvalObject = this.differenceInsurance(updatedData, DbData, oldData);

            const sendingObj = {
                ContractorNumber: this.loginDetails[0].ContrID,
                InsuranceInformation: approvalObject,
            };
            const ccopsData = { CredentialingInformation: sendingObj };
            const finalObj = Object.keys(approvalObject).length > 0 ? ccopsData : null;

            if (this.loggedInUserType !== 'Internal') {
                this.SaveEditEventJSON(finalObj, approvalObject);
            } else {
                // final object formation for internal-user
                const reqObj: any = {
                    CCOpsID: this.loginDetails[0].CCOpsID,
                    ResourceId: this.internalEmployee !== true ? this.loginDetails[0].ResourceID : this.loginDetailsInternal.ResourceID,
                    ContractorResourceNumber: this._srvAuth.Profile.ContractorResourceID,
                    ContractorResourceID: this._srvAuth.Profile.ContractorResourceID,
                    CCOpsData: JSON.stringify(ccopsData),
                    Contr_ID: this.loginDetails[0].ContrID,
                    LoginUserEmail: this.loginDetails[0].Email,
                    PageName: 'Credentialing Information Page',
                };

                const result: number = await this.credentialSrv.saveInsuranceInternalData(reqObj);
                if (result === 1) {
                    this.onLoad();
                    this.filterChange(null);
                }
            }
        }
    }

    async SaveEditEventJSON(finalObj, approvalObject) {
        const result = await this._srvContractorData.saveContractorData(
            { currentPage: 'Credentialing Information Page', nextPage: '' },
            finalObj,
            'CredentialingInfoPage/EditCredentialingInfoEventJsonData'
        );
        await this.credentialSrv.getCredentialComments();
        if (result === 1) {
            this.onLoad();
            this.filterChange(null);
        }
    }

    public differenceInsurance(tgt, src, approvalJSON) {
        tgt.CoverageAmount = parseFloat(tgt.CoverageAmount);
        src.CoverageAmount = parseFloat(src.CoverageAmount);
        if (Array.isArray(tgt)) {
            // if you got array
            return tgt; // just copy it
        }
        let obj = [];
        const rst: any = {};
        // if you got object
        for (const k in tgt) {
            // visit all fields
            if (tgt.hasOwnProperty(k)) {
                if (approvalJSON !== undefined && approvalJSON.hasOwnProperty(k)) {
                    if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                        // if field contains object (or array because arrays are objects too)
                        rst[k] = this.differenceInsurance(tgt[k], src[k], approvalJSON[k]); // diff the contents
                    } else if (approvalJSON[k] !== tgt[k]) {
                        // if field is not an object and has changed
                        rst[k] = tgt[k]; // use new value
                    }
                    // otherwise just skip it
                } else {
                    if (src[k] !== null && typeof src[k] === 'object') {
                        // if field contains object (or array because arrays are objects too)
                        rst[k] = this.differenceInsurance(tgt[k], src[k], approvalJSON[k]); // diff the contents
                    } else if (src[k] !== tgt[k]) {
                        // if field is not an object and has changed
                        rst[k] = tgt[k]; // use new value
                    }
                    // otherwise just skip it
                }
                const sendingDate = approvalJSON !== undefined ? approvalJSON['CreatedDate'] : tgt['CreatedDate'];
                rst.Due = tgt['Due'];
                rst.CreatedDate = sendingDate == null ? this.serverDateTime : sendingDate;
                rst.CreatedResourceID =
                    tgt['CreatedResourceID'] == null ? (this.internalEmployee !== true ? this.loginDetails[0].ResourceID : this.loginDetailsInternal.ResourceID) : tgt['CreatedResourceID'];
                rst.CredentialingItem = tgt['CredentialingItem'];
                rst.CredentialingTrackingNumber = tgt['CredentialingTrackingNumber'];
                rst.GroupName = tgt['GroupName'];
                rst.GroupNumber = tgt['GroupNumber'];
                rst.MetricTypeName = tgt['MetricTypeName'];
                rst.MetricTypeNumber = tgt['MetricTypeNumber'];
                rst.UpdatedDate = sendingDate != null ? this.serverDateTime : null;
                rst.UpdatedResourceID = sendingDate != null ? (this.internalEmployee !== true ? this.loginDetails[0].ResourceID : this.loginDetailsInternal.ResourceID) : null; // tgt['UpdatedResourceID']
                if (this.internalEmployee === true) rst.ExpirationDate = tgt['ExpirationDate'] != null ? moment(tgt['ExpirationDate']).format('MM/DD/YYYY') : null;
            }
        }

        if (!Object.keys(rst).length) {
            return;
        } else {
            let ind;
            ind = this.approvalApiJson.findIndex((x) => x.CredentialingTrackingNumber === rst['CredentialingTrackingNumber']);
            if (Object.keys(rst).length > 10) {
                if (ind !== -1) {
                    if (Object.keys(rst).length <= 10) {
                        obj = [];
                    } else {
                        obj.push(rst);
                    }
                } else {
                    obj.push(rst);
                }
            }
        }
        return obj;
    }

    // public coverageAmount(event) {
    //     if (event.target.value.length === 12 || event.keyCode === 45) return false;
    // }

    public coverageAmount(evt: any): boolean {
        // getting key code of pressed key
        const keycode = evt.which ? evt.which : evt.keyCode;
        const pattern = /[0-9\.\ ]/;
        const inputChar = String.fromCharCode(evt.charCode);

        if (evt.target.value.length === 12 || evt.keyCode === 45) return false;

        // comparing pressed keycodes
        if (!(keycode === 8 || keycode === 46) && (keycode < 48 || keycode > 57) && !pattern.test(inputChar)) {
            evt.srcElement.classList.add('err');
            return false;
        } else {
            evt.srcElement.classList.remove('err');
            const parts = evt.srcElement.value.split('.');
            if (parts.length > 1 && keycode === 46) {
                return false;
            }
            if (evt.srcElement.value !== '' && keycode === 45) {
                return false;
            }
            if (isNaN(parseFloat(parts))) {
                return;
            } else {
                if (parts.length > 1) {
                    if (parts[1].length > 1) return false;
                }
            }
            return true;
        }
    }

    public pageChange({ skip, take }: PageChangeEvent): void {
        this.skip = skip;
        this.pageSize = take;
    }
}
