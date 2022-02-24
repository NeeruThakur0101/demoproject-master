import { DialogService } from '@progress/kendo-angular-dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Component, OnInit, AfterViewInit, ViewContainerRef, ViewChild } from '@angular/core';
import { SortDescriptor } from '@progress/kendo-data-query';

import { ViewTrainingAttendeesComponent } from '../../dialogs/view-training-attendees/view-training-attendees.component';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { Router } from '@angular/router';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { DeviceObj, PageObj } from 'src/app/core/models/user.model';
import { UniversalService } from 'src/app/core/services/universal.service';
import { CredentialService } from './credential.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Renderer2 } from '@angular/core';
import { ElementRef } from '@angular/core';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-credentialling-information',
    templateUrl: './credentialling-information.component.html',
    styleUrls: ['./credentialling-information.component.scss'],
})
export class CredentiallingInformationComponent implements OnInit, AfterViewInit {
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    public selectedTab = 1;
    public tabs: any;
    public isMobile: boolean;
    public isTab: boolean;
    public isDesktop: boolean;
    public deviceInfo: object = null;
    public deviceResObj: DeviceObj;
    public pageSize = 10;
    public skip = 0;
    public buttonCount = 5;
    public info = true;
    sort: SortDescriptor[];
    public step = '';
    public pageHeight = 300;
    public pageObj: PageObj = {
        buttonCount: 5,
        info: true,
        type: 'numeric',
        pageSizes: true,
        previousNext: true,
    };

    public loginDetails: Array<SessionUser> = [];
    public loggedInUserType: string;
    public crComments: any = [];
    public gridData: any;
    public pageContent: any;
    public readonlyUserAccess = false;
    public hidePage: boolean = false;
    // comments returns from child components
    // used in main page beacuse common for all tabs
    public receivedComments(events) {
        this.crComments = events;
    }

    constructor(
        private deviceService: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        private _router: Router,
        private _srvContractorData: ContractorDataService,
        public _srvAuth: AuthenticationService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvDialog: DialogService,
        public _srvCredential: CredentialService,
        private renderer: Renderer2,
        private intlService: IntlService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }
    public heightCalculate() {
        if (document.body) {
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    public async ngOnInit() {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService>this.intlService).localeId = this._srvAuth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.loginDetails = Array(this._srvAuth.Profile);
        this.loggedInUserType = this._srvAuth.LoggedInUserType;
        this.resolutionDisplay();
        this.tabs = await this._srvCredential.getTabs();

        if (this.loggedInUserType !== 'Internal') {
            this.tabs.splice(1, 1);
            this.tabs.splice(1, 1);
            this.tabs.splice(1, 1);
            this.tabs.splice(2, 1);
        }
        const response = this.checkPrivilegeForUser();
        if (response) {
            return;
        }
        await this._srvCredential.getCredentialComments();
        this._srvUniversal.loadHeight(this.commentArea, this.commentBlock, this.renderer, 2000);
    }
    private resolutionDisplay() {
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
    public ngAfterViewInit(): void {
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

    viewAttendees(value) {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
        const alertDialog = this._srvDialog.open({
            content: ViewTrainingAttendeesComponent,
            width: 800,
        });
    }
    async onTabSelect(ev) {
        const tabNow = this._srvCredential.tabNow.value;
        this._srvCredential.tabChanged.next(tabNow);
        if (this._srvCredential.changesExist.value === true) {
            ev.preventDefault();
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
                appendTo: this.containerRef,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.General_Keys.Please_save_changes}</p>
                                </div>
                            `;
            return;
        }
        this.selectedTab = ev.index + 1;
    }
    checkPrivilegeForUser() {
        // for user access Privilege
        if (this._srvAuth.Profile.ContrID > 0) {
            const accessType = this._srvAuth.getPageAccessPrivilege('Credentialing Information Page');
            if (!accessType.editAccess) {
                if (accessType.readonlyAccess) {
                    this.readonlyUserAccess = true;
                } else {
                    this.hidePage = true;
                    const dialogRef = this._srvDialog.open({
                        content: DialogAlertsComponent,
                        appendTo: this.containerRef,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = ` <div class="modal-alert info-alert">
                    <h2>${this.pageContent.Credentialing_Information.Credential_Alert_Access_Denied}</h2>
                    <p>${this.pageContent.Credentialing_Information.Credential_Alert_Access_Denied_Stmt}</p>
                   </div>`;
                    dialogRef.result.subscribe(() => {
                        // to show selected jump to value
                        // end
                        this._router.navigate(['contractorRegistration/company-information']);
                    });
                    return true;
                }
            }
        }
        return false;
    }

    public onBack() {
        if (this._srvAuth.Profile.EventName !== 'No Event' && this.loggedInUserType !== 'Internal') {
            this._srvContractorData.saveContractorData({ currentPage: 'Credentialing Information Page', nextPage: 'questionnaire' }, null, 'CredentialingInfoPage/EditCredentialingInfoEventJsonData');
            this._router.navigate(['/existing-contractor/questionnaire']);
            return;
        }
    }

    async SaveNext() {
        await this._srvContractorData.saveContractorData({ currentPage: 'Credentialing Information Page', nextPage: 'validation' }, null, 'CredentialingInfoPage/EditCredentialingInfoEventJsonData');
        this._router.navigate(['/contractorRegistration/validation']);
    }
}
