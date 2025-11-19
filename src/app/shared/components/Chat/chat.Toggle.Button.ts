import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-toggle-button',
  templateUrl: './chat.Toggle.Button.html',
})
export class ChatToggleButtonComponent {
  @Input() toggleChat!: () => void;
}