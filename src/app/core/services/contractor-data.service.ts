import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { CorrectionRequestComments, JumpToDDL } from '../models/user.model';
import { StorageService } from './storage.service';
@Injectable()
export class ContractorDataService {
    public ApplicationJSON: any;
    private baseURL: string = environment.api_url;
    public contractorData: any = null;
    public JumpToData = new BehaviorSubject(null);
    constructor(private $http: HttpClient, private $auth: AuthenticationService, private _srvStorage: StorageService) { }
    saveContractorData(pageKey: any, data: any, pageUrl: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.contractorData = null;
            if (data !== null) {
                this.contractorData = data;
                this.contractorData.LastPageVisited = pageKey.nextPage;
                this.contractorData.ContractorResourceNumber = this.$auth.Profile.ContractorResourceID;
            }
            let selectedEvent = null;
            if (this.$auth.Profile.EventAlias && this.$auth.Profile.EventName === 'No Event') {
                selectedEvent = this.$auth.Profile.EventAlias;
            } else if (!this.$auth.Profile.EventAlias) {
                selectedEvent = this.$auth.Profile.EventName === 'No Event' ? null : this.$auth.Profile.EventName;
            }
            this.$http.put<number>(`${this.baseURL}${pageUrl}`, {
                ResourceId: this.$auth.Profile.ResourceID,
                CCOpsID: this.$auth.Profile.CCOpsID,
                CCOpsData: this.contractorData !== null ? JSON.stringify(this.contractorData) : null,
                Contr_ID: this.$auth.Profile.ContrID, ContractorResourceID: this.$auth.Profile.ContractorResourceID,
                EventName: selectedEvent, EventTypeID: this.$auth.Profile.EventTypeID,
                PageName: pageKey.currentPage, isInternal: false,
                LastPageVisited: pageKey.nextPage, EventDataFlag: this.$auth.Profile.EventName === 'No Event' ? false : true
            }).pipe(catchError(this.handleError)).subscribe((res) => {
                // only used during Pending Profile Change Correction Request
                if (this.$auth.Profile.EventAlias) { this.getjumpToData() }
                resolve(res);
            })
        })
    }

    // while submitting any event (for eg - Recertification)
    public submitEventData(): Promise<any> {
        return this.$http.put<any>(`${this.baseURL}JSON/SubmitEventData`, {
            ResourceId: this.$auth.Profile.ResourceID,
            Contr_ID: this.$auth.Profile.ContrID,
            EventName: this.$auth.Profile.EventName,
            ContractorResourceID: this.$auth.Profile.ContractorResourceID
        }).pipe(catchError(this.handleError)).toPromise();
    }

    public getCompleteUrl(pageName) {
        let baseUrl;
        const url = pageName === 'Contact Information'
            ? 'contact-information'
            : pageName === 'Company Information'
                ? 'company-information'
                : pageName === 'Ownership Information'
                    ? 'ownership'
                    : pageName === 'Legal Questions'
                        ? 'legal-questions'
                        : pageName === 'Equipment Information'
                            ? 'equipment-information'
                            : pageName === 'Financial Information'
                                ? 'financial-information'
                                : pageName === 'Job Volume Information'
                                    ? 'job-volume-information'
                                    : pageName === 'References'
                                        ? 'reference-information'
                                        : pageName === 'Trades'
                                            ? 'trade-information'
                                            : pageName === 'Profile Coverage'
                                                ? 'coverage-profile-information'
                                                : pageName === 'Facilities/Other Locations Information'
                                                    ? 'contractor-location'
                                                    : pageName === 'Languages/Veterans/Minority Information'
                                                        ? 'veteran-info'
                                                        : pageName === 'Surge/CAT Response'
                                                            ? 'surge-info'
                                                            : pageName === 'Signature Page'
                                                                ? 'signature-page'
                                                                : pageName === 'Contractor Questionnaire Page'
                                                                    ? 'questionnaire'

                                                                    : pageName === 'Employee Information'
                                                                        ? 'employee-information'
                                                                        : pageName === 'Surge/CAT Response'
                                                                            ? 'surge-info'
                                                                            : pageName === 'Contractor Questionnaire Page'
                                                                                ? 'questionnaire'
                                                                                : pageName === 'Languages/Veterans/Minority Information'
                                                                                    ? 'veteran-info'
                                                                                    : pageName === 'Credentialing Information'
                                                                                        ? 'credentialing-info'
                                                                                        : pageName === 'Internal Landing Page'
                                                                                            ? 'internal-landing'
                                                                                            : pageName === 'Contractor Operations'
                                                                                                ? 'contractor-operation'
                                                                                                : pageName === 'Credit Information'
                                                                                                    ? 'credit-info'
                                                                                                    : pageName === 'Background Information'
                                                                                                        ? 'background-information'

                                                                                                        : 'validation';


        if (pageName === 'Employee Information' || pageName === 'Internal Landing Page'
            || pageName === 'Contractor Operations' || pageName === 'Credit Information' ||
            pageName === 'Background Information') {
            baseUrl = '/internal/';
        }
        else if (pageName === 'Surge/CAT Response' || pageName === 'Contractor Questionnaire Page' ||
            pageName === 'Languages/Veterans/Minority Information' || pageName === 'Credentialing Information') {
            baseUrl = '/existing-contractor/';
        }
        else {
            baseUrl = '/contractorRegistration/';
        }
        return baseUrl+url;
    }
    public async getPageComments(pageKey: string) {
        let $pageComment: CorrectionRequestComments[];  // [];
        const loggedInUserType = this.$auth.LoggedInUserType;
        if (loggedInUserType === 'Internal' || (( !this.$auth.Profile.EventName || !this.$auth.Profile.EventName.includes('Correction')) && ( !this.$auth.Profile.EventAlias || !this.$auth.Profile.EventAlias.includes('Correction')))) { return $pageComment; };
        let COMMENTS: CorrectionRequestComments[] = [];
        COMMENTS = await this.getAllComments(this.$auth.Profile.ContrID, this._srvStorage.getStorage('EventTypeID') !== null ? parseInt(this._srvStorage.getStorage('EventTypeID'), 10): null);
        $pageComment = COMMENTS.filter((ele) => {
            return ele.ApplicationPageName === pageKey
        })
        return $pageComment;
    }

    getAllComments(contrId: number, eventTypeId: number, path?: string): Promise<CorrectionRequestComments[]> {
        let url: any = null;
        let param = new HttpParams();
        if (this.$auth.LoggedInUserType === 'Internal') {
            param = param.append('contrId', contrId.toString());
            param = param.append('eventID',eventTypeId.toString());
            param = param.append('userLanguageID',this.$auth.currentLanguageID);
            url = `${this.baseURL}ContractorOperations/GetCorrectionRequestInternalEmployee`;
        } else {
            param = param.append('contrId', contrId.toString());
            param = param.append('eventTypeID',eventTypeId !== null ? eventTypeId.toString() : null);
            param = param.append('pageName', null);
            param = param.append('userLanguageID',this.$auth.currentLanguageID);
            url = `${this.baseURL}ContractorOperations/GetCorrectionRequestReadonlyWindow`;
        }
        return this.$http.get<CorrectionRequestComments[]>(url, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    getBreadcrum(){
        let param = new HttpParams();
            param = param.append('userLanguageID', this.$auth.currentLanguageID);
        return this.$http.get<any>(`${this.baseURL}Login/GetBreadcrumb`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    getjumpToData() : Promise<JumpToDDL[]> {
         return new Promise((resolve, rej) => {
            const ResourceID = this.$auth.LoggedInUserType === 'Internal' ? this.$auth.ProfileInternal.ResourceID : this.$auth.Profile.ResourceID;
            const ContrID = this.$auth.LoggedInUserType === 'Internal' ? 0 : this.$auth.Profile.ContrID;
            const EventID = this.$auth.LoggedInUserType === 'Internal' ? null : this.$auth.Profile.EventTypeID === 0 ? null : this.$auth.Profile.EventTypeID;
            const url = `JSON/JumpToData`;
            let param = new HttpParams();
            param = param.append('resourceID', ResourceID.toString());
            param = param.append('contr_ID', ContrID.toString());
            param = param.append('eventTypeID', EventID !== null ?EventID.toString():null);
            param = param.append('userLanguageID',this.$auth.currentLanguageID);
            this.$http.get<any>(`${this.baseURL}${url}`, { params: param }).pipe(catchError(this.handleError)).subscribe((res) => {
                this.JumpToData.next(res);
                resolve(res);
            });
         })
    }


    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }

}