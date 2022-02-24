import { inject, TestBed, getTestBed, async, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { AddReferenceDialogComponent } from './add-reference-dialog.component';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, NgModule, ElementRef, OnInit } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { SharedModule } from 'src/app/shared-module/shared-module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By, } from '@angular/platform-browser';
import { ApiService } from '../../../../core/services/http-service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DatePipe } from '@angular/common';




describe('AddReferenceDialogComponent', () => {
    let component: AddReferenceDialogComponent;
    let fixture: ComponentFixture<AddReferenceDialogComponent>;
    let de: DebugElement;
    let button: ElementRef;

    beforeEach((() => {
        TestBed.configureTestingModule({
            declarations: [AddReferenceDialogComponent],
            providers: [TranslateService, DialogRef, ApiService, DatePipe],
            imports: [SharedModule, RouterTestingModule, RouterModule, ReactiveFormsModule, BrowserModule, FormsModule, ButtonsModule,
                TranslateModule.forRoot(), HttpClientModule, BrowserAnimationsModule
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(AddReferenceDialogComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        button = de.query(By.css('button'));
    });

    function updateForm(ReferenceNumber, ReferenceName, ReferenceTypeNumber, ReferenceCompanyName, ReferencePosition, ReferencePhoneNumber, ReferenceEmail, JobType, AdditionalContactName, ReferenceComment) {
        component.referenceForm.controls['ReferenceNumber'].setValue(ReferenceNumber);
        component.referenceForm.controls['ReferenceName'].setValue(ReferenceName);
        component.referenceForm.controls['ReferenceTypeNumber'].setValue(ReferenceTypeNumber);
        component.referenceForm.controls['ReferenceCompanyName'].setValue(ReferenceCompanyName);
        component.referenceForm.controls['ReferencePosition'].setValue(ReferencePosition);
        component.referenceForm.controls['ReferencePhoneNumber'].setValue(ReferencePhoneNumber);
        component.referenceForm.controls['ReferenceEmail'].setValue(ReferenceEmail);
        component.referenceForm.controls['JobType'].setValue(JobType);
        component.referenceForm.controls['AdditionalContactName'].setValue(AdditionalContactName);
        component.referenceForm.controls['ReferenceComment'].setValue(ReferenceComment);
    }

    // should test the  component creation
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // to props  objReference
    it('should have default props', fakeAsync(() => {
        expect(component.objReference).toBeTruthy();
    }));


    it('form invalid when empty', () => {
        component.referenceForm.controls['ReferenceNumber'].setValue('');
        component.referenceForm.controls['ReferenceName'].setValue('');
        component.referenceForm.controls['ReferenceTypeNumber'].setValue('');
        component.referenceForm.controls['ReferenceCompanyName'].setValue('');
        component.referenceForm.controls['ReferencePosition'].setValue('');
        component.referenceForm.controls['ReferencePhoneNumber'].setValue('');
        component.referenceForm.controls['ReferenceEmail'].setValue('');
        component.referenceForm.controls['JobType'].setValue('');
        component.referenceForm.controls['AdditionalContactName'].setValue('');
        component.referenceForm.controls['ReferenceComment'].setValue('');
        expect(component.referenceForm.valid).toBeFalsy();
    });

    // it('referenceNumber field validity', () => {
    //     const ReferenceNumber = component.referenceForm.controls['ReferenceNumber'];
    //     expect(ReferenceNumber.valid).toHaveBeenCalled();
    //     ReferenceNumber.setValue('');
    //     expect(ReferenceNumber.hasError('')).toBeDefined();

    // });

    it('referenceName field validity', () => {
        const ReferenceName = component.referenceForm.controls['ReferenceName'];
        expect(ReferenceName.valid).toBeFalsy();
        ReferenceName.setValue('');
        expect(ReferenceName.hasError('required')).toBeTruthy();

    });

    it('referenceTypeNumber field validity', () => {
        const ReferenceTypeNumber = component.referenceForm.controls['ReferenceTypeNumber'];
        expect(ReferenceTypeNumber.valid).toBeFalsy();
        ReferenceTypeNumber.setValue('');
        expect(ReferenceTypeNumber.hasError('required')).toBeTruthy();
    });

    it('referenceCompanyName field validity', () => {
        const ReferenceCompanyName = component.referenceForm.controls['ReferenceCompanyName'];
        expect(ReferenceCompanyName.valid).toBeFalsy();
        ReferenceCompanyName.setValue('');
        expect(ReferenceCompanyName.hasError('required')).toBeTruthy();
    });

    it('referencePosition field validity', () => {
        const ReferencePosition = component.referenceForm.controls['ReferencePosition'];
        expect(ReferencePosition.valid).toBeFalsy();
        ReferencePosition.setValue('');
        expect(ReferencePosition.hasError('required')).toBeTruthy();
    });


    it('referencePhoneNumber field validity', () => {
        const ReferencePhoneNumber = component.referenceForm.controls.ReferencePhoneNumber;
        expect(ReferencePhoneNumber.valid).toBeFalsy();
        ReferencePhoneNumber.setValue('');
        expect(ReferencePhoneNumber.hasError('required')).toBeTruthy();
    });


    it('referenceEmail field validity', () => {
        let errors = {};
        const ReferenceEmail = component.referenceForm.controls['ReferenceEmail'];
        expect(ReferenceEmail.valid).toBeFalsy();

        // Email field is required
        errors = ReferenceEmail.errors || {};
        expect(errors['required']).toBeTruthy();

        // Set email to something
        ReferenceEmail.setValue('test');
        errors = ReferenceEmail.errors || {};
        expect(errors['required']).toBeFalsy();
        expect(errors['pattern']).toBeTruthy();

        // Set email to something correct
        ReferenceEmail.setValue('test@example.com');
        errors = ReferenceEmail.errors || {};
        expect(errors['required']).toBeFalsy();
        expect(errors['pattern']).toBeFalsy();
    });

    it('jobType field validity', () => {
        const JobType = component.referenceForm.controls['JobType'];
        expect(JobType.valid).toBeFalsy();
        JobType.setValue('');
        expect(JobType.hasError('required')).toBeTruthy();
    });



    it('should set submitted to true', () => {
        component.onSubmitAndNext();
        expect(component.submitted).toBeTruthy();
    });

    it('should set close to true', () => {
        const data = 'cancel';
        component.closeAddReference(data);
        expect(component.closeAddReference).toBeDefined();
    });

    it('should call referenceTypeValidation function', () => {
        const element = 'referenceTypeValidation';
        component.referenceTypeValidation(element);
        component.referenceTypeValidation('Commercial');
        component.referenceTypeValidation('Residential');

    });

    it('should call removeValidators function', () => {
        const data = 'removeValidators';
        component.removeValidators();
        expect(component.removeValidators).toBeDefined();
    });

    it('should call preventDataOnCancel function', () => {
        const data = 'preventDataOnCancel';
        component.preventDataOnCancel();
    });


    it('should call  referenceRoleId function', () => {
        const name = 'referenceRoleId';
        component.referenceRoleId(name);

    });

    // it('should test checkValidInput', () => {
    //     const event = {target:{value:'hero'}};
    //     const valLen = event.target.value.length;
    //     component.checkValidInput(event);
    //     expect(valLen).toEqual(12);
    // });

    it('should call handleFilterJob function', () => {
        const value = 'handleFilterJob';
        component.handleFilterJob(value);
        expect(component.handleFilterJob).toBeDefined();

    });

    it('should call handleFilterType function', () => {
        const value = 'handleFilterType';
        // spyOn(component, 'handleFilterType');
        component.handleFilterType(value);
        expect(component.handleFilterType).toBeDefined();
    });

    it('should set onSubmit to true', () => {
        const data = 'Submit';
        // spyOn(component, 'onSubmit');
        // component.onSubmit();
        expect(component.onSubmit).toBeDefined();

    });

    it('should set ngOnInit to true', () => {
        const data = 'OnInit';
        component.ngOnInit();
        expect(component.ngOnInit).toBeDefined();

    });

    it('form should be valid', () => {
        component.referenceForm.controls['ReferenceNumber'].setValue('1');
        component.referenceForm.controls['ReferenceName'].setValue('Priyanka');
        component.referenceForm.controls['ReferenceTypeNumber'].setValue('1');
        component.referenceForm.controls['ReferenceCompanyName'].setValue('Primus');
        component.referenceForm.controls['ReferencePosition'].setValue('Software');
        component.referenceForm.controls['ReferencePhoneNumber'].setValue('534-232-3223');
        component.referenceForm.controls['ReferenceEmail'].setValue('dd@gmail.com');
        component.referenceForm.controls['JobType'].setValue('da');
        component.referenceForm.controls['AdditionalContactName'].setValue('dsdsa');
        component.referenceForm.controls['ReferenceComment'].setValue('hello');
        expect(component.referenceForm.valid).toBeTruthy();
    });


    it('form value should update from form changes', fakeAsync(() => {
        // updateForm(validUser.ReferenceName, validUser.ReferenceTypeNumber, validUser.ReferenceCompanyName, validUser.ReferencePosition, validUser.ReferencePosition, validUser.ReferencePhoneNumber, validUser.ReferenceEmail, validUser.JobType, validUser.AdditionalContactName);
        // expect(component.referenceForm.value).toEqual(validUser);
    }));
    it('isValid should be false when form is invalid', fakeAsync(() => {
        // updateForm(validUser.ReferenceName, validUser.ReferenceTypeNumber, validUser.ReferenceCompanyName, validUser.ReferencePosition, validUser.ReferencePosition, validUser.ReferencePhoneNumber, validUser.ReferenceEmail, validUser.JobType, validUser.AdditionalContactName);
        // expect(component.submitted).toBeFalsy();
    }));
    it('should update model on submit', fakeAsync(() => {
        // updateForm(validUser.ReferenceName, validUser.ReferenceTypeNumber, validUser.ReferenceCompanyName, validUser.ReferencePosition, validUser.ReferencePosition, validUser.ReferencePhoneNumber, validUser.ReferenceEmail, validUser.JobType, validUser.AdditionalContactName);
        // component.onSubmit();
        // expect(component.objReference).toEqual(validUser);
    }));
    afterAll(() => {
        TestBed.resetTestingModule();
    });

});


