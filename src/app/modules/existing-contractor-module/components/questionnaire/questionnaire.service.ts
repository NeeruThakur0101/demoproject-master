import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { QuestionnariresDBDataModel } from './model';

@Injectable()

export class QuestionnaireDataService {
    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuthentication: AuthenticationService, private _httpClient: HttpClient) { }

    // DB GET-API for Phase 1 & Phase 2
    public getDbData(loginDetails: SessionUser): Promise<QuestionnariresDBDataModel> {
        const currentLangId = this._srvAuthentication.currentLanguageID;
        let param = new HttpParams();
        param = param.append('Contr_ID', loginDetails.ContrID.toString());
        param = param.append('UserLanguageID', currentLangId.toString());
        return this._httpClient.get<QuestionnariresDBDataModel>(`${this.baseUrlAlt}QuestionnaireAnswer/GetQuestionnaireAnswer`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();

    }

    // GET-API for Contractor JSON Data Phase 2
    public getEventPageJSON(loginDetails: SessionUser): Promise<EditContractor> {
        let param = new HttpParams();
        param = param.append('contrID', loginDetails.ContrID.toString());
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('pageName', 'Contractor Questionnaire');
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        param = param.append('EventName', this._srvAuthentication.Profile.EventAlias ? this._srvAuthentication.Profile.EventAlias : this._srvAuthentication.Profile.EventName);
        return this._httpClient.get<EditContractor>(`${this.baseUrlAlt}QuestionnaireAnswer/GetQuestionnaireAnswersEventPageJson`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // PUT-API for Internal
    public saveInternalData(ccopsData): Promise<any> {
        return this._httpClient.put<HttpResponse<object>>(`${this.baseUrlAlt}/JSON/EditJsonDataInternal`, ccopsData
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

