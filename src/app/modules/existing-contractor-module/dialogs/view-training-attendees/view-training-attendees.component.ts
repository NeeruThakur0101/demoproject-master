import { DialogRef, DialogService, DialogContentBase } from '@progress/kendo-angular-dialog';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { DeleteAlertComponent } from 'src/app/shared-module/components/delete-alert/delete-alert.component';
import { Attendees, EmployeeList, EmployeeTrainee, Training } from '../../components/credentialling-information/credentialing.model';
import { CredentialService } from '../../components/credentialling-information/credential.service';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { UniversalService } from 'src/app/core/services/universal.service';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

@Component({
    selector: 'app-view-training-attendees',
    templateUrl: './view-training-attendees.component.html',
    styleUrls: ['./view-training-attendees.component.scss'],
})
export class ViewTrainingAttendeesComponent extends DialogContentBase implements OnInit {
    @Input() containerRef;
    @Input() pageLanguage: any;
    @Input() set dataItem(value: Training) {
        this._dataItem = value;
    }
    get dataItem(): Training {
        return this._dataItem;
    }
    public min: Date = new Date(1900, 0, 1);
    public max: Date = new Date(Date.now());
    public group: FormGroup;
    public loader: boolean = false;
    public submitted = false;
    public _dataItem: Training;
    public pageContent: any;
    private attendeesData: Attendees[] = [];
    public employeeList: EmployeeList[] = [];
    public employeeTrainees: EmployeeTrainee[] = [];

    @ViewChild('commentBlock') commentBlock: ElementRef;
    @ViewChild('commentArea') commentArea: ElementRef;

    constructor(
        _dialogRef: DialogRef,
        public $credentialSrv: CredentialService,
        private _srvAuthentication: AuthenticationService,
        private _dialog: DialogService,
        private renderer: Renderer2,
        private _srvUniversal: UniversalService,
        public intlService: IntlService
    ) {
        super(_dialogRef);
        this.$credentialSrv.getUser();
    }
    // used to disable datepicker field from typing
    @HostListener('document:keydown', ['$event.target.value']) onKeydownHandler(value: string) {
        if (value === undefined) {
            return false;
        } else {
            return true;
        }
    }

    public heightCalculate() {
        if (document.body) {
            this.renderer.removeClass(this.commentBlock.nativeElement, 'has-scroll');
            this.renderer.removeClass(this.commentBlock.nativeElement, 'none');
            if (this.commentBlock && this.commentArea) {
                const className = this._srvUniversal.calculateHeight(this.commentArea, this.commentBlock, 'max-height', 'min-Height');
                this.renderer.addClass(this.commentBlock.nativeElement, className);
            }
        }
    }

    ngOnInit(): void {
        //setting locale dynamically in case of internal employee
        (<CldrIntlService>this.intlService).localeId = this._srvAuthentication.currentLanguageID === 0 ? 'en-US' : 'fr-CA';

        this.pageContent = this.pageLanguage;
        this.getData();
        setTimeout(() => {
            this.heightCalculate();
        }, 3000);
    }

    async getData() {
        this.loader = true;
        this.group = new FormGroup({});
        this.employeeList = await this.$credentialSrv.getTraineeAttendeesPopupData();
        this.attendeesData = await this.$credentialSrv.getTraineeAttendeesData(this._dataItem.CredentialingTrackingNumber);
        this.attendeesData.forEach((ele) => {
            this.employeeTrainees.push({
                id: this.employeeTrainees.length,
                employee: ele.PersonalId,
                title: ele.Title,
                dateCompleted: new Date(ele.CompleteDate),
                deletedFlag: false,
                disabled: true,
            });
            this.group.addControl(`date${this.employeeTrainees.length - 1}`, new FormControl('', Validators.required));
            this.group.addControl(`empl${this.employeeTrainees.length - 1}`, new FormControl(ele.PersonalId));
        });
        this.employeeTrainees.push({
            id: this.employeeTrainees.length,
            employee: 0,
            title: '',
            dateCompleted: '',
            deletedFlag: false,
        });
        this.group.addControl(`date${this.employeeTrainees.length - 1}`, new FormControl());
        this.group.addControl(`empl${this.employeeTrainees.length - 1}`, new FormControl());
        this.loader = false;
    }
    public onEmployeeSelect(evt: EmployeeList, id: number) {
        if (this.submitted) {
            this.submitted = false;
        }
        const empIndex = this.employeeTrainees.findIndex((ele) => ele.employee === evt.PersonalId);
        if (empIndex > -1 && this.employeeTrainees[empIndex].deletedFlag === true) {
            this.employeeTrainees[empIndex].deletedFlag = false;
            this.group.addControl(`date${this.employeeTrainees[empIndex].id}`, new FormControl('', Validators.required));
            this.group.addControl(`empl${this.employeeTrainees[empIndex].id}`, new FormControl(evt.PersonalId));
            const idx = this.employeeTrainees.findIndex((ele) => ele.id === id);
            this.employeeTrainees.splice(idx, 1);
            this.group.removeControl(`date${id}`);
            this.group.removeControl(`empl${id}`);
            return;
        }
        this.group.controls[`date${id}`].setValidators(Validators.required);
        this.group.controls[`date${id}`].updateValueAndValidity();
        this.employeeTrainees[id]['title'] = evt.Title;
    }
    public close() {
        this.dialog.close({ button: 'Yes' });
    }
    public addEmployeeRow() {
        if (this.submitted) {
            this.submitted = false;
        }

        if (this.employeeTrainees[this.employeeTrainees.length - 1].employee) {
            this.employeeTrainees.push({
                id: this.employeeTrainees.length,
                employee: 0,
                title: '',
                dateCompleted: '',
                deletedFlag: false,
            });
            this.group.addControl(`date${this.employeeTrainees.length - 1}`, new FormControl());
            this.group.addControl(`empl${this.employeeTrainees.length - 1}`, new FormControl());
        }

        setTimeout(() => {
            this.heightCalculate();
        }, 100);
    }

    deleteProcess(row, id) {
        const empIndex = this.employeeTrainees.findIndex((ele) => ele.id === row.id);
        const duplicateEnteries = this.employeeTrainees.filter((elem) => {
            return elem.employee === row.employee;
        });
        if (id < 0 || duplicateEnteries.length > 1) {
            this.employeeTrainees.splice(empIndex, 1);
            this.group.controls[`date${empIndex}`].setValue('');
            this.group.controls[`empl${empIndex}`].setValue(0);
            if (empIndex < this.employeeTrainees.length) {
                for (let i = row.id; i < this.employeeTrainees.length; i++) {
                    this.employeeTrainees[i].id = i;
                    this.group.controls[`date${i}`].setValue(this.group.controls[`date${i + 1}`].value === '' ? '' : new Date(this.group.controls[`date${i + 1}`].value));
                    this.group.controls[`empl${i}`].setValue(
                        this.group.controls[`empl${i + 1}`].value === 0 || !this.group.controls[`empl${i + 1}`].value ? null : this.group.controls[`empl${i + 1}`].value
                    );
                }
                this.group.removeControl(`date${this.employeeTrainees.length}`);
                this.group.removeControl(`empl${this.employeeTrainees.length}`);
            } else {
                this.group.removeControl(`date${empIndex}`);
                this.group.removeControl(`empl${empIndex}`);
            }
            return;
        }
        this.employeeTrainees[empIndex].deletedFlag = true;
        this.employeeTrainees[empIndex].dateCompleted = '';
        this.group.removeControl(`date${row.id}`);
        this.group.removeControl(`empl${row.id}`);
        if (this.employeeTrainees.length === this.attendeesData.length) {
            this.addRowForBlankTable();
        }

        setTimeout(() => {
            this.heightCalculate();
        }, 3000);
    }
    public deleteEmployeeRow(row: EmployeeTrainee) {
        if (this.submitted) {
            this.submitted = false;
        }
        const id = this.attendeesData.findIndex((idx) => idx.PersonalId === row.employee);
        if (id > -1) {
            const dialogAlert = this._dialog.open({ content: DeleteAlertComponent, width: 500, appendTo: this.containerRef });
            const dialogData = dialogAlert.content.instance;
            dialogData.header = this.pageContent.Event_Selection.Alert;
            dialogData.alertMessage = `
                <div class="modal-alert info-alert">
                <p *ngIf="pageContent">${this.pageContent.Credentialing_Information.Are_You_Sure_To_Delete} </p>
               </div> `;
            dialogAlert.result.subscribe((result) => {
                const resultFromDialog = result;
                if (resultFromDialog['button'] === 'Yes') {
                    this.deleteProcess(row, id);
                }
            });
        } else {
            this.deleteProcess(row, id);
        }

        setTimeout(() => {
            this.heightCalculate();
        }, 1000);
    }
    addRowForBlankTable() {
        const delFlag = this.employeeTrainees.filter((el) => {
            return el.deletedFlag === false;
        });
        if (delFlag.length === 0) {
            this.employeeTrainees.push({
                id: this.employeeTrainees.length,
                employee: 0,
                title: '',
                dateCompleted: '',
                deletedFlag: false,
            });
            this.group.addControl(`date${this.employeeTrainees.length - 1}`, new FormControl());
            this.group.addControl(`empl${this.employeeTrainees.length - 1}`, new FormControl());
        }
    }
    async onSave(data) {
        this.submitted = true;
        if (!this.group.valid) {
            return;
        }
        const duplicateData = JSON.parse(JSON.stringify(data));
        duplicateData.sort((a, b) => {
            return a.employee - b.employee;
        });
        let duplicateFlag: boolean = false;

        for (let i = 0; i < duplicateData.length - 1; i++) {
            if (duplicateData[i].employee === duplicateData[i + 1].employee) {
                duplicateFlag = true;
                break;
            }
        }

        if (duplicateFlag) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 450, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;

            dialog.alertMessage = `
        <div class="modal-alert info-alert">
            <p *ngIf="pageContent">${this.pageContent.Credentialing_Information.Exist_Duplicate_Enteries}</p>
       </div> `;
            duplicateFlag = false;
            this.submitted = false;
            return;
        }
        let dateNotValid: number = 0;
        let updatedData: boolean = false;
        for (const element of this.employeeTrainees) {
            const validDateChk = this.$credentialSrv.validateDate(moment(element.dateCompleted).format('MM-DD-YYYY'));
            if (validDateChk === false && element.deletedFlag === false) {
                dateNotValid++;
            }
            const index = this.attendeesData.findIndex((ele) => ele.PersonalId === element.employee);
            if (index > -1) {
                if (moment(element.dateCompleted).format('MM-DD-YYYY') !== moment(this.attendeesData[index].CompleteDate).format('MM-DD-YYYY')) {
                    updatedData = true;
                    break;
                } else if (element.deletedFlag === true) {
                    updatedData = true;
                    break;
                }
            } else if (element.employee && element.dateCompleted) {
                updatedData = true;
                break;
            }
        }
        if (!updatedData) {
            const dialogRef = this._dialog.open({ content: DialogAlertsComponent, width: 450, appendTo: this.containerRef });
            const dialog = dialogRef.content.instance;

            dialog.alertMessage = `
        <div class="modal-alert info-alert">
            <p *ngIf="pageContent">${this.pageContent.Credentialing_Information.No_Changes_Msg}</p>
       </div> `;
            updatedData = false;
            this.submitted = false;
            return;
        }
        if (dateNotValid > 0) {
            const dialogRef = this._dialog.open({
                content: DialogAlertsComponent,
                width: 500,
                appendTo: this.containerRef,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                    <div class="modal-alert info-alert">
                        <p *ngIf="pageContent">${this.pageContent.Credentialing_Information.Invalid_Date}</p>
                    </div>
                `;
            this.submitted = false;
            dateNotValid = 0;
            return;
        }
        const saveObj = [];
        await this.$credentialSrv.getServerTime();
        const loggedInUserResourceId = this._srvAuthentication.LoggedInUserType === 'Internal' ? this._srvAuthentication.ProfileInternal.ResourceID : this._srvAuthentication.Profile.ResourceID;
        data.forEach((x) => {
            if (x.employee && (x.dateCompleted || x.deletedFlag === true)) {
                const obj = {
                    Contr_ID: this._srvAuthentication.Profile.ContrID,
                    CredentialingTrackingNumber: this._dataItem.CredentialingTrackingNumber,
                    CredentialingMetricTypeID: this._dataItem.MetricTypeNumber,
                    PersonalId: x.employee,
                    CompleteDate: x.dateCompleted && x.dateCompleted !== null ? moment(x.dateCompleted).format('MM-DD-YYYY') : null,
                    DeletedFlag: x.deletedFlag,
                    MetricTypeNumber: this._dataItem.MetricTypeNumber,
                    CreatedResourceID: this._dataItem['CreatedDate'] == null ? loggedInUserResourceId : this._dataItem.CreatedResourceID,
                    UpdatedResourceID: this._dataItem['CreatedDate'] !== null ? loggedInUserResourceId : this._dataItem.UpdatedResourceID,
                    CreatedDate: this._dataItem['CreatedDate'] == null ? this.$credentialSrv.timeStamp : this._dataItem.CreatedDate,
                    UpdatedDate: this._dataItem['UpdatedDate'] !== null ? this.$credentialSrv.timeStamp : this._dataItem.UpdatedDate,
                    ExpirationDate: this._dataItem.ExpirationDate !== null && this._dataItem.ExpirationDate !== undefined ? moment(this._dataItem.ExpirationDate).format('MM-DD-YYYY') : null,
                };
                saveObj.push(obj);
            }
        });
        this.loader = true;
        await this.$credentialSrv.saveViewAttendeesData(saveObj);
        this.dialog.close({ status: 'Yes' });
        this.$credentialSrv.loadTraining.next(true);
    }

    public getDisplayedList() {
        let listDisplayLength = 0;
        if (this.employeeTrainees.length === this.attendeesData.length) {
            const delFlag = this.employeeTrainees.filter((el) => {
                return el.deletedFlag === false;
            });
            if (delFlag.length === 1) {
                return true;
            }
        }
        this.employeeTrainees.forEach((ele) => {
            if (ele.deletedFlag === false) {
                listDisplayLength += 1;
            }
        });
        return listDisplayLength > 1 ? true : false;
    }
    getDisplayedListPlus() {
        let listLength = 0;
        let index: number;
        let delIndex: number;
        this.employeeTrainees.forEach((ele, i) => {
            if (ele.deletedFlag === true) {
                listLength += 1;
                delIndex = i;
            } else {
                index = i;
            }
        });
        if (listLength) {
            if (this.employeeTrainees.length > this.attendeesData.length) {
                return index;
            } else {
                return listLength ? index : delIndex;
            }
        }
        return this.employeeTrainees.length - 1;
    }
    onDateSelect(evt, id) {
        if (this.submitted) {
            this.submitted = false;
        }
        this.group.get(`empl${id}`).setValidators([Validators.required]);
        this.group.get(`empl${id}`).updateValueAndValidity();
    }
}
