import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { environment } from 'src/environments/environment';
import { LangVeteranInfo } from './veteran.model';

@Injectable()
export class LanguageVeteranService {
    private baseURL = environment.api_url;

    constructor(private _http: HttpClient) {}

    public getContractorApprovalData(param): Promise<EditContractor[]> {
        return this._http.get<EditContractor[]>(`${this.baseURL}LanguageAndVeteranInfo/GetLangVeteranEventPageJson`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public getVeteranMasterData(param): Promise<LangVeteranInfo> {
        return this._http.get<LangVeteranInfo>(`${this.baseURL}LanguageAndVeteranInfo/GetLangugeVeteranInfo`,{params: param}).pipe(catchError(this.handleError)).toPromise();
    }
    public saveVeteranInfo(url: string,data): Promise<number> {
        return this._http.put<number>(`${this.baseURL}${url}`, data).pipe(catchError(this.handleError)).toPromise();
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
