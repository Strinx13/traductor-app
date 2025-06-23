import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdiomasTableComponent } from './idiomas-table.component';

describe('IdiomasTableComponent', () => {
  let component: IdiomasTableComponent;
  let fixture: ComponentFixture<IdiomasTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdiomasTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdiomasTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
