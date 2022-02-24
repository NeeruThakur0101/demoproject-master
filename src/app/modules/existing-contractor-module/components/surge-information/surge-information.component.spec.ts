import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';

import { SurgeInformationComponent } from './surge-information.component';
import { ApiService } from 'src/app/core/services/http-service';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { SurgeInfoService } from '../../services/surge-info.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { RouterTestingModule } from '@angular/router/testing';
describe('SurgeInformationComponent', () => {
    let component: SurgeInformationComponent;
    let fixture: ComponentFixture<SurgeInformationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SurgeInformationComponent],
            imports: [HttpClientModule, RouterTestingModule],
            providers: [ApiService, AuthenticationService, DialogContainerService, DatePipe, DialogService, SurgeInfoService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SurgeInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call checkPrivilage function', () => {
        expect(component.checkPrivilage).toBeDefined();
    });
    it('should make reason field invalid if not willing to mobilize and value is null', () => {
      component.formGroup.controls.willingToMobilizeFlg.setValue(false);
      component.formGroup.controls.reasonsMultiselect.setValue(null);
      component.save();
      expect(component.formGroup.controls.reasonsMultiselect.valid).toBeFalse()
    })
    it('should make host network field invalid if switch indicates true', () => {
      component.formGroup.controls.hostControlSwitch.setValue(true);
      component.formGroup.controls.hostNetworkMultiSelect.setValue(null);
      component.save();
      expect(component.formGroup.controls.hostNetworkMultiSelect.valid).toBeTrue()
    })
});
