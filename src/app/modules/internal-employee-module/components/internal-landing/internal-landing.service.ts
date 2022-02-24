import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs'; import { catchError } from 'rxjs/operators';
import { AppStarted, AppSubmitted, AppUpdate, CallsTab, ContractorReassign, CoverageArea, LegalIssue, MedalionCount, ProfileChange, Recerts } from './internal-landing.model';
@Injectable()

export class InternalLandingService {
    public Profile: SessionUser = this._srvAuth.Profile;
    private baseURL: string = environment.api_url;
    private currentLangId : string;

    constructor(private _srvHttp: HttpClient, private _srvAuth: AuthenticationService) {
        this.currentLangId = this._srvAuth.currentLanguageID;
     }

    public GetAppsSubmitted(internalResourceId: number): Promise<AppSubmitted[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<AppSubmitted[]>(`${this.baseURL}InternalLandingPage/GetAppsSubmitted`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetAppsUpdateSubmitted(internalResourceId: number): Promise<AppUpdate[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<AppUpdate[]>(`${this.baseURL}InternalLandingPage/GetAppsUpdateSubmitted`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetInternalAppsStarted(internalResourceId: number): Promise<AppStarted[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<AppStarted[]>(`${this.baseURL}InternalLandingPage/GetInternalAppsStarted`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetAppsUpdateStarted(internalResourceId: number): Promise<AppUpdate[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<AppUpdate[]>(`${this.baseURL}InternalLandingPage/GetAppsUpdateStarted`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetLandingProfileChangeTab(internalResourceId: number): Promise<ProfileChange[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<ProfileChange[]>(`${this.baseURL}InternalLandingPage/GetLandingProfileChangeTab`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetLandingCallsTab(internalResourceId: number): Promise<CallsTab[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<CallsTab[]>(`${this.baseURL}InternalLandingPage/GetLandingCallsTab`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetLandingLegalIssueTab(internalResourceId: number): Promise<LegalIssue[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<LegalIssue[]>(`${this.baseURL}InternalLandingPage/GetLandingLegalIssueTab`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetLandingCoverageProfileChangeTab(internalResourceId: number): Promise<CoverageArea[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<CoverageArea[]>(`${this.baseURL}InternalLandingPage/GetLandingCoverageProfileChangeTab`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }
    public GetLandingRecertTab(internalResourceId: number): Promise<Recerts[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('userLanguageID',this.currentLangId);
        return this._srvHttp.get<Recerts[]>(`${this.baseURL}InternalLandingPage/GetLandingRecertTab`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }
    public GetMedallianCount(internalResourceId: number): Promise<MedalionCount[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        return this._srvHttp.get<MedalionCount[]>(`${this.baseURL}InternalLandingPage/GetMedallianCount`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public GetRepresentativeDropDown(repResourceId : number,internalResourceId: number, contrId: number, RoleName: string): Promise<ContractorReassign[]> {
        let param = new HttpParams();
        param = param.append('LoggedInResourceID', internalResourceId.toString());
        param = param.append('ContractorID', contrId.toString());
        param = param.append('RoleName', RoleName);
        param = param.append('RepResourceID', repResourceId.toString());
        return this._srvHttp.get<ContractorReassign[]>(`${this.baseURL}InternalLandingPage/GetReassignContractorWindow`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    public async UpdateFollowUpDate(obj, url?): Promise<number> {
        const urlText = url == null ? 'InternalLandingPage/UpdateFollowUpDate/' : url;
        return this._srvHttp.put<number>(`${this.baseURL}${urlText}`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    public async InsertLandingReassignment(obj): Promise<number> {
        const urlText = 'InternalLandingPage/InsertLandingReassignment';
        return this._srvHttp.post<number>(`${this.baseURL}${urlText}`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}