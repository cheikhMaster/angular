import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkMetricsComponent } from './network-metrics.component';

describe('NetworkMetricsComponent', () => {
  let component: NetworkMetricsComponent;
  let fixture: ComponentFixture<NetworkMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworkMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
