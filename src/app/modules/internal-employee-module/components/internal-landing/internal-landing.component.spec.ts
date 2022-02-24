// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { HttpClientModule } from '@angular/common/http';
// import { HttpClientTestingModule,HttpTestingController} from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';

// import { InternalLandingComponent } from './internal-landing.component';
// import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
// import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
// import { ApiService } from 'src/app/core/services/http-service';
// import { UniversalService } from 'src/app/core/services/universal.service';
// import { DialogService,SharedModule,DialogContainerService } from '@progress/kendo-angular-dialog';
// import { DatePipe } from '@angular/common';

// describe('InternalLandingComponent', () => {
//   let component: InternalLandingComponent;
//   let fixture: ComponentFixture<InternalLandingComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ InternalLandingComponent,DialogAlertsComponent ],
//       providers:[ApiService,UniversalService,InternalUserDetailsService,DialogService,
//         DialogContainerService,DatePipe],
//       imports:[SharedModule,HttpClientTestingModule,RouterTestingModule]
//     })
//     .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(InternalLandingComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should called getMedallionsCount',()=>{
//     component.getMedallionsCount();
//   })

//   it('should called bindcounter method',()=>{
//     component.Recruiting === true
//     component.bindcounter();
    
//   })

//   it('should called medallionsClick method',()=>
//   { 
//     component.medallionsClick('Apps Submitted','e','');
//   })

//   it('should called openContractor1 method',()=>
//   {  let data:any;
//     component.openContractor1(data,'Apps Started');
//   })

//   it('should called getSelectedGridData method ',()=>{
//     component.loader =true;
//     component.getSelectedGridData('Apps Submitted');
//   })
// });
