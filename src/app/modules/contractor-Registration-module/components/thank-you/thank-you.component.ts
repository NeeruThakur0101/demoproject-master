import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Subscription } from 'rxjs';
import { DialogService } from '@progress/kendo-angular-dialog';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { EmailThankYouPage } from '../../models/data-model';
import { ThankYouDataService } from './thank-you.service';
import { ThankYouData } from './model-thank-you';
import { StorageService } from 'src/app/core/services/storage.service';
import { LoginUser } from 'src/app/core/models/user.model';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';

@Component({
    selector: 'app-thank-you',
    templateUrl: './thank-you.component.html',
    styleUrls: ['./thank-you.component.scss'],
})
export class ThankYouComponent implements OnInit {
    public emailNotificationIn: Subscription;
    public emailNotificationReno: Subscription;
    public toggleInsuranceEmail: boolean = false;
    public toggleRemoRenoEmail: boolean = false;
    public globalJSON: Subscription;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
    public accountId: number;
    public insuranceEmailCount: number = 0;
    public remoRenoEmailCount: number = 0;
    public emailObj: EmailThankYouPage = { AppType: '', ResourceID: 0, Contr_ID: 0, EmailType: '', ContractorName: '', ContractorType: '' };
    public resData: ThankYouData;
    public contractorName: string;
    public cir: boolean = false;
    public chi: boolean = false;
    public resourceId: number;
    public ContractorID: number;
    public pageContent: any;
    public CountryID: number;
    public isBreadcrum: boolean = false;
    public breadcrumHub: string;

    constructor(
        private _route: Router,
        private _srvDialog: DialogService,
        private _srvThankYou: ThankYouDataService,
        private _srvStorage: StorageService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvAuthentication: AuthenticationService,
        private _srvContrData: ContractorDataService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    async ngOnInit() {
        const breadcrumData = await this._srvContrData.getBreadcrum()
        this.breadcrumHub = breadcrumData.ApplicationHubName;
        if (this.breadcrumHub) {
            this.isBreadcrum = true;
        }

        this.contractorName = this._srvStorage.getStorage('contractorName');
        this.loginDetails = Array(this._srvAuthentication.Profile);

        this.CountryID = this.loginDetails[0].CountryID;
        this.ContractorID = this._srvStorage.getStorage('ContractorID');
        this.resourceId = this.loginDetails[0].ResourceID;

        const reponse = await this._srvThankYou.getCompleteApplication(this.loginDetails[0]);
        this.resData = reponse;
        const resData = reponse;

        this.toggleInsuranceEmail = resData.CompleteApplication.ApplicationAndProgramTypes.some((element) => {
            if (element.ContractorApplicationTypeNumber === 5) {
                return true;
            }
            return false;
        });

        this.toggleRemoRenoEmail = resData.CompleteApplication.ApplicationAndProgramTypes.some((element) => {
            if (element.ContractorApplicationTypeNumber === 6 || element.ContractorApplicationTypeNumber === 7) {
                if (element.ContractorApplicationTypeNumber === 6) {
                    this.chi = true;
                }
                if (element.ContractorApplicationTypeNumber === 7) {
                    this.cir = true;
                }
                return true;
            }
            return false;
        });
    }

    public async insuranceEmail() {
        this.emailObj.AppType = 'Insurance Restoration';
        this.emailObj.Contr_ID = this.ContractorID;
        this.emailObj.ResourceID = this.resourceId;
        this.emailObj.EmailType = 'Restoration';
        this.emailObj.ContractorName = this.contractorName;
        this.emailObj.ContractorType = 'Insurance';

        if (this.insuranceEmailCount === 0) {
            const thanksResponse = await this._srvThankYou.sendThanksEmail(this.emailObj);
            if (thanksResponse.body === 1) {
                this.shootAlertMessage('ins');
            }
        } else {
            this.shootAlertMessage('ins');
        }
    }

    public async remoRenoEmail() {
        this.emailObj.AppType = this.cir === true && this.chi === true ? 'Consumer Home Improvement & Consumer Home Repair' : this.chi === true ? 'Consumer Home Improvement' : 'Consumer Home Repair';
        this.emailObj.Contr_ID = this.ContractorID;
        this.emailObj.ResourceID = this.resourceId;
        this.emailObj.EmailType = 'Remodeling';
        this.emailObj.ContractorName = this.contractorName;
        this.emailObj.ContractorType = 'Remodeling';

        if (this.remoRenoEmailCount === 0) {
            const thanksResponse = await this._srvThankYou.sendThanksEmail(this.emailObj);
            if (thanksResponse.body === 1) {
                this.shootAlertMessage('rem');
            }
        } else {
            this.shootAlertMessage('rem');
        }
    }

    public shootAlertMessage(source: string) {
        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        if ((this.insuranceEmailCount === 0 && source === 'ins') || (this.remoRenoEmailCount === 0 && source === 'rem')) {
            dialog.alertMessage = `<div class="modal-alert confirmation-alert">
            <h2>${this.pageContent.Thank_You_Page.Success_Alert}</h2>
            <p>${this.pageContent.Thank_You_Page.Email_Sent_Success}</p>
       </div> `;
        } else {
            dialog.alertMessage = `<div class="modal-alert info-alert">
            <p>${this.pageContent.Thank_You_Page.Email_Already}</p>
       </div> `;
        }
        if (source === 'ins') {
            this.insuranceEmailCount = 1;
        } else if (source === 'rem') {
            this.remoRenoEmailCount = 1;
        }
        return dialogRef;
    }
    public redirectToLogin() {
        this._srvStorage.clearStorage();
        this._route.navigate(['/login']);
    }
}
