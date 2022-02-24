import { AuthenticationService } from './../../core/services/authentication.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
// import { en, fr } from './lang';
import { en } from './en-lang';
import { fr } from './fr-lang';

export interface User {
    CCOpsID?: number;
    CompanyName?: string;
    ContrID?: number;
    CountryID?: number;
    Email?: string;
    IsOwnerPrinciple?: boolean;
    JWTToken?: string;
    EmployeeFullName?: string;
    ResourceID?: number;
    ResourceType?: string;
    UserType?: string;
}

@Injectable()
export class InternalUserDetailsService {
    public adminMsg: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private baseUrlAlt: string = environment.api_url;
    public get currentLanguage() {
        if (this.$auth.Profile && this.$auth.Profile.CountryID) {
            return this.$auth.Profile.CountryID === 1 ? 'en' : 'fr';
        }
        return 'en';
    }
    constructor(private $http: HttpClient, private $auth: AuthenticationService) { }

    // Get Page Json Data
    public getContractorCredDetails(CCOpsId: number, contrId: number, pageName: string): Promise<any> {
        let param = new HttpParams();
        param = param.append('CCOpsId', CCOpsId.toString());
        param = param.append('Contr_Id', contrId.toString());
        param = param.append('PageName', pageName);
        const URL: string = `${this.baseUrlAlt}Login/GetContractorLoginData`;
        return this.$http.get<any>(URL, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

    public EmailExists(email: string ): Promise<boolean> {
        let param = new HttpParams();
        param = param.append('EmailID', email.toString());
        param = param.append('Contr_ID', this.$auth.Profile.ContrID.toString());
        return this.$http.get<boolean>(`${this.baseUrlAlt}EmployeeInfo/GetEmailCheck`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
        }

    onLanguageSelect(lang: string) {
        if (lang === 'en') {
            return en;
        } else {
            return fr;
        }
    }

    getPageContentByLanguage()
    {
        if (this.$auth.Language === 0) {
            return en;
        } else {
            return fr;
        }
    }
    getPageContentByLanguageForSignup(value)
    {
        if (value === 0) {
            return en;
        } else {
            return fr;
        }
    }
}