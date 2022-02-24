// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { EmployeeInformationComponent } from './employee-information.component';
// import { HttpClientModule } from '@angular/common/http';
// import{AddEmployeesDialogComponent} from '../../dialogs/add-employee-dialog/add-employees-dialog.component'
// import { ElementRef, Renderer2 } from '@angular/core';
// import { DialogService, DialogRef, DialogCloseResult ,SharedModule,DialogContainerService} from '@progress/kendo-angular-dialog';
// import { DeviceDetectorService } from 'ngx-device-detector';
// import { ApiService } from 'src/app/core/services/http-service';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { UniversalService } from 'src/app/core/services/universal.service';
// import { AuthenticationService, PageAccess } from 'src/app/core/services/authentication.service';
// import { ContractorRegistrationService } from 'src/app/modules/contractor-Registration-module/services/contractor-Registration.service';

// export class MockElementRef extends ElementRef {
//   constructor() { super(null); }
// }
// describe('EmployeeInformationComponent', () => {
//   let component: EmployeeInformationComponent;
//   let fixture: ComponentFixture<EmployeeInformationComponent>;

//   const selectedData:object={
// CONTR_ID: 19168,
// ContrEmployeeTypeID: 4,
// ContractorCompanyName: "(19168) DBA FIRST",
// ContractorVeteranEmployeeID: 0,
// EditFlag: true,
// Email: "vikas@gmail.com",
// EmployeeRole: "Email Contact",
// HireDate: "0001-01-01T00:00:00",
// MilitaryAffiliation: null,
// Name: "vikas",
// PRNL_ID: 107068,
// Phone: "3456555555",
// Srno: 4,
// VeteranFlg: false,
// VeteranFlgCount: 2

// }

// const res:object={
//   _empDetails:[{
//     CONTR_ID: 19168,
// ContrEmployeeTypeID: 2,
// ContractorCompanyName: "(19168) DBA FIRST",
// ContractorVeteranEmployeeID: 0,
// EditFlag: false,
// Email: "rishabh.gupta@primussoft.com",
// EmployeeRole: "Owner",
// HireDate: "0001-01-01T00:00:00",
// MilitaryAffiliation: null,
// Name: "Rishabh gupta",
// PRNL_ID: 2058,
// Phone: "232-141-2421",
// VeteranFlg: false,
// VeteranFlgCount: 2
//   }],
//   _roleDetails:[{
//     Percentage: 42.86,
// RoleID: 4,
// RoleName: "Email Contact",
// Rolecount: 3
//   }]
// }


//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ EmployeeInformationComponent,AddEmployeesDialogComponent ],
//       providers: [DialogService, DialogRef, DialogCloseResult,
//         DeviceDetectorService, ApiService,UniversalService,AuthenticationService,
//         ContractorRegistrationService,DialogContainerService],
//         imports: [HttpClientModule,SharedModule,HttpClientTestingModule, RouterTestingModule],
//         schemas: [NO_ERRORS_SCHEMA],
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(EmployeeInformationComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should bind Employee getGridData',()=>{
//    component.loader=true;
//    component.Contr_ID=19168;
//    component.getGridData();
//    expect(component.getGridData).toBeDefined();

//   });

//   it('should bind Employee getGridData',()=>{
//     component.loader=true;
//     component.Contr_ID=19168;
//     component.getGridData();
//     expect(component.getGridData).toBeDefined();

//    });

//    it('should called refress method',()=>{
//      component.refress();
//    })

//    it('should call onSeriesClick method',()=>{
//      let event:any;
//     component.onSeriesClick(event);
//    })

//    it('should called open method',()=>
//    { component.opened=true;
//      component.open();
//    })
//    it('should called close method',()=>
//    {
//     component.opened = false;
//      component.close(true);
//    })

//    it('should called changeClass method',()=>
//    {
//      component.changeClass();
//      expect(component.changeClass).toBeDefined();
//    })

//    it('should called accessDenied method',()=>{
//      component.accessDenied();
//      expect(component.accessDenied).toBeDefined();
//    })

//    it('should called setData method',()=>{
//      component.setData(res);
//      expect(component.setData).toBeDefined();
//    })

//    it('should called ngAfterViewInit Method',()=>
//    {
//      component.ngAfterViewInit();
//      expect(component.ngAfterViewInit).toBeDefined();
//    })

//    it('should called addEmployee',()=>
//    {    let event:any;
//       component.loader = true;
//         component.selectedItem=selectedData;
//      component.addEmployee(event,'EDIT',selectedData);
//      expect(component).toBeTruthy();
//    })

//    it('should called TooltipClick',()=>
//    { let event:any;
//      component.TooltipClick(event);
//      expect(component.TooltipClick).toBeDefined();
//    })
//    it('should called filterChange',()=>
//    { let filter:any;
//      component.filterChange(filter);
//      expect(component.filterChange).toBeDefined();

//    })
// });
