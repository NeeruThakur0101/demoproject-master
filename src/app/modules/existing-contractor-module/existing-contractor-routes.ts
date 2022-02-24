import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CredentiallingInformationComponent } from './components/credentialling-information/credentialling-information.component';
import { LanguageAndVeteranInformationComponent } from './components/language-and-veteran-information/language-and-veteran-information.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { SurgeInformationComponent } from './components/surge-information/surge-information.component';
import { ExistingNoAuthGuard } from './services/existing-can-activate.guard';
const existingContratorRoute: Routes = [
    {
        path: 'surge-info',
        component: SurgeInformationComponent,
        canActivate: [ExistingNoAuthGuard]
    },
    {
        path: 'veteran-info',
        component: LanguageAndVeteranInformationComponent,
        canActivate: [ExistingNoAuthGuard]
    },
    {
        path: 'questionnaire',
        component: QuestionnaireComponent,
        canActivate: [ExistingNoAuthGuard]

    },
    {
        path: 'credentialing-info',
        component: CredentiallingInformationComponent,
        canActivate: [ExistingNoAuthGuard]
    }
];
@NgModule({
    imports: [RouterModule.forChild(existingContratorRoute)],
    exports: [RouterModule],
})
export class ExistingContratorRoutingModule { }
