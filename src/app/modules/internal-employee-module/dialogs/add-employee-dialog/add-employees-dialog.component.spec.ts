// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { ElementRef} from '@angular/core';
// import { AddEmployeesDialogComponent } from './add-employees-dialog.component';
// import {  ReactiveFormsModule, FormsModule} from '@angular/forms';
// import { NO_ERRORS_SCHEMA } from '@angular/core';
// import { DialogContentBase, DialogRef, DialogService, DialogCloseResult,SharedModule,DialogContainerService } from '@progress/kendo-angular-dialog';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { HttpClientModule } from '@angular/common/http';
// import { ApiService } from 'src/app/core/services/http-service';
// import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
// export class MockElementRef extends ElementRef {
//   constructor() { super(null); }
// }

// describe('AddEmployeesComponent', () => {
//   let component: AddEmployeesDialogComponent;
//   let fixture: ComponentFixture<AddEmployeesDialogComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ AddEmployeesDialogComponent ],
//       providers: [DialogContentBase, DialogRef, DialogService, DialogCloseResult,DialogContainerService,
//         ApiService,InternalUserDetailsService],
//       imports: [HttpClientModule,SharedModule,HttpClientTestingModule,RouterTestingModule,ReactiveFormsModule,
//         FormsModule,
//       ],
//       schemas: [NO_ERRORS_SCHEMA],
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(AddEmployeesDialogComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
//   it('should called close',()=>{
//     component.close();
//   });

//   it('should called employeeTypeValidation',()=>
//   {
//     let element={
//       EmployeeRole:'Technician'
//     }
//     component.employeeTypeValidation(element);
//     expect(component.employeeTypeValidation).toBeDefined();    
//   });

//   it('should called employeeTypeValidation1',()=>{
//     let ContrEmployeeTypeID:6
//     component.employeeTypeValidation1(ContrEmployeeTypeID);
//     expect(component.employeeTypeValidation1).toBeDefined();    
//   });

//   it('should called employeeRoleIDChange',()=>{
//     let name={
//       ContrEmployeeTypeID:6
//     }
//     component.employeeRoleIDChange(name);
//     expect(component.employeeRoleIDChange).toBeDefined();    
//   });

//   it('should called getEmployeeDropdown',()=>{
//     component.loader = true;
//     component.getEmployeeDropdown();
//     expect(component.getEmployeeDropdown).toBeDefined();   
//   });

//   it('should called onSave',()=>{
//     component.onSave();
//   });

// it('should called isNumber',()=>
// { 
//   let evt, option: string='phone';
//   component.isNumber(evt,option);
//   expect(component.isNumber).toBeDefined();  
// })
// it('should called onFocus',()=>{
//   let event:any;
//   component.onFocus(event);
// })

// it('should called setEmployeeStructureVeteranValidators',()=>
// {
//   component.setEmployeeStructureVeteranValidators();
// })
// it('should called handleFilterRole',()=>
// { 
//   let value:any;
//   component.handleFilterRole(value);
// })

// it('should called handleFilterMilitary',()=>
// { let value:any;
//   component.handleFilterMilitary(value);
// })

// it('should called CheckEmailExists',()=>
// { let EmailVal='vikas@gmail.com'
//   component.CheckEmailExists(EmailVal);
// })

// it('should called resetForm',()=>{
//   component.resetForm();
// })
// it('should called EmployeeDialogFormControl',()=>
// {
//   component.EmployeeDialogFormControl;
// })

// });
