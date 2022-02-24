import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoginUser } from 'src/app/core/models/user.model';
import { ThankYouData } from './model-thank-you';

@Injectable()

export class ThankYouDataService {
    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    // GET-API for CompleteApplication
    public getCompleteApplication(loginDetails: SessionUser): Promise<ThankYouData> {
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        return this._httpClient.get<ThankYouData>(`${this.baseUrlAlt}ApplicationType/GetApplicationType`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // POST-API for Thank You
    public sendThanksEmail(finalObj): Promise<any> {
        return this._httpClient.post<HttpResponse<object>>(`${this.baseUrlAlt}JSON/SendThanksEmail`, finalObj
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

