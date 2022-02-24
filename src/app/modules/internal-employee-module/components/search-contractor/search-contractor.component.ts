import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CompositeFilterDescriptor, distinct, filterBy, SortDescriptor } from '@progress/kendo-data-query';
import { DeviceResObj, SearchContractor, ValueControl } from './search.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { Router } from '@angular/router';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { SearchContractorService } from './search-contractor.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { InternalLogin } from 'src/app/core/models/user.model';
import { Session } from 'protractor';

@Component({
    selector: 'app-search-contractor',
    templateUrl: `./search-contractor.component.html`,
    styleUrls: ['./search-contractor.component.scss'],
})
export class SearchContractorComponent implements OnInit, AfterViewInit {
    constructor(
        private deviceService: DeviceDetectorService,
        private universal: UniversalService,
        private _srvStorage: StorageService,
        private $auth: AuthenticationService,
        public apiInternal: InternalUserDetailsService,
        private router: Router,
        private search: SearchContractorService
    ) {
        this.loginDetailsInternal = this.$auth.ProfileInternal;
    }
    @ViewChild(DataBindingDirective) directive;
    public multiple = false;
    public allowUnsort = true;
    public formGroup: FormGroup;
    public internalResourceId: number;
    public showFilters = true;
    private valueControl: ValueControl;
    public searchGrid: SearchContractor[] = [];
    public enterFieldFlag: boolean = false;
    public fromPage: string = 'internal';
    public pageContent: any;

    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceResObj;

    public pageSize = 10;
    public skip = 0;
    public buttonCount = 5;
    public info = true;
    sort: SortDescriptor[];
    public showGrid = false;
    public step = '';
    public pageHeight = 300;
    public pageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public loginDetailsInternal: SessionUser;
    public filter: CompositeFilterDescriptor = null;
    public gridData = filterBy(this.searchGrid, this.filter);
    public filterChange(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridData = filterBy(this.searchGrid, filter);
    }

    public distinctPrimitive(fieldName: string) {
        return distinct(this.searchGrid, fieldName).map((item) => item[fieldName]);
    }
    ngOnInit() {
        this.pageContent = this.apiInternal.getPageContentByLanguage();
        this.internalResourceId = this.$auth.ProfileInternal.ResourceID;
        this.initFormGroup();
        this.deviceResObj = this.universal.deviceResolution();
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
    ngAfterViewInit() {
        // layout data
        this.universal.gridLayout.subscribe((layout: DeviceResObj) => {
            this.deviceInfo = this.deviceService.getDeviceInfo();
            if (Object.keys(layout).length > 0) {
                this.pageSize = layout.pageSize;
                this.pageObj = layout.pageObj;
                this.skip = 0;
                if (this.isTab === true) {
                    if (window.screen.orientation.type == 'portrait-primary') {
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

    public searchFilter() {
        this.showFilters = !this.showFilters;
        this.enterFieldFlag = false;
    }
    public async searchContractor() {
        this.valueControl = this.formGroup.value;
        if (
            this.valueControl.contractorId ||
            this.valueControl.contractorName ||
            this.valueControl.ownerPrincipal ||
            this.valueControl.city ||
            this.valueControl.state ||
            this.valueControl.postalCode ||
            this.valueControl.dm ||
            this.valueControl.xnaSymbility
        ) {
            // added to show grid===========================
            this.showGrid = true;
            // ==================
            this.valueControl.contractorId = this.valueControl.contractorId !== '' ? this.valueControl.contractorId : null;
            this.valueControl.contractorName = this.valueControl.contractorName !== '' ? this.valueControl.contractorName : null;
            this.valueControl.ownerPrincipal = this.valueControl.ownerPrincipal !== '' ? this.valueControl.ownerPrincipal : null;
            this.valueControl.city = this.valueControl.city !== '' ? this.valueControl.city : null;
            this.valueControl.state = this.valueControl.state !== '' ? this.valueControl.state : null;
            this.valueControl.postalCode = this.valueControl.postalCode !== '' ? this.valueControl.postalCode : null;
            this.valueControl.dm = this.valueControl.dm !== '' ? this.valueControl.dm : null;
            this.valueControl.xnaSymbility = this.valueControl.xnaSymbility !== '' ? this.valueControl.xnaSymbility : null;
            const res = await this.search.gridData(this.internalResourceId, this.valueControl);
            this.searchGrid = res;
            this.directive.skip = 0;
            this.enterFieldFlag = false;
            this.showFilters = !this.showFilters;
        } else {
            this.enterFieldFlag = true;
        }
    }
    resetPage() {
        this.formGroup.reset();
        this.searchGrid = [];
    }
    initFormGroup() {
        this.formGroup = new FormGroup({
            contractorId: new FormControl(''),
            contractorName: new FormControl(),
            ownerPrincipal: new FormControl(),
            city: new FormControl(),
            state: new FormControl(),
            postalCode: new FormControl(),
            dm: new FormControl(),
            xnaSymbility: new FormControl(),
        });
    }
    public async openContractorDetail(item) {
        const result = [];
        this._srvStorage.setStorage('from-search', 'routeTo');
        const contrData = await this.fetchContractorDetails(0, item.ContractorID, null);
        if (this.loginDetailsInternal) {
            contrData.ResourceID = this.loginDetailsInternal.ResourceID;
        }
        result.push(contrData);
        if (Object.keys(contrData).length > 1) {
            this._srvStorage.setStorage(result, 'loginDetails');
            this.router.navigate(['/contractorRegistration/company-information']);
        }
    }
    // fetch contractor login details
    async fetchContractorDetails(param1, param2, param3) {
        const details = await this.apiInternal.getContractorCredDetails(param1, param2, param3);
        return { ...details, EventName: 'No Event', EventTypeID: 0, EventAlias: null };
    }
    public keyPress(event) {
        const pattern = /[0-9\+\-\ ]/;
        const inputChar = String.fromCharCode(event.charCode);

        if (event.keyCode === 32) { return false; }
        else if (event.keyCode === 13) { return true; }
        else if (!pattern.test(inputChar)) { event.preventDefault(); }
    }

    public onPaste(e) {
        let clipboardData;
        let pastedData;
        // Get pasted data via clipboard API
        clipboardData = e.clipboardData;
        pastedData = clipboardData.getData('Text');
        const isNumber = this.isStringOrNumber(pastedData);
        // Do whatever with pasteddata
        if (isNumber === true) {
            // Stop data actually being pasted into div
            e.stopPropagation();
            e.preventDefault();
        }
    }

    public isStringOrNumber(txt) {
        const regExp = /[a-zA-Z]/g;
        const testString = txt;
        if (regExp.test(testString)) {
            return true;
        } else {
            return false;
        }
    }
}
