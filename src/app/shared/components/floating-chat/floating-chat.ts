import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  text: string;
  time: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'app-floating-chat',
  templateUrl: './floating-chat.html',
  styleUrls: ['./floating-chat.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class FloatingChatComponent implements AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;

  isChatOpen = false;
  newMessage = '';
  unreadCount = 0;
  isLoading = false;
  
  messages: ChatMessage[] = [];

  private shouldScrollToBottom = false;

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.unreadCount = 0;
      this.shouldScrollToBottom = true;
    }
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.isLoading) return;

    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Agregar mensaje del usuario
    this.messages.push({
      id: this.messages.length + 1,
      text: this.newMessage,
      time: time,
      type: 'sent'
    });

    const userInput = this.newMessage;
    this.newMessage = '';
    this.shouldScrollToBottom = true;
    this.isLoading = true;

    try {
      // Llamar al backend de Gemini
      const response = await fetch('http://localhost:3001/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
      });

      if (!response.ok) throw new Error('Error en el backend de Gemini');
      
      const data = await response.json();
      const botText = data.text || 'Lo siento, hubo un error al procesar tu mensaje.';
      
      // Agregar respuesta del bot
      const responseTime = new Date();
      const responseTimeStr = `${responseTime.getHours()}:${responseTime.getMinutes().toString().padStart(2, '0')}`;
      
      this.messages.push({
        id: this.messages.length + 1,
        text: botText,
        time: responseTimeStr,
        type: 'received'
      });

      this.shouldScrollToBottom = true;

      // Si el chat está cerrado, incrementar contador de no leídos
      if (!this.isChatOpen) {
        this.unreadCount++;
      }
    } catch (err) {
      console.error('Error al comunicarse con Gemini:', err);
      
      const errorTime = new Date();
      const errorTimeStr = `${errorTime.getHours()}:${errorTime.getMinutes().toString().padStart(2, '0')}`;
      
      this.messages.push({
        id: this.messages.length + 1,
        text: 'Lo siento, hubo un error al procesar tu mensaje. Asegúrate de que el servidor de Gemini esté ejecutándose en http://localhost:3001',
        time: errorTimeStr,
        type: 'received'
      });

      this.shouldScrollToBottom = true;
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
