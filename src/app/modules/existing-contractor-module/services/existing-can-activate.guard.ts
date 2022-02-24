import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Subscription, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/http-service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Injectable()
export class ExistingNoAuthGuard implements CanActivate {
    public forwardedData: any;
    public loginDetails: Array<any> = [];
    public routeCheck: Subscription;
    constructor(private apiService: ApiService, private router: Router, private authService: AuthenticationService, private $auth: AuthenticationService) {
    }
    public canActivate(): boolean {

        const currentUser = this.authService.currentUserValue;

        if (currentUser) {
            this.loginDetails = [];
            this.loginDetails = Array(this.authService.Profile);
            if (this.$auth.Profile && this.$auth.Profile.ContrID && this.$auth.Profile.ContrID > 0 && this.$auth.Profile.EventName !== 'No Event' && this.authService.LoggedInUserType !== 'Internal') {
                let param = new HttpParams();
                param = param.append('resourceId', this.$auth.Profile.ResourceID.toString());
                param = param.append('CCOpsID', this.$auth.Profile.CCOpsID.toString());
                param = param.append('ContrID', this.$auth.Profile.ContrID.toString());
                param = param.append('EventName', this.$auth.Profile.EventName);
                this.routeCheck = this.apiService
                    .get(`JSON/GetLastPageVisited`, { params: param, responseType: 'text' })
                    .subscribe(contrData => {
                        let LastPageVisited = contrData;
                        LastPageVisited = contrData === 'credential' ? 'credentialing-info' : contrData;
                        if (contrData !== '') {
                            this.router.navigate(['/existing-contractor/' + LastPageVisited]);
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
