import { HeaderComponent } from './components/header/header.component';
import { UploadModule } from '@progress/kendo-angular-upload';
// Modules
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule, NumericTextBoxModule } from '@progress/kendo-angular-inputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { IntlModule } from '@progress/kendo-angular-intl';
import { GridModule } from '@progress/kendo-angular-grid';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';
import { PopupModule } from '@progress/kendo-angular-popup';
import { SaveAlertComponent } from './components/save-alert.component';
import { DialogAlertsComponent } from './components/dialog-alerts/dialog-alerts.component';

// Components
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { MulticheckFilterComponent } from './components/multicheck-filter/multicheck-filter.component';
import { InternalUserDetailsService } from './services/internal-userDetails.service';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { CrDetailComponent } from './components/page-title/cr-detail/cr-detail.component';
import { OperationCorrectionRequestComponent } from './components/operation-correction-request/operation-correction-request.component';
import { MultiCheckFilterComponent } from '../modules/internal-employee-module/components/shared-layouts/multicheck.filter.component';
import { StorageService } from '../core/services/storage.service';
import { PhonePipe } from './pipes/phone.pipe';
import { LoginInvalidAlertComponent } from './components/login-invalid-alert/login-invalid-alert.component';

// Components

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 4,
};

@NgModule({
    declarations: [
        SaveAlertComponent,
        DialogAlertsComponent,
        HeaderComponent,
        MulticheckFilterComponent,
        PageTitleComponent,
        CrDetailComponent,
        OperationCorrectionRequestComponent,
        MultiCheckFilterComponent,
        PhonePipe,
        LoginInvalidAlertComponent,
    ],
    entryComponents: [SaveAlertComponent, MultiCheckFilterComponent, DialogAlertsComponent, MulticheckFilterComponent],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        LayoutModule,
        TooltipModule,
        InputsModule,
        NumericTextBoxModule,
        ButtonsModule,
        DropDownsModule,
        IntlModule,
        DateInputsModule,
        DialogsModule,
        GridModule,
        PDFExportModule,
        ExcelExportModule,
        PopupModule,
        UploadModule,
        SwiperModule,
    ],
    exports: [
        FormsModule,
        CommonModule,
        LayoutModule,
        TooltipModule,
        ReactiveFormsModule,
        InputsModule,
        NumericTextBoxModule,
        ButtonsModule,
        DropDownsModule,
        IntlModule,
        DateInputsModule,
        DialogsModule,
        GridModule,
        PDFExportModule,
        ExcelExportModule,
        PopupModule,
        UploadModule,
        HeaderComponent,
        SwiperModule,
        MulticheckFilterComponent,
        MultiCheckFilterComponent,
        PageTitleComponent,
        CrDetailComponent,
        OperationCorrectionRequestComponent,
        PhonePipe,
    ],
    providers: [
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG,
        },
        InternalUserDetailsService,
        StorageService,
    ],
})
export class SharedModule {}
