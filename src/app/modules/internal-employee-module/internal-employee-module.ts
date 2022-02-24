import { CacheInterceptor } from './../../core/services/cache-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/shared-module/shared-module';

import { CoreModule } from 'src/app/core/core.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgxPaginationModule } from 'ngx-pagination';
import 'hammerjs';
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { InternalLandingComponent } from './components/internal-landing/internal-landing.component';
import { InternalRoutingModule, internalEmployeeComponents } from './internal-employee.routes';
import { UniversalService } from 'src/app/core/services/universal.service';
import { AddEmployeesDialogComponent } from './dialogs/add-employee-dialog/add-employees-dialog.component';
// new

import { EmployeeInformationComponent } from './components/employee-information/employee-information.component';
import { ContractorOperationComponent } from './components/contractor-operation/contractor-operation.component';
import { SearchContractorComponent } from './components/search-contractor/search-contractor.component';

import { ChartsModule } from '@progress/kendo-angular-charts';

import { ContractorOperationService } from './components/contractor-operation/contractor-operation.service';
// Services

// popup
import { OperationAddEventComponent } from './dialogs/operation-add-event/operation-add-event.component';
import { OperationHistoryComponent } from './dialogs/operation-history/operation-history.component';
import { OperationHistoryEventsComponent } from './dialogs/operation-history-events/operation-history-events.component';
import { OperationHistoryDetailComponent } from './dialogs//operation-history-detail/operation-history-detail.component';
// import { SelectEmailAddressComponent } from './dialogs/select-email-address/select-email-address.component';
import { ReassignContracrtorActionComponent } from './dialogs/reassign-contracrtor-action/reassign-contracrtor-action.component';
import { BackgroundInformationComponent } from './components/background-information/background-information.component';
import { BackgroundInformationService } from './components/background-information/background-information.service';
import { ClientProgramDetailsWindowComponent } from './dialogs/client-program-details-window/client-program-details-window.component';
import { CreditInformationComponent } from './components/credit-information/credit-information.component';
import { AddCreditReportComponent } from './dialogs/add-credit-report/add-credit-report.component';
import { OperationHistoryService } from './dialogs/operation-history/operation-history.service';
import { CreditService } from './components/credit-information/credit.service';
import { EmployeeInfoDataService } from './components/employee-information/employee-info.service';
import { EmailTemplateService } from './dialogs/email-template/email-template.service';
import { MultiCheckDueDateFilterComponent } from './components/shared-layouts/multicheck.duedatefilter.component';
import { InternalLandingService } from './components/internal-landing/internal-landing.service';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
};

@NgModule({
    declarations: [
        // components
        MultiCheckDueDateFilterComponent,
        CreditInformationComponent,
        AddCreditReportComponent,
        internalEmployeeComponents,
        InternalLandingComponent,
        EmployeeInformationComponent,
        AddEmployeesDialogComponent,
        ContractorOperationComponent,
        BackgroundInformationComponent,
        SearchContractorComponent,
        OperationAddEventComponent,
        OperationHistoryComponent,
        OperationHistoryDetailComponent,
        // SelectEmailAddressComponent,
        OperationHistoryEventsComponent,
        ReassignContracrtorActionComponent,
        ClientProgramDetailsWindowComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [AddEmployeesDialogComponent, ClientProgramDetailsWindowComponent],
    imports: [
        SharedModule,
        InternalRoutingModule,
        CoreModule,
        PerfectScrollbarModule,
        NgxPaginationModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        GooglePlaceModule,
        ProgressBarModule,
        ChartsModule,
    ],
    providers: [
        InternalLandingService,
        CreditService,
        UniversalService,
        ContractorOperationService,
        BackgroundInformationService,
        EmployeeInfoDataService,
        EmailTemplateService,
        OperationHistoryService,
        DatePipe,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    ],
})
export class InternalEmployeeModule {}
