import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtiquetasTableComponent } from './etiquetas-table.component';

describe('EtiquetasTableComponent', () => {
  let component: EtiquetasTableComponent;
  let fixture: ComponentFixture<EtiquetasTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtiquetasTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtiquetasTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
