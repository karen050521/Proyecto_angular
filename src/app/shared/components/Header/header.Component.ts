import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatModalComponent } from '../../components/Chat/chat.Modal';
import { LogoutButtonComponent } from './logout.Button';
import { UserAvatarComponent } from './user.Avatar.Component';
import { ChatToggleButtonComponent } from '../../components/Chat/chat.Toggle.Button';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.Component.html',
  styleUrls: ['./header.Component.css'],
  imports: [
    CommonModule,
    ChatModalComponent,
    LogoutButtonComponent,
    UserAvatarComponent,
    ChatToggleButtonComponent
  ]
})

export class HeaderComponent {
  @Input() onDrawerToggle!: () => void;
  @Input() showMenuButton: boolean = false;

  showChat = false;
  photoURL = localStorage.getItem('photoURL') || '';

  toggleChat = () => this.showChat = !this.showChat;
}