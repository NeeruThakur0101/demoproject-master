import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { OperationHistoryDetailComponent } from './../operation-history-detail/operation-history-detail.component';
import { AuthenticationService } from './../../../../core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorOperationService } from './../../components/contractor-operation/contractor-operation.service';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { SortDescriptor, CompositeFilterDescriptor, filterBy, distinct } from '@progress/kendo-data-query';
import { Component, Input, OnInit } from '@angular/core';
import { ContractorOperationOpsHistory, OperationOpsHistoryGrid } from '../../components/contractor-operation/models';
import { OperationHistoryService } from '../operation-history/operation-history.service';
import { PageObj } from 'src/app/core/models/user.model';

@Component({
    selector: 'app-operation-history-events',
    templateUrl: './operation-history-events.component.html'
})
export class OperationHistoryEventsComponent implements OnInit {

    public pageContent: any;
    public Page: ContractorOperationOpsHistory = { grid: [] };
    // grid code
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    public sort: SortDescriptor[];
    @Input() public incomingData: any;
    public step: string = '';
    public pageHeight: number = 300;
    public allowUnsort: boolean = true;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };
    /***** */
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
        public dialog: DialogRef,
        private _srvDialog: DialogService,
        private _srvOperation: ContractorOperationService,
        public _srvInternal: InternalUserDetailsService,
        private _srvAuth: AuthenticationService,
        private _srvOpsHistory: OperationHistoryService
    ) { }
    ngOnInit(): void {
        this.pageContent = this._srvInternal.getPageContentByLanguage();
        this.loadOpsHistoryGridData();
    }

    // bind ops history data in grid
    async loadOpsHistoryGridData() {
        this.Page.grid = await this._srvOperation.getOpsHistoryEventGridDetails(this.incomingData.CCOpsID);
        this.Page.grid.forEach(el => {
            let statusnew;
            if (el.Status === 'Pending') {
                statusnew = this.pageContent.Contaractor_Operation.Ops_Pending;
            }
            else if (el.Status === 'Approved') {
                statusnew = this.pageContent.Contaractor_Operation.Ops_Approved;
            }
            else if (el.Status === 'Disapproved') {
                statusnew = this.pageContent.Contaractor_Operation.Ops_Disapproved;
            }
            el['StatusNew'] = statusnew;
        });
    }
    // this method use for open ops history details popup
    public openPending(dataItem) {
        setTimeout(() => { window.scroll({ top: 0, left: 0, behavior: 'smooth' }); }, 5);
        const alertDialog = this._srvDialog.open({
            content: OperationHistoryDetailComponent,
            width: 700,
        });
        dataItem.Event = true;
        dataItem.CCOpsID = this.incomingData.CCOpsID;
        dataItem = { ...dataItem, EventNameTranslated: this.translateEventName(this.incomingData) };
        const dialog = alertDialog.content.instance;
        dialog.dataItem = dataItem;
        alertDialog.result.subscribe(opsHistoryDetail => {
            if (opsHistoryDetail['result'] === 'Refresh') { this.loadOpsHistoryGridData() }
        });
    }

    translateEventName(element) {
        if (element.EventName.toLowerCase() === 'Recertification'.toLowerCase()) {
            element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Recertification_Alert;
        } else if (element.EventName.toLowerCase() === 'App update'.toLowerCase()) {
            element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.App_Update_Alert;
        } else if (element.EventName.toLowerCase() === 'Application Correction Request'.toLowerCase()) {
            element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Application_Correction_Request_Alert;
        } else if (element.EventName.toLowerCase() === 'Profile Changes Correction Request'.toLowerCase()) {
            element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Profile_Changes_Correction_Request_Alert;
        } else if (element.EventName.toLowerCase() === 'App Update Correction Request'.toLowerCase()) {
            element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.App_Update_Correction_Request_Alert;
        } else if (element.EventName.toLowerCase() === 'Territory Coordinator Correction Request'.toLowerCase()) {
            element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Territory_Coordinator_Correction_Request_Alert;
        }

        return element.EventName
    }

    public processCall(type: string) {
        this._srvOpsHistory.processCall(type, this.incomingData).subscribe(result => {
            if (result === 1) {
                this.dialog.close({ result: 'Refresh' })
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

    public close() {
        this.dialog.close({ button: 'Yes' });
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

}
