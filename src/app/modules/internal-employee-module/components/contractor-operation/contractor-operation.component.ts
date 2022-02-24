import { OperationHistoryComponent } from '../../dialogs/operation-history/operation-history.component';
import { OperationAddEventComponent } from '../../dialogs/operation-add-event/operation-add-event.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CompositeFilterDescriptor, filterBy, distinct, SortDescriptor } from '@progress/kendo-data-query';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ContractorOperationPage, OperationGrid } from './models';
import { ContractorOperationService } from './contractor-operation.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { EditRecertificationDateComponent } from '../../dialogs/edit-recertification-date/edit-recertification-date.component';
import { OperationCorrectionRequestComponent } from 'src/app/shared-module/components/operation-correction-request/operation-correction-request.component';
import { SelectEmailAddressComponent } from '../../dialogs/select-email-address/select-email-address.component';
import { LoginUser, PageObj } from 'src/app/core/models/user.model';
import { UniversalService } from 'src/app/core/services/universal.service';
import * as moment from 'moment';

@Component({
    selector: 'app-contractor-operation',
    templateUrl: './contractor-operation.component.html',
    styleUrls: ['./contractor-operation.component.scss'],
})
export class ContractorOperationComponent implements OnInit, AfterViewInit {
    public pageContent: any;
    public loader = false;
    public loginDetails: Array<LoginUser> = [];
    public loggedInUserType: string;
    public loginInternal: SessionUser;
    public resourceId: number;
    public ContrID: number;
    public date: Date;
    public Page: ContractorOperationPage = { grid: [], showData: false };
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: any;
    public editRecertDatePvlg: boolean = false;
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    sort: SortDescriptor[];
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

    public filter: CompositeFilterDescriptor = null;

    public gridDataOperation: OperationGrid[] = [];
    public gridData: OperationGrid[] = filterBy(this.Page.grid, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridData = filterBy(this.Page.grid, filter);
    }

    public distinctPrimitive(fieldName: string) {
        return distinct(this.Page.grid, fieldName).map((item) => item[fieldName]);
    }

    public distinctPrimitiveEventDate(fieldName: string) {
        this.Page.grid.forEach((element) => {
            if (element['ContractorMgmtEventDate'] !== null)
                element['ContractorMgmtEventDate'] = moment(element['ContractorMgmtEventDate']).format('MM/DD/yyyy');
        });
        return distinct(this.Page.grid, fieldName).map((item) => item[fieldName]);
    }


    constructor(
        private _srvDevice: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private _srvDialog: DialogService,
        private _srvOperation: ContractorOperationService,
        public _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.loggedInUserType = this._srvAuth.LoggedInUserType;
    }

    async ngOnInit() {

        this.loginInternal = this._srvAuth.ProfileInternal;
        this.loadGridData();

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
    ngAfterViewInit() {
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: any) => {
            this.deviceInfo = this._srvDevice.getDeviceInfo();
            if (Object.keys(layout).length > 0) {
                this.pageSize = layout.pageSize;
                this.pageObj = layout.pageObj;
                this.skip = 0;
                if (this.isTab === true) {
                    if (window.screen.orientation.type === 'portrait-primary') {
                        this.pageSize = 2;
                        this.pageObj.buttonCount = 2;
                    } else {
                        this.pageSize = 5;
                        this.pageObj.buttonCount = 5;
                    }
                }
            }
        });
    }

    // bind grid data for contractor operation
    async loadGridData() {
        this.Page.showData = true;
        this.Page.grid = await this._srvOperation.getGridDetails(this.loginInternal.ResourceID);
        this.Page.grid.forEach((ele) => {
            ele['ContractorMgmtEventDate'] = ele.ContractorMgmtEventDate ? new Date(ele.ContractorMgmtEventDate) : null;
        });
        this.Page.showData = false;
    }
    openPopup(value) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);

        if (value === 'Profile Changes') {
            const alertDialog = this._srvDialog.open({
                content: OperationHistoryComponent,
                width: 700,
            });
        }
    }

    // this method use for open ops history popup
    public openHyperLinkPopup(dataItem) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);

        if (dataItem.HyperLinkFlg !== -1) {
            const alertDialog = this._srvDialog.open({
                content: OperationHistoryComponent,
                width: 700,
            });
        } else {
            const alertDialog = this._srvDialog.open({
                content: OperationCorrectionRequestComponent,
                width: 700,
            });
            const popupInstance = alertDialog.content.instance;
            popupInstance.path = 'Operation-Event';
            popupInstance.readonly = true;
            popupInstance.EventTypeID = dataItem.ContractorMgmtEventID;
        }
    }

    // this method is use for open add event popup
    openEventPop() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
        const alertDialog = this._srvDialog.open({
            content: OperationAddEventComponent,
            width: 600,
        });
        alertDialog.result.subscribe((r) => {
            if (r['status'] === 'save') {
                this.loadGridData();
            }
        });
    }

    // this method is use for open email popup
    openEmail(dataItem) {
        let url;

        if (dataItem.EmailFlag) {
            url = dataItem.ReportURL
        }
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
        const alertDialog = this._srvDialog.open({
            content: SelectEmailAddressComponent,
            width: 600,
        });
        const dialogRef = alertDialog.content.instance;
        dialogRef.pdfLink = url;
    }
    public editRecertDate() {
        const dialog = this._srvDialog.open({
            content: EditRecertificationDateComponent,
            width: 500,
        });
        dialog.result.subscribe((r) => {
            if (r['status'] === 'save') {
                this.loadGridData();
            }
        });
    }
}
