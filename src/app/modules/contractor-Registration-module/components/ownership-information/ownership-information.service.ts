import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';
import { OwnDataModel, OwnershipObject } from './ownership.model';

@Injectable({
    providedIn: 'root',
})
export class OwnershipInformationService {
    public timeStamp: any;
    constructor(private _http: HttpClient, private _srvAuthentication: AuthenticationService) {}
    // to handle error
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

    getServerTime(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._http.get(`${environment.api_url}JSON/GetServerTimeStamp`).subscribe((res) => {
                this.timeStamp = res;
                resolve(res);
            });
        });
    }

    // to get ownership data model
    public getOwnData(resourceId, userLanguageID): Promise<OwnDataModel> {
        let params = {
            params: {
                resourceID: resourceId,
                userLanguageID: userLanguageID,
            },
        };
        let url = `OwnershipInformation/GetOwnData`;
        // let url = `OwnershipInformation/GetOwnData/${resourceId}`
        return this._http.get<OwnDataModel>(`${environment.api_url}${url}`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // to get ownership details
    public getOwnershipDetails(url, params = {}): Promise<OwnershipObject> {
        return this._http.get<OwnershipObject>(`${environment.api_url}${url}`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // to get company details
    public getCompanyDetails(params = {}): Promise<any> {
        let url = 'CompanyInfo/GetCompanyDetails';
        return this._http.get<any>(`${environment.api_url}${url}`, params).pipe(catchError(this.handleError)).toPromise();
    }

    // to save ownership data
    public putOwnerShipData(putObject): Promise<number> {
        const url = `OwnershipInformation/SaveOwnershipDetails`;
        return this._http.put<number>(`${environment.api_url}${url}`, putObject).pipe(catchError(this.handleError)).toPromise();
    }

    //  to get page event
    public getEventPageJSON(ContrID?, resourceId?, CCopsId?): Promise<EditContractor[]> {
        let param = new HttpParams();
        param = param.append('contrID', ContrID.toString());
        param = param.append('resourceId', resourceId.toString());
        param = param.append('pageName', 'Ownership Information Page');
        param = param.append('CCOpsId', CCopsId.toString());
        param = param.append('IsOwnerDisable', (this._srvAuthentication.LoggedInUserType === 'Internal' ? true : false).toString());
        param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
        return this._http.get<EditContractor[]>(`${environment.api_url}OwnershipInformation/GetOwnershipEventJson`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // Get contractor changes for legal
    public getContractorLegalChanges(ContrID?, resourceId?, CCopsId?): Promise<any> {
        const params = {
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
}
