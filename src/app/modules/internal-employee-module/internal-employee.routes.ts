import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InternalLandingComponent } from './components/internal-landing/internal-landing.component';
import { NoAuthGuard } from '../contractor-Registration-module/services/can-activate/can-activate.guard';
import { EmployeeInformationComponent } from './components/employee-information/employee-information.component';
import { ContractorOperationComponent } from './components/contractor-operation/contractor-operation.component';
import { SearchContractorComponent } from './components/search-contractor/search-contractor.component';
import { CreditInformationComponent } from './components/credit-information/credit-information.component';
import { BackgroundInformationComponent } from './components/background-information/background-information.component';



export const internalEmployeeComponents = [
    InternalLandingComponent,
    ContractorOperationComponent
];

const internalEmployeeRoute: Routes = [
    {
        path: 'internal-landing',
        component: InternalLandingComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'employee-information',
        component: EmployeeInformationComponent
    },
    {
        path: 'contractor-operation',
        component: ContractorOperationComponent
    },
    {
        path: 'background-information',
        component: BackgroundInformationComponent
    },
    {
        path: 'search-contractor',
        component: SearchContractorComponent
    },
    {
        path: 'credit-info',
        component: CreditInformationComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(internalEmployeeRoute)],
    exports: [RouterModule],
    providers: [
        // CanDeactivateGuard,
        NoAuthGuard]
})
export class InternalRoutingModule { }
