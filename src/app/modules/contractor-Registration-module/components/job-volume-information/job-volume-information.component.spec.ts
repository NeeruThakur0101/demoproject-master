// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { JobVolumeInformationComponent } from './job-volume-information.component';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { ChartsModule } from '@progress/kendo-angular-charts';
// import { ApiService } from 'src/app/core/services/http-service';
// import { DialogService, DialogContainerService, SharedModule } from '@progress/kendo-angular-dialog';
// import { HttpClientModule } from '@angular/common/http';
// import { RouterTestingModule } from '@angular/router/testing';
// import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
// import { SortDescriptor } from '@progress/kendo-data-query';
// import { UniversalService } from 'src/app/core/services/universal.service';
// import { of } from 'rxjs';
// import { AuthenticationService } from 'src/app/core/services/authentication.service';

// describe('JobVolumeInformationComponent', () => {
//     let component: JobVolumeInformationComponent;
//     let fixture: ComponentFixture<JobVolumeInformationComponent>;
//     let service: ApiService;
//     let $auth: AuthenticationService;
//     let sort: SortDescriptor[];

//     beforeEach(async(() => {
//         TestBed.configureTestingModule({
//             imports: [ChartsModule, HttpClientModule, SharedModule, RouterTestingModule, BrowserDynamicTestingModule],
//             declarations: [JobVolumeInformationComponent],
//             providers: [ApiService, DialogService, DialogContainerService, UniversalService, AuthenticationService],
//             schemas: [NO_ERRORS_SCHEMA],
//         }).compileComponents();
//     }));

//     beforeEach(() => {
//         fixture = TestBed.createComponent(JobVolumeInformationComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should call getCompanyOpeningDate function', () => {
//         component.getCompanyOpeningDate();
//         expect(component.getCompanyOpeningDate).toBeDefined();
//     });

//     it('should call loadGridData', () => {
//         component.loadGridData();
//         expect(component.loadGridData).toBeDefined();
//     });

//     it('should call onPageChange', () => {
//         const state = { take: 1 };
//         component.onPageChange(state);
//         expect(component.onPageChange).toBeDefined();
//     });

//     it('should give year difference', () => {
//         const currDate = new Date();
//         const date = new Date();
//         const diffvalue = component.diff_years(currDate, date);
//         expect(diffvalue).toBe(0);
//     });

//     it('should send data for Approval', () => {
//         expect(component.getJsonForApprovalData).toBeDefined();
//     });

//     it('should match json to show visual cue', () => {
//         expect(component.matchJsonObjectToshowVisualCue).toBeDefined();
//     });

//     it('should call send json for internal employee', () => {
//         expect(component.sendJsonInternalEmployee).toBeDefined();
//     });
//     it('should call save Data in Json And refresh Grid', () => {
//         expect(component.saveDataInJsonAndrefreshGrid).toBeDefined();
//     });
//     it('should get json for approval data', () => {
//         service = new ApiService(null);
//         component = new JobVolumeInformationComponent(null, service, null, null, null, null, null, null, null, null, null);
//         const spy = spyOn(service, 'get').and.callFake((t) => {
//             return of([]);
//         });
//         component.getJsonForApprovalData();
//         expect(spy).toHaveBeenCalled();
//     });
//     it('should not get privilege access for prospective user', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false };
//         $auth = new AuthenticationService(null, null);
//         component = new JobVolumeInformationComponent(null, null, null, null, null, null, null, $auth, null, null, null);
//         const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         });
//         component.ContrID = 0;
//         component.checkPrivilegeForUser();
//         expect(spy).toHaveBeenCalledTimes(0);
//     });
//     it('should disable the form when the access privilege is readonly', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false };
//         $auth = new AuthenticationService(null, null);
//         component = new JobVolumeInformationComponent(null, null, null, null, null, null, null, $auth, null, null, null);
//         const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         });
//         component.ContrID = 19417;
//         component.checkPrivilegeForUser();
//         expect(component.disableInternalAccess).toBeTruthy();
//     });
//     it('should get access privilege once for the user', () => {
//         const $pageAccess = { readonlyAccess: true, editAccess: false };
//         $auth = new AuthenticationService(null, null);
//         component = new JobVolumeInformationComponent(null, null, null, null, null, null, null, $auth, null, null, null);
//         const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//             return $pageAccess;
//         });
//         component.ContrID = 19417;
//         component.checkPrivilegeForUser();
//         expect(spy).toHaveBeenCalledTimes(1);
//     });
// });
