import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantManagente } from './restaurant-managente';

describe('RestaurantManagente', () => {
  let component: RestaurantManagente;
  let fixture: ComponentFixture<RestaurantManagente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantManagente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantManagente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
