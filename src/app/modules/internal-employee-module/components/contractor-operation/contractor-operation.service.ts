import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventTypeDropDown, MetaDataEvent, OperationGrid, OperationHistoryDetails, OperationOpsHistoryGrid } from './models';
import { DataValidation } from '../../dialogs/pending-profile-change/model';
import { EditContractor } from 'src/app/core/models/contractor.module';
@Injectable()
export class ContractorOperationService {
    public Profile: SessionUser;
    public ApplicationJSON: any;
    public baseURL: string = environment.api_url;
    public ResourceID = this._srvAuth.ProfileInternal.ResourceID
    public loggedInUserType: string;

    constructor(private _http: HttpClient, private _srvAuth: AuthenticationService) {
        this.ResourceID = this._srvAuth.ProfileInternal.ResourceID;
        this.loggedInUserType = this._srvAuth.LoggedInUserType;
    }

    // Get Page Json Data
    public getGridDetails(resourceId): Promise<OperationGrid[]> {
        const URL: string = `${this.baseURL}ContractorOperations/GetContractorOperationsData`;
        let param = new HttpParams();
        param = param.append('contrId', this._srvAuth.Profile.ContrID.toString());
        param = param.append('resourceID', resourceId.toString());
        param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
        return this._http.get<OperationGrid[]>(URL, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    // Get Email details for Email Popup
    public getEmailDetails(): Promise<any> {
        const URL: string = `${this.baseURL}ContractorOperations/GetEmailAddresses`;
        let param = new HttpParams();
        param = param.append('contrId', this._srvAuth.Profile.ContrID.toString());
        param = param.append('resourceID', this.ResourceID.toString());
        return this._http.get<any>(URL, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // Get Ops History Grid Data for pop up
    public getOpsHistotyGridDetails(): Promise<OperationOpsHistoryGrid[]> {
        const URL: string = `${this.baseURL}ContractorOperations/GetOpsHistory`;
        let param = new HttpParams();
        param = param.append('contrId', this._srvAuth.Profile.ContrID.toString());
        param = param.append('resourceID', this.ResourceID.toString());
        param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
        return this._http.get<OperationOpsHistoryGrid[]>(URL, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    // Get Ops History Grid Data for pop up
    public getOpsHistoryEventGridDetails(ccopsID): Promise<OperationOpsHistoryGrid[]> {
        const URL: string = `${this.baseURL}ContractorOperations/GetEventOpsHistory`;
        let param = new HttpParams();
        param = param.append('contrId', this._srvAuth.Profile.ContrID.toString());
        param = param.append('CCOpsId', ccopsID.toString());
        param = param.append('resourceID', this.ResourceID.toString());
        param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
        return this._http.get<OperationOpsHistoryGrid[]>(URL, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // Bind Event Group Dropdown for Add event Popup
    public BindEventTypeDDL(): Promise<EventTypeDropDown[]> {
        const URL: string = `${this.baseURL}ContractorOperations/GetEmailAddresses`;
        let param = new HttpParams();
        param = param.append('contrId', this._srvAuth.Profile.ContrID.toString());
        param = param.append('resourceID', this.ResourceID.toString());
        return this._http.get<EventTypeDropDown[]>(URL, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public BindEventGroupDDL(DataTypeID, EventTypeName): Promise<MetaDataEvent> {
        const Url = `${this.baseURL}ContractorOperations/GetAddEventDropDown`;
        let param = new HttpParams();
        param = param.append('contr_ID', this._srvAuth.Profile.ContrID.toString());
        param = param.append('dataTypeID', DataTypeID.toString());
        param = param.append('eventTypeName', EventTypeName);
        param = param.append('userLanguageID', this._srvAuth.currentLanguageID);
        return this._http.get<MetaDataEvent>(Url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public editRecertDate(date, resourceId): Promise<any> {
        return this._http
            .post<any>(`${this.baseURL}ContractorOperations/EditRecertificationWindow`, {
                RecertificationDate: date,
                CONTR_ID: this._srvAuth.Profile.ContrID,
                LoggedInResourceID: resourceId,
            })
            .pipe(catchError(this.handleError))
            .toPromise();
    }

    public InsertCorrectionRequestReturn(obj): Promise<number> {
        return this._http.post<number>(`${this.baseURL}ContractorOperations/InsertCorrectionRequestReturn`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    public AddEvent(obj): Promise<number> {
        return this._http.post<number>(`${this.baseURL}ContractorOperations/AddEvent`, obj).pipe(catchError(this.handleError)).toPromise();
    }
    public GetDbData(Url, param): Promise<OperationHistoryDetails[]> {
        return this._http.get<OperationHistoryDetails[]>(`${this.baseURL}${Url}`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public GetFieldValidation(fieldName, pageName, resourceId): Promise<DataValidation> {
        let param = new HttpParams();
        param = param.append('key', fieldName);
        param = param.append('pageName', pageName);
        param = param.append('resourceId', resourceId.toString());
        return this._http.get<DataValidation>(`${this.baseURL}ContractorOperations/GetFieldInfo`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public GetContractorChanges(ContrID, ResourceID, pageName, CCOpsID, eventName, url): Promise<EditContractor> {
        let param = new HttpParams();
        param = param.append('contrID', ContrID.toString());
        param = param.append('resourceId', ResourceID.toString());
        param = param.append('pageName', pageName);
        param = param.append('CCOpsId', CCOpsID.toString());
        param = param.append('EventName', eventName);
        param = param.append('IsInternal', this.loggedInUserType === 'Internal' ? 'true' : 'false');
        return this._http.get<EditContractor>(`${this.baseURL}${url}`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public EditJsonData(obj, url): Promise<number> {
        return this._http.put<any>(`${this.baseURL}${url}`, obj).pipe(catchError(this.handleError)).toPromise();
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}
