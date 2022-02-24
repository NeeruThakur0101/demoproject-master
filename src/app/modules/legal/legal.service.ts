import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LegalIssueType, Control, County, LegalPage, OwnershipList } from './models';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';

@Injectable()
export class LegalService {
    public Profile: SessionUser = this._srvAuthentication.Profile;
    LegalPage: LegalPage = { loadingState: false };
    private baseURL: string = environment.api_url;
    public crComments;
    private languageId: number = this._srvAuthentication.currentLanguageID;
    public refreshUser() {
        this.Profile = this._srvAuthentication.Profile;
        this.Profile.UserType = this._srvAuthentication.LoggedInUserType;
    }

    public getLoadingState() {
        return this.LegalPage.loadingState;
    }
    public async getLegalComments() {
        this.crComments = await this._srvContractorData.getPageComments('Legal Questions');
    }
    constructor(private _http: HttpClient, private _srvAuthentication: AuthenticationService, private _srvContractorData: ContractorDataService) { }

    // Get LegalIssueTypes
    public getLegalIssueTypes(): Promise<LegalIssueType[]> {
        let params: {} = {
            params: {
                resourceID: this._srvAuthentication.Profile.ResourceID,
                userLanguageID: this.languageId,
            },
        };
        return this._http.get<LegalIssueType[]>(`${this.baseURL}LegalIssue/GetLegalItemInfo`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Get form control configuration for LegalIssueType
    getFormConfigByLegalIssueType(legalIssueTypeID: number): Promise<Control[]> {
        let params: {} = {
            params: {
                legalIssueTypeID: legalIssueTypeID,
                countryID: this._srvAuthentication.Profile.CountryID,
                resourceID: this._srvAuthentication.Profile.ResourceID,
                userLanguageID: this.languageId,
            },
        };
        return this._http.get<Control[]>(`${this.baseURL}LegalIssue/GetLegalItemDetail`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Get Page Json Data
    public getPageJSONData(params): Promise<any> {
        if (this._srvAuthentication.Profile.ContrID > 0) {
            let URL = `${this.baseURL}JSON/GetContractorData`;
            return this._http.get<any>(URL, params).pipe(catchError(this.handleError)).toPromise();
        } else {
            let URL: string = `${this.baseURL}LegalIssue/GetLegalIssueDetails`;
            return this._http.get<any>(URL, params).pipe(catchError(this.handleError)).toPromise();
        }
    }

    // Get contractor changes
    public getContractorChanges(ContrID?, resourceId?, CCopsId?): Promise<any> {
        let params = {
            params: {
                contrID: ContrID,
                resourceID: resourceId,
                pageName: 'Legal Item Information Page',
                CCOpsId: CCopsId,
                EventName: this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName,
            },
        };
        return this._http.get<any>(`${environment.api_url}LegalIssue/GetLegalEventJson`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Save Page Json Data
    public async SaveData(str = null): Promise<number> {
        const apiData: OwnershipList = {
            OwnershipInformationList: this.LegalPage.PageObj,
            ResourceId: this._srvAuthentication.Profile.ResourceID,
            CCopsId: this.Profile.CCOpsID,
            LastPageVisited: str ? str : 'legal-questions',
        };
        return this._http.put<number>(`${this.baseURL}LegalIssue/SaveLegalIssueDetails`, apiData).pipe(catchError(this.handleError)).toPromise();
    }

    // Save, Edit or Delete entries for Contractor
    async ContractorDataOperation(data, str) {
        if (data && data.LegalInformationPage.ContractorLegalIssue.length === 0) {
            data = null;
        }
        return await this._srvContractorData.saveContractorData({ currentPage: 'Legal Item Information Page', nextPage: str }, data, 'LegalIssue/EditEventLegalInfo');
    }

    // Save, Edit or Delete entries for Internal User
    public EditInternalData(obj: any): Promise<any> {
        return this._http
            .put<any>(`${this.baseURL}JSON/LegalIssueEditInternalEmp`, {
                Contr_ID: this._srvAuthentication.Profile.ContrID,
                ResourceId: this._srvAuthentication.ProfileInternal.ResourceID,
                CCOpsID: this.Profile.CCOpsID,
                CCOpsData: JSON.stringify(obj),
                PageName: 'Legal Item Information Page',
            })
            .pipe(catchError(this.handleError))
            .toPromise();
    }

    // Get county list for state
    public getCountiesByStateID(stateID: number): Promise<County[]> {
        let params: {} = {
            params: {
                stateProvinceID: stateID,
                countryID: this.Profile.CountryID,
                resourceID: this.Profile.ResourceID,
                userLanguageID: this.languageId,
            },
        };
        return this._http.get<County[]>(`${this.baseURL}LegalIssue/GetCountyData`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}
