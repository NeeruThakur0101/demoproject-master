import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ReferenceAndJobType, ReferenceData } from './model_reference';
import { EditContractor } from 'src/app/core/models/contractor.module';

@Injectable()

export class ReferenceDataService {
    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    // DB GET-API for Phase 1 & Phase 2
    public getDbData(loginDetails: SessionUser): Promise<ReferenceData> {
        if (loginDetails.ContrID > 0) { // Phase 2
            const currentLangId = this._srvAuthentication.currentLanguageID;
            let param = new HttpParams();
            param = param.append('resourceId', loginDetails.ResourceID.toString());
            param = param.append('ContrID', loginDetails.ContrID.toString());
            param = param.append('pageName', 'References Information Page');
            param = param.append('UserLanguageID', currentLangId.toString());
            return this._httpClient.get<ReferenceData>(`${this.baseUrlAlt}JSON/GetContractorData`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
        else { // Phase 1
            let param = new HttpParams();
            param = param.append('resourceId', loginDetails.ResourceID.toString());
            param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
            return this._httpClient.get<ReferenceData>(`${this.baseUrlAlt}AddReference/GetReferenceModal`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
    }

    // GET-API for CompleteApplication
    public getCompleteApplication(loginDetails: SessionUser): Promise<ReferenceData> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        return this._httpClient.get<ReferenceData>(`${this.baseUrlAlt}ApplicationType/GetApplicationType`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Financial-Information
    public getFinancialInfo(loginDetails: SessionUser): Promise<ReferenceData> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        return this._httpClient.get<ReferenceData>(`${this.baseUrlAlt}FinancialInfo/GetFinancialInformation`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Contractor JSON Data Phase 2
    public getReferenceTypeData(loginDetails: SessionUser, contractorAppTypeID: string): Promise<ReferenceAndJobType> {
        const currentLangId = this._srvAuthentication.currentLanguageID;
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('contractorAppTypeID', contractorAppTypeID.toString());
        param = param.append('userLanguageID', currentLangId.toString());
        return this._httpClient.get<ReferenceAndJobType>(`${this.baseUrlAlt}AddReference/GetRefData`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Contractor JSON Data Phase 2
    public getEventPageJSON(loginDetails: SessionUser): Promise<EditContractor> {
        let param = new HttpParams();
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('pageName', 'References Information Page');
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
        return this._httpClient.get<EditContractor>(`${this.baseUrlAlt}AddReference/GetReferenceEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Phase 1
    public saveData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}AddReference/SaveReference`, ccopsData
            , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Internal
    public saveInternalData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}JSON/EditJsonDataInternal`, ccopsData
            , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Client Error');
        } else { console.error('Server Error'); }

        // log error.
        return throwError(error);
    }
}

