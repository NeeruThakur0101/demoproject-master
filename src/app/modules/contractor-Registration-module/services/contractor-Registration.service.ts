import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { DialogService, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Router } from '@angular/router';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ContractorRegistrationService {
    public messageSource = new BehaviorSubject({});
    public loggedInUserType: string;
    public dataFromSaveNext: BehaviorSubject<object> = new BehaviorSubject({});
    public sourceFromReferenceDialog = this.dataFromSaveNext.asObservable();
    public saveReponseNumber: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public dataSource = new BehaviorSubject({});
    public currentMessage = this.messageSource.asObservable();
    public legalModalSource = new BehaviorSubject({});
    public legalModalMetaData = this.legalModalSource.asObservable();
    public saveStateID: BehaviorSubject<number> = new BehaviorSubject(0);
    public addEmployeeDialog: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public saveCoverageProfile: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public ownershipPercentage: BehaviorSubject<number> = new BehaviorSubject(0);
    public ownershipStructure: BehaviorSubject<number> = new BehaviorSubject(null);
    public transmitOwnerShipPercentage = this.ownershipPercentage.asObservable();
    public accumulatedPercentage: number = 0;
    public phoneNumber: string;
    public pageContent: any;
    public companyName: BehaviorSubject<string> = new BehaviorSubject('');
    public filteredData: BehaviorSubject<any> = new BehaviorSubject([]);
    public getRefDataFromSelect = new BehaviorSubject([]);
    public ownershipEmail: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public isDuplicateEmail: boolean = false;
    public phoneNumberExists: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public inactiveOwnershipEmail: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public userFromSignupAdded: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public emailIDRevival: BehaviorSubject<string> = new BehaviorSubject('');
    private baseURL: string = environment.api_url;
    public Profile: SessionUser = this.$auth.Profile;

    public refreshUser() {
        this.Profile = this.$auth.Profile;
        this.Profile.UserType = this.$auth.LoggedInUserType;
    }
    public constructor(
        private $http: HttpClient,
        private dialogService: DialogService,
        private route: Router,
        public $language: InternalUserDetailsService,
        private $auth: AuthenticationService
    ) {
        this.pageContent = this.$language.getPageContentByLanguage();
    }

    public getSelectProgramType(data) {
        this.messageSource.next(data);
    }
    public getContactInformation(data) {
        this.dataSource.next(data);
    }

    public sendSingleSource(data) {
        this.messageSource.next(data);
    }

    public sendLegalModalData(data) {
        this.legalModalSource.next(data);
    }
    public alphanumericEvaluator(event) {
        const keyCode = event.keyCode || event.which;

        // Regex for Valid Characters i.e. Alphabets and Numbers.
        const regex = /^[a-zA-Z0-9 ]*$/;

        // Validate TextBox value against the Regex.
        const isValid = regex.test(String.fromCharCode(keyCode));
        if (!isValid) {
        }
        return isValid;
    }

    // owner/principal duplicacy check
    public ownershipDuplicacyHandle(data, app) {
        const valueArr = [];
        if (data.length) {
            data.map((item) => {
                if (app.app === 'grid') {
                    if (item.IsContractorActive === 'Y' && item.hasOwnProperty('IsDeletedFlag') && (item.IsDeletedFlag === false || item.IsDeletedFlag === null)) {
                        valueArr.push(item.ContactEmail);
                    } else if (item.IsContractorActive === 'Y' && !item.hasOwnProperty('IsDeletedFlag')) {
                        valueArr.push(item.ContactEmail);
                    }
                } else if (app.app === 'signupImport') {
                    if (item.hasOwnProperty('IsDeletedFlag') && (item.IsDeletedFlag === false || item.IsDeletedFlag === null)) {
                        valueArr.push(item.ContactEmail);
                    } else if (!item.hasOwnProperty('IsDeletedFlag')) {
                        valueArr.push(item.ContactEmail);
                    }
                    const isDuplicateOwner = valueArr.some((email) => {
                        return valueArr.indexOf(email) !== app.email;
                    });
                    this.ownershipEmail.next(isDuplicateOwner);
                }
            });
            const isDuplicate = valueArr.some((item, idx) => {
                return valueArr.indexOf(item) !== idx;
            });
            this.ownershipEmail.next(isDuplicate);
        }
    }
    // owner/principal duplicacy check for those who are inactive
    public inactiveOwnerPrincipleDuplicacyCheck(data, emailID) {
        if (data.length) {
            data.map((item) => {
                if (item.IsContractorActive === 'N' && item.ContactEmail === emailID) {
                    this.isDuplicateEmail = true;
                }
            });

            data = [];

            this.inactiveOwnershipEmail.next(this.isDuplicateEmail);
        }
    }
    // total percentage calculation of ownership
    public ownershipPercentageCalculation(data) {
        this.accumulatedPercentage = 0;
        data.forEach((element) => {
            if (element.IsContractorActive === 'Y' && element.hasOwnProperty('IsDeletedFlag') && (element.IsDeletedFlag === false || element.IsDeletedFlag === null)) {
                const parseOwnershipPercentage = parseInt(element.OwnershipPercentage, 10);

                this.accumulatedPercentage += parseOwnershipPercentage;
            } else if (element.IsContractorActive === 'Y' && !element.hasOwnProperty('IsDeletedFlag')) {
                const parseOwnershipPercentage = parseInt(element.OwnershipPercentage, 10);

                this.accumulatedPercentage += parseOwnershipPercentage;
            }
        });

        const found = data.some((phoneNumberElement) => phoneNumberElement.ContrEmployeeTypeId === '' || phoneNumberElement.ContrEmployeeTypeId === null);
        this.phoneNumberExists.next(!found);
        this.ownershipPercentage.next(this.accumulatedPercentage);
    }

    public booleanCheck(o1, o2) {
        if (Array.isArray(o1)) {
            // if you got array
            return o1; // just copy it
        }
        let k;
        let kDiff;
        const diff = {};
        for (k in o1) {
            if (!o1.hasOwnProperty(k)) {
            } else if (typeof o1[k] !== 'object' || typeof o2[k] !== 'object') {
                if (k in o2 && o1[k] !== o2[k]) {
                    diff[k] = true;
                } else {
                    diff[k] = false;
                }
            } else if ((kDiff = this.booleanCheck(o1[k], o2[k]))) {
                diff[k] = kDiff;
            }
        }
        for (k in o2) {
            if (o2.hasOwnProperty(k) && !(k in o1)) {
                diff[k] = o2[k];
            }
        }
        for (k in diff) {
            if (diff.hasOwnProperty(k)) {
                return diff;
            }
        }
        return false;
    }

    public difference(tgt, src) {
        if (Array.isArray(tgt)) {
            // if you got array
            return tgt; // just copy it
        }

        // if you got object
        const rst = {};
        for (const k in tgt) {
            // visit all fields
            if (src[k] !== null && typeof src[k] === 'object') {
                // if field contains object (or array because arrays are objects too)
                rst[k] = this.difference(tgt[k], src[k]); // diff the contents
            } else if (src[k] !== tgt[k]) {
                // if field is not an object and has changed
                rst[k] = tgt[k]; // use new value
            }
            // otherwise just skip it
        }
        return rst;
    }

    public differenceCompany(tgt, src, approvalJSON) {
        if (Array.isArray(tgt)) {
            // if you got array
            return tgt; // just copy it
        }
        // if you got object
        const rst = {};
        for (const k in tgt) {
            // visit all fields
            if (approvalJSON.hasOwnProperty(k)) {
                if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceCompany(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (approvalJSON[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            } else {
                if (src[k] !== null && typeof src[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceCompany(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (src[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            }
        }
        return rst;
    }

    public gridDifferenceCue(tgt, src) {
        // if you got object
        for (const k in tgt) {
            // visit all fields
            if (typeof src[k] === 'object' && src[k] !== null && tgt[k] !== null) {
                // if field contains object (or array because arrays are objects too)
                tgt[k] = this.gridDifferenceCue(tgt[k], src[k]); // diff the contents
            } else if (src[k] !== tgt[k]) {
                // if field is not an object and has changed
                tgt[k + 'Cue'] = true; // use new value
            } else if (src[k] === tgt[k]) {
                // if field is not an object and has changed
                tgt[k + 'Cue'] = false; // use new value
            }
            // otherwise just skip it
        }

        for (const k in src) {
            if (src.hasOwnProperty(k) && !(k in tgt)) {
                tgt[k] = src[k];
            }
        }
        return tgt;
    }

    public booleanCheckGrid(o1, o2) {
        let kDiff;
        const diff = {};
        for (const k in o1) {
            if (!o1.hasOwnProperty(k)) {
            } else if (typeof o1[k] !== 'object' || typeof o2[k] !== 'object') {
                if (k in o2 && o1[k] !== o2[k]) {
                    diff[k + 'Cue'] = true;
                } else {
                    diff[k + 'Cue'] = false;
                }
            } else if ((kDiff = this.booleanCheckGrid(o1[k], o2[k]))) {
                diff[k] = kDiff;
            }
        }
        for (const k in o2) {
            if (o2.hasOwnProperty(k) && !(k in o1)) {
                diff[k] = o2[k];
            }
        }
        for (const k in diff) {
            if (diff.hasOwnProperty(k)) {
                return diff;
            }
        }
        return false;
    }

    public gridDifference(tgt, src, approvalJSON) {
        if (Array.isArray(tgt)) {
            // if you got array
            return tgt; // just copy it
        }

        // if you got object
        const rst = {};
        // tslint:disable-next-line:forin
        for (const k in tgt) {
            // visit all fields
            if (k === 'VeteranMilitaryAffiliationData') {
                rst[k] = tgt[k];
                continue;
            }
            if (approvalJSON.hasOwnProperty(k)) {
                if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.gridDifference(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (approvalJSON[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            } else {
                if (typeof src[k] === 'object' && src[k] !== null) {
                    // if field contains object (or array because arrays are objects too)
                    rst[k] = this.gridDifference(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (k !== 'ID' && k !== 'OwnershipNumber' && src[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                } else if (k === 'OwnershipNumber' || k === 'ID') {
                    rst[k] = tgt[k];
                }
                // otherwise just skip it
            }
        }
        return rst;
    }

    public gridDifferenceInternal(tgt, src) {
        // if you got object
        const rst = {};
        // tslint:disable-next-line:forin
        for (const k in tgt) {
            // visit all fields
            if (k === 'VeteranMilitaryAffiliationData') {
                rst[k] = tgt[k];
                continue;
            }
            if (typeof src[k] === 'object' && src[k] !== null) {
                // if field contains object (or array because arrays are objects too)
                rst[k] = this.gridDifferenceInternal(tgt[k], src[k]); // diff the contents
            } else if (k !== 'ID' && k !== 'OwnershipNumber' && src[k] !== tgt[k]) {
                // if field is not an object and has changed
                rst[k] = tgt[k]; // use new value
            }
            // else if (k === 'OwnershipNumber' || k === 'ID' || k === 'ContractorVeteranEmployeeNumber' || k === 'MilitaryAffiliationName' || k === 'MilitaryAffiliationNumber') {
            //     rst[k] = tgt[k];
            // }
            else if (k === 'OwnershipNumber' || k === 'ID' || k === 'ContractorVeteranEmployeeNumber' || k === 'MilitaryAffiliationName' || k === 'MilitaryAffiliationNumber') {
                rst[k] = tgt[k];
            }
            // otherwise just skip it
        }
        return rst;
    }

    public funcInternalUserGoDirectlyToContractorPage(data, keyName) {
        this.loggedInUserType = this.$auth.LoggedInUserType;
        // this bunch of code is used when logged in user is internal and wants to go directly to the page of contractor
        // and user has not filled up this page

        if (this.loggedInUserType === 'Internal' && (data === null || data.length === 0)) {
            const dialogRef = this.dialogService.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = ` <div class="modal-alert info-alert">
            <p>${this.pageContent.General_Keys.General_No_Data}</p>
           </div>`;
            dialogRef.result.subscribe((r) => {
                if (r instanceof DialogCloseResult) {
                    this.route.navigate(['/contractorRegistration/company-information']);
                } else {
                    if (r['button'] === 'Yes') {
                        this.route.navigate(['/contractorRegistration/company-information']);
                    }
                }
            });
        }
    }

    public checkPrimaryOwner(ownershipList, ownerRole): boolean {
        const userList = [];
        const translatedUserList = [];
        let isDuplicatePrimaryOwner: boolean;
        ownershipList.forEach((owner) => {
            if (owner.IsContractorActive === 'Y' && (!owner.hasOwnProperty('IsDeletedFlag') || owner.IsDeletedFlag === false || owner.IsDeletedFlag === null)) {
                userList.push(owner.ContrEmployeeTypeId);
            }
        });
        // have to add this because of the translation
        for (const roleObject of ownerRole) {
            userList.forEach((user) => {
                if (user === roleObject.ContractorEmployeeTypeTranslated) translatedUserList.push(roleObject.ContractorEmployeeType);
            });
        }
        isDuplicatePrimaryOwner = translatedUserList.includes('Primary Owner' || 9);
        return isDuplicatePrimaryOwner;
    }

    public saveLastPageVisited(pageName: string): Promise<number> {
        const obj = {
            ResourceId: this.$auth.Profile.ResourceID,
            CCopsId: this.$auth.Profile.CCOpsID,
            LastPageVisited: pageName,
            EventName: this.$auth.Profile.EventName,
            PageName: pageName,
            isInternal: false,
            ContractorResourceID: this.$auth.Profile.ResourceID,
            ContrID: this.$auth.Profile.ContrID,
            EventTypeID: this.$auth.Profile.EventTypeID,
        };
        return this.$http.put<number>(`${this.baseURL}JSON/UpdateLastPageVisited`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}
