import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiCartera } from './mi-cartera';

describe('MiCartera', () => {
  let component: MiCartera;
  let fixture: ComponentFixture<MiCartera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiCartera],
    }).compileComponents();

    fixture = TestBed.createComponent(MiCartera);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
