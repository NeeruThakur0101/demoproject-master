import { AuthenticationService, SessionUser } from './../../../../core/services/authentication.service';
import { Component, OnInit, HostListener, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';
import * as moment from 'moment';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { OwnershipInformationList, SignatureData } from './model_signature';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { SignatureDataService } from './signature.service';

@Component({
    selector: 'app-signature-page',
    templateUrl: './signature-page.component.html',
    styleUrls: ['./signature-page.component.scss'],
})
export class SignaturePageComponent implements OnInit {
    public checkedData: boolean = false;
    public resourceId: number;
    public previousPageData: SignatureData;
    public OwnershipName: string;
    public signatureData: OwnershipInformationList;
    public ContractorSignatureDate: string = '';
    public ContractorSignatureInitials: string = '';
    public save: boolean = false;
    public loggedInUserType: string;
    public OwnershipStructure: number;
    public cachedContrSignInitials: string;
    public loginDetails: Array<SessionUser> = [];;
    public userLoggedIn: string;
    public LoginUserEmail: string;
    public ContrID: number;
    public CCOpsID: number;
    public pageContent: any;
    public pageAccess: boolean = true;
    public initalPattern: RegExp = /^[a-zA-Z].*$/;
    @ViewChild('container', { read: ViewContainerRef, static: false }) containerRef;
    constructor(
        private _route: Router,
        private _srvAuthentication: AuthenticationService,
        private _srvDialog: DialogService,
        public _srvLanguage: InternalUserDetailsService,
        public _srvSignatureData: SignatureDataService,
        public _srvContrRegistration: ContractorRegistrationService,
        private _srvStorage: StorageService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }

    async ngOnInit() {
        this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
        this.loginDetails = Array(this._srvAuthentication.Profile);
        this._srvAuthentication.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Signature Page');

        this.resourceId = this.loginDetails[0].ResourceID;
        this.userLoggedIn = this.loginDetails[0].EmployeeFullName;
        this.LoginUserEmail = this.loginDetails[0].Email;
        this.ContrID = this.loginDetails[0].ContrID;
        this.CCOpsID = this.loginDetails[0].CCOpsID;

        let signatureResponse = await this._srvSignatureData.getDBSignature(this.loginDetails);
        const ownershipReponse = await this._srvSignatureData.getOwnershipData(this.loginDetails);
        signatureResponse = { ...signatureResponse, ...ownershipReponse };
        this.loginData(signatureResponse);
    }

    async loginData(signatureResponse: SignatureData) {
        const masterListData = signatureResponse;

        this.ContractorSignatureInitials = masterListData.ContractorSignatureInitials;
        this.cachedContrSignInitials = masterListData.ContractorSignatureInitials;
        this.ContractorSignatureDate = masterListData.ContractorSignatureDate;
        this.previousPageData = signatureResponse;

        if (signatureResponse.hasOwnProperty('OwnershipDetails')) {
            this.signatureData = signatureResponse.OwnershipDetails.OwnershipInformationList;
            this.OwnershipStructure = signatureResponse.OwnershipDetails.OwnershipStructure;
        }
    }

    // Windows Load
    @HostListener('window:beforeunload', ['$event'])
    doSomething($event) {
        $event.preventDefault();
        $event.returnValue = 'true';
    }

    //  Click Back Button
    async backButtonClick() {
        // this.loader = true;
        if (this.ContractorSignatureInitials !== this.cachedContrSignInitials && this.save !== true) {
            const dialogRef = this._srvDialog.open({
                content: SaveAlertComponent,
                width: 500,
            });

            const dialog = dialogRef.content.instance;
            dialog.header = this.pageContent.Equip_Info.Global_Alert_Header_Warning;
            dialog.alertMessage = ` <div class="modal-alert info-alert">
            <h2>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved} </h2>
            <p>${this.pageContent.Equip_Info.Global_Alert_Data_Unsaved_Stmt}</p>
            </div>`;

            dialogRef.result.subscribe((res) => {
                const resultFromDialog = res;
                if (resultFromDialog['button'] === 'Yes') {
                    this._srvContrRegistration.saveLastPageVisited('validation');
                    this._route.navigate(['/contractorRegistration/validation']);
                }
            });
        } else {
            await this._srvContrRegistration.saveLastPageVisited('validation');
            this._route.navigate(['/contractorRegistration/validation']);
        }
    }

    // Save Next Functionality
    async onSaveNext() {
        if (!this.ContractorSignatureInitials || this.ContractorSignatureInitials.length < 1) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `<div class="modal-alert info-alert">
            ${this.pageContent.Signature_Info.Please_Enter_Initial}
            </div>`;
            return dialogRef;
        } else {
            const saveObj: SignatureData = {
                ContractorSignatureDate: (this.ContractorSignatureDate = moment(Date.now()).format('MM/DD/YYYY')),
                ContractorSignatureInitials: this.ContractorSignatureInitials.trim(),
                ResourceId: this.resourceId,
                CCopsId: this.CCOpsID,
                LastPageVisited: 'signature-page',
            };
            await this._srvSignatureData.saveData(saveObj);
            this.save = true;
        }
    }

    // Click Submit Button
    async submit() {
        if (this.ContractorSignatureInitials.length < 1) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `<div class="modal-alert info-alert">
            ${this.pageContent.Signature_Info.Enter_Inital}
            </div>`;
            return dialogRef;
        } else if (this.save === true) {
            const saveObj: SignatureData = {
                CCOpsData: null,
                LoginUserEmail: this.LoginUserEmail,
                ResourceId: this.resourceId,
                CCopsId: this.CCOpsID,
                LastPageVisited: 'signature-page',
            };

            const submitReponse = await this._srvSignatureData.submitData(saveObj).catch((error) => {
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });

                const dialog = dialogRef.content.instance;
                dialog.alertMessage = ` <div class="modal-alert info-alert">
                <h2>${this.pageContent.Signature_Info.Something_wrong} </h2>
                <p>${this.pageContent.Signature_Info.Please_Contact_Admin}</p>
                </div>`;
                return dialogRef;
            });

            if (submitReponse.body === 0) {
                this.save = true;
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `<div class="modal-alert info-alert">
                ${this.pageContent.Signature_Info.Cannot_Create}
                </div>`;
                return dialogRef;
            } else if (submitReponse.body === 1) {
                this.save = true;
                const dialogRef = this._srvDialog.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                dialog.alertMessage = `<div class="modal-alert info-alert">
              ${this.pageContent.Signature_Info.Created_Not_Sent_Successfully}
                </div>`;
                return dialogRef;
            } else if (submitReponse.body > 1) {
                this._srvStorage.setStorage(submitReponse.body, 'ContractorID');
                this.save = true;
                await this._srvContrRegistration.saveLastPageVisited('thank-you');
                this._route.navigate(['/contractorRegistration/thank-you']);
            }
        }
    }

    // deny access and route to company infoif access not granted
    public accessDenied() {
        const dialogRef = this._srvDialog.open({
            content: DialogAlertsComponent,
            appendTo: this.containerRef,
            width: 500,
        });
        const dialog = dialogRef.content.instance;
        dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                 <h2>${this.pageContent.Signature_Info.Access_Denied}</h2>
                                    <p>${this.pageContent.Signature_Info.Permission}</p>
                                </div>
                            `;
        dialogRef.result.subscribe((res) => {
            this._route.navigate(['/contractorRegistration/company-information']);
        });
        this.pageAccess = false;
    }
    onKeyPress(e, value) {
        if (e.keyCode === 32 && !value.length) e.preventDefault();
    }
}
