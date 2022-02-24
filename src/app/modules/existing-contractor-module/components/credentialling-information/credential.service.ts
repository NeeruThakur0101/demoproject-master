import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { ApiService } from 'src/app/core/services/http-service';
import { environment } from 'src/environments/environment';
import { Attendees, CredentialingGridData, CredentialTabNames, EmployeeList, Vendors } from '../credentialling-information/credentialing.model';

@Injectable()
export class CredentialService {
    public loadTraining: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public changesExist: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public tabNow: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public tabChanged: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public baseURL: string = environment.api_url;
    public loginDetails: Array<SessionUser> = []; // Array<LoginUser>;;
    public loggedInUserType = this.$auth.LoggedInUserType;
    public loginDetailsInternal: SessionUser;
    public crComments = [];
    public timeStamp: Date;

    constructor(private $http: HttpClient, private $auth: AuthenticationService, private $contrDataSrv: ContractorDataService, private $ApiSrv: ApiService) { }

    public getUser() {
        this.loginDetails = Array(this.$auth.Profile);
        this.loggedInUserType = this.$auth.LoggedInUserType;
        this.loginDetailsInternal = this.$auth.ProfileInternal;
    }

    public getApprovalData(): Promise<EditContractor[]> {
        let param = new HttpParams();
        param = param.append('contrID', this.$auth.Profile.ContrID.toString());
        param = param.append('resourceId', this.$auth.Profile.ResourceID.toString());
        param = param.append('pageName', 'Credentialing Information Page');
        param = param.append('CCOpsId', this.$auth.Profile.CCOpsID.toString());
        param = param.append('EventName', this.$auth.Profile.EventAlias ? this.$auth.Profile.EventAlias : this.$auth.Profile.EventName);
        return this.$http.get<EditContractor[]>(`${this.baseURL}CredentialingInfoPage/GetCredentialingInfoEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public async getCredentialComments() {
        this.crComments = await this.$contrDataSrv.getPageComments('Credentialing Information'); // Page name
    }
    public getTabs(): Promise<CredentialTabNames[]> {
        const currentLangId = this.$auth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('userLanguageID', currentLangId);
        const Url: string = `${this.baseURL}CredentialingInfoPage/GetCredentialingTabs`;
        return this.$http.get<CredentialTabNames[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public getVendors(): Promise<Vendors[]> {
        const Url: string = `${this.baseURL}CredentialingInfoPage/GetVenderDropDown`;
        return this.$http.get<Vendors[]>(Url).pipe(catchError(this.handleError)).toPromise();
    }
    public saveLicensesInternalData(obj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}JSON/EditJsonDataInternal`, obj).pipe(catchError(this.handleError)).toPromise();
    }
    public saveInsuranceInternalData(obj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}JSON/EditJsonDataInternal`, obj).pipe(catchError(this.handleError)).toPromise();
    }
    public saveCertificate(obj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}CredentialingInfoPage/SaveCertificateData`, obj).pipe(catchError(this.handleError)).toPromise();
    }
    public saveTechnicalData(_technicalObj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}CredentialingInfoPage/SaveTechnicalData`, _technicalObj).pipe(catchError(this.handleError)).toPromise();
    }
    public saveTrainingData(_trainingObj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}CredentialingInfoPage/SaveTrainingData`, _trainingObj).pipe(catchError(this.handleError)).toPromise();
    }
    public saveAdditionalData(_additionalObj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}CredentialingInfoPage/SaveAdditionalData`, _additionalObj).pipe(catchError(this.handleError)).toPromise();
    }
    public saveViewAttendeesData(_attendeesObj): Promise<number> {
        return this.$http.put<number>(`${this.baseURL}CredentialingInfoPage/SaveTraineeAttendeesData`, _attendeesObj).pipe(catchError(this.handleError)).toPromise();
    }
    public getTabsGridData(CredentialingMetricGroupID: number): Promise<CredentialingGridData> {
        const currentLangId = this.$auth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('CredentialingMetricGroupID', CredentialingMetricGroupID.toString());
        param = param.append('contr_id', this.$auth.Profile.ContrID.toString());
        param = param.append('userLanguageID', currentLangId);
        const Url: string = `${this.baseURL}CredentialingInfoPage/GetCredentialingInfo`;
        return this.$http.get<CredentialingGridData>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public getTraineeAttendeesPopupData(): Promise<EmployeeList[]> {
        const currentLangId = this.$auth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('contr_ID', this.$auth.Profile.ContrID.toString());
        param = param.append('userLanguageID', currentLangId);
        const Url: string = `${this.baseURL}CredentialingInfoPage/GetTraineeAttendeesDropDown`;
        return this.$http.get<EmployeeList[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public getTraineeAttendeesData(credentialingTrackingID): Promise<Attendees[]> {
        const currentLangId = this.$auth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('credentialingTrackingID', credentialingTrackingID.toString());
        param = param.append('contr_ID', this.$auth.Profile.ContrID.toString());
        param = param.append('userLanguageID', currentLangId);
        const Url: string = `${this.baseURL}CredentialingInfoPage/GetTraineeAttendeesData`;
        return this.$http.get<Attendees[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public putApprovalData(old, newGrid) {

        const newData = {};
        for (const key in old) {
            if (key === 'LicenseNumber') {
                newData[key] = newGrid[key];
                newData['is' + key] = true;
                newData['IsRowDisable'] = newGrid['IsRowDisable'] === true ? true : false;
            } else {
                newData[key] = old[key];
            }
        }
        return newData;
    }

    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Side Error') : console.error('Server Side Error');
        return throwError(error);
    }
    getServerTime(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.$ApiSrv.get('JSON/GetServerTimeStamp').subscribe((res) => {
                this.timeStamp = res;
                resolve(res);
            });
        });
    }
    public validateDate(testdate) {
        const dateRegex = /^(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])\-(19|20)\d{2}$/;
        return dateRegex.test(testdate);
    }
    public validateDateChk(testdate) {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
        return dateRegex.test(testdate);
    }
    public async internalObjCreation(db, chng, tab?) {
        const rst = {};
        let ctr = 0;
        await this.getServerTime();
        delete chng.isExpirationDate;
        delete chng.isLicenseNumber;
        const loggedInUserResourceId = this.$auth.LoggedInUserType === 'Internal' ? this.$auth.ProfileInternal.ResourceID : this.$auth.Profile.ResourceID;
        for (const k in chng) {
            if (typeof chng[k] === 'object' && chng[k] !== null) {
                rst[k] = this.internalObjCreation(db[k], chng[k]);
            } else if (k !== 'LicenseNumber' && k !== 'ExpirationDate' && k !== 'Due') {
                if ((k === 'CreatedDate' || k === 'CreatedResourceID') && (db['CreatedDate'] == null || db['CreatedResourceID'] == null)) {
                    rst[k] = k === 'CreatedResourceID' ? loggedInUserResourceId : this.timeStamp;
                } else if ((k === 'UpdatedDate' || k === 'UpdatedResourceID') && (db['CreatedDate'] !== null || db['CreatedResourceID'] !== null)) {
                    rst[k] = k === 'UpdatedResourceID' ? loggedInUserResourceId : this.timeStamp;
                } else {
                    rst[k] = db[k];
                }
            } else if (chng[k] !== db[k]) {
                ctr++;
                rst[k] = chng[k];
            }
        }
        return ctr > 0 ? rst : {};
    }
    public async contractorObjCreation(tgt, src, approvalJSON = {}) {
        if (Array.isArray(tgt)) {
            return tgt;
        }
        const rst = {};
        let ctr = 0;
        await this.getServerTime();
        delete tgt.isExpirationDate;
        delete tgt.isLicenseNumber;
        const loggedInUserResourceId = this.$auth.LoggedInUserType === 'Internal' ? this.$auth.ProfileInternal.ResourceID : this.$auth.Profile.ResourceID;
        for (const k in tgt) {
            // visit all fields
            if (k === 'ExpirationDate' || k === 'Due') {
                continue;
            } else if ((k === 'CreatedDate' || k === 'CreatedResourceID') && (tgt['CreatedDate'] == null || tgt['CreatedResourceID'] == null)) {
                rst[k] = k === 'CreatedResourceID' ? loggedInUserResourceId : this.timeStamp;
            } else if ((k === 'UpdatedDate' || k === 'UpdatedResourceID') && (tgt['CreatedDate'] !== null || tgt['CreatedResourceID'] !== null)) {
                rst[k] = k === 'UpdatedResourceID' ? loggedInUserResourceId : this.timeStamp;
            } else if (k !== 'LicenseNumber') {
                rst[k] = tgt[k];
            } else {
                if (approvalJSON && approvalJSON.hasOwnProperty(k)) {
                    if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {
                        rst[k] = this.contractorObjCreation(tgt[k], src[k], approvalJSON[k]);
                    } else if (approvalJSON[k] !== tgt[k]) {
                        ctr++;
                        rst[k] = tgt[k]; // use new value
                    }
                    // otherwise just skip it
                } else {
                    if (typeof src[k] === 'object' && src[k] !== null) {
                        // if field contains object (or array because arrays are objects too)
                        rst[k] = this.contractorObjCreation(tgt[k], src[k], approvalJSON[k]); // diff the contents
                    } else if (src[k] !== tgt[k]) {
                        // if field is not an object and has changed
                        ctr++;
                        rst[k] = tgt[k]; // use new value
                    }
                    // otherwise just skip it
                }
            }
        }
        return ctr > 0 ? rst : {};
    }


}
