import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pessoa } from './pessoa';

describe('Pessoa', () => {
  let component: Pessoa;
  let fixture: ComponentFixture<Pessoa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pessoa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pessoa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
