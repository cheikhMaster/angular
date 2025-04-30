import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionMetricsComponent } from './connection-metrics.component';

describe('ConnectionMetricsComponent', () => {
  let component: ConnectionMetricsComponent;
  let fixture: ComponentFixture<ConnectionMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConnectionMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
