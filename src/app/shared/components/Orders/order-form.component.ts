import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  imports: [CommonModule, FormsModule]
})
export class OrderFormComponent {
  @Input() form: any = {};
  @Input() customers: any[] = [];
  @Input() motorcycles: any[] = [];
  @Input() menus: any[] = [];
  @Input() products: any[] = [];
  @Output() formChange = new EventEmitter<any>();
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();

  getMenuProductName(menu: any): string {
    const product = this.products.find((p: any) => p.id === menu.product_id);
    return product ? product.name : 'Menú sin producto';
  }

  onInputChange(event: any): void {
    this.formChange.emit({ ...this.form, [event.target.name]: event.target.value });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitForm.emit(this.form);
  }

  onCancel(): void {
    this.cancelForm.emit();
  }
}