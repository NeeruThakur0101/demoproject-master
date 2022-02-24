import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { CompositeFilterDescriptor, distinct, filterBy, SortDescriptor } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ViewTrainingAttendeesComponent } from '../../../dialogs/view-training-attendees/view-training-attendees.component';
import { CredentialService } from '../credential.service';
import { Training } from '../credentialing.model';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnInit {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    @Input() containerRef;
    @Input() pageObj: any;
    @Input() pageSize: number;
    public pageContent: any;
    public _trainingGrid: Training[] = [];
    private _trainingOriginalData: Training[] = [];
    public min: Date = new Date(1900, 0, 1);
    public isLoader: boolean = false;
    public filter: CompositeFilterDescriptor = null;
    public gridDataGrid = filterBy(this._trainingGrid, this.filter);
    private invalidDateChk: Array<boolean> = [];
    public sort: SortDescriptor[] = [];
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataGrid = filterBy(this._trainingGrid, filter);
    }
    public distinctPrimitive(fieldName: string) {
        this._trainingGrid.forEach((element) => {
            if (element['ExpirationDate'] !== null) element['ExpirationDate'] = moment(element['ExpirationDate']).format('MM/DD/yyyy');
        });
        return distinct(this._trainingGrid, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        private _srvLanguage: InternalUserDetailsService,
        public _srvCredential: CredentialService,
        private _srvAuthentication: AuthenticationService,
        private _dialog: DialogService,
        private renderer: Renderer2,
        private _srvUniversal: UniversalService,
        public intlService: IntlService
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
        //setting locale dynamically in case of internal employee
        (<CldrIntlService>this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this._srvCredential.tabNow.next('Training');
        this.initialCall();

        setTimeout(() => {
            this.heightCalculate();
        }, 1000);

        this._srvCredential.tabChanged.subscribe((value) => {
            if (value === 'Training') {
                let flag = 0;
                for (const [i, ele] of this._trainingOriginalData.entries()) {
                    const newDate = this._trainingGrid[i]['ExpirationDate'] !== null ? moment(this._trainingGrid[i].ExpirationDate).format('MM-DD-YYYY') : null;
                    if (ele.ExpirationDate !== newDate) {
                        flag++;
                        this._srvCredential.changesExist.next(true);
                        break;
                    }
                    if (flag === 0 && i === this._trainingOriginalData.length - 1) {
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
    }
    private async initPage() {
        const gridData = await this._srvCredential.getTabsGridData(3);
        this._trainingOriginalData = JSON.parse(JSON.stringify(gridData.TrainingInformation));
        this._trainingGrid = gridData.TrainingInformation;
        if (this._trainingGrid) {
            this._trainingGrid.forEach((element) => {
                const val: any = element['ExpirationDate'];
                element['ExpirationDate'] = val !== null ? val.replace(new RegExp(/-/gm), '/') : null;
                if (element.ExpirationDate === null) {
                    element['ExpirationDateNew'] = null;
                } else {
                    element['ExpirationDateNew'] = new Date(element.ExpirationDate);
                }
            });
        }
        this.isLoader = false;
    }

    async onSaveTraining(dataItem, rowIndex) {
        dataItem['ExpirationDate'] = dataItem['ExpirationDateNew'];
        const _expDate = dataItem['ExpirationDate'] !== null ? moment(dataItem.ExpirationDate).format('MM-DD-YYYY') : null;
        let dateValid: boolean = false;
        if (dataItem.ExpirationDate && dataItem.ExpirationDate.getTime() > this.min.getTime() && moment(_expDate, 'MM-DD-YYYY', true).isValid()) {
            dateValid = true;
        }
        const expDate = this._trainingOriginalData[rowIndex].ExpirationDate !== null ? moment(this._trainingOriginalData[rowIndex].ExpirationDate).format('MM-DD-YYYY') : null;
        if (expDate === _expDate || (_expDate === null && this.invalidDateChk[rowIndex] === true)) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 450, appendTo: this.containerRef });
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
        if (!dateValid && dataItem['ExpirationDate'] !== null) {
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
            MetricTypeNumber: dataItem.MetricTypeNumber,
            CreatedResourceID: dataItem['CreatedDate'] == null ? loggedInUserResourceId : this._trainingOriginalData[rowIndex].CreatedResourceID,
            UpdatedResourceID: dataItem['CreatedDate'] !== null ? loggedInUserResourceId : this._trainingOriginalData[rowIndex].UpdatedResourceID,
            CreatedDate: dataItem['CreatedDate'] == null ? this._srvCredential.timeStamp : this._trainingOriginalData[rowIndex].CreatedDate,
            UpdatedDate: dataItem['UpdatedDate'] !== null ? this._srvCredential.timeStamp : this._trainingOriginalData[rowIndex].UpdatedDate,
            ExpirationDate: _expDate,
        };
        await this._srvCredential.saveTrainingData(saveObj);
        this.initialCall();
    }

    public viewAttendees(dataItem) {
        const dialogRef = this._dialog.open({
            content: ViewTrainingAttendeesComponent,
            width: 800,
            appendTo: this.containerRef,
        });
        const trainingDialog = dialogRef.content.instance;
        trainingDialog.dataItem = dataItem;
        trainingDialog.pageLanguage = this.pageContent;
        trainingDialog.containerRef = this.containerRef;
        dialogRef.result.subscribe((r) => {
            if (r['status'] === 'Yes') {
                this._srvCredential.loadTraining.pipe(take(1)).subscribe((state) => {
                    this.initialCall();
                });
                this._srvCredential.loadTraining.next(false);
            }
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

    public sortChange() {
        this._trainingGrid.forEach((element) => {
            element['ExpirationDate'] = element['ExpirationDate'] !== null ? new Date(element['ExpirationDate']) : null;
        });
    }
}
