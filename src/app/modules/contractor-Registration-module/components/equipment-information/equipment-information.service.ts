import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Equipment, EquipmentInfo, EquipmentInfoTab, SavedEquipment, SaveEquipment } from './model';
import { EditContractor } from 'src/app/core/models/contractor.module';
@Injectable()
export class EquipmentService {
    private baseURL: string = environment.api_url + 'EquipmentInfo';
    private burl: string = environment.api_url;
    public PageObject: EquipmentInfoTab[] = [];

    constructor(private $http: HttpClient) {}

    // Get Equipment info Tabs
    public GetEquipmentInfoTab(param): Promise<EquipmentInfoTab[]> {
        return this.$http.get<EquipmentInfoTab[]>(`${this.baseURL}/GetEquipmentInfoTab`,{params: param}).pipe(catchError(this.handleError)).toPromise();
    }
    public getSavedData(param): Promise<SavedEquipment> {
        return this.$http.get<SavedEquipment>(`${this.burl}EquipmentInformation/GetEquipmentInfo`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }
    // Get Equipments collection
    public GetEquipmentInfoTabData(param): Promise<Equipment[]> {
        return this.$http.get<Equipment[]>(`${this.baseURL}/GetEquipmentInfoTabData`,{params: param}).pipe(catchError(this.handleError)).toPromise();
    }
    public SaveEquipmentData(data:SaveEquipment): Promise<SaveEquipment> {
        return this.$http.put<SaveEquipment>(`${this.burl}EquipmentInformation/SaveEquipmentInformation`, data).pipe(catchError(this.handleError)).toPromise();
    }
    public submitEquipmentChanges(url: string, data): Promise<number> {
        return this.$http.put<number>(`${this.burl}${url}`, data).pipe(catchError(this.handleError)).toPromise();
    }
    public getContractorApprovalData(param):Promise<EditContractor[]>{
        return this.$http.get<EditContractor[]>(`${this.burl}EquipmentInformation/GetEquipmentEventPageJson`,{params:param}).pipe(catchError(this.handleError)).toPromise();
    }
    public getMasterEquipmentData(param):Promise<any>{
        return this.$http.get<any>(`${this.burl}JSON/GetContractorData`, {params:param}).pipe(catchError(this.handleError)).toPromise();
    }
    public FromEquipApproval(tgt, src, approvalJSON) {
        const rst: any = {};
        let visit = 0;
        // tslint:disable-next-line:forin
        for (const k in tgt) {
         // visit all fields
            if (approvalJSON.hasOwnProperty(k)) {
               if (approvalJSON[k] !== tgt[k] && (k==='NumberOfEquipmentOwned' || k === 'NumberOfEquipmentLease')) {
                    // if field is not an object and has changed
                    ++visit;
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            } else if(src!==undefined && src.hasOwnProperty(k)){
                if (src[k] !== tgt[k] && (k==='NumberOfEquipmentOwned' || k === 'NumberOfEquipmentLease')) {
                    // if field is not an object and has changed
                    ++visit;
                    rst[k] = tgt[k]; // use new value
                }
                // otherwise just skip it
            }else{
                if(tgt[k]!==null && (k==='NumberOfEquipmentOwned' || k === 'NumberOfEquipmentLease')){
                    ++visit;
                    rst[k] = tgt[k];
                }
            }
            if(k === 'EquipmentName' || k === 'EquipmentNumber'){
                rst[k] = tgt[k];
            }
        }

        return visit>0 ? rst: {};
    }
    public FromEquipApproved(tgt, src) {
        // if you got object
        const rst = {};
        let visit = 0
        // tslint:disable-next-line:forin
        for (const k in tgt) {
            // visit all fields
           if (src[k] !== tgt[k] && (k==='NumberOfEquipmentOwned' || k === 'NumberOfEquipmentLease')) {
                // if field is not an object and has changed
                ++visit;
                rst[k] = tgt[k]; // use new value
           }
            if(k === 'EquipmentName' || k === 'EquipmentNumber'){
                rst[k] = tgt[k];
            }
        }
        return visit>0 ?rst: {};
    }
    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Client Error');
        } else {
            console.error('Server Error');
        }

        // log error.
        return throwError(error);
    }
}
