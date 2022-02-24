import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class XHRInterceptorService implements HttpInterceptor {
	constructor(private $auth: AuthenticationService) {}
private totalRequest = 0;
	intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        this.totalRequest ++;
		this.$auth.pageLoader.next(true);
		return next.handle(request.clone()).pipe(
			timeout(300000),
			catchError((error): Observable<HttpEvent<T>> => {
				// Check if timeout error set appropriacte status code and error message.
				error && error['name'] === 'TimeoutError' ? (error = new HttpErrorResponse({ status: 408, error: 'Request timed out.' })) : null;

				// Check for authentication and authorization errors.
				// error.status === 401 | Request don't have proper credential for authentication
				// error.status === 403 | Request have proper credential, but current credential don't have access to requested resource.

				return throwError(error);
			}),
			finalize(() => {
				this.totalRequest--;
                this.totalRequest === 0 ? this.$auth.pageLoader.next(false): this.$auth.pageLoader.next(true);
			})
		);
	}
}