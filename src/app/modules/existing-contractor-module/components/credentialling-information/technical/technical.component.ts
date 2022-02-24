import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { CompositeFilterDescriptor, distinct, filterBy } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { CredentialService } from '../credential.service';
import { TechnicalData } from '../credentialing.model';
@Component({
    selector: 'app-technical',
    templateUrl: './technical.component.html',
    styleUrls: ['./technical.component.scss'],
})
export class TechnicalComponent implements OnInit {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    @Input() containerRef;
    @Input() pageObj: any;
    @Input() pageSize: number;
    public pageContent: any;
    public _technicalGrid: TechnicalData[] = [];
    private _technicalOriginalData: TechnicalData[] = [];
    public isLoader: boolean = false;
    public filter: CompositeFilterDescriptor = null;
    private invalidDateChk: Array<boolean> = [];
    public gridDataGrid = filterBy(this._technicalGrid, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this._technicalGrid, filter);
    }
    public distinctPrimitive(fieldName: string) {
        this._technicalGrid.forEach((element) => {
            if (element['ExpirationDate'] !== null) element['ExpirationDate'] = moment(element['ExpirationDate']).format('MM/DD/yyyy');
        });
        return distinct(this._technicalGrid, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private _dialog: DialogService,
        private _renderer: Renderer2,
        private _srvUniversal: UniversalService,
        private _srvLanguage: InternalUserDetailsService,
        private _srvCredential: CredentialService,
        public _srvAuthentication: AuthenticationService,
        public intlService: IntlService
    ) { }

    // height calculate
    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this._renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    public checkHeight() {
        setTimeout(() => {
            this.heightCalculate();
        }, 3000);
    }

    ngOnInit(): void {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this._srvCredential.tabNow.next('Technical');
        this.initialCall();
        this._srvCredential.tabChanged.subscribe((value) => {
            if (value === 'Technical') {
                let flag = 0;
                for (const [i, ele] of this._technicalOriginalData.entries()) {
                    const newDate = this._technicalGrid[i]['ExpirationDate'] !== null ? moment(this._technicalGrid[i].ExpirationDate).format('MM-DD-YYYY') : null;
                    if (ele.ExpirationDate !== newDate) {
                        flag++;
                        this._srvCredential.changesExist.next(true);
                        break;
                    }
                    if (flag === 0 && i === this._technicalOriginalData.length - 1) {
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
        const gridData = await this._srvCredential.getTabsGridData(4);
        this._technicalOriginalData = JSON.parse(JSON.stringify(gridData.TechnicalInformation));
        this._technicalGrid = gridData.TechnicalInformation;
        if (this._technicalGrid) {
            this._technicalGrid.forEach((element) => {
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

    async onSaveTechnical(dataItem: TechnicalData, rowIndex: number) {
        dataItem['ExpirationDate'] = dataItem['ExpirationDateNew'];
        const _expDate = dataItem['ExpirationDate'] !== null ? moment(dataItem.ExpirationDate).format('MM-DD-YYYY') : null;
        const expDate = this._technicalOriginalData[rowIndex].ExpirationDate !== null ? moment(this._technicalOriginalData[rowIndex].ExpirationDate).format('MM-DD-YYYY') : null;

        if (expDate === _expDate || (_expDate === null && this.invalidDateChk[rowIndex] === true)) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 500, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;
            let msg = '';
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
        delete dataItem['ExpirationDateNew'];
        await this._srvCredential.getServerTime();
        const loggedInUserResourceId = this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID;
        const saveObj = {
            Contr_ID: this._srvAuthentication.Profile.ContrID,
            CredentialingFirm: dataItem.MetricTypeName,
            MetricTypeNumber: dataItem.MetricTypeNumber,
            CreatedResourceID: dataItem['CreatedDate'] == null ? loggedInUserResourceId : this._technicalOriginalData[rowIndex].CreatedResourceID,
            UpdatedResourceID: dataItem['CreatedDate'] !== null ? loggedInUserResourceId : this._technicalOriginalData[rowIndex].UpdatedResourceID,
            CreatedDate: dataItem['CreatedDate'] == null ? this._srvCredential.timeStamp : this._technicalOriginalData[rowIndex].CreatedDate,
            UpdatedDate: dataItem['UpdatedDate'] !== null ? this._srvCredential.timeStamp : this._technicalOriginalData[rowIndex].UpdatedDate,
            ExpirationDate: _expDate,
        };
        await this._srvCredential.saveTechnicalData(saveObj);
        this.initialCall();
    }

    public sortChange() {
        this._technicalGrid.forEach((element) => {
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
