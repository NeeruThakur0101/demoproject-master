/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OwnershipPageDialogComponent } from './ownership-page-dialog.component';

describe('OwnershipPageDialogComponent', () => {
	let component: OwnershipPageDialogComponent;
	let fixture: ComponentFixture<OwnershipPageDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OwnershipPageDialogComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OwnershipPageDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
