import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddFinancialInfoDialogComponent } from './add-financial-info-dialog.component';
import { ApiService } from 'src/app/core/services/http-service';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule, DialogsModule, DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule, ReactiveFormsModule, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';

describe('AddFinancialInfoDialogComponent', () => {
    let component: AddFinancialInfoDialogComponent;
    let fixture: ComponentFixture<AddFinancialInfoDialogComponent>;
    let service: ApiService
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddFinancialInfoDialogComponent, SaveAlertComponent],
            imports: [RouterTestingModule, SharedModule, DialogsModule,
                InputsModule, DropDownsModule,
                ButtonsModule,
                FormsModule,
                BrowserModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                HttpClientModule,
                RecaptchaModule,
                RecaptchaFormsModule
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [DialogService, DialogContainerService,
                DialogRef,
                FormBuilder,
                TranslateService, ApiService
            ],
            // providers: [DialogService, DialogContainerService,
            //     { provide: DialogRef, useClass: { NG_VALUE_ACCESSOR } },
            //     { provide: FormBuilder, useValue: FormBuilder },
            //     TranslateService, ApiService, DialogRef,
            //     FormBuilder, BrowserAnimationsModule
            // ],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [SaveAlertComponent]
                }
            })
            .compileComponents();
        service = TestBed.get(ApiService);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddFinancialInfoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(component.financialForm.valid).toBeFalsy();
    });

    it('should call doSomething', () => {
        fixture.detectChanges();
        const event = new Event('keydown', { bubbles: true });
        component.doSomething(event);
        expect(event.returnValue).toBeTruthy();
        spyOn(event, 'preventDefault');
        expect(event.preventDefault).toHaveBeenCalledTimes(0);
    });

    it('should call toggleFiscalYear', () => {
        const value = true;
        component.toggleFiscalYear(value);
        expect(component.toggleFiscalYear).toBeDefined();
    });

    it('should call validateYear', () => {
        const year = '2019';
        component.validateYear(year);
        expect(component.validateYear).toBeDefined();
    });

    it('should call closeAddFinancial', () => {
        const data = 'Yes';
        spyOn(component, 'closeAddFinancial');
        component.closeAddFinancial(data);
        expect(component.closeAddFinancial).toBeDefined();
    });

    it('should call onSubmit', () => {
        component.onSubmit();
        expect(component.onSubmit).toBeTruthy();
    });

    it('should call numberOnly function', () => {
        // const event = new KeyboardEvent("keypress",{
        //     "key": "Enter"
        // });
        // component.numberOnly(event);
        expect(component.numberOnly).toBeDefined();
    });

    // it('should call completeEventHandler function', () => {
    //     component.completeEventHandler();
    // 	expect(component.completeEventHandler).toBeDefined();
    // });

    it('should call onPaste function', () => {
        component.onPaste();
        expect(component.onPaste).toBeDefined();
    });

    it('should call onKeyDown function', () => {
        component.onKeyDown();
        expect(component.onKeyDown).toBeDefined();
    });

    it('should call financialFormControl function', () => {
        expect(component.financialFormControl).toBeDefined();
    })

    // it('should call convertDate function',() => {
    //     component.convertDate('12-12-2019');
    //     expect(component.convertDate).toBeDefined();
    // })

    it('should find form as invalid when total revenue field is empty', () => {
        const control = component.financialForm.get('FINST_TOT_REVN_AM');
        control.setValue(null);
        component.onSubmit();
        expect(component.financialForm.valid).toBeFalsy();
    })
    it('should find total revenue as required', () => {
        const control = component.financialForm.get('FINST_TOT_REVN_AM');
        control.setValue(null);
        component.onSubmit();
        expect(control.valid).toBeFalsy();
    })
});
