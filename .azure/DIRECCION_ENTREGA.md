# 📍 Sistema de Dirección de Entrega

## Resumen de la Implementación

Se ha implementado un sistema completo de selección de direcciones **ANTES** de generar la orden, siguiendo las mejores prácticas de UX.

---

## 🎯 Flujo Mejorado

### Antes (❌ Problema):
1. Usuario hace checkout
2. Se genera la orden SIN dirección
3. Usuario tenía que agregar dirección después

### Ahora (✅ Solución):
1. Usuario hace click en "Generar orden"
2. **Se abre modal de selección de dirección**
3. Usuario elige una dirección existente o crea una nueva
4. **Confirmación con dirección incluida**
5. Se genera la orden CON la dirección ya asignada

---

## 📁 Archivos Creados

### 1. **AddressSelectorModal Component**
**Ubicación:** `src/app/shared/components/address-selector-modal/`

**Archivos:**
- `address-selector-modal.ts` - Lógica del modal
- `address-selector-modal.html` - Template con lista y formulario
- `address-selector-modal.css` - Estilos con diseño azul

**Características:**
- ✅ Lista de direcciones guardadas del usuario
- ✅ Selección visual con radio buttons
- ✅ Formulario para agregar nueva dirección
- ✅ Validación de campos obligatorios
- ✅ Auto-selección si solo hay 1 dirección
- ✅ Diseño responsive con tema azul

### 2. **AddressSelectorService**
**Ubicación:** `src/app/core/services/address-selector.service.ts`

**Funciones:**
- `open()` - Abre el modal y retorna una Promise
- `selectAddress(address)` - Confirma la selección
- `close()` - Cancela sin seleccionar

**Uso:**
```typescript
const address = await this.addressSelectorService.open();
if (address) {
  // Usuario seleccionó una dirección
} else {
  // Usuario canceló
}
```

---

## 🔄 Archivos Modificados

### 1. **cart-sidebar.ts**
**Cambio:** Nuevo flujo en el método `checkout()`

```typescript
async checkout(): Promise<void> {
  // PASO 1: Validar carrito
  const validation = this.checkoutService.validateCart(items);
  
  // PASO 2: Seleccionar dirección (NUEVO)
  const selectedAddress = await this.addressSelectorService.open();
  if (!selectedAddress) return; // Canceló
  
  // PASO 3: Confirmar con dirección incluida
  const confirmed = await this.confirmService.confirm({
    message: `Dirección: ${selectedAddress.street}...`
  });
  
  // PASO 4: Procesar con dirección
  this.checkoutService.processCheckout(items, selectedAddress)...
}
```

### 2. **checkout.service.ts**
**Cambio:** Método `processCheckout()` ahora requiere dirección

**Firma anterior:**
```typescript
processCheckout(items: CartItem[], customerId?: number)
```

**Firma nueva:**
```typescript
processCheckout(items: CartItem[], deliveryAddress: Address, customerId?: number)
```

**Lógica:**
1. Valida que la dirección esté presente
2. Crea las órdenes
3. **Asocia la dirección a cada orden creada**

### 3. **address.service.ts**
**Nuevo método:**
```typescript
getUserAddresses(userId: number): Observable<Address[]>
```

Obtiene las direcciones guardadas de un usuario específico.

### 4. **address.model.ts**
**Cambios en la interfaz:**
```typescript
export interface Address {
  order_id?: number;  // Ahora opcional
  user_id?: number;   // Nuevo campo para direcciones del usuario
  // ... otros campos
}
```

---

## 🎨 Diseño del Modal

### Características Visuales:
- **Color principal:** #2563eb (azul)
- **Animaciones:** Fade in + slide up
- **Estados:**
  - Hover en tarjetas de dirección
  - Selección visual con borde azul
  - Iconos de check cuando está seleccionada
- **Responsive:** Se adapta a móvil y desktop
- **Formulario:** Campos con validación visual

### Elementos:
- 📍 Icono de ubicación en el header
- 🔘 Radio buttons para selección
- ✅ Icono de confirmación
- ➕ Botón para agregar nueva dirección
- 📝 Formulario con campos validados

---

## 🔧 Integración

### En cart-sidebar.html:
```html
<!-- Al final del archivo -->
<app-address-selector-modal />
```

### En cart-sidebar.ts:
```typescript
imports: [CommonModule, AddressSelectorModal]
```

---

## 📊 Flujo de Datos

```
Usuario click "Generar orden"
        ↓
AddressSelectorService.open()
        ↓
Modal muestra direcciones guardadas
        ↓
Usuario selecciona/crea dirección
        ↓
AddressSelectorService.selectAddress(address)
        ↓
Promise se resuelve con Address
        ↓
ConfirmationService muestra confirmación con dirección
        ↓
CheckoutService.processCheckout(items, address)
        ↓
Se crean órdenes + se asocian direcciones
        ↓
OrderConfirmationModal muestra resumen
```

---

## ✅ Beneficios de esta Implementación

1. **UX Mejorada:** Usuario sabe dónde se entregará ANTES de confirmar
2. **Datos Completos:** Órdenes siempre tienen dirección desde el inicio
3. **Reutilizable:** Direcciones guardadas se pueden usar en futuras órdenes
4. **Validación:** No se puede crear orden sin dirección
5. **Escalable:** Fácil agregar gestión de direcciones (editar, eliminar)

---

## 🚀 Próximos Pasos (Opcional)

- [ ] Integrar con sistema de autenticación para `user_id` real
- [ ] Agregar edición de direcciones guardadas
- [ ] Agregar eliminación de direcciones
- [ ] Marcar una dirección como "predeterminada"
- [ ] Validación de código postal con API externa
- [ ] Autocompletado de direcciones con Google Maps API

---

## 🐛 Nota Importante

**TODO en el código:**
```typescript
// En address-selector-modal.ts línea 39 y 75
const userId = 1; // TODO: Obtener del usuario autenticado
```

Actualmente usa `userId = 1` hardcoded. Cuando integres autenticación, cambia esto por el ID del usuario actual.

---

## 📝 Ejemplo de Uso

```typescript
// Usuario hace checkout
async checkout() {
  // 1. Seleccionar dirección
  const address = await this.addressSelectorService.open();
  
  // 2. Procesar con dirección
  this.checkoutService.processCheckout(items, address).subscribe(...);
}
```

**Resultado:** Orden creada con dirección completa desde el inicio ✅
