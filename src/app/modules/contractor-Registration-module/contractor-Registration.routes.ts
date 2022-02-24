import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { NoAuthGuard } from './services/can-activate/can-activate.guard';
import { EquipmentInformationComponent } from './components/equipment-information/equipment-information.component';
import { FinancialInformationComponent } from './components/financial-information/financial-information.component';
import { JobVolumeInformationComponent } from './components/job-volume-information/job-volume-information.component';
import { OwnershipInformationComponent } from './components/ownership-information/ownership-information.component';
// Modules
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { CompanyInformationComponent } from './components/company-information/company-information.component';
import { SelectProgramTypeComponent } from './components/select-program-type/select-program-type.component';
import { ValidationComponent } from './components/validation/validation.component';
import { ContractorLocationComponent } from './components/contractor-location/contractor-location.component';
import { TradeInformationComponent } from './components/trade-information/trade-information.component';
import { ReferencesInformationComponent } from './components/references-information/references-information.component';
import { CoverageProfileComponent } from './components/coverage-profile/coverage-profile.component';
import { SignaturePageComponent } from './components/signature-page/signature-page.component';
import { ContactInformationComponent } from './components/contact-information/contact-information.component';

// tslint:disable-next-line: max-line-length
export const contractorRegistrationComponents = [
    ContactInformationComponent,
    SelectProgramTypeComponent,
    CompanyInformationComponent,
    OwnershipInformationComponent,
    ContractorLocationComponent,
    ValidationComponent,
    TradeInformationComponent,
    ReferencesInformationComponent,
    EquipmentInformationComponent,
    CoverageProfileComponent,
    JobVolumeInformationComponent,
    FinancialInformationComponent,
    SignaturePageComponent,
    ThankYouComponent
];

const contractorRegistrationRoute: Routes = [
    {
        path: 'select-program',
        component: SelectProgramTypeComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'company-information',
        component: CompanyInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'contact-information',
        component: ContactInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'ownership',
        component: OwnershipInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'legal-questions',
        loadChildren: () => import('../legal/legal.module').then((m) => m.LegalModule),
        canActivate: [NoAuthGuard],
    },
    {
        path: 'contractor-location',
        component: ContractorLocationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'job-volume-information',
        component: JobVolumeInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'financial-information',
        component: FinancialInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'reference-information',
        component: ReferencesInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'equipment-information',
        component: EquipmentInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'trade-information',
        component: TradeInformationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'coverage-profile-information',
        component: CoverageProfileComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'coverage-profile-information/:id',
        component: CoverageProfileComponent,
        // canActivate: [NoAuthGuard]
    },
    {
        path: 'validation',
        component: ValidationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'signature-page',
        component: SignaturePageComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'thank-you',
        component: ThankYouComponent,
        canActivate: [NoAuthGuard]

    }
];

@NgModule({
    imports: [RouterModule.forChild(contractorRegistrationRoute)],
    exports: [RouterModule],
    providers: [
        NoAuthGuard]
})
export class ContractorRoutingModule { }
