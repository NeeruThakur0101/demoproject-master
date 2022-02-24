import { HttpClient, HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ApiService } from 'src/app/core/services/http-service';
import { StorageService } from 'src/app/core/services/storage.service';
import { UniversalService } from 'src/app/core/services/universal.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';

import { SelectProgramTypeComponent } from './select-program-type.component';
import { SelectProgramService } from './select-program.service';

describe('SelectProgramTypeComponent', () => {
	let component: SelectProgramTypeComponent;
	let fixture: ComponentFixture<SelectProgramTypeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SelectProgramTypeComponent],
			providers:[InternalUserDetailsService,ApiService,AuthenticationService,
				StorageService,SelectProgramService,UniversalService,
				ContractorRegistrationService,DialogContainerService,DialogService],
			imports:[ BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientModule,
                RouterTestingModule.withRoutes([])]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SelectProgramTypeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	// it('should call checkHeight', () => {
    //     component.checkHeight();
    //     expect(component.checkHeight).toBeDefined();
    // });

	// it('should call loadMasterData', () => {
    //     component.loadMasterData();
    //     expect(component.loadMasterData).toBeDefined();
    // });

	// it('should call getPageData', () => {
    //     component.getPageData();
    //     expect(component.getPageData).toBeDefined();
    // });
	// it('should call fillTradesData', () => {
	// 	const tradesData : any = [];
    //     component.fillTradesData(tradesData);
    //     expect(component.fillTradesData).toBeDefined();
    // });

	// // it('should call onNext', () => {
    // //     component.onNext();
    // //     expect(component.onNext).toBeDefined();
    // // });
	// it('should call createArrayForReferencePage', () => {
	// 	component.arrayReferenceInfo = [
	// 		{ Id: 1, Name: 'abc', Checked: true }
	// 	];
    //     component.createArrayForReferencePage(1, '', true);
    //     expect(component.createArrayForReferencePage).toBeDefined();
    // });
	
});
