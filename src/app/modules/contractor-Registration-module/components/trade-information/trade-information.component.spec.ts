import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeInformationComponent } from './trade-information.component';

describe('TradeInformationComponent', () => {
	let component: TradeInformationComponent;
	let fixture: ComponentFixture<TradeInformationComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TradeInformationComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TradeInformationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
