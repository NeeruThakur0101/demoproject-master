// Modules
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { SignupComponent } from './components/signup/signup.component';
import { LoginComponent } from './components/login/login.component';
export const authenticationComponents = [SignupComponent];

const authenticationRoute: Routes = [
	{ path: '', component: SignupComponent },
	{ path: 'login', component: LoginComponent },
];

@NgModule({
	entryComponents: [],
	imports: [RouterModule.forChild(authenticationRoute)],
	exports: [RouterModule]
})

export class SignupRoutingModule { }
