import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./modules/signup-module/signup-module.module').then((m) => m.SignupModule),
    },
    { path: 'core', loadChildren: () => import('./core/core.module').then((m) => m.CoreModule) },
    {
        path: 'contractorRegistration',
        loadChildren: () => import('./modules/contractor-Registration-module/contractor-Registration-module').then((m) => m.ContractorRegistrationModule),
    },
    {
        path: 'internal',
        loadChildren: () => import('./modules/internal-employee-module/internal-employee-module').then((m) => m.InternalEmployeeModule),
    },
    {
        path: 'existing-contractor',
        loadChildren: () => import('./modules/existing-contractor-module/existing-contractor-module').then((m) => m.ExistingContractorModule),
    },
    {
        path: 'admin',
        loadChildren: () => import('./modules/admin-module/admin-module').then((m) => m.AdminModule),
    }
];

@NgModule({
    imports: [CommonModule, RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
