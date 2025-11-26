import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  imports: [CommonModule]
})
export class OrderListComponent {
  @Input() orders: any[] = [];
  @Input() getCustomerName!: (id: any) => string;
  @Input() getMotorcyclePlate!: (id: any) => string;
  @Input() getMenuName!: (id: any) => string;
  @Output() editOrder = new EventEmitter<any>();
  @Output() deleteOrder = new EventEmitter<any>();

  onEdit(id: any): void {
    this.editOrder.emit(id);
  }
  onDelete(id: any): void {
    this.deleteOrder.emit(id);
  }
}