import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { environment } from 'src/environments/environment';
import { CompanyDetails, CompleteApplication, FinancialInformation, JobVolumeInfo, JobVolumeInformation } from './model';

@Injectable()
export class JobVolumeInformationService {
    private baseURL = environment.api_url;
    constructor(private _http: HttpClient) { }

    public GetCompanyDetails(param): Promise<CompanyDetails> {
        return this._http.get<CompanyDetails>(`${this.baseURL}CompanyInfo/GetCompanyDetails`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public GetCompleteApplicationDetails(param): Promise<CompleteApplication> {
        return this._http.get<CompleteApplication>(`${this.baseURL}ApplicationType/GetApplicationType`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public GetFinancialDetails(param): Promise<FinancialInformation[]> {
        return this._http.get<FinancialInformation[]>(`${this.baseURL}FinancialInfo/GetFinancialInformation`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public saveJobVolume(data): Promise<number> {
        return this._http.put<number>(`${this.baseURL}JobVolume/SaveJobVolumeInfo`, data).pipe(catchError(this.handleError)).toPromise();
    }
    public saveJobVolumeInternalChanges(data): Promise<number> {
        return this._http.put<number>(`${this.baseURL}JSON/EditJsonDataInternal`, data).pipe(catchError(this.handleError)).toPromise();
    }
    public getContractorApprovalData(param): Promise<EditContractor[]> {
        return this._http.get<EditContractor[]>(`${this.baseURL}JobVolume/GetJobVolumeEventPageJson`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public getJobVolumeInfo(param): Promise<JobVolumeInformation[]> {
        return this._http.get<JobVolumeInformation[]>(`${this.baseURL}JobVolume/GetJobVolumeInfo`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public GetJobVolumeData(param): Promise<any> {
            return this._http.get<any>(`${this.baseURL}JSON/GetContractorData`,{params:param}).pipe(catchError(this.handleError)).toPromise();
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Client Error');
        } else {
            console.error('Server Error');
        }

        // log error.
        return throwError(error);
    }
}
