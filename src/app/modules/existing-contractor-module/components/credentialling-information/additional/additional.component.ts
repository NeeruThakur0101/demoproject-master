import { ElementRef, Renderer2 } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { CompositeFilterDescriptor, distinct, filterBy, SortDescriptor } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { CredentialService } from '../credential.service';
import { AdditionalData, Vendors } from '../credentialing.model';

@Component({
    selector: 'app-additional',
    templateUrl: './additional.component.html',
    styleUrls: ['./additional.component.scss'],
})
export class AdditionalComponent implements OnInit {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    @Input() containerRef;
    @Input() pageObj: any;
    @Input() pageSize: number;
    public pageContent: any;
    public _additionalGrid: AdditionalData[] = [];
    private _additionalOriginalData: AdditionalData[] = [];
    public isLoader: boolean = false;
    public allowCustom = true;
    public listItems: Vendors[] = [];
    private invalidDateChk: Array<boolean> = [];
    public filterListItems: Vendors[] = [];
    public filter: CompositeFilterDescriptor = null;
    public filterSettings: DropDownFilterSettings = {
        caseSensitive: false,
        operator: 'contains',
    };
    public gridDataGrid = filterBy(this._additionalGrid, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this._additionalGrid, filter);
    }
    public distinctPrimitive(fieldName: string): any {
        this._additionalGrid.forEach((element) => {
            if (element['ExpirationDate'] !== null) element['ExpirationDate'] = moment(element['ExpirationDate']).format('MM/DD/yyyy');
        });
        return distinct(this._additionalGrid, fieldName).map((item) => item[fieldName]);
    }
    public sort: SortDescriptor[] = [];
    public skip: number = 0;
    constructor(
        private _srvLanguage: InternalUserDetailsService,
        private _srvCredential: CredentialService,
        public _srvAuthentication: AuthenticationService,
        private _dialog: DialogService,
        private _srvUniversal: UniversalService,
        private renderer: Renderer2
    ) {}

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    ngOnInit(): void {
        this._srvCredential.tabNow.next('Miscellaneous');
        this.getVendorData();
        this.initialCall();

        setTimeout(() => {
            this.heightCalculate();
        }, 3000);

        this._srvCredential.tabChanged.subscribe((value) => {
            if (value === 'Miscellaneous') {
                let flag = 0;
                for (const [i, ele] of this._additionalOriginalData.entries()) {
                    const vendorId = this._additionalGrid[i].VendorID || this._additionalGrid[i].CredentialingFirm;
                    const oldVendorId = ele.VendorID || ele.CredentialingFirm;
                    const reportNumber = this._additionalGrid[i].ReportNumber === '' ? null : this._additionalGrid[i].ReportNumber;
                    const newDate = this._additionalGrid[i]['ExpirationDate'] !== null ? moment(this._additionalGrid[i].ExpirationDate).format('MM-DD-YYYY') : null;
                    if (ele.ExpirationDate !== newDate || ele.ReportNumber !== reportNumber || vendorId !== oldVendorId) {
                        flag++;
                        this._srvCredential.changesExist.next(true);
                        break;
                    }
                    if (flag === 0 && i === this._additionalOriginalData.length - 1) {
                        this._srvCredential.changesExist.next(false);
                    }
                }
            }
        });
    }
    private async initialCall() {
        this.isLoader = true;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        await this.initPage();
        this.isLoader = false;
    }
    private async initPage() {
        const gridData = await this._srvCredential.getTabsGridData(6);
        this._additionalOriginalData = JSON.parse(JSON.stringify(gridData.AdditionalInformation));
        this._additionalGrid = gridData.AdditionalInformation;
        if (this._additionalGrid) {
            this._additionalGrid.forEach((element, i) => {
                const val: any = element['ExpirationDate'];
                element['ExpirationDate'] = val !== null ? val.replace(new RegExp(/-/gm), '/') : null;
                if (element.ExpirationDate === null) {
                    element['ExpirationDateNew'] = null;
                } else {
                    element['ExpirationDateNew'] = new Date(element.ExpirationDate);
                }
            });
        }
    }

    async onSaveAdditional(dataItem: AdditionalData, rowIndex: number) {
        dataItem['VendorID'] = typeof dataItem['VendorID'] === 'string' ? dataItem['VendorID'].trim() : dataItem['VendorID'];
        dataItem['ExpirationDate'] = dataItem['ExpirationDateNew'];
        const _expDate = dataItem['ExpirationDate'] !== null ? moment(dataItem.ExpirationDate).format('MM-DD-YYYY') : null;
        const expDate = this._additionalOriginalData[rowIndex].ExpirationDate !== null ? moment(this._additionalOriginalData[rowIndex].ExpirationDate).format('MM-DD-YYYY') : null;
        dataItem.VendorID = dataItem.VendorID || dataItem.CredentialingFirm;
        this._additionalOriginalData[rowIndex].VendorID = this._additionalOriginalData[rowIndex].VendorID || this._additionalOriginalData[rowIndex].CredentialingFirm;
        if (this._additionalOriginalData[rowIndex].VendorID === undefined) {
            this._additionalOriginalData[rowIndex].VendorID = null;
        }
        if (
            (expDate === _expDate &&
                dataItem['VendorID'] === this._additionalOriginalData[rowIndex]['VendorID'] &&
                dataItem.ReportNumber &&
                this._additionalOriginalData[rowIndex]['ReportNumber'] &&
                dataItem['ReportNumber'].trim() === this._additionalOriginalData[rowIndex]['ReportNumber'].trim()) ||
            (_expDate === null && this.invalidDateChk[rowIndex] === true)
        ) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 450, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;
            let msg: string;
            if (this.pageContent) {
                msg = this.invalidDateChk[rowIndex] === true ? this.pageContent.Credentialing_Information.Invalid_Date : this.pageContent.Credentialing_Information.No_Changes_Msg;
            }
            dialog.alertMessage = `
        <div class="modal-alert info-alert">
            <p>${msg}</p>
       </div> `;
            return;
        }
        const dateValidate: boolean = this._srvCredential.validateDate(_expDate);

        if (!dateValidate && dataItem['ExpirationDate'] !== null) {
            const dialogRef = this._dialog.open({
                content: DialogAlertsComponent,
                width: 500,
                appendTo: this.containerRef,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p *ngIf="pageContent">${this.pageContent.Credentialing_Information.Invalid_Date}</p>
                </div>
            `;
            return;
        }
        this.isLoader = true;
        await this._srvCredential.getServerTime();
        const vendorName = this.listItems.find((ele) => {
            return ele.VendorID === dataItem.VendorID;
        });

        delete dataItem['ExpirationDateNew'];
        const loggedInUserResourceId = this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID;
        const saveObj = {
            Contr_ID: this._srvAuthentication.Profile.ContrID,
            MetricTypeNumber: dataItem.MetricTypeNumber,
            MetricTypeName: dataItem.MetricTypeName,
            ReportNumber: dataItem.ReportNumber === '' ? null : dataItem.ReportNumber,
            VendorName: typeof dataItem.VendorID === 'number' ? vendorName.VendorName : null,
            VendorID: typeof dataItem.VendorID === 'number' ? dataItem.VendorID : null,
            CredentialingTrackingNumber: dataItem.CredentialingTrackingNumber,
            CredentialingItem: dataItem.CredentialingItem,
            GroupNumber: dataItem.GroupNumber,
            GroupName: dataItem.GroupName,
            CreatedDate: dataItem['CreatedDate'] == null ? this._srvCredential.timeStamp : this._additionalOriginalData[rowIndex].CreatedDate,
            CreatedResourceID: dataItem['CreatedDate'] == null ? loggedInUserResourceId : this._additionalOriginalData[rowIndex].CreatedResourceID,
            UpdatedDate: dataItem['UpdatedDate'] !== null ? this._srvCredential.timeStamp : this._additionalOriginalData[rowIndex].UpdatedDate,
            UpdatedResourceID: dataItem['CreatedDate'] !== null ? loggedInUserResourceId : this._additionalOriginalData[rowIndex].UpdatedResourceID,
            ExpirationDate: _expDate,
            Due: dataItem.Due,
            CredentialingDate: dataItem.CredentialingDate,
            CredentialingFirm: typeof dataItem.VendorID === 'number' ? null : dataItem.VendorID,
        };
        await this._srvCredential.saveAdditionalData(saveObj);
        this.initialCall();
    }

    async getVendorData() {
        this.listItems = await this._srvCredential.getVendors();
        this.filterListItems = this.listItems;
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

    public sortChange() {
        this._additionalGrid.forEach((element) => {
            element['ExpirationDate'] = element['ExpirationDate'] !== null ? new Date(element['ExpirationDate']) : null;
        });
    }

    keyPressDateChk(ev, rowIndex) {
        if (ev.target.value === 'month/day/year') {
            this.invalidDateChk[rowIndex] = false;
            return;
        }
        const dateValidate: boolean = this._srvCredential.validateDateChk(ev.target.value);
        if (!dateValidate) {
            this.invalidDateChk[rowIndex] = true;
        } else {
            this.invalidDateChk[rowIndex] = false;
        }
    }
}
