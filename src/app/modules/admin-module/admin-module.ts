import { CacheInterceptor } from './../../core/services/cache-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared-module/shared-module';
import { CoreModule } from 'src/app/core/core.module';
import { AdminRoutingModule, adminComponents} from './admin-routes';
import { AdminService } from './components/admin/admin.service';
@NgModule({
    declarations: [
        // components
        adminComponents
        // dialogs
    ],
    entryComponents: [
        // components
    ],
    imports: [
        AdminRoutingModule,
        SharedModule,
        CoreModule
    ],
    providers: [
        AdminService,
        { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
    ]
})
export class AdminModule { }
