import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService, SessionUser } from './../../../../core/services/authentication.service';
import { ApiService } from './../../../../core/services/http-service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class OperationHistoryService {
    public messageSource: BehaviorSubject<string> = new BehaviorSubject(null);
    public messageEmit = this.messageSource.asObservable();
    public loginDetailsInternal: SessionUser;
    constructor(private _srvApi: ApiService, private _srvAuth: AuthenticationService) {
        this.loginDetailsInternal = this._srvAuth.ProfileInternal;
    }

    public processCall(type: string, incomingData, jsonState: string = 'filled') {
        const url = type === 'Disapprove' ? 'JSON/Disapprove' : jsonState === 'filled' ? 'JSON/Approve' : 'JSON/ApproveEmptyJSON';
        return this._srvApi.put(`${url}`, {
            Contr_ID: this._srvAuth.Profile.ContrID, ResourceId: this.loginDetailsInternal.ResourceID, PageName: null, EventName: incomingData.ChangeType, CCOpsID: incomingData.CCOpsID, ContractorResourceID: this._srvAuth.Profile.ContractorResourceID
        }).pipe(catchError(this.handleError));
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

}