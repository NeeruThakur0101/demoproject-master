import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';
import { SortDescriptor } from '@progress/kendo-data-query';
import { DialogService } from '@progress/kendo-angular-dialog';
import { filterBy, CompositeFilterDescriptor, distinct } from '@progress/kendo-data-query';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackgroundInformationService } from './background-information.service';
import { AllHeaderInfo, OwnersInfo, ProgramInfo, SubContractedTradesInfo } from './bginfo.model';
import { FormControl, FormGroup } from '@angular/forms';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ClientProgramDetailsWindowComponent } from '../../dialogs/client-program-details-window/client-program-details-window.component';
import { DeviceObj, PageObj } from 'src/app/core/models/user.model';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';

@Component({
    selector: 'app-background-information',
    templateUrl: `./background-information.component.html`,
    styleUrls: ['./background-information.component.scss'],
})
export class BackgroundInformationComponent implements OnInit, AfterViewInit {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceObj;
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    sort: SortDescriptor[];
    public step: string = '';
    public pageHeight: number = 300;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };
    public multiple: boolean = false;
    public allowUnsort: boolean = true;
    public ownerGridData: OwnersInfo[] = [];
    public ownersVisualFlag: boolean;
    public pageContent: any;
    public formgroup: FormGroup;
    public programTabData: ProgramInfo[] = [];
    public ownersTabData: OwnersInfo[] = [];
    public subContractedTradesData: SubContractedTradesInfo[] = [];
    public allHeaderData: AllHeaderInfo;
    public loader: boolean = false;
    public filter: CompositeFilterDescriptor = null;
    public gridData: OwnersInfo[] = filterBy(this.ownerGridData, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridData = filterBy(this.ownerGridData, filter);
    }
    public distinctPrimitive(fieldName: string): any {
        return distinct(this.ownerGridData, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private dialogSrv: DialogService,
        private deviceService: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private $bgSrv: BackgroundInformationService,
        public $auth: AuthenticationService,
        public $language: InternalUserDetailsService,
        private _renderer: Renderer2
    ) {}

    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this._renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    ngOnInit(): void {
        this.loader = true;
        this.pageContent = this.$language.getPageContentByLanguage();
        this.deviceResolutionConfig();
        this.initFormGroup();
        this.backgroundInfo();
    }
    private initFormGroup() {
        this.formgroup = new FormGroup({
            bgAddendum: new FormControl(),
            empCount: new FormControl(),
            bgScreeningException: new FormControl(),
            annualScreeningAudit: new FormControl(),
            auditDateText: new FormControl(),
        });
    }
    private async backgroundInfo() {
        this.allHeaderData = await this.$bgSrv.headerData();
        this.setHeaderData();
        this.programTabData = await this.$bgSrv.clientProgramTab();
        this.ownerGridData = await this.$bgSrv.ownersTab();
        this.ownersVisualFlag = this.ownerGridData.length ? true : false;
        this.subContractedTradesData = await this.$bgSrv.subContractedTradesTab();
        this.loader = false;
    }
    public setHeaderData() {
        const id = this.allHeaderData.backgroundAddendum.findIndex((x) => x.VendorID === this.allHeaderData.headerData[0].VendorID);
        this.formgroup.patchValue({
            bgAddendum: id > -1 ? this.allHeaderData.headerData[0].VendorID : null,
            empCount: this.allHeaderData.headerData[0].EmployeeCount,
            bgScreeningException: this.allHeaderData.headerData[0].BGExceptionFlag ? this.allHeaderData.headerData[0].BGExceptionFlag : false,
            annualScreeningAudit: this.allHeaderData.headerData[0].AnnualScreeningReqFlag ? this.allHeaderData.headerData[0].AnnualScreeningReqFlag : false,
            auditDateText: this.allHeaderData.headerData[0].ContractorMgmtEventDate ? new Date(this.allHeaderData.headerData[0].ContractorMgmtEventDate) : null,
        });

        setTimeout(() => {
            this.heightCalculate();
        }, 3000);
    }
    public async auditDateClicked() {
        await this.$bgSrv.saveAuditDate();
        this.allHeaderData = await this.$bgSrv.headerData();
        this.formgroup.controls.auditDateText.setValue(new Date(this.allHeaderData.headerData[0].ContractorMgmtEventDate));
    }
    public async onSaveClick() {
        await this.$bgSrv.backgroundSaveData({
            VendorID: this.formgroup.controls.bgAddendum.value,
            BGExceptionFlag: this.formgroup.controls.bgScreeningException.value,
            AnnualScreeningReqFlag: this.formgroup.controls.annualScreeningAudit.value,
        });
        this.loader = true;
        this.allHeaderData = await this.$bgSrv.headerData();
        this.setHeaderData();
        this.loader = false;
    }
    deviceResolutionConfig() {
        this.deviceResObj = this._srvUniversal.deviceResolution();
        this.deviceInfo = this.deviceService.getDeviceInfo();
        this.isMobile = this.deviceService.isMobile();
        this.isTab = this.deviceService.isTablet();
        this.isDesktop = this.deviceService.isDesktop();
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
    }

    openClientprogDetails(data) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);

        const dialogRef = this.dialogSrv.open({
            content: ClientProgramDetailsWindowComponent,
            width: 500,
        });
        const client = dialogRef.content.instance;
        client.programData = data;
        if (this.allHeaderData && this.allHeaderData.headerData[0]) {
            client.ContractorName = this.allHeaderData.headerData[0].ContractorNameWithID;
        }
        dialogRef.result.subscribe((r) => {});
    }

    ngAfterViewInit() {
        // layout data
        this._srvUniversal.gridLayout.subscribe((layout: any) => {
            this.deviceInfo = this.deviceService.getDeviceInfo();
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
}
