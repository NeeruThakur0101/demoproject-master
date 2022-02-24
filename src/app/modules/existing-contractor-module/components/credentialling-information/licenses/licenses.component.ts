import { Component, Input, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogService } from '@progress/kendo-angular-dialog';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, distinct, filterBy, SortDescriptor } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { LicenseJSONData, LicensesList, LicensesListOptional } from '../credentialing.model';
import { CredentialService } from '../credential.service';
import { ElementRef } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-licenses',
    templateUrl: './licenses.component.html',
    styleUrls: ['./licenses.component.scss'],
})
export class LicensesComponent implements OnInit, AfterViewChecked {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    @Input() containerRef;
    @Input() pageObj: any;
    @Input() pageSize: number;
    @Input() readonlyUserAccess: boolean;
    public filter: CompositeFilterDescriptor = null;
    public _licenseGrid: LicensesList[] | LicensesListOptional[] = [];
    public liscOldData: LicensesList[] | LicensesListOptional[] = [];
    public masterData: LicensesList[] = [];
    public isControl: boolean = false;
    public group: FormGroup;
    public gridView: GridDataResult;
    public sort: SortDescriptor[] = [];
    public submitted: Array<boolean> = [];
    public skip: number = 0;
    private dataForApproval: LicenseJSONData[] = [];
    public pageContent: any;
    public isSaving: boolean = true;
    private invalidDateChk: Array<boolean> = [];
    public gridDataGrid: LicensesList[] | LicensesListOptional[] = filterBy(this._licenseGrid, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this._licenseGrid, filter);
    }

    public distinctPrimitive(fieldName: string) {
        this._licenseGrid.forEach((element) => {
            if (element['ExpirationDate'] !== null) element['ExpirationDate'] = moment(element['ExpirationDate']).format('MM/DD/yyyy');
        });
        return distinct(this._licenseGrid, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        public _srvCredential: CredentialService,
        private _srvAuthentication: AuthenticationService,
        private _srvContractorData: ContractorDataService,
        private _srvLanguage: InternalUserDetailsService,
        private _dialog: DialogService,
        private readonly _changeDetectorRef: ChangeDetectorRef,
        private renderer: Renderer2,
        private _srvUniversal: UniversalService,
        public intlService: IntlService
    ) {
        this._srvCredential.getUser();
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
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this._srvCredential.tabNow.next('Licenses');
        this.initialCall();
        setTimeout(() => {
            this.heightCalculate();
        }, 1000);

        this._srvCredential.tabChanged.subscribe((value) => {
            if (value === 'Licenses') {
                let flag = 0;
                for (const [i, ele] of this.liscOldData.entries()) {
                    const approvalData = this.dataForApproval.find((x) => x.LicenseTypeNumber === ele.LicenseTypeNumber && x.State === ele.State);
                    const licenceNumber = this._licenseGrid[i].LicenseNumber === '' ? null : this._licenseGrid[i].LicenseNumber;
                    const newDate = this._licenseGrid[i]['ExpirationDate'] !== null ? moment(this._licenseGrid[i].ExpirationDate).format('MM-DD-YYYY') : null;
                    const oldDate = ele.ExpirationDate !== null ? moment(ele.ExpirationDate).format('MM-DD-YYYY') : null;
                    if (
                        oldDate !== newDate ||
                        (ele.LicenseNumber !== licenceNumber && (this._licenseGrid[i].isLicenseNumber === false || this._licenseGrid[i].isLicenseNumber === undefined)) ||
                        (approvalData && approvalData.hasOwnProperty('LicenseNumber') && licenceNumber !== approvalData.LicenseNumber && this._licenseGrid[i].isLicenseNumber === true)
                    ) {
                        flag++;
                        this._srvCredential.changesExist.next(true);
                        break;
                    }
                    if (flag === 0 && i === this.liscOldData.length - 1) {
                        this._srvCredential.changesExist.next(false);
                    }
                }
            }
        });
    }
    private async initialCall() {
        this.isSaving = true;
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        await this.approvalDataCall();
        await this.initPage();
        this.addApprovalData();
    }
    ngAfterViewChecked(): void {
        this._changeDetectorRef.detectChanges();
    }
    private addApprovalData(): Promise<void> {
        return new Promise((res, rej) => {
            if (this.dataForApproval.length > 0) {
                this.dataForApproval.forEach((ele) => {
                    const gridInd: number = this._licenseGrid.findIndex((x) => x.LicenseTypeNumber === ele.LicenseTypeNumber && x.State === ele.State);
                    const data = this._licenseGrid.find((x) => x.LicenseTypeNumber === ele.LicenseTypeNumber && x.State === ele.State);
                    if (gridInd > -1) {
                        this._licenseGrid[gridInd] = this._srvCredential.putApprovalData(this._licenseGrid[gridInd], ele);
                        this.group.controls[`licenseNo${gridInd}`].setValue(this._licenseGrid[gridInd].LicenseNumber);
                    }
                });
                this.gridView = {
                    data: this._licenseGrid.slice(this.skip, this.skip + this.pageSize),
                    total: this._licenseGrid.length,
                };
                res();
            } else {
                res();
            }
        });
    }
    private async initPage() {
        const gridData = await this._srvCredential.getTabsGridData(5);
        this._licenseGrid = gridData.LicenseInformation;
        this.masterData = gridData.LicenseInformation;
        await this.initFormgroup();
    }
    private async approvalDataCall() {
        const data = await this._srvCredential.getApprovalData();
        this.dataForApproval =
            data.length > 0 && JSON.parse(data[0].CCOpsData) != null && JSON.parse(data[0].CCOpsData).ContractorData.CredentialingInformation.LicenseInformation
                ? JSON.parse(data[0].CCOpsData).ContractorData.CredentialingInformation.LicenseInformation
                : [];
    }

    private initFormgroup(): Promise<void> {
        return new Promise((res, rej) => {
            this.group = new FormGroup({});
            this._licenseGrid.forEach((element, i) => {
                const val: any = element['ExpirationDate'];
                this.group.addControl(`licenseNo${i}`, new FormControl(element.LicenseNumber));

                element['ExpirationDate'] = val !== null ? val.replace(new RegExp(/-/gm), '/') : null;
                this.group.addControl(`expiryDate${i}`, new FormControl());
                this.group.controls[`expiryDate${i}`].setValue(element.ExpirationDate !== null ? new Date(element['ExpirationDate']) : null);

                if (element.ExpirationDate === null) {
                    element['ExpirationDateNew'] = null;
                } else {
                    element['ExpirationDateNew'] = new Date(element.ExpirationDate);
                }

                this.submitted[i] = false;
                if (i === this._licenseGrid.length - 1) {
                    this.isControl = true;
                    if (this.readonlyUserAccess === true) {
                        this.group.disable();
                    }
                    this.liscOldData = JSON.parse(JSON.stringify(this._licenseGrid));
                }
            });
            res();
        });
    }
    public onSaveLicense(dataItem, rowIndex) {
        this.isSaving = false;
        this.submitted[rowIndex] = true;
        dataItem['ExpirationDate'] = dataItem['ExpirationDateNew'];
        if (this._srvCredential.loggedInUserType === 'Internal') {
            dataItem['ExpirationDate'] = dataItem['ExpirationDate'] !== null ? moment(dataItem.ExpirationDate).format('MM-DD-YYYY') : null;
        }
        const oldData = this.liscOldData;
        const oldDataObj = oldData.find((x) => x.LicenseTypeNumber === dataItem.LicenseTypeNumber && x.State === dataItem.State);
        this._srvCredential.loggedInUserType === 'Internal' ? this.internalSave(dataItem, oldDataObj, rowIndex) : this.contractorSave(dataItem, oldDataObj);
    }

    private async internalSave(updatedData, oldDataObj, rowIndex) {
        let obj;
        const _expDate = oldDataObj['ExpirationDate'] !== null ? moment(oldDataObj.ExpirationDate).format('MM-DD-YYYY') : null;
        const licenseNoChk = {
            old: oldDataObj.LicenseNumber !== null ? oldDataObj.LicenseNumber.trim() : null,
            new: updatedData.LicenseNumber !== null ? updatedData.LicenseNumber.trim() : null,
        };
        if (
            ((licenseNoChk.new === licenseNoChk.old || (updatedData && updatedData.isLicenseNumber)) && updatedData && updatedData.ExpirationDate === _expDate) ||
            (updatedData['ExpirationDate'] === null && this.invalidDateChk[rowIndex] === true)
        ) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 500, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;
            let msg = '';
            if (this.pageContent) {
                msg = this.invalidDateChk[rowIndex] === true ? this.pageContent.Credentialing_Information.Invalid_Date : this.pageContent.Credentialing_Information.No_Changes_Msg;
            }
            dialog.alertMessage = `
            <div class="modal-alert info-alert"">
                <p>${msg}</p>
           </div> `;
            this.isSaving = true;
            return;
        }
        const dateValidate: boolean = this._srvCredential.validateDate(updatedData['ExpirationDate']);
        if (!dateValidate && updatedData['ExpirationDate'] !== null) {
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

        delete updatedData.IsRowDisable;

        const credData = await this._srvCredential.internalObjCreation(oldDataObj, updatedData, 5);
        delete credData['ExpirationDateNew'];
        const ccopsData = {
            CredentialingInformation: { ContractorNumber: this._srvAuthentication.Profile.ContrID, LicenseInformation: [credData] },
        };
        obj = {
            ContractorResourceID: this._srvAuthentication.Profile.ContractorResourceID,
            Contr_ID: this._srvAuthentication.Profile.ContrID,
            CCOpsData: JSON.stringify(ccopsData),
            ResourceId: this._srvCredential.loginDetailsInternal.ResourceID,
            PageName: 'Credentialing Information Page',
            CCOpsID: this._srvCredential.loginDetails[0].CCOpsID,
        };
        await this._srvCredential.saveInsuranceInternalData(obj);
        this.initialCall();
    }
    private async contractorSave(updatedData, oldDataObj) {
        const approvalData = this.dataForApproval.length ? this.dataForApproval.find((x) => x.LicenseTypeNumber === updatedData.LicenseTypeNumber && x.State === updatedData.State) : null;
        const licenseNoChk = {
            old: oldDataObj.LicenseNumber !== null ? oldDataObj.LicenseNumber.trim() : null,
            new: updatedData.LicenseNumber !== null ? updatedData.LicenseNumber.trim() : null,
            approval: approvalData && approvalData.LicenseNumber != null ? approvalData.LicenseNumber.trim() : null,
        };
        if (
            (approvalData === null && !updatedData.LicenseNumber && licenseNoChk.new === licenseNoChk.old) ||
            (approvalData && licenseNoChk.new === licenseNoChk.approval) ||
            licenseNoChk.new === licenseNoChk.old
        ) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 500, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert"">
                <p *ngIf="pageContent">${this.pageContent.Credentialing_Information.No_Changes_Msg}</p>
           </div> `;
            this.isSaving = true;
            return;
        }

        delete updatedData.IsRowDisable;
        const credData = await this._srvCredential.contractorObjCreation(updatedData, oldDataObj, approvalData);
        delete credData['ExpirationDateNew'];
        const ccopsData = {
            CredentialingInformation: { ContractorNumber: this._srvAuthentication.Profile.ContrID, LicenseInformation: [credData] },
        };
        const finalObj = Object.keys(credData).length > 0 ? ccopsData : null;
        await this._srvContractorData.saveContractorData({ currentPage: 'Credentialing Information Page', nextPage: '' }, finalObj, 'CredentialingInfoPage/EditCredentialingInfoEventJsonData');
        await this._srvCredential.getCredentialComments();
        this.isSaving = true;
        if (Object.keys(credData).length > 0) {
            this.initialCall();
        }
    }

    public sortChange() {
        this._licenseGrid.forEach((element) => {
            element['ExpirationDate'] = element['ExpirationDate'] !== null ? new Date(element['ExpirationDate']) : null;
        });
    }

    keyPress(ev, rowIndex) {
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
