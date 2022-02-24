import { Router } from '@angular/router';
import { ApiService } from './http-service';
import { InternalLogin, User } from './../models/user.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { StorageService } from './storage.service';

export interface SessionUser {
    CCOpsID?: number;
    CompanyName?: string;
    ContrID?: number;
    CountryID?: number;
    Email?: string;
    EmployeeFullName?: string;
    IsOwnerPrinciple?: boolean;
    JWTToken?: string;
    ResourceID?: number;
    ResourceType?: string;
    UserType?: string;
    EventName?: string;
    EventAlias?: string | null;
    EventTypeID?: number;
    editAccess?: boolean;
    ContractorResourceID?: number;
    CurrentLanguageID?: number;
}

export interface PageAccess {
    editAccess: boolean;
    readonlyAccess: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    public loginDetails: BehaviorSubject<string> = new BehaviorSubject<string>(this._srvStorage.getStorage('loginDetails'));
    public loginDetailsInternal: BehaviorSubject<string> = new BehaviorSubject<string>(this._srvStorage.getStorage('loginDetailsInternal'));

    private currentUserSubject: BehaviorSubject<User>;
    public pageLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public multipleCall: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public currentUser: Observable<User>;
    public get isAuthenticated(): boolean {
        return this._srvStorage.getStorage('loginDetails') !== null ? true : false;
    }
    public get isAuthenticatedInternal(): boolean {
        return this._srvStorage.getStorage('loginDetailsInternal') !== null ? true : false;
    }
    public get Profile(): SessionUser {
        return this.isAuthenticated ? (this._srvStorage.getStorage('loginDetails').shift() as SessionUser) : null;
    }
    public get LoggedInUserType() {

        return this.isAuthenticatedInternal ? this.ProfileInternal.ResourceType : this.Profile.ResourceType;
    }
    public get Language() {
        return this.isAuthenticated || this.isAuthenticatedInternal ? this._srvStorage.getStorage('LanguageID') : null;
    }

    public get currentLanguageID() {
        return this._srvStorage.getStorage('LanguageID');
    }

    public get ProfileInternal(): SessionUser {
        return this.isAuthenticatedInternal ? (this._srvStorage.getStorage('loginDetailsInternal').Login[0] as SessionUser) : null;
    }

    public get ProfileInternalRoles(): InternalLogin {
        return this.isAuthenticatedInternal ? (this._srvStorage.getStorage('loginDetailsInternal') as InternalLogin) : null;
    }
    public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: true };
    constructor(private api: ApiService, private router: Router, private _srvStorage: StorageService) {
        this.currentUserSubject = new BehaviorSubject<User>(this._srvStorage.getStorage('currentUser'));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    // returns user's access privilege on which the users lands
    public getPageAccessPrivilege(pageName: string) {
        if (this.currentUserSubject.value.RoleDetails.length) {
            if (this.currentUserSubject.value.RoleDetails.some((el) => el.ObjectPrivilegeDescription === `Recertification and App Update Access`)) {
                this.$pagePrivilege.editAccess = true;
                this.$pagePrivilege.readonlyAccess = false;
            } else {
                if (this.Profile.EventName !== 'No Event' || (this.Profile.EventAlias && this.Profile.EventAlias.includes('Correction'))) {
                    this.$pagePrivilege.editAccess = true;
                    this.$pagePrivilege.readonlyAccess = false;
                } else {
                    this.$pagePrivilege.editAccess = this.currentUserSubject.value.RoleDetails.some((el) => el.ObjectPrivilegeDescription === `${pageName} Basic User`);
                    this.$pagePrivilege.readonlyAccess = this.currentUserSubject.value.RoleDetails.some((el) => el.ObjectPrivilegeDescription === `${pageName} Read Only`);

                    if (
                        this.currentUserSubject.value.RoleDetails.some((el) => el.ObjectPrivilegeDescription === `Contractor Central Access`) &&
                        !this.$pagePrivilege.editAccess &&
                        !this.$pagePrivilege.readonlyAccess &&
                        pageName === 'Company Information'
                    ) {
                        this.$pagePrivilege.editAccess = false;
                        this.$pagePrivilege.readonlyAccess = true;
                    }
                }
            }
        }
        return this.$pagePrivilege;
    }
    public getRecertDateEditPrivilege() {
        let editPrivilege;
        if (this.currentUserSubject.value.RoleDetails.length) {
            editPrivilege = this.currentUserSubject.value.RoleDetails.some((el) => el.ObjectPrivilegeDescription === 'Edit Recertification Date');
        }
        return editPrivilege;
    }

    login(url: string, username: string, password: string) {
        let param = new HttpParams();
        param = param.append('loginUser', username);
        param = param.append('password', password);
        return this.api.get(`${url}`, { params: param }).pipe(
            map((user) => {
                // login successful if there's a jwt token in the response
                if (user.Login.length && user.Login[0].JWTToken) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    this._srvStorage.setStorage(user, 'currentUser');
                    this.currentUserSubject.next(user);
                }

                return user;
            })
        );
    }

    logout() {
        // remove user from local storage to log user out
        this._srvStorage.clearStorage();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }
}
