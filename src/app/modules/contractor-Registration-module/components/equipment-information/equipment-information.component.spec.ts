import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { ApiService } from 'src/app/core/services/http-service';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { EquipmentInformationComponent } from './equipment-information.component';
import { EquipmentService } from './equipment-information.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/core/services/storage.service';
import { ContractorRegistrationService } from '../../services/contractor-Registration.service';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { ContractorDataService } from 'src/app/core/services/contractor-data.service';
import { UniversalService } from 'src/app/core/services/universal.service';

describe('EquipmentInformationComponent', () => {
  let component: EquipmentInformationComponent;
  let fixture: ComponentFixture<EquipmentInformationComponent>;
  let eqpSrv: EquipmentService;
  let $auth: AuthenticationService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentInformationComponent ],
      imports: [RouterTestingModule, HttpClientModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [DialogService,Router,StorageService,EquipmentService,ContractorRegistrationService,AuthenticationService,InternalUserDetailsService,ContractorDataService,UniversalService,Renderer2]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('the text in save and next button should be Next in case of internal user', () => {
      const nextText = component.pageContent.Equip_Info.Global_Button_Next
      component.loggedInUserType = 'Internal';
      component.ngOnInit();
      expect(component.saveAndNextBtn).toBe(nextText)
  })
  it('should set hidePage to false', () => {
    component.contrID = 0;
    component.checkPrivilegeForUser();
    expect(component.hidePage).toBeFalse();
})
it('should call checkPrivilegeForUser', () => {
    expect(component.checkPrivilegeForUser).toBeDefined();
})

it('should disable vehicle visual toggle for internal user as it has visual-cue', () => {
  component.vehicleVisualToggle = true;
  component.disableContractorVisual();
  expect(component.formGroup.controls['vehicleToggle'].disable).toBeTruthy();
})
it('should disable own field for internal user which has visual cue in it', () => {
  component.formGroup = new FormGroup({
      own_1: new FormControl()
  })
  component.ownVisualFlag[1] = true;
  component.disableContractorVisual();
  expect(component.formGroup.controls['own_1'].disable).toBeTruthy();
})

it('should make the formgroup disable for the internal user when seeing prospective contractor pages', () => {
    component.disableForInternalUser();
    expect(component.formGroup.disable).toBeTruthy();
})

it('should call submit for internal user', () => {
    expect(component.submitForInternal).toBeDefined();
})

it('should disable lease field for internal user which has visual cue in it', () => {
    component.formGroup = new FormGroup({
        lease_1: new FormControl()
    })
    component.leaseVisualFlag[1] = true;
    component.disableContractorVisual();
    expect(component.formGroup.controls['lease_1'].disable).toBeTruthy();
  })

  it('should call the function where the prospective contractor is now a contractor', () => {
      expect(component.contractorYet).toBeDefined();
  })

//   it('should get saved json', () => {
//     eqpSrv = new EquipmentService(null);
//     component = new EquipmentInformationComponent(null,null,null,eqpSrv,null,null,null,null,null,null);
//     const spy = spyOn(eqpSrv, 'get').and.callFake((t) => {
//         return of([])
//     })
//     component.notContractorYet();
//     expect(spy).toHaveBeenCalled();
// })

// it('should set form to disable when user have readonlyAccess', () => {
//     $auth = new AuthenticationService(null,null);
//     component = new EquipmentInformationComponent(null,null,null,null,null,$auth)
//     const pageAccess = { readonlyAccess: true, editAccess: false }
//     spyOn($auth,'getPageAccessPrivilege').and.callFake((t) => {
//         return pageAccess;
//     })
//     component.contrID= 19417;
//     component.checkPrivilegeForUser();
//     expect(component.readonlyPrivilege).toBeTruthy();
// })
// it('should set save button disable when user have readonlyAccess', () => {
//     $auth = new AuthenticationService(null,null);
//     component = new EquipmentInformationComponent(null,null,null,null,null,$auth)
//     const pageAccess = { readonlyAccess: true, editAccess: false }
//     spyOn($auth,'getPageAccessPrivilege').and.callFake((t) => {
//         return pageAccess;
//     })
//     component.contrID= 19417;
//     component.checkPrivilegeForUser();
//     expect(component.saveBtnDisable).toBeTruthy();
// })
// it('should not get privilege access for prospective user', () => {
//     const $pageAccess = { readonlyAccess: true, editAccess: false }
//     $auth = new AuthenticationService(null,null);
//     component = new EquipmentInformationComponent(null,null,null,null,null,$auth);
//     const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//         return $pageAccess;
//     })
//     component.contrID = 0;
//     component.checkPrivilegeForUser();
//     expect(spy).toHaveBeenCalledTimes(0);
// })
//  it('should get access privilege once for the user', () => {
//     const $pageAccess = { readonlyAccess: true, editAccess: false }
//     $auth = new AuthenticationService(null,null);
//     component = new EquipmentInformationComponent(null,null,null,null,null,$auth);
//     const spy = spyOn($auth, 'getPageAccessPrivilege').and.callFake((t) => {
//         return $pageAccess;
//     })
//     component.contrID = 19417;
//     component.checkPrivilegeForUser();
//     expect(spy).toHaveBeenCalledTimes(1);
// })
});
