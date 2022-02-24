import { UploadInterceptor } from './modules/contractor-Registration-module/dialogs/repository-dialog/repository-dialog.component';
import { CoreModule } from 'src/app/core/core.module';
import { CacheInterceptor } from './core/services/cache-interceptor';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DialogsModule, DialogRef } from '@progress/kendo-angular-dialog';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { NgxMaskModule } from 'ngx-mask';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe, CommonModule, registerLocaleData } from '@angular/common';
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { GridModule } from '@progress/kendo-angular-grid';
import { PendingProfileChangeComponent } from './modules/internal-employee-module/dialogs/pending-profile-change/pending-profile-change.component';
import { ContractorDataService } from './core/services/contractor-data.service';
import { SharedModule } from './shared-module/shared-module';
import { EditRecertificationDateComponent } from './modules/internal-employee-module/dialogs/edit-recertification-date/edit-recertification-date.component';
import { DeleteAlertComponent } from './shared-module/components/delete-alert/delete-alert.component';
import { SelectEmailAddressComponent } from './modules/internal-employee-module/dialogs/select-email-address/select-email-address.component';
import { EmailTemplateComponent } from './modules/internal-employee-module/dialogs/email-template/email-template.component';
import { XHRInterceptorService } from './core/services/XHRInterceptor.service';

import localeFr from '@angular/common/locales/fr';

import '@progress/kendo-angular-intl/locales/en/all';
import '@progress/kendo-angular-intl/locales/fr/all';

registerLocaleData(localeFr);

@NgModule({
    declarations: [AppComponent, PendingProfileChangeComponent, EditRecertificationDateComponent, DeleteAlertComponent, SelectEmailAddressComponent, EmailTemplateComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SharedModule,
        CoreModule,
        FormsModule,
        InputsModule,
        CommonModule,
        // ngx-translate and the loader module
        HttpClientModule,
        DeviceDetectorModule.forRoot(),
        BrowserAnimationsModule,
        EditorModule,
        ProgressBarModule,
        NgIdleKeepaliveModule.forRoot(),
        NgxMaskModule.forRoot(),
        DialogsModule,
        ButtonsModule,
        GridModule,
    ],
    providers: [
        DatePipe,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: UploadInterceptor,
            multi: true,
        },
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: XHRInterceptorService, multi: true },
        DialogRef,
        ContractorDataService,
        {
            provide: LOCALE_ID,
            useValue: 'en-US',
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
