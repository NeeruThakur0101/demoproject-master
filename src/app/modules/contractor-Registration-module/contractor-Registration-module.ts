import { ValidationService } from './components/validation/validation.service';
import { CacheInterceptor } from './../../core/services/cache-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { AddReferenceDialogComponent } from './dialogs/add-reference-dialog/add-reference-dialog.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FinancialInformationComponent } from './components/financial-information/financial-information.component';
import { JobVolumeInformationComponent } from './components/job-volume-information/job-volume-information.component';
import { AddJobVolumeDialogComponent } from './dialogs/add-job-volume-dialog/add-job-volume-dialog.component';
// Modules
import { NgxMaskModule } from 'ngx-mask';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from 'src/app/shared-module/shared-module';
import { ContractorRoutingModule, contractorRegistrationComponents } from './contractor-Registration.routes';
// Services
import { ContractorRegistrationService } from './services/contractor-Registration.service';
// Components
import { FinancialDefferalProcessDialogComponent } from './dialogs/financial-defferal-process-dialog/financial-defferal-process-dialog.component';
import { OwnershipPageDialogComponent } from './dialogs/ownership-page-dialog/ownership-page-dialog.component';
import { CoreModule } from 'src/app/core/core.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { LocationPageDialogComponent } from './dialogs/location-page-dialog/location-page-dialog.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddFinancialInfoDialogComponent } from './dialogs/add-financial-info-dialog/add-financial-info-dialog.component';
import 'hammerjs';
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { OwnershipFilterPipe } from './pipes/ownershipfilter.pipe';
import { RepositoryDialogComponent } from './dialogs/repository-dialog/repository-dialog.component';
import { ContactInformationService } from './services/contactInfo.service';
import { ShimmerComponent } from 'src/app/shared-module/components/shimmer/shimmer.component';
import { AddProfileCoverageDialogComponent } from './dialogs/add-profile-coverage-dialog/add-profile-coverage-dialog/add-profile-coverage-dialog.component';
import { CopyCoverageProfileComponent } from './dialogs/copy-coverage-profile/copy-coverage-profile.component';
import { EquipmentService } from './components/equipment-information/equipment-information.service';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { CoverageProfileService } from './components/coverage-profile/coverage-profile.service';
import { JobVolumeInformationService } from './components/job-volume-information/job-volume-information.service';
import { SelectProgramService } from './components/select-program-type/select-program.service';
import { CompanyService } from './components/company-information/company.service';
import { TradeService } from './components/trade-information/trade.service';
import { LocationDataService } from './components/contractor-location/location.service';
import { ReferenceDataService } from './components/references-information/reference.service';
import { FinancialeDataService } from './components/financial-information/financial.service';
import { ThankYouDataService } from './components/thank-you/thank-you.service';
import { DocumentUploadService } from '../existing-contractor-module/dialogs/document-upload/document-upload.service';
import { SignatureDataService } from './components/signature-page/signature.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
};

@NgModule({
    declarations: [
        // components
        contractorRegistrationComponents,
        OwnershipPageDialogComponent,
        JobVolumeInformationComponent,
        FinancialInformationComponent,
        AddReferenceDialogComponent,
        RepositoryDialogComponent,

        // dialogs
        FinancialDefferalProcessDialogComponent,
        AddJobVolumeDialogComponent,
        AddFinancialInfoDialogComponent,
        AddProfileCoverageDialogComponent,
        LocationPageDialogComponent,
        CopyCoverageProfileComponent,
        ShimmerComponent,

        // pipes
        OwnershipFilterPipe,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [
        // components
        LocationPageDialogComponent,

        // modals
        OwnershipPageDialogComponent,
        FinancialDefferalProcessDialogComponent,
        AddJobVolumeDialogComponent,
        AddFinancialInfoDialogComponent,
        AddReferenceDialogComponent,
        RepositoryDialogComponent,
        AddProfileCoverageDialogComponent,
    ],
    imports: [
        SharedModule,
        ContractorRoutingModule,
        CoreModule,
        PerfectScrollbarModule,
        NgxPaginationModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ChartsModule,
        NgxMaskModule,
        GooglePlaceModule,
        ProgressBarModule,
        ScrollingModule,
    ],
    providers: [
        TradeService,
        CompanyService,
        DocumentUploadService,
        SelectProgramService,
        ContractorRegistrationService,
        ContactInformationService,
        DatePipe,
        EquipmentService,
        LocationPageDialogComponent,
        OwnershipFilterPipe,
        CoverageProfileService,
        FinancialeDataService,
        LocationDataService,
        ReferenceDataService,
        JobVolumeInformationService,
        ValidationService,
        ThankYouDataService,
        SignatureDataService,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    ],
})
export class ContractorRegistrationModule {}
