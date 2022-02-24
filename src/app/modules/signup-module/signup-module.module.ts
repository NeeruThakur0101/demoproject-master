
import { CoreModule } from './../../core/core.module';
// Modules
import { NgModule } from '@angular/core';
import { SignupRoutingModule } from './signup.routing';
import { SharedModule } from 'src/app/shared-module/shared-module';
import { SignupComponent } from './components/signup/signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha';
import { LoginComponent } from './components/login/login.component';
import { LoginDialogComponent } from './dialogs/login-dialog/login-dialog.component';
import { EventSelectionComponent } from './dialogs/event-selection/event-selection.component';
import { SuccessComponent } from './dialogs/success/success.component';
// Components

@NgModule({
    declarations: [SignupComponent, SuccessComponent, LoginComponent, LoginDialogComponent, EventSelectionComponent],
    entryComponents: [
        LoginDialogComponent,
        EventSelectionComponent
    ],
    imports: [SharedModule, SignupRoutingModule,
        ReactiveFormsModule,
        RecaptchaModule,
        RecaptchaFormsModule, CoreModule],
    providers: [{
        provide: RECAPTCHA_SETTINGS,
        useValue: {
            // siteKey: '6Le2WkIcAAAAANAtOTlKlb4J8e9RpBAjMhjz5fwr' // dev master
            siteKey: '6LcC2u8bAAAAAOHEtPnLLa9wsuC9qfAdZtD5Sr4j' // DEV enhancement
            // siteKey: '6LeZw-8bAAAAABwE8e0bOJaJQx0MeNdztAcRfkso'  // QA new
        } as RecaptchaSettings,
    }]
})

export class SignupModule { }
