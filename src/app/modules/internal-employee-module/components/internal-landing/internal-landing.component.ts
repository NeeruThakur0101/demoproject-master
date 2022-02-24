import { SortDescriptor } from '@progress/kendo-data-query';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { filterBy, CompositeFilterDescriptor, distinct } from '@progress/kendo-data-query';
import { ApiService } from 'src/app/core/services/http-service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ReassignContracrtorActionComponent } from '../../dialogs/reassign-contracrtor-action/reassign-contracrtor-action.component';
import { InternalLandingService } from './internal-landing.service';
import { DeviceObj, InternalLogin, LoginUser, PageObj, RoleMetadata } from 'src/app/core/models/user.model';
import { AppStarted, AppSubmitted, AppUpdate, CallsTab, CoverageArea, LegalIssue, MedalionCount, ProfileChange, Recerts } from './internal-landing.model';
import { StorageService } from 'src/app/core/services/storage.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
@Component({
    selector: 'app-internal-landing',
    templateUrl: './internal-landing.component.html',
})
export class InternalLandingComponent implements OnInit, AfterViewInit {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    // current Calls
    public fromPage: string = 'internal';
    public statusval: boolean = false;
    public valcss: string = 'inactive';
    public medallionActive: string;
    public slides: Array<{ class: string; name: string; count: number; role: string }> = [
        { class: 'ico-app-start', name: 'Apps Started', count: 0, role: 'Recruiter' },
        { class: 'ico-app-submit', name: 'Apps Submitted', count: 0, role: 'Recruiter' },
        { class: 'ico-au-start', name: 'App Updates Started', count: 0, role: 'Recruiter' },
        { class: 'ico-au-submit', name: 'App Updates Submitted', count: 0, role: 'Recruiter' },
        { class: 'ico-app-coverage', name: 'Coverage Area', count: 0, role: 'Recruiter' },
        { class: 'ico-call', name: 'Current Calls', count: 13, role: 'Membership' },
        { class: 'ico-brand', name: 'Recerts', count: 0, role: 'Membership' },
        { class: 'ico-legal', name: 'Legal Issues', count: 0, role: 'Membership' },
        { class: 'ico-prof', name: 'Profile Changes', count: 0, role: 'Membership' },
    ];
    public slidestotal: Array<{ class: string; name: string; count: number; role: string }> = [];
    public slidesR: Array<{ class: string; name: string; count: number; role: string }> = [];
    public name: string = 'Angular with Swiper';
    public config: SwiperConfigInterface = {
        a11y: true,
        direction: 'horizontal',
        slidesPerView: 2,

        mousewheel: true,
        scrollbar: false,

        pagination: false,

        speed: 3000,
        keyboard: {
            enabled: true,
        },
        navigation: {
            nextEl: '#js-next',
            prevEl: '#js-prev',
        },

        breakpoints: {
            1300: {
                slidesPerView: 4,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
            760: {
                slidesPerView: 2,
                spaceBetween: 20,
            },

            300: {
                slidesPerView: 1,
                spaceBetween: 0,
            },
        },
    };

    // apps started
    public CounterAppStarted: number = -1;
    public CounterAppSubmitted: number = -1;

    public CounterAppUpdateStarted: number = -1;
    public CounterAppUpdateSubmitted: number = -1;

    public CounterProfileChange: number = -1;

    public CounterLegalIssuesCount: number = -1;
    public CounterResertCallCount: number = -1;
    public CountCoverageArea: number = -1;
    public CounterCurrentCalls: number = -1;
    public getMedallianCount: MedalionCount[] = [];
    public strRoleName: string;
    public Recruiting: boolean = false;
    public MembershipServices: boolean = false;

    public RecruitingVal: boolean = false;
    public MembershipServicesVal: boolean = false;
    public repFlag: boolean = false;

    public model = { datePick: null };

    public status: boolean = false;
    public cssval: string = 'swiper-slide';
    public loginDetails: Array<LoginUser> = [];
    public RoleDetailsInternal: InternalLogin;
    public appStarted: boolean = true;
    public appSubmited: boolean = false;
    public appUpdateStarted: boolean = false;
    public appUpdateSubmited: boolean = false;
    public profileChanges: boolean = false;
    public coverageArea: boolean = false;
    public LegalIssue: boolean = false;
    public recerts: boolean = false;

    public AppsStartedCount: number = 20;
    public accountId: number;
    public resourceId: number;
    public LoggedInResourceID: number;
    public internalResourceId: number;
    public pageContent: any;
    public filter: CompositeFilterDescriptor = null;
    public callsTab: boolean = false;

    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceObj;
    public loggedInUserType: string;
    public pageSize: number = 10;
    public skip: number = 0;
    public buttonCount: number = 5;
    public info: boolean = true;
    public sort: SortDescriptor[];
    public step: string = '';
    public pageHeight: number = 300;
    public reassignRoleName: string;
    public allowUnsort: boolean = true;
    public multiple = false;
    public pageObj: PageObj = {
        buttonCount: 10,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public value: Date = new Date();
    public date: Date = new Date(); // for today's date
    public min: Date = new Date(this.date.setDate(this.date.getDate() + 1));
    public loginDetailsInternal: InternalLogin;
    // for gridDataAppStarted Tab
    public appstartedVal: AppStarted[] = [];
    public gridData1: AppStarted[] = filterBy(this.appstartedVal, this.filter);
    public gridDataCalls: CallsTab[] = [];
    public gridDataCallsGrid: CallsTab[] = filterBy(this.gridDataCalls, this.filter);

    public gridDataAppSubmitted: AppSubmitted[] = [];
    public gridDataAppSubmittedGrid: AppSubmitted[] = filterBy(this.gridDataAppSubmitted, this.filter);

    public gridDataAppUpdateSubmitted: AppUpdate[] = [];
    public gridDataAppUpdateSubmittedGrid: AppUpdate[] = filterBy(this.gridDataAppUpdateSubmitted, this.filter);

    public gridDataProfileChanges: ProfileChange[] = [];
    public gridDataProfileChangesGrid: ProfileChange[] = filterBy(this.gridDataProfileChanges, this.filter);

    public gridDataCoverageArea: CoverageArea[] = [];
    public gridDataCoverageAreaGrid: CoverageArea[] = filterBy(this.gridDataCoverageArea, this.filter);

    public gridDataLegalIssues: LegalIssue[] = [];
    public gridDataLegalIssuesGrid: LegalIssue[] = filterBy(this.gridDataLegalIssues, this.filter);

    public gridDataRecertTab: Recerts[] = [];
    public gridDataRecertGrid: Recerts[] = filterBy(this.gridDataRecertTab, this.filter);

    // for gridDataAppUpdateStarted Tab
    public appUpdatestartedVal: AppUpdate[] = [];
    public gridData2: AppUpdate[] = filterBy(this.appUpdatestartedVal, this.filter);

    public filterChangeAS(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataAppSubmittedGrid = filterBy(this.gridDataAppSubmitted, filter);
    }
    public distinctPrimitiveAS(fieldName: string): any {
        this.gridDataAppSubmitted.forEach((ele) => {
            ele['SubmitDate'] = ele.SubmitDate ? moment(ele['SubmitDate']).format('MM/DD/yyyy') : null;
            ele['LastFollowupDate'] = ele.LastFollowupDate ? moment(ele['LastFollowupDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowupDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
            }
        });
        return distinct(this.gridDataAppSubmitted, fieldName).map((item) => item[fieldName]);
    }

    public filterChangeAppUpdateSubmitted(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataAppUpdateSubmittedGrid = filterBy(this.gridDataAppUpdateSubmitted, filter);
    }
    public distinctPrimitiveAppUpdateSubmitted(fieldName: string): any {
        this.gridDataAppUpdateSubmitted.forEach((ele) => {
            ele['SubmitDate'] = ele.SubmitDate ? moment(ele['SubmitDate']).format('MM/DD/yyyy') : null;
            ele['LastFollowupDate'] = ele.LastFollowupDate ? moment(ele['LastFollowupDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowupDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
            }
        });
        return distinct(this.gridDataAppUpdateSubmitted, fieldName).map((item) => item[fieldName]);
    }

    // for gridDataProfileChanges Tab
    public filterChangePC(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataProfileChangesGrid = filterBy(this.gridDataProfileChanges, filter);
    }
    public distinctPrimitivePC(fieldName: string): any {
        this.gridDataProfileChanges.forEach((ele) => {
            ele['ChangedDate'] = ele.ChangedDate ? moment(ele['ChangedDate']).format('MM/DD/yyyy') : null;
            ele['LastFollowUpDate'] = ele.LastFollowUpDate ? moment(ele['LastFollowUpDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowUpDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
            }
        });
        return distinct(this.gridDataProfileChanges, fieldName).map((item) => item[fieldName]);
    }

    // for gridDataCoverageArea Tab
    public filterChangeCA(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataCoverageAreaGrid = filterBy(this.gridDataCoverageArea, filter);
    }
    public distinctPrimitiveCA(fieldName: string): any {
        this.gridDataCoverageArea.forEach((ele) => {
            ele['ChangedDate'] = ele.ChangedDate ? moment(ele['ChangedDate']).format('MM/DD/yyyy') : null;
            ele['LastFollowUpDate'] = ele.LastFollowUpDate ? moment(ele['LastFollowUpDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowUpDate === null) {
                ele['LastFollowUpDateNew'] = null;
            } else {
                ele['LastFollowUpDateNew'] = new Date(ele.LastFollowUpDate);
            }
        });
        return distinct(this.gridDataCoverageArea, fieldName).map((item) => item[fieldName]);
    }

    // for gridData Legal Issues Tab
    public filterChangeLI(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataLegalIssuesGrid = filterBy(this.gridDataLegalIssues, filter);
    }
    public distinctPrimitiveLI(fieldName: string): any {
        this.gridDataLegalIssues.forEach((ele) => {
            ele['IssueDate'] = ele.IssueDate ? moment(ele['IssueDate']).format('MM/DD/yyyy') : null;
            ele['LastFollowUpDate'] = ele.LastFollowUpDate ? moment(ele['LastFollowUpDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowUpDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
            }
        });
        return distinct(this.gridDataLegalIssues, fieldName).map((item) => item[fieldName]);
    }

    // for gridData Recert Tab
    public filterChangeRT(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataRecertGrid = filterBy(this.gridDataRecertTab, filter);
    }

    public distinctPrimitiveRT(fieldName: string): any {
        return distinct(this.gridDataRecertTab, fieldName).map((item) => item[fieldName]);
    }

    public filterChangeCalls(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridDataCallsGrid = filterBy(this.gridDataCalls, filter);
    }

    public distinctPrimitiveCalls(fieldName: string): any {
        this.gridDataCalls.forEach((ele) => {
            ele['DateDueFilterNew'] = ele.DateDueFilter;
            ele['LastFollowUpDate'] = ele.LastFollowUpDate ? moment(ele['LastFollowUpDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowUpDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
            }
        });
        return distinct(this.gridDataCalls, fieldName).map((item) => item[fieldName]);
    }

    public renderDate(date) {
        return new Date(date);
    }

    public filterChangeAppstarted(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridData1 = filterBy(this.appstartedVal, filter);
    }

    public distinctPrimitiveAppstarted(fieldName: string): any {
        this.appstartedVal.forEach((ele) => {
            ele['StartedDate'] = ele.StartedDate ? moment(ele['StartedDate']).format('MM/DD/yyyy') : null;
            // ele['LastFollowupDate'] = ele.LastFollowupDate ? moment(ele['LastFollowupDate']).format('MM/DD/yyyy') : null;
            const followDate = String(ele.LastFollowupDate).replace(new RegExp(/-/gm), '/'); // Change all '-' to '/'
            if (ele.LastFollowupDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                // ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                ele['LastFollowupDateNew'] = new Date(followDate);
            }
        });
        return distinct(this.appstartedVal, fieldName).map((item) => item[fieldName]);
    }

    public filterChangeAppUpdatestarted(filter: CompositeFilterDescriptor): void {
        this.filter = filter;
        this.gridData2 = filterBy(this.appUpdatestartedVal, filter);
    }

    public distinctPrimitiveUpdateAppstarted(fieldName: string): any {
        this.appUpdatestartedVal.forEach((ele) => {
            ele['StartedDate'] = ele.StartedDate ? moment(ele['StartedDate']).format('MM/DD/yyyy') : null;
            ele['LastFollowupDate'] = ele.LastFollowupDate ? moment(ele['LastFollowupDate']).format('MM/DD/yyyy') : null;
            if (ele.LastFollowupDate === null) {
                ele['LastFollowupDateNew'] = null;
            } else {
                ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
            }
        });
        return distinct(this.appUpdatestartedVal, fieldName).map((item) => item[fieldName]);
    }

    constructor(
        private _srvStorage: StorageService,
        private _srvInternal: InternalLandingService,
        private _srvApi: ApiService,
        private _route: Router,
        private _srvDevice: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private _srvDialog: DialogService,
        public datepipe: DatePipe,
        public _srvInternalUser: InternalUserDetailsService,
        private _srvAuth: AuthenticationService,
        private renderer: Renderer2,
        public intlService: IntlService
    ) {
        this.loginDetailsInternal = this._srvAuth.ProfileInternalRoles;
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
        (<CldrIntlService> this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.pageContent = this._srvInternalUser.getPageContentByLanguage();

        this.slides[0].name = this.pageContent.Internal_Landing.Medallion_Apps_Started;
        this.slides[1].name = this.pageContent.Internal_Landing.Medallion_Apps_Submitted;
        this.slides[2].name = this.pageContent.Internal_Landing.Medallion_App_Updates_Started;
        this.slides[3].name = this.pageContent.Internal_Landing.Medallion_App_Updates_Submitted;
        this.slides[4].name = this.pageContent.Internal_Landing.Medallion_Apps_Coverage_Profile;
        this.slides[5].name = this.pageContent.Internal_Landing.Medallion_Current_Calls;
        this.slides[6].name = this.pageContent.Internal_Landing.Medallion_Recerts;
        this.slides[7].name = this.pageContent.Internal_Landing.Medallion_Legal_Issues;
        this.slides[8].name = this.pageContent.Internal_Landing.Medallion_Profile_Changes;

        this.RoleDetailsInternal = this._srvAuth.ProfileInternalRoles;
        this.internalResourceId = this.RoleDetailsInternal.Login[0].ResourceID;
        this.loggedInUserType = this.RoleDetailsInternal.Login[0].ResourceType;
        let roleDetails: RoleMetadata[];
        roleDetails = this.RoleDetailsInternal.RoleDetails;

        this.RecruitingVal = roleDetails.some((el) => el.RoleName === 'Recruiting' || el.RoleName === 'Recruiting Leader');
        this.MembershipServicesVal = roleDetails.some((el) => el.RoleName === 'Membership Services' || el.RoleName === 'Membership Services Leader');
        this.repFlag = roleDetails.every((el) => el.RoleName === 'Contractor Central User');
        this.getMedallionsCount();

        if (this.RecruitingVal === true && this.MembershipServicesVal === false) {
            this.reassignRoleName = 'Recruiting';
            this.medallionActive = 'Apps Started';
            this.Recruiting = true;
            this.getSelectedGridData('Apps Started');
            this.slides = [...this.slides.filter((o) => o.role === 'Recruiter')];
        }

        if (this.MembershipServicesVal === true && this.RecruitingVal === false) {
            this.reassignRoleName = 'Membership Services';
            this.medallionActive = 'Current Calls';
            this.MembershipServices = true;
            this.appStarted = false;
            this.appSubmited = false;
            this.profileChanges = false;
            this.coverageArea = false;
            this.callsTab = true;
            this.getSelectedGridData('Current Calls');
            this.slides = [...this.slides.filter((o) => o.role === 'Membership')];
        }
        if (this.RecruitingVal === true && this.MembershipServicesVal === true) {
            this.reassignRoleName = 'Membership Services';
            this.medallionActive = 'Current Calls';
            this.Recruiting = true;
            this.MembershipServices = true;
            this.appStarted = false;
            this.callsTab = true;
            this.getSelectedGridData('Current Calls');
            this.slides = [...this.slides.filter((o) => o.role === 'Membership'), ...this.slides.filter((o) => o.role === 'Recruiter')];
        }
        this.bindcounter();
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

        setTimeout(() => {
            this.heightCalculate();
        }, 3000);
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

    async openContractor1(data, tabName: string) {
        const result = [];
        if (tabName === 'Apps Started') {
            const contrData = await this.fetchContractorDetails(data.CCOpsID, 0, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/contractorRegistration/company-information']);
        }
        if (tabName === 'Apps Update Started') {
            const contrData = await this.fetchContractorDetails(0, data.ContrID, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/contractorRegistration/company-information']);
        }
        if (tabName === 'Apps Submitted') {
            const contrData = await this.fetchContractorDetails(0, data.ContrID, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/contractorRegistration/company-information']);
        }
        if (tabName === 'Apps Update Submitted') {
            const contrData = await this.fetchContractorDetails(0, data.ContrID, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/contractorRegistration/company-information']);
        }

        if (tabName === 'Profile Changes') {
            if (data.ChangeType === 'Trades') {
                const contrData = await this.fetchContractorDetails(0, data.ContractorID, data.ChangeType);
                if (this.loginDetailsInternal.Login.length) {
                    contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
                }
                result.push(contrData);
                this._srvStorage.setStorage(result, 'loginDetails');
                this._route.navigate(['/contractorRegistration/trade-information']);
            } else if (data.ChangeType === 'Coverage Area') {
                const contrData = await this.fetchContractorDetails(0, data.ContractorID, data.ChangeType);
                if (this.loginDetailsInternal.Login.length) {
                    contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
                }
                result.push(contrData);
                this._srvStorage.setStorage(result, 'loginDetails');
                this._route.navigate(['/contractorRegistration/coverage-profile-information']);
            } else {
                const contrData = await this.fetchContractorDetails(0, data.ContractorID, data.ChangeType);
                if (this.loginDetailsInternal.Login.length) {
                    contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
                }
                result.push(contrData);
                this._srvStorage.setStorage(result, 'loginDetails');
                this._route.navigate(['/internal/contractor-operation']);
            }
        }
        if (tabName === 'Coverage Area') {
            if (data.ChangeType === 'Trades') {
                const contrData = await this.fetchContractorDetails(0, data.ContractorID, data.ChangeType);
                if (this.loginDetailsInternal.Login.length) {
                    contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
                }
                result.push(contrData);
                this._srvStorage.setStorage(result, 'loginDetails');
                this._route.navigate(['/contractorRegistration/trade-information']);
            } else if (data.ChangeType === 'Coverage Area') {
                const contrData = await this.fetchContractorDetails(0, data.ContractorID, data.ChangeType);
                if (this.loginDetailsInternal.Login.length) {
                    contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
                }
                result.push(contrData);
                this._srvStorage.setStorage(result, 'loginDetails');
                this._route.navigate(['/internal/contractor-operation']);
            } else {
                const contrData = await this.fetchContractorDetails(0, data.ContractorID, data.ChangeType);
                if (this.loginDetailsInternal.Login.length) {
                    contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
                }
                result.push(contrData);
                this._srvStorage.setStorage(result, 'loginDetails');
                this._route.navigate(['/internal/contractor-operation']);
            }
        }
        if (tabName === 'Legal Issues') {
            const contrData = await this.fetchContractorDetails(0, data.ContractorID, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/contractorRegistration/legal-questions']);
        }
        if (tabName === 'Recerts') {
            const contrData = await this.fetchContractorDetails(0, data.ContractorID, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/internal/contractor-operation']);
        }

        if (tabName === 'Current Calls') {
            const contrData = await this.fetchContractorDetails(0, data.ContractorID, null);
            if (this.loginDetailsInternal.Login.length) {
                contrData.ResourceID = this.loginDetailsInternal.Login[0].ResourceID;
            }
            result.push(contrData);
            this._srvStorage.setStorage(result, 'loginDetails');
            this._route.navigate(['/existing-contractor/credentialing-info']);
        }
    }

    // fetch contractor login details
    async fetchContractorDetails(param1, param2, param3) {
        const details = await this._srvInternalUser.getContractorCredDetails(param1, param2, param3);
        return { ...details, EventName: 'No Event', EventTypeID: 0, EventAlias: null };
    }

    // Bind Grid data and this method call when we on madallions
    public async getSelectedGridData(text) {
        if (text === 'Apps Submitted') {
            const res: AppSubmitted[] = await this._srvInternal.GetAppsSubmitted(this.internalResourceId);
            this.gridDataAppSubmitted = res;
            this.gridDataAppSubmitted.forEach((ele) => {
                if (ele.LastFollowupDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                }
            });
            this.bindcounter();
        }
        if (text === 'Apps Update Submitted') {
            const res: AppUpdate[] = await this._srvInternal.GetAppsUpdateSubmitted(this.internalResourceId);
            this.gridDataAppUpdateSubmitted = res;
            this.gridDataAppUpdateSubmitted.forEach((ele) => {
                if (ele.LastFollowupDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                }
            });
            this.bindcounter();
        }
        if (text === 'Apps Started') {
            const res: AppStarted[] = await this._srvInternal.GetInternalAppsStarted(this.internalResourceId);
            if (res.length && res !== null) {
                this.appstartedVal = res;
                this.bindcounter();
                this.appstartedVal.forEach((ele) => {
                    if (ele.LastFollowupDate === null) {
                        ele['LastFollowupDateNew'] = null;
                    } else {
                        const followDate = String(ele.LastFollowupDate).replace(new RegExp(/-/gm), '/'); // Change all '-' to '/'
                        ele['LastFollowupDateNew'] = new Date(followDate);
                    }
                });
            }
            this.bindcounter();
        }
        if (text === 'Apps Update Started') {
            const res: AppUpdate[] = await this._srvInternal.GetAppsUpdateStarted(this.internalResourceId);
            if (res.length && res !== null) {
                this.appUpdatestartedVal = res;
                this.bindcounter();
                this.appUpdatestartedVal.forEach((ele) => {
                    if (ele.LastFollowupDate === null) {
                        ele['LastFollowupDateNew'] = null;
                    } else {
                        ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                    }
                });
            }
            this.bindcounter();
        }
        if (text === 'Profile Changes') {
            const res: ProfileChange[] = await this._srvInternal.GetLandingProfileChangeTab(this.internalResourceId);
            this.gridDataProfileChanges = res;
            this.gridDataProfileChanges.forEach((ele) => {
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
            this.bindcounter();
        }
        if (text === 'Coverage Area') {
            const res: CoverageArea[] = await this._srvInternal.GetLandingCoverageProfileChangeTab(this.internalResourceId);
            this.gridDataCoverageArea = res;
            this.gridDataCoverageArea.forEach((ele) => {
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowUpDateNew'] = null;
                } else {
                    ele['LastFollowUpDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
            this.bindcounter();
        }
        if (text === 'Legal Issues') {
            const res: LegalIssue[] = await this._srvInternal.GetLandingLegalIssueTab(this.internalResourceId);
            this.gridDataLegalIssues = res;
            this.gridDataLegalIssues.forEach((ele) => {
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
            this.bindcounter();
        }

        if (text === 'Recert Tab') {
            const res: Recerts[] = await this._srvInternal.GetLandingRecertTab(this.internalResourceId);
            this.gridDataRecertTab = res;
            this.bindcounter();
        }

        if (text === 'Current Calls') {
            const res: CallsTab[] = await this._srvInternal.GetLandingCallsTab(this.internalResourceId);
            this.gridDataCalls = res;
            this.gridDataCalls.forEach((ele) => {
                ele['DateDue'] = ele.DateDue ? new Date(ele.DateDue) : null;
                // this column is added to manage sorting and filtering as both functionality used different columns
                ele['DateDueFilterNew'] = ele.DateDueFilter;
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
            this.bindcounter();
        }
    }

    public sortChangeAppUpdatesStarted() {
        setTimeout(() => {
            this.appUpdatestartedVal.forEach((ele) => {
                ele['StartedDate'] = ele.StartedDate ? new Date(ele.StartedDate) : null;
                ele['LastFollowupDate'] = ele.LastFollowupDate ? new Date(ele.LastFollowupDate) : null;
                if (ele.LastFollowupDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                }
            });
        });
    }
    public sortChangeAppSubmitted() {
        setTimeout(() => {
            this.gridDataAppSubmitted.forEach((ele) => {
                ele['SubmitDate'] = ele.SubmitDate ? new Date(ele.SubmitDate) : null;
                ele['LastFollowupDate'] = ele.LastFollowupDate ? new Date(ele.LastFollowupDate) : null;
                if (ele.LastFollowupDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                }
            });
        });
    }
    public sortChangeCoverage() {
        setTimeout(() => {
            this.gridDataCoverageArea.forEach((ele) => {
                ele['ChangedDate'] = ele.ChangedDate ? new Date(ele.ChangedDate) : null;
                ele['LastFollowUpDate'] = ele.LastFollowUpDate ? new Date(ele.LastFollowUpDate) : null;
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowUpDateNew'] = null;
                } else {
                    ele['LastFollowUpDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
        });
    }
    public sortChangeAppUpdatesSubmitted() {
        setTimeout(() => {
            this.gridDataAppUpdateSubmitted.forEach((ele) => {
                ele['SubmitDate'] = ele.SubmitDate ? new Date(ele.SubmitDate) : null;
                ele['LastFollowupDate'] = ele.LastFollowupDate ? new Date(ele.LastFollowupDate) : null;
                if (ele.LastFollowupDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowupDate);
                }
            });
        });
    }
    public sortChangeAppStarted() {
        setTimeout(() => {
            this.appstartedVal.forEach((ele) => {
                ele['StartedDate'] = ele.StartedDate ? new Date(ele.StartedDate) : null;
                // ele['LastFollowupDate'] = ele.LastFollowupDate ? new Date(ele.LastFollowupDate) : null;
                const followDate = String(ele.LastFollowupDate).replace(new RegExp(/-/gm), '/'); // Change all '-' to '/'

                if (ele.LastFollowupDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(followDate);
                }
            });
        });
    }
    public sortChangeProfile() {
        setTimeout(() => {
            this.gridDataProfileChanges.forEach((ele) => {
                ele['ChangedDate'] = ele.ChangedDate ? new Date(ele.ChangedDate) : null;
                ele['LastFollowUpDate'] = ele.LastFollowUpDate ? new Date(ele.LastFollowUpDate) : null;
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
        });
    }
    public sortChangeLegal() {
        setTimeout(() => {
            this.gridDataLegalIssues.forEach((ele) => {
                ele['IssueDate'] = ele.IssueDate ? new Date(ele.IssueDate) : null;
                ele['LastFollowUpDate'] = ele.LastFollowUpDate ? new Date(ele.LastFollowUpDate) : null;
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
        });
    }

    public sortChangeCalls(eventResult) {
        setTimeout(() => {
            this.gridDataCalls.forEach((ele) => {
                ele['DateDueFilterNew'] = ele.DateDue;
                ele['LastFollowUpDate'] = ele.LastFollowUpDate ? new Date(ele.LastFollowUpDate) : null;
                if (ele.LastFollowUpDate === null) {
                    ele['LastFollowupDateNew'] = null;
                } else {
                    ele['LastFollowupDateNew'] = new Date(ele.LastFollowUpDate);
                }
            });
        });
    }

    // bind medallions count left only apps started count
    public async getMedallionsCount() {
        const res: MedalionCount[] = await this._srvInternal.GetMedallianCount(this.internalResourceId);
        this.getMedallianCount = res;
        this.getMedallianCount.forEach((ele) => {
            if (ele.MedallianTypeID === 1) {
                this.CounterCurrentCalls = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 2) {
                this.CounterAppSubmitted = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 3) {
                this.CounterProfileChange = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 4) {
                this.CounterLegalIssuesCount = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 5) {
                this.CounterResertCallCount = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 6) {
                this.CountCoverageArea = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 7) {
                this.CounterAppUpdateStarted = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 8) {
                this.CounterAppUpdateSubmitted = ele.TotalCount;
            }
            if (ele.MedallianTypeID === 9) {
                this.CounterAppStarted = ele.TotalCount;
            }
        });
        this.bindcounter();
    }

    // Bind all Medallions Count in Slide Array accorting to role
    public bindcounter() {
        if (this.Recruiting === true && this.MembershipServices === false) {
            this.slides
                .filter((o) => o.role === 'Recruiter')
                .forEach((slide) => {
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Apps_Started) {
                        slide.count = this.CounterAppStarted;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Apps_Submitted) {
                        slide.count = this.CounterAppSubmitted;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Apps_Coverage_Profile) {
                        slide.count = this.CountCoverageArea;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_App_Updates_Started) {
                        slide.count = this.CounterAppUpdateStarted;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_App_Updates_Submitted) {
                        slide.count = this.CounterAppUpdateSubmitted;
                    }
                });
        }

        if (this.MembershipServices === true && this.Recruiting === false) {
            this.slides
                .filter((o) => o.role === 'Membership')
                .forEach((slide) => {
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Current_Calls) {
                        slide.count = this.CounterCurrentCalls;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Recerts) {
                        slide.count = this.CounterResertCallCount;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Legal_Issues) {
                        slide.count = this.CounterLegalIssuesCount;
                    }
                    if (slide.name === this.pageContent.Internal_Landing.Medallion_Profile_Changes) {
                        slide.count = this.CounterProfileChange;
                    }
                });
        }
        if (this.MembershipServices === false && this.Recruiting === false) {
            this.slides = [];
        }
        if (this.Recruiting === true && this.MembershipServices === true) {
            this.slides.forEach((slide) => {
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Apps_Started) {
                    slide.count = this.CounterAppStarted;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Apps_Submitted) {
                    slide.count = this.CounterAppSubmitted;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Apps_Coverage_Profile) {
                    slide.count = this.CountCoverageArea;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_App_Updates_Started) {
                    slide.count = this.CounterAppUpdateStarted;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_App_Updates_Submitted) {
                    slide.count = this.CounterAppUpdateSubmitted;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Current_Calls) {
                    slide.count = this.CounterCurrentCalls;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Recerts) {
                    slide.count = this.CounterResertCallCount;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Legal_Issues) {
                    slide.count = this.CounterLegalIssuesCount;
                }
                if (slide.name === this.pageContent.Internal_Landing.Medallion_Profile_Changes) {
                    slide.count = this.CounterProfileChange;
                }
            });
        }
    }

    // This method call when we click on medallions swiper-button-next
    public medallionsNextClick(e) {
        const result = document.getElementsByClassName('swiper-slide-next');
        const withNoDigits = result[0].textContent.replace(/[0-9]/g, '');
        this.medallionsClick(withNoDigits, e, 'next');
    }
    // This method call when we click on medallions swiper-button-prev
    public medallionsPrevClick(e) {
        const result = document.getElementsByClassName('swiper-slide-prev');
        const withNoDigits = result[0].textContent.replace(/[0-9]/g, '');
        this.medallionsClick(withNoDigits, e, 'prev');
    }
    // this method is called when we click on medallions
    public medallionsClick(text, e, temp) {
        this.filter = { logic: 'and', filters: [] };
        if (temp === '') {
            const htmlCollection: any = document.getElementsByClassName('swiper-slide');
            for (const el of htmlCollection) {
                el.classList.remove('swiper-slide-active');
            }
            e.currentTarget.classList.add('swiper-slide-active');
        }
        if (text === this.pageContent.Internal_Landing.Medallion_Apps_Submitted) {
            this.reassignRoleName = 'Recruiting';
            this.medallionActive = 'Apps Submitted';
            this.getSelectedGridData('Apps Submitted');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = true;
            this.appUpdateSubmited = false;
            this.profileChanges = false;
            this.coverageArea = false;
            this.LegalIssue = false;
            this.recerts = false;
            this.callsTab = false;
        }
        if (text === this.pageContent.Internal_Landing.Medallion_Apps_Started) {
            this.reassignRoleName = 'Recruiting';
            this.medallionActive = 'Apps Started';
            this.getSelectedGridData('Apps Started');
            this.getMedallionsCount();
            this.appStarted = true;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.profileChanges = false;
            this.coverageArea = false;
            this.callsTab = false;
            this.recerts = false;
            this.LegalIssue = false;
        }

        if (text === this.pageContent.Internal_Landing.Medallion_Apps_Coverage_Profile) {
            this.reassignRoleName = 'Recruiting';
            this.medallionActive = 'Coverage Area';
            this.getSelectedGridData('Coverage Area');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.coverageArea = true;
            this.profileChanges = false;
            this.callsTab = false;
            this.LegalIssue = false;
            this.recerts = false;
        }
        if (text === this.pageContent.Internal_Landing.Medallion_App_Updates_Started) {
            this.reassignRoleName = 'Recruiting';
            this.medallionActive = 'Apps Update Started';
            this.getSelectedGridData('Apps Update Started');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = true;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.profileChanges = false;
            this.LegalIssue = false;
            this.recerts = false;
            this.coverageArea = false;
            this.callsTab = false;
        }
        if (text === this.pageContent.Internal_Landing.Medallion_App_Updates_Submitted) {
            this.reassignRoleName = 'Recruiting';
            this.medallionActive = 'Apps Update Submitted';
            this.getSelectedGridData('Apps Update Submitted');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = true;
            this.profileChanges = false;
            this.LegalIssue = false;
            this.recerts = false;
            this.coverageArea = false;
            this.callsTab = false;
        }

        if (text === this.pageContent.Internal_Landing.Medallion_Current_Calls) {
            this.reassignRoleName = 'Membership Services';
            this.medallionActive = 'Current Calls';
            this.getSelectedGridData('Current Calls');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.profileChanges = false;
            this.LegalIssue = false;
            this.recerts = false;
            this.callsTab = true;
            this.coverageArea = false;
        }
        if (text === this.pageContent.Internal_Landing.Medallion_Recerts) {
            this.reassignRoleName = 'Membership Services';
            this.medallionActive = 'Recert Tab';
            this.getSelectedGridData('Recert Tab');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.profileChanges = false;
            this.LegalIssue = false;
            this.recerts = true;
            this.callsTab = false;
            this.coverageArea = false;
        }
        if (text === this.pageContent.Internal_Landing.Medallion_Legal_Issues) {
            this.reassignRoleName = 'Membership Services';
            this.medallionActive = 'Legal Issues';
            this.getSelectedGridData('Legal Issues');
            this.getMedallionsCount();
            this.LegalIssue = true;
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.profileChanges = false;
            this.recerts = false;
            this.callsTab = false;
            this.coverageArea = false;
        }
        if (text === this.pageContent.Internal_Landing.Medallion_Profile_Changes) {
            this.reassignRoleName = 'Membership Services';
            this.medallionActive = 'Profile Changes';
            this.getSelectedGridData('Profile Changes');
            this.getMedallionsCount();
            this.appStarted = false;
            this.appUpdateStarted = false;
            this.appSubmited = false;
            this.appUpdateSubmited = false;
            this.profileChanges = true;
            this.coverageArea = false;
            this.LegalIssue = false;
            this.recerts = false;
            this.callsTab = false;
        }
    }

    // this method call for update  followup date click
    public async handleClickCell(FollowUpDate: Date, selectedData?: any, str?: string) {
        if (str === 'appSubmited') {
            const UpdateFollowUpDate = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDate);
            if (res === 1) {
                this.getSelectedGridData('Apps Submitted');
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                    <div class="modal-alert confirmation-alert">
                        <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                        <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                    </div>
                `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Apps Submitted'));
            }
        }

        if (str === 'appStarted') {
            const UpdateFollowUpDateStarted = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDateStarted);
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                    <div class="modal-alert confirmation-alert">
                        <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                        <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                    </div>
                `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Apps Started'));
            }
        }
        if (str === 'profileChanges') {
            const UpdateFollowUpDateStarted = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDateStarted);
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                    <div class="modal-alert confirmation-alert">
                        <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                        <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                    </div>
                `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Profile Changes'));
            }
            this.getSelectedGridData('Profile Changes');
        }
        if (str === 'coverageArea') {
            const UpdateFollowUpDateStarted = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDateStarted);
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                    <div class="modal-alert confirmation-alert">
                        <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                        <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                    </div>
                `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Coverage Area'));
            }
        }
        if (str === 'Legal Issues') {
            const UpdateFollowUpDate = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDate);
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert confirmation-alert">
                    <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                    <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                </div>
            `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Legal Issues'));
            }
        }
        if (str === 'Apps Update Submitted') {
            const UpdateFollowUpDate = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDate);
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert confirmation-alert">
                    <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                    <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                </div>
            `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Apps Update Submitted'));
            }
        }
        if (str === 'Apps Update Started') {
            const UpdateFollowUpDate = {
                CCOpsID: selectedData.CCOpsID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDate);
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert confirmation-alert">
                    <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                    <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                </div>
            `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Apps Update Started'));
            }
        }
        if (str === 'Current Calls') {
            const UpdateFollowUpDate = {
                CredentialingLicenseID: selectedData.CredentialingLicenseID,
                Contr_ID: selectedData.ContractorID,
                FollowUpDate: this.convert(FollowUpDate),
                LoggedInResourceID: this.internalResourceId,
            };
            const res: number = await this._srvInternal.UpdateFollowUpDate(UpdateFollowUpDate, 'InternalLandingPage/UpdateFollowUpDateCallsTab/');
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert confirmation-alert">
                    <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                    <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                </div>
            `;
                dialogRef.result.subscribe((eventResult) => this.getSelectedGridData('Current Calls'));
            }
        }
    }

    public UpdateFollowUpDate(UpdateFollowUpDateStarted) {
        this._srvApi.put('InternalLandingPage/UpdateFollowUpDate/', UpdateFollowUpDateStarted).subscribe((res) => {
            if (res === 1) {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert confirmation-alert">
                    <h2>${this.pageContent.Internal_Landing.Alert_Updated}</h2>
                    <p>${this.pageContent.Internal_Landing.Alert_Date_Updated}</p>
                </div>
            `;
                return dialogRef;
            }
        });
    }
    public convert(str) {
        const date = new Date(str);
        const mnth = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear()].join('/');
    }

    displayActiveness() {
        return 'active';
    }
    public openReassign(item) {
        const dialogRef = this._srvDialog.open({
            content: ReassignContracrtorActionComponent,
            width: 500,
        });
        const reassign = dialogRef.content.instance;
        reassign.reassignData = item;
        reassign.recruitingRole = this.RecruitingVal;
        reassign.recruitingRoleName = this.reassignRoleName;
        reassign.repResourceId = item.RepResourceID;
        dialogRef.result.subscribe((r) => {
            if (r['status'] === 'reassign') {
                this.getSelectedGridData(this.medallionActive);
                this.getMedallionsCount();
            }
        });
    }
}
