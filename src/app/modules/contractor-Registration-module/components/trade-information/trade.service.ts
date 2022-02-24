import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs'; import { catchError } from 'rxjs/operators';
import { TradeGroupList, TradeJsonResult } from './trade-model';
import { EditContractor } from 'src/app/core/models/contractor.module';
@Injectable()

export class TradeService {
    public Profile: SessionUser = this._srvAuth.Profile;
    private baseURL: string = environment.api_url;
    public crComments;
    public refreshUser() {
        this.Profile = this._srvAuth.Profile; this.Profile.UserType = this._srvAuth.LoggedInUserType;
    }

    constructor(private _http: HttpClient, private _srvAuth: AuthenticationService) { }
    // get data of phase 1 and phase 2
    public async GetTradeDetails(): Promise<TradeJsonResult> {
        let param = new HttpParams();
        if (this._srvAuth.Profile.ContrID > 0) {
            param = param.append('resourceID', this._srvAuth.Profile.ResourceID.toString());
            param = param.append('contrID', this._srvAuth.Profile.ContrID.toString());
            param = param.append('pageName', 'Trades');
            return this._http.get<TradeJsonResult>(`${this.baseURL}JSON/GetContractorData`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
        else {
            // get phase 1 json data
            param = param.append('resourceId', this._srvAuth.Profile.ResourceID.toString());
            param = param.append('CCOpsID', this._srvAuth.Profile.CCOpsID.toString());
            return this._http.get<TradeJsonResult>(`${this.baseURL}TradeInformation/GetTradeInfo`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
    }

    // get  page data to fill page
    public GetTradeMasterData(): Promise<TradeGroupList[]> {
        const currentLangId = this._srvAuth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('resourceID', this._srvAuth.Profile.ResourceID.toString());
        param = param.append('loggedUserCountryId', this._srvAuth.Profile.CountryID.toString());
        param = param.append('userLanguageID',currentLangId);
        return this._http.get<TradeGroupList[]>(`${this.baseURL}TradeInformation/GetTradeInfoDetails`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // public GetSubOutReasonDropDown(param): Promise<SubOutReason[]> {
    //     return this._http.get<SubOutReason[]>(`${this.baseURL}TradeInformation/GetSubOutReasonDropDown`, { params: param })
    //         .pipe(catchError(this.handleError)).toPromise();
    // }
    // get pending approval json data
    public GetEventPageJson(ContrId: number, resourceId: number, CCopsId: number): Promise<EditContractor[]> {
        let param = new HttpParams();
        param = param.append('contrID', ContrId.toString());
        param = param.append('resourceId', resourceId.toString());
        param = param.append('pageName', 'Trades');
        param = param.append('CCOpsId', CCopsId.toString());
        param = param.append('EventName', this._srvAuth.Profile.EventAlias ? this._srvAuth.Profile.EventAlias : this._srvAuth.Profile.EventName);
        return this._http.get<EditContractor[]>(`${this.baseURL}TradeInformation/GetTradeEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // save data for phase 1
    public async SaveData(objTrade): Promise<number> {
        return this._http.put<number>(`${this.baseURL}TradeInformation/SaveTradeInformation`, objTrade).pipe(catchError(this.handleError)).toPromise();
    }

    public saveInternalData(obj): Promise<number> {
        return this._http.put<number>(`${this.baseURL}JSON/EditJsonDataInternal`, obj).pipe(catchError(this.handleError)).toPromise();
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}