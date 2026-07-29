import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValeDigital } from './vale-digital';

describe('ValeDigital', () => {
  let component: ValeDigital;
  let fixture: ComponentFixture<ValeDigital>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValeDigital],
    }).compileComponents();

    fixture = TestBed.createComponent(ValeDigital);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
