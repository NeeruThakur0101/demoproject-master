import { DialogAlertsComponent } from './../../../../shared-module/components/dialog-alerts/dialog-alerts.component';
import { UserDetails } from './../../../contractor-Registration-module/models/data-model';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DialogService } from '@progress/kendo-angular-dialog';
import { LoginDialogComponent } from '../../dialogs/login-dialog/login-dialog.component';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/core/services/storage.service';
import { TimeoutService } from 'src/app/core/services/timeout.service';
import { LoginInvalidAlertComponent } from 'src/app/shared-module/components/login-invalid-alert/login-invalid-alert.component';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    public contrDetails: any;
    public loader: boolean = false;
    public userDetails = new UserDetails();
    constructor(
        private authService: AuthenticationService,
        private dialogService: DialogService,
        private route: Router,
        private _srvStorage: StorageService,
        private timeService: TimeoutService,
        @Inject(LOCALE_ID) public localeId: string,
        public intlService: IntlService
    ) { }

    ngOnInit() {

    }

    submit() {
        const e = document.getElementById('txtLogin') as HTMLSelectElement;
        const p = document.getElementById('txtPasword') as HTMLSelectElement;

        if (e.value === '') {
            alert('Please enter email');
        } else {
            this.loader = true;
            this.authService.login('Login/GetLogin', e.value, p.value).subscribe(
                (cred) => {
                    const res = cred.Login;
                    this.loader = false;
                    //// if user is internal employee
                    if (res.length > 0) {
                        if (res[0].ResourceType === 'Internal') {
                            cred.Login[0].editAccess = false;
                            cred.Login[0].EventName = 'No Event';
                            cred.Login[0].EventTypeID = 0;
                            this._srvStorage.setStorage(cred, 'loginDetailsInternal');
                            this._srvStorage.setStorage(cred.Login[0].CurrentLanguageID, 'LanguageID');

                            //setting locale dynamically in case of internal employee
                            (<CldrIntlService> this.intlService).localeId = this.authService.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

                            let roleDetails: any = [];
                            roleDetails = cred.RoleDetails;

                            const notRecrutingAndMembershipFlag = roleDetails.some(
                                (elem) =>
                                    elem.RoleName === 'Recruiting' || elem.RoleName === 'Recruiting Leader' || elem.RoleName === 'Membership Services' || elem.RoleName === 'Membership Services Leader'
                            );

                            if (roleDetails.some((el) => el.ObjectPrivilegeDescription === `Contractor Central Access`)) {
                                if (notRecrutingAndMembershipFlag) {
                                    // noraml landing page
                                    this.route.navigate(['/internal/internal-landing']);
                                    this._srvStorage.setStorage('not-search-page', 'landing-page');
                                } else if (roleDetails.some((el) => el.ObjectPrivilegeDescription === `Admin Page Admin User`)) {
                                    // move to admin page
                                    this.route.navigate(['/admin/admin']);
                                    this._srvStorage.setStorage('admin-page', 'landing-page');
                                } else {
                                    // move to search page
                                    this.route.navigate(['/internal/search-contractor']);
                                    this._srvStorage.setStorage('search-page', 'landing-page');
                                }
                            } else {
                                const dialogRef = this.dialogService.open({
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

                            this.timeService.setUserLoggedIn(true);
                        } else {
                            if (res.length > 0) {
                                const dialogRef = this.dialogService.open({
                                    content: LoginDialogComponent,
                                    width: 500,
                                });
                                const dialog = dialogRef.content.instance;
                                dialog.loginResult = res;
                            } else {
                                alert('Incorrect username and password');
                            }
                        }
                    } else {
                        const dialogRef = this.dialogService.open({
                            content: LoginInvalidAlertComponent,
                            width: 500,
                        });
                        const dialog = dialogRef.content.instance;
                        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>Invalid Credentials!</h2>
                                    <p>Username or Password must be incorrect!</p>
                                </div>
                            `;
                    }
                },
                (err) => {
                    this.loader = false;
                    const dialogRef = this.dialogService.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>Error</h2>
                                    <p>Something went wrong. Please contact administrator.</p>
                                </div>
                            `;
                }
            );
        }
    }
}
