import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { EditContractor } from 'src/app/core/models/contractor.module';
import { AssignLiscenceData, ContractorList, EquipmentSelect, EquipmentType, LicenseData, UserRights } from './admin-interface.model';
@Injectable()
export class AdminService {
    public Profile: SessionUser = this._srvAuth.Profile;
    private baseURL: string = environment.api_url;
    public crComments;
    public refreshUser() {
        this.Profile = this._srvAuth.Profile;
        this.Profile.UserType = this._srvAuth.LoggedInUserType;
    }
    constructor(private $http: HttpClient, private _srvAuth: AuthenticationService, private $cntrDataSrv: ContractorDataService) { }

    //#region multi-location tab
    public GetLeadMultiLocationRights(contrIdOrName): Promise<ContractorList[]> {
        let param = new HttpParams();
        param = param.append('searchText', contrIdOrName);
        param = param.append('loggedInResourceID', this._srvAuth.ProfileInternal.ResourceID.toString())
        return this.$http.get<ContractorList[]>(`${this.baseURL}AdminPage/GetLeadMultiLocationRights`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public GetChildMultiLocationRights(selectedLeadId, text, loggedInResourceId): Promise<ContractorList[]> {
        let param = new HttpParams();
        param = param.append('leadContrId', selectedLeadId);
        param = param.append('serachText', text);
        param = param.append('loggedInResourceID', loggedInResourceId);
        return this.$http.get<ContractorList[]>(`${this.baseURL}AdminPage/GetChildMultiLocationRights`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public GetSearchAssignUserName(text): Promise<UserRights[]> {
        let param = new HttpParams();
        param = param.append('AssignUserName', text);
        return this.$http.get<UserRights[]>(`${this.baseURL}AdminPage/GetSearchAssignUserName`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    // save data for multi location rights and assign user name
    public async SaveMultiLocationData(url, obj): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}${url}`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    // Licenses tab
    public GetLicenseTabData(): Promise<LicenseData[]> {
        return this.$http.get<LicenseData[]>(`${this.baseURL}AdminPage/License`).pipe(catchError(this.handleError)).toPromise();
    }

    public async SaveLicenseData(obj): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}AdminPage/InsertLicense`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    // Assign License Dropdown

    public GetAssignLicenseDropdown(loginDetailsInternal: SessionUser): Promise<AssignLiscenceData> {
        let param = new HttpParams();
        param = param.append('userLanguageID', (loginDetailsInternal.CurrentLanguageID).toString());
        return this.$http.get<AssignLiscenceData>(`${this.baseURL}AdminPage/GetAssignRequiredLicenseDropdown`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    public async SaveAssignLicenseData(obj): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}AdminPage/InsertAssignRequiredLicenses`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    //#endregion


    // Equipment Type and Equipment Select
    public GetEquipmentType(): Promise<EquipmentType[]> {
        return this.$http.get<EquipmentType[]>(`${this.baseURL}AdminPage/EquipmentTypes`).pipe(catchError(this.handleError)).toPromise();
    }

    public GetEquipmentSelectType(val): Promise<EquipmentSelect[]> {
        let param = new HttpParams();
        param = param.append('EquipmentTypeID', val.EquipmentTypeID);
        return this.$http.get<EquipmentSelect[]>(`${this.baseURL}AdminPage/EquipmentTypeDropdown`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    public async SaveEquipmentType(obj): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}AdminPage/InsertEquipmentType`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    public async SaveEquipmentSelectType(obj): Promise<number> {
        return this.$http.post<number>(`${this.baseURL}AdminPage/InsertEquipmentList`, obj).pipe(catchError(this.handleError)).toPromise();
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        error.error instanceof ErrorEvent ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}
