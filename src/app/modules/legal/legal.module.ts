// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared-module/shared-module';
import { CoreModule } from './../../core/core.module';

// Services
import { LegalService } from './legal.service';

// Components
import { LegalComponent } from './legal.component';
import { DynamicFormPopupComponent } from './dynamic-form/dynamic-form-popup.component';
import {
    DynamicFormComponent, TextboxComponent, DropdownComponent,
    TextareaComponent, DatepickerComponent, ToggleComponent
} from './dynamic-form/dynamic-form.component';

@NgModule({
    declarations: [
        LegalComponent, DynamicFormPopupComponent, DynamicFormComponent,
        TextboxComponent, DropdownComponent, TextareaComponent,
        DatepickerComponent, ToggleComponent
    ],
    imports: [
        CommonModule, SharedModule, CoreModule,
        RouterModule.forChild([{ path: '', component: LegalComponent }])
    ],
    exports: [RouterModule],
    providers: [LegalService]
})

export class LegalModule {}