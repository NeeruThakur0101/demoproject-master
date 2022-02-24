import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContractorLocationComponent } from './contractor-location.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserModule, By } from '@angular/platform-browser';
import { DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
import { ApiService } from 'src/app/core/services/http-service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { LocationDataService } from './location.service';
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
describe('ContractorLocationComponent', () => {
    let component: ContractorLocationComponent;
    let fixture: ComponentFixture<ContractorLocationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, HttpClientModule, BrowserModule, 
                RouterTestingModule, TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                }
            })],
            declarations: [ContractorLocationComponent],
            providers: [ContractorRegistrationService,InternalUserDetailsService,AuthenticationService,
                StorageService,ContractorDataService,LocationDataService,
                FormBuilder,  DialogService, DialogContainerService, UniversalService, ApiService],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .overrideComponent(ContractorLocationComponent, {
                set: {}
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ContractorLocationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('form invalid when empty', () => {
    //     expect(component.locationForm.valid).toBeFalsy();
    // });
    // it(`should have as title 'contractor_location' `, async(() => {
    //     // tslint:disable-next-line: no-shadowed-variable
    //     const fixture = TestBed.createComponent(ContractorLocationComponent);
    //     const app = fixture.debugElement.componentInstance;
    //     expect('').toEqual('');
    // }));
    // it('should call openDialogForm method', async () => {
    //     const onClickMock = spyOn(component, 'openDialogForm');
    //     fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
    //     expect(onClickMock).toHaveBeenCalled();
    // });
});
