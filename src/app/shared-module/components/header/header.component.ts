import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorRegistrationService } from 'src/app/modules/contractor-Registration-module/services/contractor-Registration.service';
import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/core/services/http-service';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DOCUMENT } from '@angular/common';
import { InternalUserDetailsService } from '../../services/internal-userDetails.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { environment } from 'src/environments/environment';
import { JumpToDDL } from 'src/app/core/models/user.model';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
    public selectedPage: { ApplicationPageName: string; ApplicationPageID: number; ApplicationPageNameTranslated?: string } = {
        ApplicationPageName: 'Jump To',
        ApplicationPageID: 0,
        ApplicationPageNameTranslated: 'Jump To',
    };
    public loginDetails: any;
    public pageContent: any;
    public recrutingAndMembershipFlag: boolean;
    public homeDisplay: boolean = false;
    @Input() searchIcon: string;
    @Input() fromPage: string = '';
    public defaultItem: JumpToDDL = { ApplicationPageName: 'Jump To', ApplicationPageID: 0, ApplicationPageNameTranslated: 'Jump To' };
    public loginPage: string;
    public $location: any;
    public pagelistItems: Array<JumpToDDL>;
    private pageSearchResult: Array<JumpToDDL>;
    public defaultRoute: JumpToDDL = { ApplicationPageName: 'Jump To', ApplicationPageID: 0 };
    public userType: string;
    public companyOwnershipPercentage: number = 0;
    public adminHomeClickReposne: boolean = false;
    public showAdminBtn: boolean = false;
    @Output() adminBtnValue = new EventEmitter();
    public isMove: boolean = false;
    public breadcrumHub : string;
    public isBreadcrum : boolean = false;
    constructor(
        @Inject(DOCUMENT) private document: Document,
        private _srvStorage: StorageService,
        public _srvAuth: AuthenticationService,
        private _route: Router,
        private _srvContractor: ContractorRegistrationService,
        private _activeRoute: ActivatedRoute,
        private _srvDialog: DialogService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvContrData: ContractorDataService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
        this.defaultItem.ApplicationPageName = this.pageContent.General_Keys.General_Jump;
        this.defaultItem.ApplicationPageNameTranslated = this.pageContent.General_Keys.General_Jump;

        this.selectedPage.ApplicationPageName = this.pageContent.General_Keys.General_Jump;
        this.selectedPage.ApplicationPageNameTranslated = this.pageContent.General_Keys.General_Jump;
    }
    async ngOnInit() {
        const breadcrumData = await this._srvContrData.getBreadcrum() 
        this.breadcrumHub = breadcrumData.ApplicationHubName;
        if(this.breadcrumHub)
        {
            this.isBreadcrum = true;
        }
        const url = document.location.href.split('/');
        const urlText = url[url.length - 1];
        if (urlText === 'admin') {
            this.document.body.classList.add('admin-body');
        } else {
            this.document.body.classList.remove('admin-body');
        }

        this.loginPage = this._srvStorage.getStorage('landing-page');
        this.userType = this._srvAuth.LoggedInUserType;
        this.displayHomeIcon();
        let route = this._srvStorage.getStorage('routeTo');
        route = route === null ? 'contractors' : route;

        if (this._srvStorage.getStorage('loginDetailsInternal')) {
            this.showAdminBtn = this._srvStorage.getStorage('loginDetailsInternal').RoleDetails.some((el) => el.ObjectPrivilegeDescription === 'Admin Page Admin User');
        }

        if (this.userType === 'Internal' && route !== 'prospective-contractors') {
            this.loginDetails = this._srvStorage.getStorage('loginDetailsInternal');
        } else {
            this.loginDetails = this._srvStorage.getStorage('loginDetails');
        }
        if (this.loginDetails && 'Login' in this.loginDetails) {
            this.loginDetails = this.loginDetails.Login;
        }

        if (this._srvAuth.Language && this._srvAuth.Language === 1) {
            this.document.body.classList.add('lang-french');
        }

        if (this.userType === 'Internal') {
            this.findInternalMember();
        }
        if ((this.loginDetails && this.loginDetails[0].ContrID > 0 && this._srvAuth.Profile.EventName === 'No Event') || this.userType === 'Internal') {
            this.jumptoDetails();
        }
    }
    public findInternalMember() {
        const roleDetailsInternal = this._srvStorage.getStorage('loginDetailsInternal');
        let roleDetails: any = [];
        roleDetails = roleDetailsInternal.RoleDetails;
        this.recrutingAndMembershipFlag = roleDetails.some(
            (elem) => elem.RoleName === 'Recruiting' || elem.RoleName === 'Recruiting Leader' || elem.RoleName === 'Membership Services' || elem.RoleName === 'Membership Services Leader'
        );
    }
    public async jumptoDetails() {
        await this._srvContrData.getjumpToData();
        this._srvContrData.JumpToData.subscribe((res) => {
            this.pagelistItems = [];
            this.pagelistItems = [
                { ApplicationPageName: this.defaultItem.ApplicationPageName, ApplicationPageID: 0, ApplicationPageNameTranslated: this.defaultItem.ApplicationPageNameTranslated },
                ...res,
            ];
    
            if (this._srvAuth.Profile && this._srvAuth.Profile.ContrID === 0) {
                this.pagelistItems = this.pagelistItems.filter((pId: any) => {
                    return (
                        pId.ApplicationPageName !== 'Background Information' &&
                        pId.ApplicationPageName !== 'Surge/CAT Response' &&
                        pId.ApplicationPageName !== 'Languages/Veterans/Minority Information' &&
                        pId.ApplicationPageName !== 'Employee Information' &&
                        pId.ApplicationPageName !== 'Contractor Operations' &&
                        pId.ApplicationPageName !== 'Credentialing Information' &&
                        pId.ApplicationPageName !== 'Credit Information' &&
                        pId.ApplicationPageName !== 'Internal Landing Page' &&
                        pId.ApplicationPageName !== 'Contractor Questionnaire Page'
                    );
                });
                this.pageSearchResult = this.pagelistItems;
            } else {
                this.pagelistItems = [{ ApplicationPageName: this.defaultItem.ApplicationPageName, ApplicationPageID: 0, ApplicationPageNameTranslated: this.defaultItem.ApplicationPageName }, ...res];
                this.pageSearchResult = this.pagelistItems;
            }
        });
    }

    public selectionChange(value: any): void {
        if (value.ApplicationPageID === 0) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
            <div class="modal-alert info-alert">
                <p>${this.pageContent.General_Keys.Valid_Page_Name}</p>
            </div>
        `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                }
            });
            return;
        }
        // check of reference counts are complete or not and send to some other page
        if (this._srvStorage.getStorage('manageRefCounter') === 'true') {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>Please complete minimum 3 entries for each reference type.</p>
                                </div>
                            `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    const selectedObj = { ApplicationPageName: 'References', ApplicationPageID: 26 };
                    this.selectedPage = selectedObj;
                }
            });
            return;
        }
        // end of check of reference counts

        if (this.loginDetails[0].ContrID > 0) {
            if (this._srvStorage.getStorage('LocationChangeCounter') === 'true') {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 550,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `
                <div class="modal-alert info-alert">
                    <p>${this.pageContent.Location_Info.Min_Loc}</p>
                </div>
            `;
                dialogRef.result.subscribe((res) => {
                    if (res['button'] === 'Yes') {
                        const selectedObj = { ApplicationPageName: 'Facilities/Other Locations Information', ApplicationPageID: 21 };
                        this.selectedPage = selectedObj;
                    }
                });
                return;
            }
        }

        let ownershipStructure = null;
        let path;
        if (this._activeRoute.url['value'].length) {
            path = this._activeRoute.url['value'][0].path;
        }
        this._srvContractor.transmitOwnerShipPercentage.subscribe((percentage) => {
            this.companyOwnershipPercentage = percentage;
        });
        this._srvContractor.ownershipStructure.subscribe((struct) => (ownershipStructure = struct));
        if (path === 'ownership' && ownershipStructure !== 1 && ownershipStructure !== 2 && ownershipStructure !== null && this.companyOwnershipPercentage !== 100) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Percentage_Ownership}</p>
                                </div>
                            `;
            dialogRef.result.subscribe((res) => {
                if (res['button'] === 'Yes') {
                    this.selectedPage = { ApplicationPageName: 'Jump To', ApplicationPageID: 0 };
                }
            });
            return;
        }
        if (value.ApplicationPageID === 0) {
            return;
        }

        const url = this._srvContrData.getCompleteUrl(value.ApplicationPageName);
        this._route.navigate([url]);
    }

    logout() {
        let ownershipStructure = null;
        let path;
        if (this._activeRoute.url['value'].length) {
            path = this._activeRoute.url['value'][0].path;
        }
        this._srvContractor.transmitOwnerShipPercentage.subscribe((percentage) => {
            this.companyOwnershipPercentage = percentage;
        });
        this._srvContractor.ownershipStructure.subscribe((struct) => (ownershipStructure = struct));
        if (path === 'ownership' && ownershipStructure !== 1 && ownershipStructure !== 2 && ownershipStructure !== null && this.companyOwnershipPercentage !== 100) {
            this.selectedPage = { ApplicationPageName: 'Jump To', ApplicationPageID: 0 };
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Percentage_Ownership}</p>
                                </div>
                            `;
            return;
        }

        this._srvAuth.logout();
        this.document.body.removeAttribute('class');
    }
    displayHomeIcon() {
        if (this.userType === 'Internal' && this.loginPage === 'not-search-page') {
            this.homeDisplay = true;
        } else if (this.loginPage === 'search-page' && this.searchIcon !== 'notDisplaySearch') {
            this.homeDisplay = true;
        } else if (this.loginPage === 'admin-page' && this.searchIcon !== 'notDisplaySearch') {
            this.homeDisplay = true;
        }
    }

    dataUnsavedAlert() {
        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
            width: 550,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                            <div class="modal-alert info-alert">
                                <p>${this.pageContent.General_Keys.Please_save_changes}</p>
                            </div>
                        `;
    }
    public redirect() {
        this.adminBtnValue.emit(true);
        this._srvLanguage.adminMsg.subscribe((res) => {
            this.adminHomeClickReposne = res;
        });

        if (this.adminHomeClickReposne === true) {
            this.isMove = true;
            this.dataUnsavedAlert();
        } else {
            this.isMove = false;
        }

        if (this.isMove === true) {
            return false;
        }

        let ownershipStructure = null;
        let path;
        if (this._activeRoute.url['value'].length) {
            path = this._activeRoute.url['value'][0].path;
        }
        this._srvContractor.transmitOwnerShipPercentage.subscribe((percentage) => {
            this.companyOwnershipPercentage = percentage;
        });
        this._srvContractor.ownershipStructure.subscribe((struct) => (ownershipStructure = struct));
        if (path === 'ownership' && ownershipStructure !== 1 && ownershipStructure !== 2 && ownershipStructure !== null && this.companyOwnershipPercentage !== 100) {
            this.selectedPage = { ApplicationPageName: 'Jump To', ApplicationPageID: 0 };
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 550,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>${this.pageContent.Ownership_Info.Percentage_Ownership}</p>
                                </div>
                            `;
            return;
        }
        if (this.searchIcon === 'notDisplaySearch') {
            this._srvStorage.setStorage('from-search', 'routeTo');
        } else {
            this._srvStorage.setStorage('prospective-contractors', 'routeTo');
        }
        this.loginPage === 'search-page' ? this._route.navigate(['/internal/search-contractor']) : this._route.navigate(['/internal/internal-landing']);
    }
    public searchContractor() {
        this._route.navigate(['/internal/search-contractor']);
    }
    public filterDropdown(ev) {
        this.pagelistItems = this.pageSearchResult.slice().filter((value) => value['ApplicationPageNameTranslated'].toLowerCase().indexOf(ev.toLowerCase()) !== -1);
    }
    public redirectToAdmin() {
        this._route.navigate(['/admin/admin']);
    }
}
