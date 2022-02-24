import { environment } from './../../../../../environments/environment';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthenticationService } from './../../../../core/services/authentication.service';
import { Subscription, throwError } from 'rxjs';
import { ApiService } from './../../../../core/services/http-service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable()
export class NoAuthGuard implements CanActivate {
    public forwardedData: any;
    public loginDetails: Array<any> = [];
    public routeCheck: Subscription;
    constructor(private apiService: ApiService, private router: Router, private authService: AuthenticationService, private $auth: AuthenticationService) {
    }
    public canActivate(route: ActivatedRouteSnapshot): boolean {

        const currentUser = this.authService.currentUserValue;

        if (currentUser) {
            this.loginDetails = [];
            this.loginDetails = Array(this.authService.Profile);
            const expectedRole = route;

            if (this.$auth.Profile && this.$auth.Profile.ContrID === 0 && (this.$auth.Profile.ContrID === 0 || this.$auth.Profile.ContrID === null) && this.authService.LoggedInUserType !== 'Internal') {
                let param = new HttpParams();
                param = param.append('resourceId', this.$auth.Profile.ResourceID.toString());
                param = param.append('CCOpsID', this.$auth.Profile.CCOpsID.toString());
                this.routeCheck = this.apiService
                    .get(`JSON/GetLastPageVisited`, { params: param, responseType: 'text' })
                    .subscribe(result => {
                        if (result !== '') {
                            const routeTo = result.toLowerCase()
                            if (routeTo !== expectedRole) {
                                this.router.navigate(['/contractorRegistration/' + routeTo]);
                                return false;
                            }
                        }
                        else {
                            this.router.navigate([
                                '/contractorRegistration/select-program'
                            ]);
                        }
                    });
                return true;
            }
            else if (this.$auth.Profile && this.$auth.Profile.ContrID && this.$auth.Profile.ContrID > 0 && this.$auth.Profile.EventName !== 'No Event' && this.authService.LoggedInUserType !== 'Internal') {
                let param = new HttpParams();
                param = param.append('resourceId', this.$auth.Profile.ResourceID.toString());
                param = param.append('CCOpsID', this.$auth.Profile.CCOpsID.toString());
                param = param.append('ContrID', this.$auth.Profile.ContrID.toString());
                param = param.append('EventName', this.$auth.Profile.EventName);
                this.routeCheck = this.apiService
                    .get(`JSON/GetLastPageVisited`, { params: param, responseType: 'text' })
                    .subscribe(contrData => {
                        const LastPageVisited = contrData;
                        if (contrData !== '') {
                            this.router.navigate(['/contractorRegistration/' + LastPageVisited]);
                        }
                        else {
                            this.router.navigate([
                                '/contractorRegistration/company-information'
                            ]);
                        }
                    });
                return true;
            }
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        (error.error instanceof ErrorEvent) ? console.error('Client Error') : console.error('Server Error');
        return throwError(error);
    }
}
