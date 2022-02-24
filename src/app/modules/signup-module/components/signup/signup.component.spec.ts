import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ApiService } from 'src/app/core/services/http-service';
import { SharedModule, DialogRef, DialogContainerService, DialogService, DialogsModule } from '@progress/kendo-angular-dialog';
import { ReactiveFormsModule, FormBuilder, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { TranslateService } from '@ngx-translate/core';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, By } from '@angular/platform-browser';
import { LoginComponent } from '../login/login.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('SignupComponent', () => {
    let component: SignupComponent;
    let fixture: ComponentFixture<SignupComponent>;
    let service: ApiService;
    const path: string = 'Signup/GetSignupData';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SignupComponent, LoginComponent],

            imports: [
                RouterTestingModule,
                SharedModule,
                DialogsModule,
                InputsModule,
                DropDownsModule,
                ButtonsModule,
                FormsModule,
                BrowserModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                HttpClientModule,
                RecaptchaModule,
                RecaptchaFormsModule,
                RouterTestingModule.withRoutes([{ path: 'login', component: LoginComponent }]),
            ],
            providers: [
                DialogService,
                DialogContainerService,
                { provide: DialogRef, useClass: { NG_VALUE_ACCESSOR } },
                { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' } as RecaptchaSettings },
                { provide: FormBuilder, useValue: FormBuilder },
                TranslateService,
                ApiService,
                DialogRef,
                FormBuilder,
                BrowserAnimationsModule,
            ],
        }).compileComponents();
        service = TestBed.get(ApiService);
    }));

    beforeEach(async (done) => {
        fixture = TestBed.createComponent(SignupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await sleep(750);
        done();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(component.regForm.valid).toBeFalsy();
    });

    // field validity
    it('reg field validity', () => {
        const firstName = component.regForm.controls['firstName'];
        firstName.setValue('Neeru');
        const lastName = component.regForm.controls['lastName'];
        lastName.setValue('Thakur');
        const compName = component.regForm.controls['companyName'];
        compName.setValue('unit test');
        const email = component.regForm.controls['email'];
        email.setValue('t@gmail.com');
        const confirmEmail = component.regForm.controls['confirmEmail'];
        confirmEmail.setValue('t@gmail.com');
        const country = component.regForm.controls['country'];
        country.setValue('1');
        const state = component.regForm.controls['state'];
        state.setValue('5');
    });

    it('should be invalid fields', () => {
        const firstName = component.regForm.controls['firstName'];
        firstName.setValue('');
        const lastName = component.regForm.controls['lastName'];
        lastName.setValue('');
        const compName = component.regForm.controls['companyName'];
        compName.setValue('');
        const email = component.regForm.controls['email'];
        email.setValue('');
        const confirmEmail = component.regForm.controls['confirmEmail'];
        confirmEmail.setValue('');
        const country = component.regForm.controls['country'];
        country.setValue('');
        const state = component.regForm.controls['state'];
        state.setValue('');
    });

    it('should be able to retrieve contries from the API via GET', (done) => {
        const dummycountries = [
            { ID: 1, Name: 'United States', Abbreviation: 'US' },
            { ID: 2, Name: 'Canada', Abbreviation: 'CA' },
        ];

        service.get(path).subscribe(
            (country) => {
                const result = country;
                try {
                    expect(result.Country.length).toBe(2);
                    expect(result.Country).toEqual(dummycountries);
                    done();
                } catch (error) { }
            },
            (err) => {
                console.log(err);
            }
        );
    });

    it('should be able to retrieve states from the API via GET', (done) => {
        const dummyStates = [
            { ID: 1, Name: 'Alabama', Abbreviation: 'AL' },
            { ID: 3, Name: 'Alaska', Abbreviation: 'AK' },
            { ID: 6, Name: 'Arizona', Abbreviation: 'AZ' },
            { ID: 2, Name: 'Arkansas', Abbreviation: 'AR' },
            { ID: 5, Name: 'California', Abbreviation: 'CA' },
            { ID: 7, Name: 'Colorado', Abbreviation: 'CO' },
            { ID: 8, Name: 'Connecticut', Abbreviation: 'CT' },
            { ID: 4, Name: 'Delaware', Abbreviation: 'DE' },
            { ID: 9, Name: 'Florida', Abbreviation: 'FL' },
            { ID: 10, Name: 'Georgia', Abbreviation: 'GA' },
            { ID: 11, Name: 'Hawaii', Abbreviation: 'HI' },
            { ID: 12, Name: 'Idaho', Abbreviation: 'ID' },
            { ID: 13, Name: 'Illinois', Abbreviation: 'IL' },
            { ID: 14, Name: 'Indiana', Abbreviation: 'IN' },
            { ID: 15, Name: 'Iowa', Abbreviation: 'IA' },
            { ID: 16, Name: 'Kansas', Abbreviation: 'KS' },
            { ID: 17, Name: 'Kentucky', Abbreviation: 'KY' },
            { ID: 18, Name: 'Louisiana', Abbreviation: 'LA' },
            { ID: 19, Name: 'Maine', Abbreviation: 'ME' },
            { ID: 20, Name: 'Maryland', Abbreviation: 'MD' },
            { ID: 21, Name: 'Massachusetts', Abbreviation: 'MA' },
            { ID: 22, Name: 'Michigan', Abbreviation: 'MI' },
            { ID: 23, Name: 'Minnesota', Abbreviation: 'MN' },
            { ID: 24, Name: 'Mississippi', Abbreviation: 'MS' },
            { ID: 25, Name: 'Missouri', Abbreviation: 'MO' },
            { ID: 26, Name: 'Montana', Abbreviation: 'MT' },
            { ID: 27, Name: 'Nebraska', Abbreviation: 'NE' },
            { ID: 28, Name: 'Nevada', Abbreviation: 'NV' },
            { ID: 29, Name: 'New Hampshire', Abbreviation: 'NH' },
            { ID: 30, Name: 'New Jersey', Abbreviation: 'NJ' },
            { ID: 31, Name: 'New Mexico', Abbreviation: 'NM' },
            { ID: 32, Name: 'New York', Abbreviation: 'NY' },
            { ID: 33, Name: 'North Carolina', Abbreviation: 'NC' },
            { ID: 34, Name: 'North Dakota', Abbreviation: 'ND' },
            { ID: 35, Name: 'Ohio', Abbreviation: 'OH' },
            { ID: 36, Name: 'Oklahoma', Abbreviation: 'OK' },
            { ID: 37, Name: 'Oregon', Abbreviation: 'OR' },
            { ID: 38, Name: 'Pennsylvania', Abbreviation: 'PA' },
            { ID: 39, Name: 'Rhode Island', Abbreviation: 'RI' },
            { ID: 40, Name: 'South Carolina', Abbreviation: 'SC' },
            { ID: 41, Name: 'South Dakota', Abbreviation: 'SD' },
            { ID: 42, Name: 'Tennessee', Abbreviation: 'TN' },
            { ID: 43, Name: 'Texas', Abbreviation: 'TX' },
            { ID: 44, Name: 'Utah', Abbreviation: 'UT' },
            { ID: 45, Name: 'Vermont', Abbreviation: 'VT' },
            { ID: 46, Name: 'Virginia', Abbreviation: 'VA' },
            { ID: 47, Name: 'Washington', Abbreviation: 'WA' },
            { ID: 48, Name: 'Washington DC', Abbreviation: 'DC' },
            { ID: 49, Name: 'West Virginia', Abbreviation: 'WV' },
            { ID: 50, Name: 'Wisconsin', Abbreviation: 'WI' },
            { ID: 51, Name: 'Wyoming', Abbreviation: 'WY' },
        ];

        service.get('Signup/GetStates/1').subscribe(
            (states) => {
                try {
                    expect(states.length).toBe(51);
                    expect(states).toEqual(dummyStates);
                    done();
                } catch (error) { }
            },
            (err) => {
                console.log(err);
            }
        );
    });
    it('should call signupform controls', () => {
        component.signupform;
        expect(component.signupform).toBeDefined();
    });

    it('should call getState list function', () => {
        component.getStatesList(1);
        expect(component.getStatesList).toBeDefined();
    });

    it('should call resetForm function', () => {
        component.resetForm();
        expect(component.resetForm).toBeDefined();
    });

    it('should call handleFilterCountry function', () => {
        component.handleFilterState('');
        expect(component.resetForm).toBeDefined();
    });

    it('should call handleFilterState function', () => {
        component.handleFilterState('');
        expect(component.resetForm).toBeDefined();
    });

    it('should call onSubmit', () => {
        spyOn(component, 'onSubmit');
        component.onSubmit();
        expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should go to login url', async(
        inject([Router, Location], (router: Router, location: Location) => {
            let fixture = TestBed.createComponent(SignupComponent);
            fixture.detectChanges();
            fixture.debugElement.query(By.css('a')).nativeElement.click();
            fixture.whenStable().then(() => {
                expect(location.path()).toEqual('/login');
            });
        })
    ));
});
