import { Injectable } from '@angular/core';
import { LoginUser } from 'src/app/core/models/user.model';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { SurgeData, SurgeDropDownData, SurgeJSONData } from './model-surge';

@Injectable()

export class SurgeInfoDataService {

    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    public compareToApplyVisualCue(target): Promise<any> {
        return new Promise((resolve, reject) => {
            const differKeys = {};
            // tslint:disable-next-line:forin
            for (const k in target) {
                differKeys[k] = target[k];
            }
            resolve(differKeys)
        });
    }

    public differenceSurge(tgt, src, approvalJSON) {
        // if you got object
        if (Object.keys(approvalJSON).length > 0) {
            approvalJSON = approvalJSON.SurgeResponseInformation
        } else {
            approvalJSON = approvalJSON
        }

        const rst = {};
        for (const k in tgt) { // visit all fields
            if (k !== 'SurgeResponseDetail' && k !== 'ManageSurgeLicenses' && k !== 'RemovedSurgeReponseDetail') {
                if (approvalJSON.hasOwnProperty(k)) {
                    if (approvalJSON[k] !== null && typeof approvalJSON[k] === 'object') { // if field contains object (or array because arrays are objects too)
                        rst[k] = this.differenceSurge(tgt[k], src[k], approvalJSON[k]); // diff the contents
                    } else if (approvalJSON[k] !== tgt[k]) { // if field is not an object and has changed
                        rst[k] = tgt[k]; // use new value
                    }
                    // otherwise just skip it
                } else {
                    if (src[k] !== null && typeof src[k] === 'object') { // if field contains object (or array because arrays are objects too)
                        rst[k] = this.differenceSurge(tgt[k], src[k], approvalJSON[k]); // diff the contents
                    } else if (src[k] !== tgt[k]) { // if field is not an object and has changed
                        rst[k] = tgt[k]; // use new value
                    }
                    // otherwise just skip it
                }
            }

        }
        return rst;
    }

    // GET-API for dropdown data
    public getDropDownData(loginDetails: SessionUser): Promise<SurgeDropDownData> {
        const currentLangId = this._srvAuthentication.currentLanguageID;
        let param = new HttpParams();
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('UserLanguageID', currentLangId.toString());
        return this._httpClient.get<SurgeDropDownData>(`${this.baseUrlAlt}SurgeResponseInfo/GetSurgeResDropdown`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for surge DB data
    public getDBData(loginDetails: SessionUser): Promise<SurgeData> {
        let param = new HttpParams();
        param = param.append('contr_ID', loginDetails.ContrID.toString());
        return this._httpClient.get<SurgeData>(`${this.baseUrlAlt}SurgeResponseInfo/GetSurgeResponseData`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Contractor JSON Data Phase 2
    public getEventPageJSON(loginDetails: SessionUser): Promise<SurgeJSONData> {
        let param = new HttpParams();
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('pageName', 'Surge Information Page');
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
        return this._httpClient.get<SurgeJSONData>(`${this.baseUrlAlt}SurgeResponseInfo/GetSurgeEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
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



