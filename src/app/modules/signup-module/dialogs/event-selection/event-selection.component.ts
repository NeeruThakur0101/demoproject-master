import { DialogService } from '@progress/kendo-angular-dialog';
import { AuthenticationService, SessionUser } from './../../../../core/services/authentication.service';
import { InternalUserDetailsService } from './../../../../shared-module/services/internal-userDetails.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OperationCorrectionRequestComponent } from 'src/app/shared-module/components/operation-correction-request/operation-correction-request.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { HttpParams } from '@angular/common/http';
import { ApiService } from 'src/app/core/services/http-service';

@Component({
    selector: 'app-event-selection',
    templateUrl: './event-selection.component.html',
})
export class EventSelectionComponent implements OnInit {
    @Input() eventData: any;
    eventArray: Array<any> = [];
    correctionArray: Array<any> = [];
    loginDetails: Array<SessionUser> = [];
    pageContent: any;
    constructor(
        public _srvStorage: StorageService,
        public route: Router,
        public $language: InternalUserDetailsService,
        public $auth: AuthenticationService,
        private apiService: ApiService,
        private $dialog: DialogService,
        private _srvInternalUser: InternalUserDetailsService
    ) { }

    ngOnInit(): void {
        this.pageContent = this._srvInternalUser.getPageContentByLanguage();
        this.eventData.forEach((element) => {
            if (element.EventName.toLowerCase() === 'Recertification'.toLowerCase()) {
                element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Recertification_Alert;
            } else if (element.EventName.toLowerCase() === 'App update'.toLowerCase()) {
                element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.App_Update_Alert;
            } else if (element.EventName.toLowerCase() === 'Application Correction Request'.toLowerCase()) {
                element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Application_Correction_Request_Alert;
            } else if (element.EventName.toLowerCase() === 'Profile Changes Correction Request'.toLowerCase()) {
                element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Profile_Changes_Correction_Request_Alert;
            } else if (element.EventName.toLowerCase() === 'App Update Correction Request'.toLowerCase()) {
                element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.App_Update_Correction_Request_Alert;
            } else if (element.EventName.toLowerCase() === 'Territory Coordinator Correction Request'.toLowerCase()) {
                element['EventNameTranslated'] = this.pageContent.Event_Selection_Alert.Territory_Coordinator_Correction_Request_Alert;
            }
        });
        this.eventArray = [];
        this.correctionArray = [];
        this.pageContent = this.$language.getPageContentByLanguage();

        this.eventArray = this.eventData.filter((eventType) => eventType.EventName !== 'No Event' && !eventType.EventName.includes('Correction'));
        this.correctionArray = this.eventData.filter((eventType) => eventType.EventName !== 'No Event' && eventType.EventName.includes('Correction'));
        this.loginDetails = Array(this.$auth.Profile);
    }

    public setEventAndRoute(eventName: string, eventID: number) {
        const sideEvent = eventName;
        eventName = eventName.includes('Profile') ? 'No Event' : eventName;
        const appendEvent = [{ ...this.loginDetails[0], EventName: eventName, EventTypeID: eventID, EventAlias: sideEvent.includes('Profile') ? sideEvent : null }];
        this._srvStorage.removeStorage('loginDetails');
        this._srvStorage.setStorage(appendEvent, 'loginDetails');
        if (!sideEvent.includes('Correction')) {
            if (sideEvent === 'No Event') {
                this.routeToCompany();
            } else {
                this.routeToLastPageVisited();
            }
        } else {
            const dialogRef = this.$dialog.open({
                content: OperationCorrectionRequestComponent,
                width: 500,
            });
            const popupInstance = dialogRef.content.instance;
            popupInstance.readonly = true;
            popupInstance.EventTypeID = eventID;
            this._srvStorage.setStorage(eventID.toString(), 'EventTypeID');
            popupInstance.path = 'Login';
            const eventObjTransalte = this.correctionArray.find(x => x.EventTypeID === eventID)
            popupInstance.EventName = eventObjTransalte.EventNameTranslated;
        }
    }

    public routeToCompany() {
        this.route.navigate([`/contractorRegistration/company-information`]);
    }

    public routeToLastPageVisited() {
        let lastPageVisited;
        let baseURL: string;
        let param = new HttpParams();
        param = param.append('resourceId', this.$auth.Profile.ResourceID.toString());
        param = param.append('CCOpsID', this.$auth.Profile.CCOpsID.toString());
        param = param.append('ContrID', this.$auth.Profile.ContrID.toString());
        param = param.append('EventName', this.$auth.Profile.EventName);
        this.apiService.get(`JSON/GetLastPageVisited`, { params: param, responseType: 'text' }).subscribe((contrData) => {
            lastPageVisited = contrData !== '' ? contrData : 'company-information';
            baseURL = '/contractorRegistration/';

            if (lastPageVisited === 'surge-info' || lastPageVisited === 'questionnaire' || lastPageVisited === 'veteran-info' || lastPageVisited === 'credential') {
                baseURL = '/existing-contractor/';
                lastPageVisited = lastPageVisited === 'credential' ? 'credentialing-info' : lastPageVisited;
            }

            this.route.navigate([baseURL + lastPageVisited]);
        });
    }
}
