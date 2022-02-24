import { ManageSurgeData } from './model_manage_surge';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { SurgeData, SurgeJSONData } from '../../components/surge-information/model-surge';

export interface User {
    CCOpsID?: number;
    CompanyName?: string;
    ContrID?: number;
    CountryID?: number;
    Email?: string;
    EmployeeFullName?: string;
    IsOwnerPrinciple?: boolean
    JWTToken?: string;
    ResourceID?: number;
    ResourceType?: string;
    USER_TYPE?: string;
}

@Injectable()

export class ManageSurgeService {
    private baseUrlAlt: string = environment.api_url;
    public Profile: User;
    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    // Get Page Json Data
    public getPageJSONData(loginDetails): Promise<SurgeJSONData> {
        if (this.Profile.ContrID > 0) {
            let param = new HttpParams();
            param = param.append('contrID', loginDetails.ContrID.toString());
            param = param.append('resourceId', loginDetails.ResourceID.toString());
            param = param.append('pageName', 'Surge Information Page');
            param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
            param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
            return this._httpClient.get<SurgeJSONData>(`${this.baseUrlAlt}SurgeResponseInfo/GetSurgeEventPageJson`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
    }

    // Get Page Json Data From DB
    public getDBSurgeRes(loginDetails): Promise<SurgeData> {
        const currentLangId = this._srvAuthentication.currentLanguageID;
        let param = new HttpParams();
        param = param.append('contr_ID', loginDetails.ContrID.toString());
        param = param.append('UserLanguageID', currentLangId.toString());
        return this._httpClient.get<SurgeData>(`${this.baseUrlAlt}SurgeResponseInfo/GetSurgeResponseData`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }




    // Get master data for manage surge licence.
    public getManageSurgeLicenceData(loginDetails): Promise<ManageSurgeData> {
        const currentLangId = this._srvAuthentication.currentLanguageID;
        let param = new HttpParams();
        param = param.append('contr_ID', loginDetails.ContrID.toString());
        param = param.append('UserLanguageID', currentLangId.toString());
        return this._httpClient.get<ManageSurgeData>(`${this.baseUrlAlt}SurgeResponseInfo/GetManagaeLicense`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();

    }

    // Save Page Json Data
    public SaveInternalData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}JSON/EditJsonDataInternal`, {
            CCOpsData: JSON.stringify(ccopsData),
            ResourceId: this.Profile.ResourceID,
            Contr_ID: this.Profile.ContrID,
            LoginUserEmail: this.Profile.Email,
            CCOpsID: this.Profile.CCOpsID,
            ContractorResourceNumber: this._srvAuthentication.Profile.ContractorResourceID,
            PageName: 'Surge Information Page'
        }, { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
    }


    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Client Error');
        } else { console.error('Server Error'); }

        // log error.
        return throwError(error);
    }

    // Validate if user is logged in else throw out.
    validateUser(): void {
        if (!this._srvAuthentication.isAuthenticated) { this._srvAuthentication.logout(); return; }
        this.Profile = this._srvAuthentication.Profile;
    }

    public difference(tgt, src) {
        if (Array.isArray(tgt)) { // if you got array
            return tgt; // just copy it
        }
        // if you got object
        const rst = {};
        for (const k in tgt) { // visit all fields
            if (typeof src[k] === 'object' && src[k] != null) { // if field contains object (or array because arrays are objects too)
                rst[k] = this.difference(tgt[k], src[k]); // diff the contents
            } else if (src[k] !== tgt[k]) { // if field is not an object and has changed
                rst[k] = tgt[k]; // use new value
            }
            // otherwise just skip it
        }
        return rst;
    }

    public comparer(otherArray) {
        return (current) => {
            return otherArray.filter((other) => {
                return other.LicenseCompanyName === current.LicenseCompanyName && other.LicenseNumber === current.LicenseNumber && other.LicenseRequiredTypeNumber === current.LicenseRequiredTypeNumber
            }).length === 0;
        }
    }

    public differenceLocation(tgt, src, approvalJSON) {
        if (Array.isArray(tgt)) { // if you got array
            return tgt; // just copy it
        }

        const rst: any = {};
        // if you got object
        for (const k in tgt) { // visit all fields
            if (approvalJSON.hasOwnProperty(k)) {
                if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') {  // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceLocation(tgt[k], src[k], approvalJSON[k]);   // diff the contents
                } else if (approvalJSON[k] !== tgt[k]) {
                    // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            } else {
                if (src[k] !== null && typeof src[k] === 'object') { // if field contains object (or array because arrays are objects too)
                    rst[k] = this.differenceLocation(tgt[k], src[k], approvalJSON[k]); // diff the contents
                } else if (src[k] !== tgt[k]) { // if field is not an object and has changed
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            }

        }
        return rst
    }


    public gridDifferenceCue(tgt, src) {

        // if you got object
        for (const k in tgt) { // visit all fields
            if (typeof src[k] === 'object' && src[k] !== null && tgt[k] !== null) { // if field contains object (or array because arrays are objects too)
                tgt[k] = this.gridDifferenceCue(tgt[k], src[k]); // diff the contents
            } else if (src[k] !== tgt[k]) { // if field is not an object and has changed
                tgt[k + 'Cue'] = true; // use new value
            } else if (src[k] === tgt[k]) { // if field is not an object and has changed
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

}