import { DialogService } from '@progress/kendo-angular-dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CompositeFilterDescriptor, distinct, filterBy, SortDescriptor } from '@progress/kendo-data-query';
import { Component, OnInit } from '@angular/core';
import { AddCreditReportComponent } from '../../dialogs/add-credit-report/add-credit-report.component';
import { LegendLabelsContentArgs } from '@progress/kendo-angular-charts';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { AddCredit } from '../../models/data-model';
import { CreditList } from './credit-interface.model';
import { CreditService } from './credit.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-credit-information',
    templateUrl: './credit-information.component.html',
    styleUrls: ['./credit-information.component.scss'],
})
export class CreditInformationComponent implements OnInit {
    public pageContent: any;
    public selectedItem: CreditList;
    // public loader: boolean = false;
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: any;
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    sort: SortDescriptor[];
    public allowUnsort: boolean = true;

    public step: string = '';
    public pageHeight: number = 300;
    public pageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public ContrID: number;
    public resourceId: number;
    public ccopsId: number;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public filter: CompositeFilterDescriptor = null;
    public gridData: CreditList[] = [];
    public gridDataCredit: CreditList[] = filterBy(this.gridData, this.filter);

    constructor(
        private _srvCredit: CreditService,
        private _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvDevice: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private _srvDialog: DialogService,
        private intlService: IntlService
    ) {
        this.labelContent = this.labelContent.bind(this);
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    public labelContent(args: LegendLabelsContentArgs): string {
        return `${args.dataItem.RoleName}`;
    }

    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataCredit = filterBy(this.gridData, filter);
    }

    public distinctPrimitive(fieldName: string): any {
        return distinct(this.gridData, fieldName).map((item) => item[fieldName]);
    }

    ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.loginDetails = Array(this._srvAuth.Profile);
        if (this.loginDetails) {
            this.resourceId = this.loginDetails[0].ResourceID;
            this.ContrID = this.loginDetails[0].ContrID;
            this.ccopsId = this.loginDetails[0].CCOpsID;
        }

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
        } else if (this.isDesktop === true) {
            this.pageSize = 10;
            this.pageObj.buttonCount = 10;
        }
        this.pageSize = this.deviceResObj.pageSize;
        this.pageObj = this.deviceResObj.pageObj;

        this.getCreditGrid();
    }

    public async getCreditGrid() {
        const res: CreditList[] = await this._srvCredit.GetCreditGridData(this.loginDetails[0].ContrID);
        let count = 0;
        res.forEach((element) => {
            count = count + 1;
            element.ID = count;
        });
        this.gridData = res;
    }

    // tslint:disable-next-line: use-lifecycle-interface
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

    addEditCreditReport(value, dataItem) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
        const dialogRef = this._srvDialog.open({
            content: AddCreditReportComponent,
            width: 600,
        });

        if (value === 'ADD') {
            dialogRef.result.subscribe((r) => {
                this.addEditCreditForm(r['status']);
            });
        } else if (value === 'EDIT') {
            this.selectedItem = dataItem;
            const creditInfo = dialogRef.content.instance;
            creditInfo.incomingData = this.selectedItem;
            dialogRef.result.subscribe((r) => {
                this.addEditCreditForm(r['status']);
            });
        }
    }

    public async addEditCreditForm(result) {
        if (result === 'close') {
        } else {
            const objCredit: AddCredit = result;
            const res: number = await this._srvCredit.SaveCreditData(objCredit);
            if (res === 1) {
                this.getCreditGrid();
            }
        }
    }
}
