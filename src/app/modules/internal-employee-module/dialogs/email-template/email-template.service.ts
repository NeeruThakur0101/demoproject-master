import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoginUser } from 'src/app/core/models/user.model';

@Injectable()
export class  EmailTemplateService {

    
    constructor(private _httpClient:HttpClient) {   }
    private baseUrlAlt: string = environment.api_url;

    // POST-API for Save Employee Info
  public sendContractorOperationEmail(objEmail): Promise<any> {
    return this._httpClient.post<HttpResponse<object>>(`${this.baseUrlAlt}ContractorOperation/ContractorOperationEmail`, objEmail
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
