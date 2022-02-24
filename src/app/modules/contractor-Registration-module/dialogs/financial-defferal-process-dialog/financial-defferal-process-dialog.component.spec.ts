import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialDefferalProcessDialogComponent } from './financial-defferal-process-dialog.component';

describe('FinancialDefferalProcessDialogComponent', () => {
	let component: FinancialDefferalProcessDialogComponent;
	let fixture: ComponentFixture<FinancialDefferalProcessDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FinancialDefferalProcessDialogComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FinancialDefferalProcessDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
