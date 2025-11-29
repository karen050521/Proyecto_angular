import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuView } from './menu-view';

describe('MenuView', () => {
  let component: MenuView;
  let fixture: ComponentFixture<MenuView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
