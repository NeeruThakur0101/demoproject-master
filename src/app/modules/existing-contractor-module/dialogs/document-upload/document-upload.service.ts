import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { DocumentType, FilesCount, ListFiles } from './model-document-upload';
import { ApiService } from 'src/app/core/services/http-service';
import { AuthenticationService, SessionUser } from 'src/app/core/services/authentication.service';

@Injectable()

export class DocumentUploadService {
    private baseUrlAlt: string = environment.api_url;

    constructor(private _srvAuth: AuthenticationService, private _httpClient: HttpClient, private _srvApi: ApiService) { }

    // GET-API Document Type
    public getDocumentType(loginDetails: SessionUser): Promise<DocumentType[]> {
        const currentLangId = this._srvAuth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('resourceId', loginDetails.ResourceID.toString());
        param = param.append('userLanguageID', currentLangId);
        return this._httpClient.get<DocumentType[]>(`${this.baseUrlAlt}UploadDocument/GetDocumentType/`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for Files Count
    public getCount(loginDetails: SessionUser): Promise<FilesCount[]> {
        const currentLangId = this._srvAuth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('CCOpsId', loginDetails.CCOpsID.toString());
        param = param.append('contrId', loginDetails.ContrID.toString());
        param = param.append('resourceID', loginDetails.ResourceID.toString());
        param = param.append('userLanguageID', currentLangId);
        return this._httpClient.get<FilesCount[]>(`${this.baseUrlAlt}UploadDocument/GetCount`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }

    // GET-API for ListFiles
    public getFilesList(loginDetails: SessionUser, folderName: string): Promise<ListFiles[]> {
        const currentLangId = this._srvAuth.currentLanguageID;
        let param = new HttpParams();
        param = param.append('repoName', folderName);
        param = param.append('CCOpsID', loginDetails.CCOpsID.toString());
        param = param.append('contrId', loginDetails.ContrID.toString());
        param = param.append('resourceID', loginDetails.ResourceID.toString());
        param = param.append('userLanguageID', currentLangId);
        return this._httpClient.get<ListFiles[]>(`${this.baseUrlAlt}UploadDocument/ListFiles`, { params: param })
            .pipe(catchError(this.handleError)).toPromise();
    }


    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Client Error');
        } else { console.error('Server Error'); }

        // log error.
        return throwError(error);
    }
}

