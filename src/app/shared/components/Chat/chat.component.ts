import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  imports: [CommonModule, FormsModule] 
})
export class ChatComponent {
  messages: { type: 'user' | 'bot', text: string }[] = [];
  inputMessage: string = '';
  isLoading = false;

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.messagesEndRef?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  async sendMessage(e: Event) {
    e.preventDefault();
    if (!this.inputMessage.trim()) return;

    const newMessage: { type: 'user' | 'bot', text: string } = { type: 'user', text: this.inputMessage };
    this.messages = [...this.messages, newMessage];
    const userInput = this.inputMessage;
    this.inputMessage = '';
    this.isLoading = true;

    try {
      // Lógica para consumir el backend local que llama a Gemini
      const response = await fetch('http://localhost:3001/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
      });

      if (!response.ok) throw new Error('Error en el backend de Gemini');
      const data = await response.json();
      let botText = data.text || 'Lo siento, hubo un error al procesar tu mensaje.';
      this.messages = [...this.messages, { type: 'bot' as 'bot', text: botText }];
    } catch (err) {
      this.messages = [...this.messages, { type: 'bot' as 'bot', text: 'Lo siento, hubo un error al procesar tu mensaje.' }];
    } finally {
      this.isLoading = false;
    }
  }
}