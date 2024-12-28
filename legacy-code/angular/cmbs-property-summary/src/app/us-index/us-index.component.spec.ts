import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { UsIndexComponent } from './us-index.component';

describe('UsIndexComponent', () => {
  let component: UsIndexComponent;
  let fixture: ComponentFixture<UsIndexComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UsIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
