import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { OwnershipDetails, SignatureData } from './model_signature';

@Injectable()

export class SignatureDataService {
    private baseUrlAlt: string = environment.api_url;

    constructor(public $auth: AuthenticationService, private $http: HttpClient) { }

    // GET-API for Signature Data Phase 1
    public getDBSignature(loginDetails): Promise<SignatureData> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails[0].ResourceID.toString());
        param = param.append('CCOpsID', loginDetails[0].CCOpsID.toString());
        return this.$http.get<SignatureData>(`${this.baseUrlAlt}JSON/GetSignaturePage`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for OwnershipDetails
    public getOwnershipData(loginDetails): Promise<OwnershipDetails> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails[0].ResourceID.toString());
        param = param.append('CCOpsID', loginDetails[0].CCOpsID.toString());
        return this.$http.get<OwnershipDetails>(`${this.baseUrlAlt}OwnershipInformation/GetOwnershipDetails`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Phase 1
    public saveData(ccopsData): Promise<any> {
        return this.$http.put<HttpResponse<object>>(`${this.baseUrlAlt}SignaturePage/SaveSignaturePage`, ccopsData
            , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Phase 1 Submit
    public submitData(ccopsData): Promise<any> {
        return this.$http.post<HttpResponse<object>>(`${this.baseUrlAlt}JSON/SubmitData`, ccopsData
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

