import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { EmpDropdowndata, EmployeeData } from './employee-info-model';
@Injectable()

export class EmployeeInfoDataService {

  constructor(private _srvAuth: AuthenticationService, private _httpClient: HttpClient) { }

  private baseUrlAlt: string = environment.api_url;

  // GET-API for Employee and Role Details
  public getEmpAndRoleData(loginDetails: SessionUser, loggedInUserType): Promise<EmployeeData> {
    let param = new HttpParams();
    param = param.append('CONTR_ID', loginDetails.ContrID.toString());
    param = loggedInUserType === 'Internal' ? param = param.append('userLanguageID', this._srvAuth.currentLanguageID) : param.append('userLanguageID', loginDetails.CurrentLanguageID.toString());
    return this._httpClient.get<EmployeeData>(`${this.baseUrlAlt}EmployeeInfo/GetEmployeeInfo`, { params: param })
      .pipe(catchError(this.handleError)).toPromise();
  }

  // GET-API for Employee-Info Dropdown Data
  public getEmpInfoDropdown(loggedInUserType, loginDetails): Promise<EmpDropdowndata> {
    let param = new HttpParams();
    param = loggedInUserType === 'Internal' ? param = param.append('userLanguageID', this._srvAuth.currentLanguageID) : param.append('userLanguageID', loginDetails.CurrentLanguageID.toString());
    return this._httpClient.get<EmpDropdowndata>(`${this.baseUrlAlt}EmployeeInfo/GetEmployeeDropDown`, { params: param })
      .pipe(catchError(this.handleError)).toPromise();
  }

  // POST-API for Save Employee Info
  public saveEmployeeInfo(ccopsData): Promise<any> {
    return this._httpClient.post<HttpResponse<object>>(`${this.baseUrlAlt}EmployeeInfo/InsertEmployeeInfo`, ccopsData
      , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
  }

  // fetch server date time
  public fetchServerTime(): Promise<Date> {
    return this._httpClient.get<Date>(`${this.baseUrlAlt}JSON/GetServerTimeStamp`)
      .pipe(catchError(this.handleError)).toPromise();
  }

  // Handle XHR errors
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Client Error');
    } else { console.error('Server Error'); }

    // log error.
    return throwError(error);
  }

  // Delete-API for delete Employee Info
  // public deleteEmployeeInfo1(ccopsData): Promise<any> {
  //   return this._httpClient.delete<HttpResponse<object>>(`${this.baseUrlAlt}EmployeeInfo/DeleteEmployeeInfo`, ccopsData
  //     ).pipe(catchError(this.handleError)).toPromise(); 
  // }

  public deleteEmployeeInfo(ccopsData): Promise<any> {
    return this._httpClient.post<HttpResponse<object>>(`${this.baseUrlAlt}EmployeeInfo/DeleteEmployeeInfo`, ccopsData
      , { observe: 'response' }).pipe(catchError(this.handleError)).toPromise();
  }

  // public deleteEmployeeInfo(ccopsData) {
  //   let endPoints = "/posts/1"
  //   this._httpClient.delete(`${this.baseUrlAlt}EmployeeInfo/DeleteEmployeeInfo`,ccopsData).subscribe();


  // }

}
