import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulosTableComponent } from './modulos-table.component';

describe('ModulosTableComponent', () => {
  let component: ModulosTableComponent;
  let fixture: ComponentFixture<ModulosTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulosTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulosTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
