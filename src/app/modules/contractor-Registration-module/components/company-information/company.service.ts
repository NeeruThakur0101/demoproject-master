import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs'; import { catchError } from 'rxjs/operators';
import { CompanyDetails, CompanyType } from './company-interface.model';
import { EditContractor } from 'src/app/core/models/contractor.module';
@Injectable()

export class CompanyService {
    public Profile: SessionUser = this._srvAuth.Profile;
    private baseURL: string = environment.api_url;
    public crComments;
    public refreshUser() {
        this.Profile = this._srvAuth.Profile; this.Profile.UserType = this._srvAuth.LoggedInUserType;
    }

    constructor(private _http: HttpClient, private _srvAuth: AuthenticationService) { }

    public GetCompanyType(): Promise<CompanyType> {
        let param = new HttpParams();
        param = param.append('resourceId', this._srvAuth.Profile.ResourceID.toString());
        param = param.append('userLanguageID',this._srvAuth.currentLanguageID);
        return this._http.get<CompanyType>(`${this.baseURL}CompanyInfo/GetCompType`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // get page data for phase 1 and phase 2
    public async GetCompanyDetails(): Promise<CompanyDetails> {
        let param = new HttpParams();
        if (this._srvAuth.Profile.ContrID > 0) {
            param = param.append('resourceID', this._srvAuth.Profile.ResourceID.toString());
            param = param.append('contrID', this._srvAuth.Profile.ContrID.toString());
            param = param.append('pageName', 'Company Information Page');
            param = param.append('userLanguageID',this._srvAuth.currentLanguageID);
            return this._http.get<CompanyDetails>(`${this.baseURL}JSON/GetContractorData`,{params : param})
                .pipe(catchError(this.handleError)).toPromise();
        }
        else {
            param = param.append('resourceId', this._srvAuth.Profile.ResourceID.toString());
            param = param.append('CCOpsID', this._srvAuth.Profile.CCOpsID.toString());
            return this._http.get<CompanyDetails>(`${this.baseURL}CompanyInfo/GetCompanyDetails`, { params: param })
                .pipe(catchError(this.handleError)).toPromise();
        }
    }

    // get approval json phase 2
    public GetEventPageJson(ContrId: number, resourceId: number, ccopsID): Promise<EditContractor[]> {
        let param = new HttpParams();
        param = param.append('contrID', ContrId.toString());
        param = param.append('resourceId', resourceId.toString());
        param = param.append('pageName', 'Company Information Page');
        param = param.append('CCOpsId', ccopsID.toString());
        param = param.append('EventName', this._srvAuth.Profile.EventAlias ? this._srvAuth.Profile.EventAlias : this._srvAuth.Profile.EventName);
        return this._http.get<EditContractor[]>(`${this.baseURL}CompanyInfo/GetCompanyEventJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // save data for phase 1
    public async SaveData(objCompany): Promise<number> {
        return this._http.put<number>(`${this.baseURL}CompanyInfo/SaveCompanyInformation`, objCompany).pipe(catchError(this.handleError)).toPromise();
    }

    public saveInternalData(obj): Promise<number> {
        return this._http.put<number>(`${this.baseURL}JSON/EditJsonDataInternal`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    public GetDocumentType(resourceId,currentLangId) : Promise<any> {
        let param = new HttpParams();
        param = param.append('resourceID', resourceId);
        param = param.append('userLanguageID',currentLangId);
        return this._http.get<EditContractor[]>(`${this.baseURL}UploadDocument/GetDocumentType`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}