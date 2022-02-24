import { environment } from './../../../../../environments/environment';
import { Injectable } from '@angular/core';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs'; import { catchError } from 'rxjs/operators';
import { CompanyDetails, ContactDetails, OwnershipDetails } from './model';

@Injectable()

export class ValidationService {
    public Profile: SessionUser;
    public ApplicationJSON: any;
    private baseURL: string = environment.api_url;

    constructor(private _http: HttpClient, private _auth: AuthenticationService) { }

    public refreshUser() {
        this.Profile = this._auth.Profile; this.Profile.UserType = this._auth.LoggedInUserType;
    }
    public getValidationContractorData(param): Promise<any> {
        // if (param.contrId > 0) {
            return this._http.get<any>(`${this.baseURL}JSON/GetContractorData`,{params:param}).pipe(catchError(this.handleError)).toPromise();
        // }
    }

    public getContactDetails(param): Promise<ContactDetails> {
        return this._http.get<ContactDetails>(`${this.baseURL}ContactInfo/GetContactDetails`,{params: param}).pipe(catchError(this.handleError)).toPromise();
    }
    public getOwnershipDetails(param): Promise<OwnershipDetails> {
        return this._http.get<OwnershipDetails>(`${this.baseURL}OwnershipInformation/GetOwnershipDetails`,{params: param}).pipe(catchError(this.handleError)).toPromise();
    }
    public getCompanyDetails(param): Promise<CompanyDetails> {
        return this._http.get<CompanyDetails>(`${this.baseURL}CompanyInfo/GetCompanyDetails`,{params: param}).pipe(catchError(this.handleError)).toPromise();
}
public saveValidationPerspectiveContractor(data): Promise<number> {
    return this._http.put<number>(`${this.baseURL}ValidationInformation/SaveValidationInformation`, data).pipe(catchError(this.handleError)).toPromise();
}
public saveValidationOwnershipPerspectiveContractor(data): Promise<number> {
    return this._http.put<number>(`${this.baseURL}OwnershipInformation/SaveOwnershipDetails`, data).pipe(catchError(this.handleError)).toPromise();
}

    // Get form control configuration for LegalIssueType
    getFormConfigByLegalIssueType(legalIssueTypeID: number): Promise<any[]> {
        return this._http.get<any[]>(`${this.baseURL}LegalIssue/GetLegalItemDetail/${legalIssueTypeID}/${this._auth.Profile.CountryID}/${this._auth.Profile.ResourceID}`)
            .pipe(catchError(this.handleError)).toPromise();
    }

    // // Get Page Json Data
    // public getEventPageJSONData(PageName: string): Promise<any> {
    //         const URL = `${this.baseURL}JSON/GetEventPageJson/${this._auth.Profile.ContrID}/${this._auth.Profile.ResourceID}/${PageName}/${this._auth.Profile.CCOpsID}/${this._auth.Profile.EventAlias ? this._auth.Profile.EventAlias : this._auth.Profile.EventName}`;
    //     return this._http.get<any>(URL).pipe(catchError(this.handleError)).toPromise();
    // }

 // get approval json phase 2
 public getEventPageJSONData(url:string, pageName: string) : Promise<any> {
    let param = new HttpParams();
    param = param.append('contrID',this._auth.Profile.ContrID.toString());
    param = param.append('resourceId', this._auth.Profile.ResourceID.toString());
    param = param.append('pageName',pageName);
    param = param.append('CCOpsId', this._auth.Profile.CCOpsID.toString());
    param = param.append('EventName',this._auth.Profile.EventAlias ? this._auth.Profile.EventAlias : this._auth.Profile.EventName);
    return this._http.get<any>(`${this.baseURL}${url}`,{params: param})
        .pipe(catchError(this.handleError)).toPromise();
}

    // Get contractor changes
    public getContractorChanges(): Promise<any> {
        return this._http.get<any>(`${this.baseURL}JSON/GetPageJson/${this._auth.Profile.ContrID}/${this._auth.Profile.ResourceID}/Legal Item Information Page/${this.Profile.CCOpsID}`)
            .pipe(catchError(this.handleError)).toPromise();
    }


    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}