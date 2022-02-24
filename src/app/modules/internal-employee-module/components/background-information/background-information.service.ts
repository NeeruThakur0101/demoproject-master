import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';
import { AllHeaderInfo, ClientProgram, OwnersInfo, ProgramInfo, SubContractedTradesInfo } from './bginfo.model';
@Injectable()
export class BackgroundInformationService {
    public loginDetailsInternal: SessionUser;
    public baseURL: string = environment.api_url;
    public ResourceID: number;

    constructor(private $http: HttpClient, private $auth: AuthenticationService) {
        // this.$auth.loginDetailsInternal.subscribe(res => { this.ResourceID = JSON.parse(res).Login[0].ResourceID;});
        // this.ResourceID = this.$auth.ProfileInternal.ResourceID;
    }

    // get header data
    public headerData(): Promise<AllHeaderInfo> {
        const Url: string = `${this.baseURL}BackgroundInfo/GetHeaderData`;
        let param = new HttpParams();
        param = param.append('Contr_ID', this.$auth.Profile.ContrID.toString());
        return this.$http.get<AllHeaderInfo>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // get Client Program Tab
    public clientProgramTab(): Promise<ProgramInfo[]> {
        const Url: string = `${this.baseURL}BackgroundInfo/GetClientProgramTab`;
        let param = new HttpParams();
        param = param.append('Contr_ID', this.$auth.Profile.ContrID.toString());
        return this.$http.get<ProgramInfo[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // get Owners Tab
    public ownersTab(): Promise<OwnersInfo[]> {
        const Url: string = `${this.baseURL}BackgroundInfo/GetOwnersTab`;
        let param = new HttpParams();
        param = param.append('Contr_ID', this.$auth.Profile.ContrID.toString());
        return this.$http.get<OwnersInfo[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // get GetProgramDetailWindow
    public GetProgramDetailWindow(contrId, clientId, currentLangId): Promise<ClientProgram[]> {
        const Url: string = `${this.baseURL}BackgroundInfo/GetProgramDetailWindow`;
        let param = new HttpParams();
        param = param.append('Contr_ID', contrId.toString());
        param = param.append('PrismClientID', clientId.toString());
        param = param.append('userLanguageID', currentLangId);
        return this.$http.get<ClientProgram[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    // get SubContracted Trades Tab
    public subContractedTradesTab(): Promise<SubContractedTradesInfo[]> {
        const currentLangId = this.$auth.currentLanguageID;
        const Url: string = `${this.baseURL}BackgroundInfo/SubContractedTrades`;
        let param = new HttpParams();
        param = param.append('Contr_ID', this.$auth.Profile.ContrID.toString());
        param = param.append('userLanguageID', currentLangId);
        return this.$http.get<SubContractedTradesInfo[]>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // Save Background Audit Date
    public saveAuditDate(): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}BackgroundInfo/UpdateAuditDate`, {
            CONTR_ID: this.$auth.Profile.ContrID,
            LoggedInResourceID: this.$auth.ProfileInternal.ResourceID
        }).pipe(catchError(this.handleError)).toPromise();
    }

    // Save Background Page Data
    public backgroundSaveData(data): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}BackgroundInfo/InsertBackgroundInfo`, {
            CONTR_ID: this.$auth.Profile.ContrID,
            VendorID: data.VendorID,
            BGExceptionFlag: data.BGExceptionFlag,
            AnnualScreeningReqFlag: data.AnnualScreeningReqFlag,
            LoggedInResourceID: this.$auth.ProfileInternal.ResourceID
        }).pipe(catchError(this.handleError)).toPromise();
    }

    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Side Error') : console.error('Server Side Error');
        return throwError(error);
    }
}
