import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LocationData, LocationDropdownData } from './model_location';
import { EditContractor } from 'src/app/core/models/contractor.module';
@Injectable()

export class LocationDataService {
    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    // DB GET-API for Phase 1 & Phase 2
    public getDbData(loginDetails: SessionUser): Promise<LocationData> {
        if (loginDetails.ContrID > 0) { // Phase 2
            let param = new HttpParams();
            param = param.append('resourceId', loginDetails.ResourceID.toString());
            param = param.append('ContrID', loginDetails.ContrID.toString());
            param = param.append('pageName', 'Contractor Locations Page');
            param = param.append('userLanguageID', this._srvAuthentication.currentLanguageID);
            return this._httpClient.get<LocationData>(`${this.baseUrlAlt}JSON/GetContractorData`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
        else { // Phase 1
            let param = new HttpParams();
            param = param.append('resourceId', loginDetails.ResourceID.toString());
            param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
            return this._httpClient.get<LocationData>(`${this.baseUrlAlt}AddContractorLocation/GetContractorLocation`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }

    }

    // GET-API for ContactDetails
    public getContactData(loginDetails: SessionUser): Promise<LocationData> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        return this._httpClient.get<LocationData>(`${this.baseUrlAlt}ContactInfo/GetContactDetails`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();

    }

    // GET-API for Contractor JSON Data Phase 2
    public getEventPageJSON(loginDetails: SessionUser): Promise<EditContractor> {
        let param = new HttpParams();
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('pageName', 'Contractor Locations Page');
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
        return this._httpClient.get<EditContractor>(`${this.baseUrlAlt}AddContractorLocation/GetLocationEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Dropdown Data
    public getDropdownData(loginDetails): Promise<LocationDropdownData> {
        let param = new HttpParams();
        param = param.append('countryID', loginDetails.CountryID.toString());
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('userLanguageID', this._srvAuthentication.currentLanguageID);
        return this._httpClient.get<LocationDropdownData>(`${this.baseUrlAlt}AddContractorLocation/GetData`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Phase 1
    public saveData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}/AddContractorLocation/SaveContractorLocation`, ccopsData
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

