import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exame } from './exame';

describe('Exame', () => {
  let component: Exame;
  let fixture: ComponentFixture<Exame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Exame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
