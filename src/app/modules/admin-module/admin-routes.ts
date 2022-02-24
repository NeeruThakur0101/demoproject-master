
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from '../contractor-Registration-module/services/can-activate/can-activate.guard';
// Components
import { AdminComponent } from './components/admin/admin.component';

// tslint:disable-next-line: max-line-length
export const adminComponents = [
    AdminComponent];

const adminRoute: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [NoAuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(adminRoute)],
    exports: [RouterModule],
    providers: [
        NoAuthGuard   ]
})
export class AdminRoutingModule { }
