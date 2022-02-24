import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { OperationHistoryEventsComponent } from './../operation-history-events/operation-history-events.component';
import { OperationHistoryDetailComponent } from '../operation-history-detail/operation-history-detail.component';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { CompositeFilterDescriptor, filterBy, distinct, SortDescriptor } from '@progress/kendo-data-query';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ContractorOperationService } from '../../../internal-employee-module/components/contractor-operation/contractor-operation.service';
import { ContractorOperationOpsHistory, OperationOpsHistoryGrid, OpsHistory } from '../../components/contractor-operation/models';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { OperationHistoryService } from './operation-history.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PageObj } from 'src/app/core/models/user.model';
import { UniversalService } from 'src/app/core/services/universal.service';

@Component({
    selector: 'app-operation-history',
    templateUrl: './operation-history.component.html',
    styleUrls: ['./operation-history.component.scss']
})

export class OperationHistoryComponent extends DialogContentBase implements OnInit {
    public pageContent: any;
    public Page: ContractorOperationOpsHistory = { grid: [] };
    // grid code
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    public type: string = 'numeric';
    public pageSizes: boolean = true;
    public previousNext: boolean = true;
    public quickAction: boolean = false;
    public sort: SortDescriptor[];
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: any;
    public editRecertDatePvlg: boolean = false;
    public allowUnsort: boolean = true;


    public step: string = '';
    public pageHeight: number = 300;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };
    public filterProfile: CompositeFilterDescriptor = null;
    public gridOpsData: OperationOpsHistoryGrid[] = filterBy(this.Page.grid, this.filterProfile);

    public filterProfileChange(filter: CompositeFilterDescriptor): void {
        this.filterProfile = filter;
        this.gridOpsData = filterBy(this.Page.grid, filter);
    }
    public distinctPrimitiveProfile(fieldName: string): any {
        return distinct(this.Page.grid, fieldName).map((item) => item[fieldName]);
    }
    constructor(
        dialog: DialogRef,
        private _srvDialog: DialogService,
        private _srvDevice: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private _srvOperation: ContractorOperationService,
        public _srvInternal: InternalUserDetailsService,
        private _srvAuth: AuthenticationService,
        private _srvOpsHistory: OperationHistoryService
    ) {
        super(dialog);
    }
    ngOnInit(): void {
        this.pageContent = this._srvInternal.getPageContentByLanguage();
        this.loadOpsHistoryGridData();

        this.editRecertDatePvlg = this._srvAuth.getRecertDateEditPrivilege();

        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this._srvDevice.getDeviceInfo();
        this.isMobile = this._srvDevice.isMobile();
        this.isTab = this._srvDevice.isTablet();
        this.isDesktop = this._srvDevice.isDesktop();
        if (this.isMobile === true) {
            this.pageSize = 1;
            this.pageObj.buttonCount = 1;
        } else if (this.isTab === true) {
            if (window.screen.orientation.type === 'portrait-primary') {
                this.pageSize = 2;
                this.pageObj.buttonCount = 2;
            } else {
                this.pageSize = 5;
                this.pageObj.buttonCount = 5;
            }
        }
        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;
    }
    // bind ops history data in grid
    async loadOpsHistoryGridData() {
        this.Page.grid = await this._srvOperation.getOpsHistotyGridDetails();
        this.Page.grid.forEach(el => {
            let statusnew;
            el.disable = true;
            if (el.Status === 'Pending') {
                statusnew = this.pageContent.Contaractor_Operation.Ops_Pending;
            }
            else if (el.Status === 'Approved') {
                statusnew = this.pageContent.Contaractor_Operation.Ops_Approved;
            }
            else if (el.Status === 'Correction Request In Progress') {
                statusnew = this.pageContent.Contaractor_Operation.Correction_Request_Progress;
            }
            else if (el.Status === 'Correction Request Pending') {
                statusnew = this.pageContent.Contaractor_Operation.Correction_Request_Pending;
            }
            else if (el.Status === 'Disapproved') {
                statusnew = this.pageContent.Contaractor_Operation.Ops_Disapproved;
            }
            el['StatusNew'] = statusnew;
        }
        );
        const pendingIndex = this.Page.grid.findIndex(element => element.Status === 'Pending');
        if (pendingIndex !== -1) {
            this.Page.grid[pendingIndex].disable = false;
        }
    }
    // this method use for open ops history details popup
    public openPending(dataItem) {
        if (dataItem.EventName !== null) {
            setTimeout(() => { window.scroll({ top: 0, left: 0, behavior: 'smooth' }); }, 5);
            const openEventDialog = this._srvDialog.open({
                content: OperationHistoryEventsComponent,
                width: 700,
            });
            const dialog = openEventDialog.content.instance;
            dataItem.EventType = dataItem.ChangeType;
            dataItem.EventName = dataItem.EventName;
            dialog.incomingData = dataItem;
            openEventDialog.result.subscribe(opsHistoryDetail => {
                if (opsHistoryDetail['result'] === 'Refresh') { this.loadOpsHistoryGridData() }
            });
        } else {
            setTimeout(() => { window.scroll({ top: 0, left: 0, behavior: 'smooth' }); }, 5);
            const alertDialog = this._srvDialog.open({
                content: OperationHistoryDetailComponent,
                width: 700,
            });
            dataItem.Event = false;
            const dialog = alertDialog.content.instance;
            dialog.dataItem = dataItem;
            alertDialog.result.subscribe(opsHistoryDetail => {
                if (opsHistoryDetail['result'] === 'Refresh') { this.loadOpsHistoryGridData() }
            });
        }
    }

    public close() {
        this.dialog.close({ button: 'Yes' });
    }
    public quickActionCall(actionType: string, dataItem) {
        this._srvOpsHistory.processCall(actionType, dataItem, 'empty').subscribe(result => {
            if (result === 1) {
                this.loadOpsHistoryGridData();
            }
            else {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 600
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ops_History_Detail.Alert_Something_Went_Wrong}</p>
                                </div>
                            `;
            }
        });
    }
}