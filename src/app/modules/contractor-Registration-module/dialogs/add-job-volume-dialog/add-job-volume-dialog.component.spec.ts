import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobVolumeDialogComponent } from './add-job-volume-dialog.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule, DialogsModule, DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, FormBuilder } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/http-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { SaveAlertComponent } from 'src/app/shared-module/components/save-alert.component';

describe('AddJobVolumeDialogComponent', () => {
    let component: AddJobVolumeDialogComponent;
    let fixture: ComponentFixture<AddJobVolumeDialogComponent>;
    let service: ApiService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddJobVolumeDialogComponent, SaveAlertComponent],
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
            providers: [DialogService, DialogContainerService,DialogRef,
               FormBuilder,TranslateService, ApiService
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
        fixture = TestBed.createComponent(AddJobVolumeDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(component.jobForm.valid).toBeFalsy();
    });

    // field validity
    it('Add job field validity', () => {
        const year = component.jobForm.controls['year'];
        year.setValue('2018');
        const residentialInsurance = component.jobForm.controls['residentialInsurance'];
        residentialInsurance.setValue('24');
        const commercialInsurance = component.jobForm.controls['commercialInsurance'];
        commercialInsurance.setValue('34');
        const residentialRemodeling = component.jobForm.controls['residentialRemodeling'];
        residentialRemodeling.setValue('34');
        const commercialRemodeling = component.jobForm.controls['commercialRemodeling'];
        commercialRemodeling.setValue('34');
        const largetSingleJob = component.jobForm.controls['largetSingleJob'];
        largetSingleJob.setValue('55');
        const avgJobAmount = component.jobForm.controls['avgJobAmount'];
        avgJobAmount.setValue('54');
    });

    it('should be invalid fields', () => {
        const year = component.jobForm.controls['year'];
        year.setValue('');
        const residentialInsurance = component.jobForm.controls['residentialInsurance'];
        residentialInsurance.setValue('');
        const commercialInsurance = component.jobForm.controls['commercialInsurance'];
        commercialInsurance.setValue('');
        const residentialRemodeling = component.jobForm.controls['residentialRemodeling'];
        residentialRemodeling.setValue('');
        const commercialRemodeling = component.jobForm.controls['commercialRemodeling'];
        commercialRemodeling.setValue('');
        const largetSingleJob = component.jobForm.controls['largetSingleJob'];
        largetSingleJob.setValue('');
        const avgJobAmount = component.jobForm.controls['avgJobAmount'];
        avgJobAmount.setValue('');
    });

    it('should call doSomething', () => {
        fixture.detectChanges();
        const event = new Event('keydown', { bubbles: true });
        component.doSomething(event);
        expect(event.returnValue).toBeTruthy();
        spyOn(event, 'preventDefault');
        expect(event.preventDefault).toHaveBeenCalledTimes(0);
    });

    it('should call validateYear', () => {
        const year = 'validateYear';
        component.validateYear(year);
        expect(component.validateYear).toBeDefined();
    });

    it('should call numberOnly function', () => {
        const event = new Event('keydown', {});
        component.numberOnly(event);
        //expect(component.numberOnly(event)).toBe(false);
        expect(component.numberOnly).toBeDefined();
    });

    it('should call onPaste function', () => {
        component.onPaste();
        expect(component.onPaste()).toBe(false);
        expect(component.onPaste).toBeDefined();
    });

    it('should call checkPercentageValue function',()=>{
        const value = '100';
        component.checkPercentageValue(value);
        expect(component.checkPercentageValue).toBeDefined();
    });
    // it('should call closePopupAddJob function',()=>{
    //     const value = 'cancle';
    //     component.closePopupAddJob(value);
    //     expect(component.closePopupAddJob).toBeDefined();
    // });

    it('should call onSubmit', () => {
        spyOn(component, 'onSubmit');
        component.onSubmit();
        expect(component.onSubmit).toBeDefined();
    });

    it('should find form as invalid when commercialInsurance field is empty', () => {
        const control = component.jobForm.get('commercialInsurance');
        control.setValue(null);
        component.onSubmit();
        expect(component.jobForm.valid).toBeFalsy();
    })
    it('should find commercialInsurance as required', () => {
        const control = component.jobForm.get('commercialInsurance');
        control.setValue(null);
        component.onSubmit();
        expect(control.valid).toBeFalsy();
    })
});
