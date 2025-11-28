import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantsView } from './restaurants-view';

describe('RestaurantsView', () => {
  let component: RestaurantsView;
  let fixture: ComponentFixture<RestaurantsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
