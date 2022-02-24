import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from 'src/environments/environment';
import { ContactDetail, StateModel } from './contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactApiService {

  constructor(private _http: HttpClient, private _srvAuthentication:AuthenticationService){}
  private handleError(error: HttpErrorResponse) {
    (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
    return throwError(error);
}
public getStateDetails(countryId, resourceId): Promise<StateModel[]>{
  let params = {params:{
    countryID:countryId,
    resourceID:resourceId,
    userLanguageID : this._srvAuthentication.currentLanguageID,
  }}
  const url = `ContactInfo/GetContactInfo`
  return this._http.get<StateModel[]>(`${environment.api_url}${url}`, params)
      .pipe(catchError(this.handleError)).toPromise();
}
public getContactDetail(path, params = {}): Promise<ContactDetail> {
  return this._http.get<ContactDetail>(`${environment.api_url}${path}`, params)
      .pipe(catchError(this.handleError)).toPromise();
}
public getEventPageJSON(ContrID?, resourceId?, CCopsId?):Promise<EditContractor[]>{
  const params={params:{
    contrID:ContrID,
    resourceID:resourceId,
    pageName:'Contact Information Page',
    CCOpsId:CCopsId,
    EventName:this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName
  }}
  return this._http.get<EditContractor[]>(`${environment.api_url}ContactInfo/GetContactEventJson`, params)
  .pipe(catchError(this.handleError)).toPromise();
}

public putContactDetail(path: string, body: object = {}): Promise<number> {
    return this._http
        .put<number>(`${environment.api_url}${path}`, body).pipe(catchError(this.handleError)).toPromise();
}
  }
