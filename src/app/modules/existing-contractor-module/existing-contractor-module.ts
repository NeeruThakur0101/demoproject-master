import { CoreModule } from 'src/app/core/core.module';
import { ManageSurgeService } from './dialogs/manage-surge-license/manage-surge.service';
import { NgModule } from '@angular/core';
import { ExistingContratorRoutingModule } from './existing-contractor-routes';
import { SharedModule } from 'src/app/shared-module/shared-module';
import { UniversalService } from 'src/app/core/services/universal.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CacheInterceptor } from 'src/app/core/services/cache-interceptor';
import { ManageSurgeLicenseComponent } from 'src/app/modules/existing-contractor-module/dialogs/manage-surge-license/manage-surge-license.component';
import { DocumentUploadComponent } from './dialogs/document-upload/document-upload.component';
import { SurgeInformationComponent } from './components/surge-information/surge-information.component';
import { LanguageAndVeteranInformationComponent } from './components/language-and-veteran-information/language-and-veteran-information.component';
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { CredentiallingInformationComponent } from './components/credentialling-information/credentialling-information.component';
import { AdditionalComponent } from './components/credentialling-information/additional/additional.component';
import { CertificatesComponent } from './components/credentialling-information/certificates/certificates.component';
import { InsuranceComponent } from './components/credentialling-information/insurance/insurance.component';
import { LicensesComponent } from './components/credentialling-information/licenses/licenses.component';
import { TechnicalComponent } from './components/credentialling-information/technical/technical.component';
import { TrainingComponent } from './components/credentialling-information/training/training.component';
import { ViewTrainingAttendeesComponent } from './dialogs/view-training-attendees/view-training-attendees.component';
import { SurgeInfoDataService } from './components/surge-information/surge-info.service';
import { QuestionnaireDataService } from './components/questionnaire/questionnaire.service';
import { LanguageVeteranService } from './components/language-and-veteran-information/language-veteran.service';
import { CredentialService } from './components/credentialling-information/credential.service';
import { DocumentUploadService } from './dialogs/document-upload/document-upload.service';
import { ExistingNoAuthGuard } from './services/existing-can-activate.guard';


@NgModule({
    declarations: [AdditionalComponent, CertificatesComponent,

        InsuranceComponent, LicensesComponent, TechnicalComponent, TrainingComponent,
        CredentiallingInformationComponent, ViewTrainingAttendeesComponent,
        SurgeInformationComponent, ManageSurgeLicenseComponent, DocumentUploadComponent, LanguageAndVeteranInformationComponent, QuestionnaireComponent],
    imports: [ExistingContratorRoutingModule, SharedModule, CoreModule, ProgressBarModule],
    entryComponents: [ManageSurgeLicenseComponent, DocumentUploadComponent, ViewTrainingAttendeesComponent],

    providers: [ManageSurgeService,
        UniversalService,
        CredentialService,
        LanguageVeteranService,
        SurgeInfoDataService,
        QuestionnaireDataService,
        DocumentUploadService,
        ExistingNoAuthGuard,
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }],
})
export class ExistingContractorModule { }
