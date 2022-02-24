import { AuthenticationService } from './authentication.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add $auth header with jwt if user is logged in and request is to api url
        const currentUser = this.authenticationService.currentUserValue;
        const isLoggedIn = currentUser && currentUser.Login[0].JWTToken;

        if (isLoggedIn) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.Login[0].JWTToken}`
                }
            });
        } else {
            // Please remove this after temporary fix for coverage profile  ====
            if (this.authenticationService.isAuthenticated) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${this.authenticationService.Profile.JWTToken}`
                    }
                });
            }
            // =================================================================
        }

        return next.handle(request);
    }
}