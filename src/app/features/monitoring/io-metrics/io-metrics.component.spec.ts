import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IoMetricsComponent } from './io-metrics.component';

describe('IoMetricsComponent', () => {
  let component: IoMetricsComponent;
  let fixture: ComponentFixture<IoMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IoMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IoMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
