import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';

@Component({
  standalone: true,
  selector: 'app-chat-modal',
  templateUrl: './chat.Modal.html',
  styleUrls: ['./chat.Modal.css'],
  imports: [CommonModule, ChatComponent]
})
export class ChatModalComponent {
  @Input() toggleChat!: () => void;
}