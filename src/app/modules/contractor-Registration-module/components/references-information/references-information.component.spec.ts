import { async, ComponentFixture, TestBed, } from '@angular/core/testing';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SharedModule } from 'src/app/shared-module/shared-module';
import { FormsModule, FormBuilder } from '@angular/forms';
import { GridModule, EditService$1 } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { ReferencesInformationComponent } from './references-information.component';
import { ApiService } from '../../../../core/services/http-service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UniversalService } from 'src/app/core/services/universal.service';
describe('ReferencesInformationComponent', () => {
    let component: ReferencesInformationComponent;
    let fixture: ComponentFixture<ReferencesInformationComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReferencesInformationComponent],
            providers: [DialogService, UniversalService,
                 TranslateService, ApiService],
            imports: [SharedModule, FormsModule, GridModule, InputsModule, RouterTestingModule, HttpClientModule,
              TranslateModule.forRoot(), HttpClientModule, BrowserAnimationsModule, HttpClientModule,
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ReferencesInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

    });

    it('should have created a referenceInformation component', () => {
        expect(component).toBeTruthy();
    });
    it('should call openAddReferenceDialog method', () => {
        const onClickMock = spyOn(component, 'openAddReferenceDialog');
        fixture.debugElement.query(By.css('button')).triggerEventHandler('click', null);
        expect(component.openAddReferenceDialog).toBeDefined();

    });
    it('should have functin to send json for approval', () => {
      expect(component.matchJsonObjectsToSendForApproval).toBeDefined();
    })


    it('kendo-grid element should contain resizable attribute with "true" value', () => {
        const element = fixture.debugElement.query(By.css('kendo-grid'));
        expect(element.nativeElement.resizable).toBeFalsy();
    });

});
