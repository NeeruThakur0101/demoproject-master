// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { FinancialInformationComponent } from './financial-information.component';
// import { ApiService } from 'src/app/core/services/http-service';
// import { HttpClientModule } from '@angular/common/http';
// import { SharedModule, DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
// import { RouterTestingModule } from '@angular/router/testing';
// import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { By } from '@angular/platform-browser';
// import { UniversalService } from 'src/app/core/services/universal.service';
// import { AuthenticationService } from 'src/app/core/services/authentication.service';

// describe('FinancialInformationComponent', () => {
// 	let component: FinancialInformationComponent;
// 	let fixture: ComponentFixture<FinancialInformationComponent>;
//     let service : ApiService;
//     let $auth: AuthenticationService;
// 	beforeEach(async(() => {
// 		TestBed.configureTestingModule({
// 			imports : [HttpClientModule, SharedModule, RouterTestingModule, BrowserDynamicTestingModule],
// 			declarations: [FinancialInformationComponent],
// 			providers : [ApiService,DialogService,DialogContainerService,UniversalService],
// 			schemas : [NO_ERRORS_SCHEMA]
// 		})
// 			.compileComponents();
// 			service = TestBed.get(ApiService);
// 	}));

// 	beforeEach(() => {
// 		fixture = TestBed.createComponent(FinancialInformationComponent);
// 		component = fixture.componentInstance;
// 		fixture.detectChanges();
// 	});

// 	it('should create', () => {
// 		expect(component).toBeTruthy();
// 	});

// 	it('should call sliderChange function',()=>{
// 		const pageIndex = 1;
// 		component.sliderChange(pageIndex);
//         expect(component.sliderChange).toBeDefined();
// 	});

// 	it('should call onPageChange', () => {
// 		const state = { take : 1};
// 		component.onPageChange(state);
//         expect(component.onPageChange).toBeDefined();
// 	});

// 	it('should call getCompanyOpeningDate function', () => {
//         component.getCompanyOpeningDate();
//         expect(component.getCompanyOpeningDate).toBeDefined();
// 	});

// 	it('should call diff_years function',() => {
// 		const date = new Date();
// 		var currentDate = new Date();
// 		component.diff_years(currentDate,date);
// 		expect(component.diff_years).toBeDefined();
// 	});

// 	it('should call loadGridData', () => {
// 		component.loadGridData();
//         expect(component.loadGridData).toBeDefined();
// 	});
// 	it('should call funcToSaveLastPage function',()=>{
// 		const lastPage = 'select-program' ;
// 		spyOn(component, 'funcToSaveLastPage');
// 		component.funcToSaveLastPage(lastPage);
// 		expect(component.funcToSaveLastPage).toBeDefined();
// 	});

// 	it('should call onBack function',()=>{
// 		spyOn(component, 'onBack');
// 		component.onBack();
// 		expect(component.onBack).toBeDefined();
// 	});

// 	it('should call financialResult function',() => {
// 		const data = 'cancel';
// 		const option = 'ADD';
// 		component.financialResult(data,option);
// 		expect(component.financialResult).toBeDefined();
// 	});

// 	it('should call onSaveNext', () => {
//         spyOn(component, 'onSaveNext');
//         component.onSaveNext();
//         expect(component.onSaveNext).toBeDefined();
// 	});

// 	it('should call openAddFinancialpopup method', async () => {
//         const onClickMock = spyOn(component, 'openAddFinancialpopup');
//         fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
//         expect(onClickMock).toHaveBeenCalled();
//     });
//     it('should give year difference', () => {
//         const currDate = new Date();
//         const date = new Date();
//        const diffvalue = component.diff_years(currDate, date);
//        expect(diffvalue).toBe(0);
//     })

//     it('should not get privilege access for prospective user', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false }
//         $auth = new AuthenticationService(null,null);
//         component = new FinancialInformationComponent(null,null,null,null,null,null,null,null,$auth);
//         const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         })
//         component.ContrID = 0;
//         component.checkPrivilegeForUser();
//         expect(spy).toHaveBeenCalledTimes(0);
//     })
//      it('should disable the form when the access privilege is readonly', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false }
//         $auth = new AuthenticationService(null,null);
//         component = new FinancialInformationComponent(null,null,null,null,null,null,null,null,$auth);
//         const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         })
//         component.ContrID = 19417;
//         component.checkPrivilegeForUser();
//         expect(component.disableInternalAccess).toBeTruthy();
//     })
//      it('should get access privilege once for the user', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false }
//         $auth = new AuthenticationService(null,null);
//         component = new FinancialInformationComponent(null,null,null,null,null,null,null,null,$auth);
//         const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         })
//         component.ContrID = 19417;
//         component.checkPrivilegeForUser();
//         expect(spy).toHaveBeenCalledTimes(1);
//     })
// });
