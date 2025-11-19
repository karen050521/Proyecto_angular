import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  template: `
    <img
      [src]="src || defaultAvatar"
      [alt]="alt"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.minWidth.px]="size"
      [style.minHeight.px]="size"
      class="rounded-full border-2 border-white object-cover"
      [style.background]="'#eee'"
      referrerpolicy="no-referrer"
    />
  `
})
export class UserAvatarComponent {
  @Input() src: string = '';
  @Input() alt: string = "Avatar";
  @Input() size: number = 40;
  defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=ccc&color=444&size=128';
}