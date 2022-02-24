
export const employee = [
    {
    "empID": 1,
    "name": "Sample Owner",
    "email": "xxx@xx.com",
    "phone": "xxx.xxx.xxxx",
    "role": "role"
},{
    "empID": 2,
   "name": "Sample Owner 1",
    "email": "xxx@xx.com",
    "phone": "xxx.xxx.xxxx",
    "role": "role"
},
{
    "empID": 3,
   "name": "Sample Owner 2",
    "email": "xxx@xx.com",
    "phone": "xxx.xxx.xxxx",
    "role": "role"
},
{
    "empID": 4,
   "name": "Sample Owner 3",
    "email": "xxx@xx.com",
    "phone": "xxx.xxx.xxxx",
    "role": "role"
},
{
    "empID": 5,
   "name": "Sample Owner 4",
    "email": "xxx@xx.com",
    "phone": "xxx.xxx.xxxx",
    "role": "role"
}];


import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable()
export class employeeApi {
    constructor(private http: HttpClient) { }

    private formatErrors(error: any) {
        return throwError(error.error);
    }
    // http methods
    get(path: string, params: any = {}): Observable<any> {
        return this.http
            .get(`${environment.api_url}${path}`, params)
            .pipe(catchError(this.formatErrors));
    }

    put(path: string, body: object = {}): Observable<any> {
        return this.http
            .put(`${environment.api_url}${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    post(path: string, body): Observable<any> {
        return this.http
            .post(`${environment.api_url}${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    delete(path): Observable<any> {
        return this.http
            .delete(`${environment.api_url}${path}`)
            .pipe(catchError(this.formatErrors));
    }

    request(req): Observable<any> {
        return this.http.request(req).pipe(catchError(this.formatErrors));
    }

    downloadFile(url: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            }),
            responseType: 'blob' as 'json',
        };
        return this.http.get<any>(environment.api_url + url, httpOptions).pipe(
        );
    }
}
