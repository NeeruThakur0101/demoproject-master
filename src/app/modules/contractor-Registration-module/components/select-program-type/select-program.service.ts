import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs'; import { catchError } from 'rxjs/operators';
import { ApplicationType } from './application-model';
@Injectable()

export class SelectProgramService {
    public Profile: SessionUser = this._srvAuth.Profile;
    private baseURL: string = environment.api_url;
    public crComments;
    public refreshUser() {
        this.Profile = this._srvAuth.Profile; this.Profile.UserType = this._srvAuth.LoggedInUserType;
    }
    constructor(private _http: HttpClient, private _srvAuth: AuthenticationService) { }

    public async GetApplicationType(): Promise<ApplicationType> {
        let param = new HttpParams();
        if(this._srvAuth.Profile.ContrID > 0)
        {
            const currentLangId = this._srvAuth.currentLanguageID;
            param = param.append('resourceID', this._srvAuth.Profile.ResourceID.toString());
            param = param.append('contrID', this._srvAuth.Profile.ContrID.toString());
            param = param.append('pageName','Complete Application Page');
            param = param.append('userLanguageID',currentLangId);
            return this._http.get<ApplicationType>(`${this.baseURL}JSON/GetContractorData`,{params : param})
            .pipe(catchError(this.handleError)).toPromise();
        }
        else
        {
            param = param.append('resourceId', this._srvAuth.Profile.ResourceID.toString());
            param = param.append('CCOpsID', this._srvAuth.Profile.CCOpsID.toString());
            return this._http.get<ApplicationType>(`${this.baseURL}ApplicationType/GetApplicationType`,{params: param})
                .pipe(catchError(this.handleError)).toPromise();
        }
    }

    public async GetAppTypeMasterData() : Promise<any> {
        const currentLanguageId = this._srvAuth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('resourceID',this._srvAuth.Profile.ResourceID.toString());
        param = param.append('userLanguageID',currentLanguageId);
        return this._http.get<any>(`${this.baseURL}ApplicationType/GetAppType`,{params : param})
        .pipe(catchError(this.handleError)).toPromise();
    }

    public async SaveData(objProgram): Promise<number> {
        return this._http.put<number>(`${this.baseURL}ApplicationType/SaveApplicationType`, objProgram).pipe(catchError(this.handleError)).toPromise();
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}