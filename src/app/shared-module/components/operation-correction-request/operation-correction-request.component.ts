import { UniversalService } from './../../../core/services/universal.service';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { Component, Input, OnInit, ViewChild, ElementRef, Renderer2, AfterViewChecked } from '@angular/core';
import { ApiService } from 'src/app/core/services/http-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { Router } from '@angular/router';
import { InternalUserDetailsService } from '../../services/internal-userDetails.service';
import { HttpParams } from '@angular/common/http';

@Component({
    selector: 'app-operation-correction-request',
    templateUrl: './operation-correction-request.component.html',
    styleUrls: ['./operation-correction-request.component.scss'],
})
export class OperationCorrectionRequestComponent extends DialogContentBase implements OnInit, AfterViewChecked {
    @Input() CrrRequestType: string;
    @Input() DataTypeID: string;
    @Input() EventjsonObject: any;
    @Input() EventTypeID: number;
    @Input() path: string;
    @Input() EventName: string;
    @Input() readonly: boolean;
    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;
    corrReqFields = [];
    formGroup: FormGroup;
    loader: boolean = false;
    addOneCmtFlag: boolean;
    pageContent: any;
    constructor(
        private apiService: ApiService,
        dialog: DialogRef,
        private _srvApi: ApiService,
        private _srvAuth: AuthenticationService,
        private _srvDialog: DialogService,
        private _srvContrData: ContractorDataService,
        private route: Router,
        public _srvLanguage: InternalUserDetailsService,
        private renderer: Renderer2,
        private _srvUniversal: UniversalService
    ) {
        super(dialog);
        this.pageContent = this._srvLanguage.getPageContentByLanguage();
    }
    ngOnInit(): void {
        if (this.readonly) {
            this.getCorrectionRqstReadonly();
        } else {
            this.formGroup = new FormGroup({});
            this.getCorrReqPages();
        }
    }

    private async getCorrectionRqstReadonly(): Promise<void> {
        this.corrReqFields = await this._srvContrData.getAllComments(this._srvAuth.Profile.ContrID, this.EventTypeID, this.path);
    }
    private getCorrReqPages(): Promise<void> {
        const correctionArray = [];
        // this.EventjsonObject.CorrectionDetail[0]['userLanguageID'] = this._srvAuth.currentLanguageID;
        this.EventjsonObject.CorrectionDetail.forEach(element => {
            element = { ...element, userLanguageID: this._srvAuth.currentLanguageID }
            correctionArray.push(element);
        });

        this.EventjsonObject.CorrectionDetail = correctionArray;
        return new Promise((resolve, reject) => {
            this.loader = true;
            this._srvApi.post(`ContractorOperations/GetCorrectionRequestWindow`, this.EventjsonObject.CorrectionDetail).subscribe((res) => {
                this.corrReqFields = res;
                this.corrReqFields.forEach((ele, i) => {
                    this.formGroup.addControl(`cmt_${i}`, new FormControl());
                    this.formGroup.addControl(`chk_${i}`, new FormControl());
                    this.formGroup.controls[`cmt_${i}`].valueChanges.subscribe((value) => {
                        if (value) {
                            this.formGroup.controls[`chk_${i}`].setValue(true);
                        } else {
                            this.formGroup.controls[`chk_${i}`].setValue(false);
                        }
                    });
                });
                this.loader = false;
                resolve();
            });
        });
    }

    ngAfterViewChecked() {
        if (document.body)
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
    }

    public close() {
        this.dialog.close({ button: 'Yes' });
    }
    public onSave() {
        let count = 0;
        this.corrReqFields.forEach((ele, i) => {
            if (this.formGroup.controls[`cmt_${i}`].value) {
                count++;
            }
        });
        if (count <= 0) {
            const dialogRef = this._srvDialog.open({
                content: DialogAlertsComponent,
                width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
        <div class="modal-alert info-alert">

            <p>Add at least one comment.</p>
        </div>
    `;
            return dialogRef;
        }
        this.finalSave();
    }
    cmtAddedChange() {
        const x: any = document.getElementsByClassName('cmt-chk');
        const boolCollect: boolean[] = [];
        for (const chk of x) {
            boolCollect.push(chk.checked);
        }
        const index = boolCollect.findIndex((b) => b === true);
        this.addOneCmtFlag = index >= 0 ? false : true;
    }

    private finalSave(): void {
        const body = {
            ResourceId: this._srvAuth.ProfileInternal.ResourceID,
            ContrId: this._srvAuth.Profile.ContrID,
            EventGroupId: this.EventjsonObject.EventGroupId,
            EventTypeId: this.EventjsonObject.EventTypeId,
            CorrectionDetail: [],
        };
        this.corrReqFields.forEach((ele, i) => {
            if (this.formGroup.controls[`cmt_${i}`].value) {
                const cmt = {
                    ApplicationPageID: ele.ApplicationPageID,
                    Comment: this.formGroup.controls[`cmt_${i}`].value,
                    CCOpsID: ele.CCOpsID,
                    ContractorCentralDataTypeID: ele.ContractorCentralDataTypeID,
                };
                body.CorrectionDetail = [...body.CorrectionDetail, cmt];
            }
        });
        this._srvApi.post('ContractorOperations/InsertCorrectionRequestWindow', body).subscribe((res) => {
            this.dialog.close({ status: 'save' });
        });
    }
    okClick() {
        let lastPageVisited;
        let baseURL: string;
        let param = new HttpParams();
        param = param.append('resourceId', this._srvAuth.Profile.ResourceID.toString());
        param = param.append('CCOpsID', this._srvAuth.Profile.CCOpsID.toString());
        param = param.append('ContrID', this._srvAuth.Profile.ContrID.toString());
        param = param.append('EventName', this._srvAuth.Profile.EventName);
        this.apiService.get(`JSON/GetLastPageVisited`, { params: param, responseType: 'text' }).subscribe((contrData) => {
            lastPageVisited = contrData !== '' ? contrData : 'company-information';
            baseURL = '/contractorRegistration/';
            if (lastPageVisited === 'surge-info' || lastPageVisited === 'questionnaire' || lastPageVisited === 'veteran-info' || lastPageVisited === 'credential') {
                baseURL = '/existing-contractor/';
                lastPageVisited = lastPageVisited === 'credential' ? 'credentialing-info' : lastPageVisited;
            }
            this.path === 'Login' ? this.route.navigate([baseURL + lastPageVisited]) : this.close();
            return true;
        });
    }
    onKeyPress(e: any, value) {
        if (e.keyCode === 32 && !value.length) e.preventDefault();
    }
}
