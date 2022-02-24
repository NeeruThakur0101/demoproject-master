import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnershipInformationComponent } from './ownership-information.component';

describe('OwnershipInformationComponent', () => {
    let component: OwnershipInformationComponent;
    let fixture: ComponentFixture<OwnershipInformationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OwnershipInformationComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OwnershipInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
