import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hemocentro } from './hemocentro';

describe('Hemocentro', () => {
  let component: Hemocentro;
  let fixture: ComponentFixture<Hemocentro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hemocentro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hemocentro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
