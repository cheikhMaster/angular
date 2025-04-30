import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablespaceMetricsComponent } from './tablespace-metrics.component';

describe('TablespaceMetricsComponent', () => {
  let component: TablespaceMetricsComponent;
  let fixture: ComponentFixture<TablespaceMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablespaceMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablespaceMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
