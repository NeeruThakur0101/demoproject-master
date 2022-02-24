import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyInformationComponent } from './company-information.component';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/core/services/http-service';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { CompanyService } from './company.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';

fdescribe('CompanyInformationComponent', () => {
    let component: CompanyInformationComponent;
    let fixture: ComponentFixture<CompanyInformationComponent>;
    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CompanyInformationComponent],
            providers: [DialogService, DialogContainerService, ApiService, DialogRef,
                FormBuilder, CompanyService, StorageService, UniversalService,
                ContractorRegistrationService,
                AuthenticationService,
                InternalUserDetailsService,
                ContractorDataService,
                Renderer2
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientModule,
                RouterTestingModule.withRoutes([])
            ],
            schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]

        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should call canDeactivate', () => {
    //     component.canDeactivate();
    //     expect(component.canDeactivate).toBeDefined();
    // });

    // it('should call onMousedown', () => {
    //     const event = Event;
    //     component.onMousedown(event);
    //     expect(component.onMousedown).toBeDefined();
    // });

    // it('should call onMouseup', () => {
    //     const event = Event;
    //     component.onMouseup(event);
    //     expect(component.onMouseup).toBeDefined();
    // });

    // it('should call ngOnInit', () => {
    //     const event = Event;
    //     component.ngOnInit();
    //     expect(component.ngOnInit).toBeDefined();
    // });

    // it('should call ngAfterViewInit', () => {
    //     component.ngAfterViewInit();
    //     expect(component.ngAfterViewInit).toBeDefined();
    // });

    // it('should call callMain', () => {
    //     component.callMain();
    //     expect(component.callMain).toBeDefined();
    // });

    // it('should call financialData', () => {
    //     component.financialData();
    //     expect(component.financialData).toBeDefined();
    // });

    // it('should call getPendingApprovalData', () => {
    //     component.getPendingApprovalData();
    //     expect(component.getPendingApprovalData).toBeDefined();
    // });

    // it('should call visualCueProcess', () => {
    //     component.visualCueProcess();
    //     expect(component.visualCueProcess).toBeDefined();
    // });

    // it('should call patchCompanyForm', () => {
    //     component.patchCompanyForm();
    //     expect(component.patchCompanyForm).toBeDefined();
    // });

    // it('should call objectsAreSame', () => {
    //     const x = {};
    //     const y = {};
    //     component.objectsAreSame(x,y);
    //     expect(component.objectsAreSame).toBeDefined();
    // });

    // it('should call companyDetails', () => {
    //     component.companyDetails();
    //     expect(component.companyDetails).toBeDefined();
    // });

    it('should call onChanges', () => {
        component.onChanges();
        expect(component.onChanges).toBeDefined();
    });

    it('should call toggleVisibility', () => {
        const e = Event;
        component.toggleVisibility(e);
        expect(component.toggleVisibility).toBeDefined();
    });

    it('should call convertDate', () => {
        // const date = '10/11/2020';
        component.convertDate('');
        expect(component.convertDate).toBeDefined();
    });

    it('should call sendJsonInternalEmployee', () => {
        const form = {
            CompanyDetails: {
                CompanyName: 'abc',
                CompanyLegalName: 'abc',
                WebSite: 'www.abc.com',
                ContractorFederalTaxNumber: '6456464646',
                ContractorFranchiseSelectedNumber: '1',
                ContractorCountryCode: '1',
                ContractorXactNetAddress: '132.54.65.65',
                ContractorSymbilityAddress: '656776767',
                ContractorOpeningDate: '12/3/1990',
                ContractorPercentOfOverallBusinessSubContracted: 10,
                ContractorCentralHeardMethod: 5,
                CountOfEmployeesInContractorCompany: 12,
                ContractorEmployeeUniformFlag: true,
                ContractorEmployeeIdentificationFlag: true,
                WorkersCompanyMinimumRequirementFlag: true,
                ContractorMoistureData: [],
            },
        };;
        component.sendJsonInternalEmployee(form);
        expect(component.onSubmit).toBeDefined();
    });

    // it('should call onRepositoryOpen', () => {
    //     component.onRepositoryOpen();
    //     expect(component.onRepositoryOpen).toBeDefined();
    // });
    it('should call onRepositoryOpen method', async () => {
        const onClickMock = spyOn(component, 'onRepositoryOpen');
        fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
        expect(onClickMock).toHaveBeenCalled();
    });

    it('should call onBackClick', () => {
        component.onBackClick();
        expect(component.onBackClick).toBeDefined();
    });

    it('should call nextPage', () => {
        component.nextPage();
        expect(component.nextPage).toBeDefined();
    });

    it('should call handleFilterFranchise', () => {
        component.FrenchiseData = [];
        component.handleFilterFranchise('Canada');
        expect(component.handleFilterFranchise).toBeDefined();
    });

    it('should call isNumber', () => {
        const e = Event;
        component.isNumber(e);
        expect(component.isNumber).toBeDefined();
    });

    it('should call onFocus', () => {
        const e: any = {};
        component.onFocus(e);
        expect(component.onFocus).toBeDefined();
    });

    it('should call unsuccess', () => {
        component.unsuccess();
        expect(component.unsuccess).toBeDefined();
    });

    it('should call ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(component.ngOnDestroy).toBeDefined();
    });
});
