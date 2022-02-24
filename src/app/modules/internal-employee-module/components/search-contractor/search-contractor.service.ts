import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchContractorService {

  constructor(private http: HttpClient, private $auth:AuthenticationService) { }

  private handleError(error: HttpErrorResponse) 
  {
    (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
    return throwError(error);
  }
  public gridData(internalResourceId,valueControl): Promise<any> {
    const params={params:{
      LoggedInResourceID: internalResourceId,
      ContractorID: valueControl.contractorId,
      ContractorName: valueControl.contractorName,
      OwnerPrincipleName: valueControl.ownerPrincipal,
      CityName: valueControl.city,
      State: valueControl.state,
      PostalCode: valueControl.postalCode,
      DM: valueControl.dm,
      xactNetAddress: valueControl.xnaSymbility
    }}
    let url = `InternalLandingPage/GetSearchData`
    return this.http.get<any>(`${environment.api_url}${url}`, params)
        .pipe(catchError(this.handleError)).toPromise();
  }
}
