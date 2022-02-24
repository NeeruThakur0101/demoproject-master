import { Component, Input, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { CompositeFilterDescriptor, filterBy, distinct, SortDescriptor } from '@progress/kendo-data-query';
// import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { CertificateList } from '../credentialing.model';
import { CredentialService } from '../credential.service';
import { ElementRef } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';
import * as moment from 'moment';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-certificates',
    templateUrl: './certificates.component.html',
    styleUrls: ['./certificates.component.scss'],
})
export class CertificatesComponent implements OnInit {
    @Input() containerRef;
    @Input() pageObj: any;
    @Input() pageSize: number;
    @Input() gridData: CertificateList;
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    public loggedInUserType: string;
    public loginDetails: number;
    public resourceId: number;
    public ContrID: number;
    // public loader: boolean = false;
    public certificateGrid: CertificateList[] = [];
    public isControl: boolean = false;
    public filter: CompositeFilterDescriptor = null;
    public serverDate: string;
    public pageContent: any;
    // public minDate: Date = new Date();
    public gridDataGrid: CertificateList[] = filterBy(this.certificateGrid, this.filter);
    public internalUserDetails: SessionUser;
    public contrUserDetails: SessionUser; // Array<SessionUser> = [];;
    public originalGridData: CertificateList[] = [];
    public sort: SortDescriptor[] = [];
    public skip: number = 0;

    public userType = this._srvCredential.loggedInUserType;
    public invalidDateChk: Array<boolean> = [];

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this.certificateGrid, filter);
    }

    constructor(
        private _srvCredential: CredentialService,
        private _srvDialog: DialogService,
        private _datePipe: DatePipe,
        private _srvInternalUserDetails: InternalUserDetailsService,
        public _srvAuthentication: AuthenticationService,
        private _srvUniversal: UniversalService,
        private renderer: Renderer2,
        public intlService: IntlService
    ) {
        _srvCredential.getUser();
    }

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
        (<CldrIntlService>this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';
        this._srvCredential.tabNow.next('Certificate');

        this.initialCall();

        setTimeout(() => {
            this.heightCalculate();
        }, 1000);
        this._srvCredential.tabChanged.subscribe((value) => {
            if (value === 'Certificate') {
                const certificateOriginalData: CertificateList[] = this.originalGridData;
                let flag = 0;
                for (const [i, ele] of certificateOriginalData.entries()) {
                    const credentialingFirm = this.certificateGrid[i].CredentialingFirm === '' ? null : this.certificateGrid[i].CredentialingFirm;
                    const newDate = this.certificateGrid[i]['ExpirationDate'] !== null ? moment(this.certificateGrid[i].ExpirationDate).format('MM-DD-YYYY') : null;
                    const oldDate = ele.ExpirationDate !== null ? moment(ele.ExpirationDate).format('MM-DD-YYYY') : null;

                    if (oldDate !== newDate || ele.CredentialingFirm !== credentialingFirm) {
                        flag++;
                        this._srvCredential.changesExist.next(true);
                        break;
                    }
                    if (flag === 0 && i === certificateOriginalData.length - 1) {
                        this._srvCredential.changesExist.next(false);
                    }
                }
            }
        });
    }

    private async initialCall() {
        this.pageContent = this._srvInternalUserDetails.getPageContentByLanguage();

        this.internalUserDetails = this._srvAuthentication.ProfileInternal;
        this.contrUserDetails = this._srvAuthentication.Profile;
        await this.onLoad();
    }

    private async onLoad() {
        const gridData = await this._srvCredential.getTabsGridData(2);

        // change date format for gridData
        gridData.CertificateInformation.forEach((element) => {
            const val: any = element['ExpirationDate'];
            element['ExpirationDate'] = val !== null ? val.replace(new RegExp(/-/gm), '/') : null;
            if (element.ExpirationDate === null) {
                element['ExpirationDateNew'] = null;
            } else {
                element['ExpirationDateNew'] = new Date(element.ExpirationDate);
            }
        });

        this.certificateGrid = gridData.CertificateInformation;
        this.originalGridData = JSON.parse(JSON.stringify(gridData.CertificateInformation));
    }

    public async onSaveCertificate(dataItem: CertificateList, rowIndex: number) {
        dataItem['ExpirationDate'] = dataItem['ExpirationDateNew'];

        // change dataItem date format
        const expireDate: string = dataItem['ExpirationDate'] !== null ? this._datePipe.transform(dataItem.ExpirationDate, 'MM-dd-yyyy') : null;

        // change DB data date format
        const oldData: CertificateList[] = this.originalGridData;
        const dbObject: CertificateList = oldData.find((el) => el.MetricTypeName === dataItem.MetricTypeName);
        dbObject['ExpirationDate'] = dbObject['ExpirationDate'] !== null ? this._datePipe.transform(dbObject.ExpirationDate, 'MM-dd-yyyy') : null;

        if ((dataItem.CredentialingFirm === dbObject.CredentialingFirm && expireDate === dbObject.ExpirationDate) || (expireDate === null && this.invalidDateChk[rowIndex] === true)) {
            const dialogRef = this._srvDialog.open({ content: DialogAlertsComponent, width: 500, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;

            const msg = this.invalidDateChk[rowIndex] === true ? this.pageContent.Credentialing_Information.Invalid_Date : this.pageContent.Credentialing_Information.No_Changes_Msg;
            dialog.alertMessage = `
  <div class="modal-alert info-alert">
      <p>${msg}</p>
 </div> `;
            return;
        }

        const dateValidate: boolean = this._srvCredential.validateDate(expireDate);

        if (!dateValidate && dataItem['ExpirationDate'] !== null) {
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

        this.serverDate = await this._srvCredential.getServerTime();
        delete dataItem['ExpirationDateNew'];
        let finalObj = {};

        finalObj = {
            Contr_ID: this.contrUserDetails[0].ContrID,
            MetricTypeName: dataItem.MetricTypeName,
            MetricTypeNumber: dataItem.MetricTypeNumber,
            CredentialingFirm: dataItem.CredentialingFirm === null || dataItem.CredentialingFirm === '' ? null : dataItem.CredentialingFirm.trim(),
            CredentialingTrackingNumber: dataItem.CredentialingTrackingNumber,
            ExpirationDate: expireDate,
        };

        if (dataItem.CredentialingTrackingNumber > 0) {
            finalObj = { ...finalObj, UpdatedResourceID: this.internalUserDetails.ResourceID, UpdatedDate: this.serverDate };
        } else {
            finalObj = { ...finalObj, CreatedResourceID: this.internalUserDetails.ResourceID, CreatedDate: this.serverDate };
        }

        // PUT-API
        await this._srvCredential.saveCertificate(finalObj);
        this.onLoad();
    }

    public onKeyPress(e, value) {
        if (e.keyCode === 32 && !value.length) e.preventDefault();
    }

    public distinctPrimitiveCert(fieldName: string) {
        this.certificateGrid.forEach((element) => {
            if (element['ExpirationDate'] !== null) element['ExpirationDate'] = moment(element['ExpirationDate']).format('MM/DD/yyyy');
        });
        return distinct(this.certificateGrid, fieldName).map((item) => item[fieldName]);
    }

    public sortChange() {
        this.certificateGrid.forEach((element) => {
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
