import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FinancialData } from './model_financial';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { LoginUser } from 'src/app/core/models/user.model';

@Injectable()

export class FinancialeDataService {
    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    // DB GET-API for Phase 1 & Phase 2
    public getDbData(loginDetails: SessionUser): Promise<FinancialData> {
        if (loginDetails.ContrID > 0) { // Phase 2

            let param = new HttpParams();
            param = param.append('resourceId', loginDetails.ResourceID.toString());
            param = param.append('ContrID', loginDetails.ContrID.toString());
            param = param.append('pageName', 'Financial Information Page');
            return this._httpClient.get<FinancialData>(`${this.baseUrlAlt}JSON/GetContractorData`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
        else { // Phase 1
            let param = new HttpParams();
            param = param.append('resourceID', loginDetails.ResourceID.toString());
            param = param.append('CCOpsId', loginDetails.CCOpsID.toString());
            return this._httpClient.get<FinancialData>(`${this.baseUrlAlt}FinancialInfo/GetFinancialInformation`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
    }

    // GET-API for Company Page Data
    public getCompanyData(loginDetails: SessionUser): Promise<FinancialData> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        return this._httpClient.get<FinancialData>(`${this.baseUrlAlt}CompanyInfo/GetCompanyDetails`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Contractor JSON Data Phase 2
    public getEventPageJSON(loginDetails: SessionUser): Promise<EditContractor> {
        let param = new HttpParams();
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('pageName', 'Financial Information Page');
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
        return this._httpClient.get<EditContractor>(`${this.baseUrlAlt}FinancialInfo/GetFinancialInfoEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public getFinancialReview(loginDetails: SessionUser): Promise<FinancialData> {
        let param = new HttpParams();
        param = param.append('Contr_ID', loginDetails.ContrID.toString());
        return this._httpClient.get<FinancialData>(`${this.baseUrlAlt}FinancialInfo/GetFinancialReview`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Phase 1
    public saveData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}FinancialInfo/SaveFinancialInformation`, ccopsData
            , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
    }

    // POST-API Financial Review
    public saveFinancialReview(ccopsData): Promise<any> {
        return this._httpClient.post<HttpResponse<object>>(`${this.baseUrlAlt}FinancialInfo/InsertFinancialReview`, ccopsData
            , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Internal
    public saveInternalData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}/JSON/EditJsonDataInternal`, ccopsData
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

