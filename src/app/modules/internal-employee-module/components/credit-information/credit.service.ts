import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs'; import { catchError } from 'rxjs/operators';
import { ActionRating, CreditList } from './credit-interface.model';
@Injectable()

export class CreditService {
    public Profile: SessionUser = this._srvAuth.Profile;
    private baseURL: string = environment.api_url;
    public crComments;
    public currentLangId : string;
    public refreshUser() {
        this.Profile = this._srvAuth.Profile; this.Profile.UserType = this._srvAuth.LoggedInUserType;
    }
    constructor(private _srvHttp: HttpClient, private _srvAuth: AuthenticationService) {
        this.currentLangId = this._srvAuth.currentLanguageID;
     }

    public GetCreditGridData(ContrID): Promise<CreditList[]> {
        let param = new HttpParams();
        param = param.append('RunType','GRID');
        param = param.append('Contr_ID',ContrID.toString());
        param = param.append('CRRPT_ID_NB','0');
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<CreditList[]>(`${this.baseURL}CreditInfo/GetCreditGridData`,{params : param})
            .pipe(catchError(this.handleError)).toPromise();
    }

    // get page data for phase 1 and phase 2
    public async GetActionRatingDropdown(): Promise<ActionRating[]> {
        let param = new HttpParams();
        param = param.append('RunType','DropDown');
        param = param.append('Contr_ID','0');
        param = param.append('CRRPT_ID_NB','0');
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<ActionRating[]>(`${this.baseURL}CreditInfo/GetCreditDropdown`,{params : param})
            .pipe(catchError(this.handleError)).toPromise();
    }

    // save data
    public async SaveCreditData(objCredit): Promise<number> {
        return this._srvHttp.post<number>(`${this.baseURL}CreditInfo/InsertCreditInfo`, objCredit).pipe(catchError(this.handleError)).toPromise();
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}