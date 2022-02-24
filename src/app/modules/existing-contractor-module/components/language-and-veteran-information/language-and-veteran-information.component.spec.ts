// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { LanguageAndVeteranInformationComponent } from './language-and-veteran-information.component';
// import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
// import { ApiService } from 'src/app/core/services/http-service';
// import { AuthenticationService } from 'src/app/core/services/authentication.service';
// import { DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
// import { DatePipe } from '@angular/common';
// import { RouterTestingModule } from '@angular/router/testing';
// import { HttpClientModule } from '@angular/common/http';
// import { of } from 'rxjs';

// describe('LanguageAndVeteranInformationComponent', () => {
//     let component: LanguageAndVeteranInformationComponent;
//     let fixture: ComponentFixture<LanguageAndVeteranInformationComponent>;
//     let authSrv: AuthenticationService;
//     let apiSrv: ApiService;
//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             declarations: [LanguageAndVeteranInformationComponent],
//             imports: [RouterTestingModule, HttpClientModule],
//             schemas: [NO_ERRORS_SCHEMA],
//             providers: [ApiService,AuthenticationService, DialogService, DatePipe, DialogContainerService],
//         }).compileComponents();
//     }));

//     beforeEach(() => {
//         fixture = TestBed.createComponent(LanguageAndVeteranInformationComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     it('should define getVeteranInfo function', () => {
//         expect(component.getVeteranInfo).toBeDefined();
//     })
//     it('should call getJsonData', () => {
//         expect(component.getJsonData).toBeDefined();
//     })
//     it('should set hidePage to false', () => {
//         component.contrId = 0;
//         component.checkPrivilegeForUser();
//         expect(component.hidePage).toBeFalse();
//     })
//     it('should define checkPrivilegeForUser', () => {
//         expect(component.checkPrivilegeForUser).toBeDefined();
//     })

//     it('should set form to disable when user have readonlyAccess', () => {
//         authSrv = new AuthenticationService(null,null);
//         component = new LanguageAndVeteranInformationComponent(null,null,authSrv,null,null)
//         const pageAccess = { readonlyAccess: true, editAccess: false }
//         spyOn(authSrv,'getPageAccessPrivilege').and.callFake((t) => {
//             return pageAccess;
//         })
//         component.contrId= 19417;
//         component.checkPrivilegeForUser();
//         expect(component.readonlyUserAccess).toBeTruthy();
//     })
//     it('should set save button disable when the user have readonlyAccess', () => {
//         authSrv = new AuthenticationService(null,null);
//         component = new LanguageAndVeteranInformationComponent(null,null,authSrv,null,null)
//         const pageAccess = { readonlyAccess: true, editAccess: false }
//         spyOn(authSrv,'getPageAccessPrivilege').and.callFake((t) => {
//             return pageAccess;
//         })
//         component.contrId= 19417;
//         component.checkPrivilegeForUser();
//         expect(component.saveBtnDisable).toBeTruthy();
//     })
//     it('should not get privilege access for prospective user', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false }
//         authSrv = new AuthenticationService(null,null);
//         component = new LanguageAndVeteranInformationComponent(null,null,authSrv,null,null);
//         const spy = spyOn(authSrv, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         })
//         component.contrId = 0;
//         component.checkPrivilegeForUser();
//         expect(spy).toHaveBeenCalledTimes(0);
//     })
//      it('should get access privilege once for the user', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false }
//         authSrv = new AuthenticationService(null,null);
//         component = new LanguageAndVeteranInformationComponent(null,null,authSrv,null,null);
//         const spy = spyOn(authSrv, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         })
//         component.contrId = 19417;
//         component.checkPrivilegeForUser();
//         expect(spy).toHaveBeenCalledTimes(1);
//     })
//     it('should call disableContractorVisual', () => {
//         expect(component.disableContractorVisual).toBeDefined();
//     })
   
//     it('should call compareData', () => {
//         expect(component.compareData).toBeDefined();
//     })
//     it('should call onSaveClick', () => {
//         expect(component.onSaveClick).toBeDefined();
//     })
//     it('should call submitLanguageAndVeteran', () => {
//         expect(component.submitLanguageAndVeteran).toBeDefined();
//     })
//     it('should set pledge error true' , () => {
//         component.initFormGroup();
//         component.formGroup.controls['nonVeteranFlag'].setValue(false);
//         component.formGroup.controls['newEmpNum'].setValue(0);
//         component.formGroup.controls['oldEmpNum'].setValue(1);
//         component.onFocusNewEmp();
//         expect(component.pledgeError).toBeTrue();
//     })
//     it('should set pledge error false' , () => {
//         component.initFormGroup();
//         component.formGroup.controls['nonVeteranFlag'].setValue(false);
//         component.formGroup.controls['newEmpNum'].setValue(4);
//         component.formGroup.controls['oldEmpNum'].setValue(1);
//         component.onFocusNewEmp();
//         expect(component.pledgeError).toBeFalse();
//     })
//     it('should set mandate field to false', () => {
//         component.formGroup.controls['newEmpNum'].setValue(4);
//         component.formGroup.controls['fromDate'].setValue(new Date())
//         component.onBlurFromDate();
//         expect(component.mandateFieldsFlag).toBeFalse();
//     })
//     it('should set mandate field to true', () => {
//         component.formGroup.controls['nonVeteranFlag'].setValue(false);
//         component.formGroup.controls['newEmpNum'].setValue(4);
//         component.formGroup.controls['fromDate'].setValue(null);
//         component.onSaveClick();
//         expect(component.mandateFieldsFlag).toBeTrue();
//     })
//     it('should set mandate field to false when non veteran flag is true', () => {
//         component.formGroup.controls['nonVeteranFlag'].setValue(true);
//         component.formGroup.controls['newEmpNum'].setValue(4);
//         component.formGroup.controls['fromDate'].setValue(null);
//         component.onSaveClick();
//         expect(component.mandateFieldsFlag).toBeFalse();
//     })

//     it('should get veteran info data', () => {
//         apiSrv = new ApiService(null);
//         component = new LanguageAndVeteranInformationComponent(apiSrv,null,null,null,null);
//         const spy = spyOn(apiSrv, 'get').and.callFake((t) => {
//             return of([])
//         })
//         component.getVeteranInfo();
//         expect(spy).toHaveBeenCalled();
//     })
// });
