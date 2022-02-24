import { SessionUser } from './../../../../core/services/authentication.service';
import { InternalUserDetailsService } from './../../../../shared-module/services/internal-userDetails.service';
import { EventSelectionComponent } from './../event-selection/event-selection.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Component, OnInit, Input, Inject, LOCALE_ID } from '@angular/core';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/http-service';
import { HttpParams } from '@angular/common/http';
import { StorageService } from 'src/app/core/services/storage.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { TimeoutService } from 'src/app/core/services/timeout.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
// import * as CryptoJS from 'crypto-js';
@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent extends DialogContentBase implements OnInit {
    public loginDetails: Array<SessionUser> = [];
    @Input() loginResult;
    public CompanyData: Array<SessionUser> = [];
    public CompanyDataFilter: Array<SessionUser> = [];
    public selectedCompany: SessionUser = { CompanyName: null, ContractorResourceID: null };
    public submitted: boolean = false;
    public loader: boolean = false;
    public finalLoginResult: Array<any> = [];
    pageContent: any;
    constructor(
        private _srvStorage: StorageService,
        public dialog: DialogRef,
        private route: Router,
        private apiService: ApiService,
        private timeService: TimeoutService,
        private $dialog: DialogService,
        private $auth: AuthenticationService,
        private $language: InternalUserDetailsService,
        @Inject(LOCALE_ID) public localeId: string,
        public intlService: IntlService
    ) {
        super(dialog);
    }
    ngOnInit() {
        this.pageContent = this.$language.getPageContentByLanguage();
        this.CompanyData = [];
        this.CompanyDataFilter = [];
        this.loginResult.forEach((element) => {
            this.CompanyData.push(element);
            this.CompanyDataFilter.push(element);
        });
    }

    public onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.selectedCompany.CompanyName === null) {
            return;
        } else {
            this.loginDetails = [];
            const index = this.loginResult.findIndex((e: SessionUser) => e.CompanyName === this.selectedCompany.CompanyName && e.ContractorResourceID === this.selectedCompany.ContractorResourceID);
            this.finalLoginResult = [];
            this.loginResult[index].EventName = 'No Event';
            this.loginResult[index].EventTypeID = 0;
            this.finalLoginResult.push(this.loginResult[index]);
        }

        const rolesData = this._srvStorage.getStorage('currentUser');
        if (this.finalLoginResult[0].ContrID === 0) {
            this.nextStep();
        } else if (rolesData.RoleDetails.length && this.finalLoginResult[0].ContrID > 0 && rolesData.RoleDetails.some((el) => el.ObjectPrivilegeDescription === `Contractor Central Access`)) {
            this.nextStep();
        } else {
            const dialogRef = this.$dialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                <h2> Access Denied.</h2>
                                    <p>You don't have access to the application.</p>
                                </div>
                            `;
        }
    }

    public nextStep() {
        // skip to remove
        this._srvStorage.setStorage(this.finalLoginResult, 'loginDetails');
        this.loginDetails = Array(this.$auth.Profile);
        this._srvStorage.setStorage(this.loginDetails[0].CurrentLanguageID, 'LanguageID');
        //setting locale dynamically in case of internal employee
        (<CldrIntlService> this.intlService).localeId = this.$auth.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        if (this.loginDetails[0].ContrID > 0) {
            const rolesData = this._srvStorage.getStorage('currentUser');
            const eventTypeflag = rolesData.RoleDetails.length && rolesData.RoleDetails.some((el) => el.ObjectPrivilegeDescription === `Recertification and AppUpdate Access`);
            let param = new HttpParams();
            param = param.append('Contr_Id', this.loginDetails[0].ContrID.toString());
            param = param.append('eventAccessFlag', eventTypeflag);
            this.apiService.get(`Login/GetEventData`, { params: param }).subscribe((events) => {
                events.forEach((el) => (el.EventName = el.EventName === null ? 'No Event' : el.EventName));
                const eventsData = [{ EventName: 'No Event', EventTypeID: 0, InProgressFlag: 0 }, ...events];
                this.loginDetails[0].editAccess = false;
                const appendEvent = [{ ...this.loginDetails[0], ...eventsData[0] }];
                this._srvStorage.setStorage(appendEvent, 'loginDetails');
                if (eventsData.length > 1) {
                    this.dialog.close();
                    let roles;
                    this.$auth.currentUser.subscribe((userRoles) => {
                        roles = userRoles ? userRoles.RoleDetails : [];
                    });
                    if (roles.some((e) => e.ObjectPrivilegeDescription.includes('Basic User'))) {
                        this.loginDetails[0].editAccess = true;
                        this.dialog.close();
                        const dialogRef = this.$dialog.open({
                            content: EventSelectionComponent,
                            width: 500,
                        });
                        const dialog = dialogRef.content.instance;
                        dialog.eventData = eventsData;
                        dialogRef.result.subscribe((res) => {
                            this.routeToCompanyInfo();
                        });
                    } else {
                        this.routeToCompanyInfo();
                    }
                } else {
                    this.routeToCompanyInfo();
                }
                this.timeService.setUserLoggedIn(true);
            });
        } else {
            let param = new HttpParams();
            param = param.append('resourceId', this.$auth.Profile.ResourceID.toString());
            param = param.append('CCOpsID', this.$auth.Profile.CCOpsID.toString());
            this.apiService.get(`JSON/GetLastPageVisited`, { params: param, responseType: 'text' }).subscribe((res1) => {
                const lastPage = res1 !== '' ? res1.toLowerCase() : 'select-program';
                this.route.navigate(['/contractorRegistration/' + lastPage]);
                this.timeService.setUserLoggedIn(true);
            });
        }
    }

    // route to company info
    public routeToCompanyInfo() {
        this.route.navigate([`/contractorRegistration/company-information`]);
    }

    // Company. Filter
    public handleFilterCompany(value) {
        this.CompanyData = this.CompanyDataFilter.filter((s) => s.CompanyName.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // Selected contractor data is stored in selectedCompany variable
    public onSelectedContractor(selectedVal: SessionUser) {
        this.selectedCompany = selectedVal;
        this._srvStorage.setStorage(selectedVal.CompanyName, 'contractorName');
    }
}
