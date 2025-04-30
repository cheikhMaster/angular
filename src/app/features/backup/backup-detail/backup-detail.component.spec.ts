import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupDetailComponent } from './backup-detail.component';

describe('BackupDetailComponent', () => {
  let component: BackupDetailComponent;
  let fixture: ComponentFixture<BackupDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackupDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
