import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyLocationsComponent } from './property-locations.component';

describe('PropertyLocationsComponent', () => {
  let component: PropertyLocationsComponent;
  let fixture: ComponentFixture<PropertyLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
