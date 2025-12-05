# 📊 Jerarquía de Z-Index - Proyecto Angular

## 🎯 Orden de Capas (de menor a mayor)

```
1.  Header                      →  z-index: 50
2.  Dropdown menu (header)      →  z-index: 1000
3.  Cart icon badge             →  z-index: 10
4.  Slide-bar (sidebar)         →  z-index: 10000
5.  Floating chat button        →  z-index: 9998
6.  Floating chat window        →  z-index: 9997
7.  Cart overlay                →  z-index: 99999
8.  Cart sidebar                →  z-index: 100000
9.  Order confirmation modal    →  z-index: 100001
10. Address selector overlay    →  z-index: 100001
11. Address selector container  →  z-index: 100002
12. Notification dropdown       →  z-index: 10001
13. Confirmation modal (⚠️)     →  z-index: 999999  ← MÁS ALTO (confirmaciones críticas)
```

## ⚙️ Reglas de Uso

### ✅ Cuándo usar cada modal:

1. **Confirmation Modal (z-index: 999999)**
   - Confirmaciones críticas (eliminar, cancelar, acciones irreversibles)
   - Debe estar POR ENCIMA de todo
   - Bloquea toda interacción hasta que el usuario responda

2. **Address Selector Modal (z-index: 100001-100002)**
   - Selección de dirección durante checkout
   - Aparece sobre el cart-sidebar
   - Permite cancelar y volver al carrito

3. **Order Confirmation Modal (z-index: 100001)**
   - Resumen de orden completada
   - Aparece después de cerrar el cart-sidebar
   - Solo informativo, no requiere confirmación crítica

## 🔧 Archivos por Componente

### Cart Sidebar
**Archivo:** `cart-sidebar.css`
```css
.cart-overlay { z-index: 99999; }
.cart-sidebar { z-index: 100000; }
```

### Address Selector Modal
**Archivo:** `address-selector-modal.css`
```css
.modal-overlay { z-index: 100001; }
.modal-container { z-index: 100002; }
```

### Order Confirmation Modal
**Archivo:** `order-confirmation-modal.css`
```css
.confirmation-overlay { z-index: 100001; }
```

### Confirmation Modal (Yes/No)
**Archivo:** `confirmation-modal.css`
```css
.modal-overlay { z-index: 999999; }
```

## 🐛 Problemas Comunes y Soluciones

### Problema: Modal queda detrás de otro elemento
**Solución:** Verificar z-index y asegurar que:
1. El overlay tenga `position: fixed`
2. El z-index sea mayor que el elemento que lo cubre
3. No haya elementos padre con `position: relative` limitando el stacking context

### Problema: Modal no se cierra/contrae
**Solución:** Verificar:
1. El `@if` condicional esté funcionando
2. El servicio esté actualizando el signal correctamente
3. No haya conflictos de eventos `(click)` entre overlay y contenedor

### Problema: Múltiples modales abiertos simultáneamente
**Solución:** 
1. El Confirmation Modal puede abrirse sobre cualquier otro modal
2. Address Selector y Order Confirmation no deberían estar abiertos al mismo tiempo
3. Cerrar modales anteriores antes de abrir nuevos (excepto confirmaciones)

## 📋 Flujo Correcto de Modales en Checkout

```
Usuario hace checkout
        ↓
[Address Selector Modal]  ← z-index: 100001
        ↓
Usuario selecciona dirección
        ↓
[Confirmation Modal]      ← z-index: 999999 (sobre Address Selector)
"¿Confirmar orden?"
        ↓
Usuario confirma
        ↓
Cart sidebar se cierra
        ↓
[Order Confirmation Modal] ← z-index: 100001
"Orden completada"
```

## 🔄 Actualización Reciente

Se corrigió el z-index del **Address Selector Modal**:
- **Antes:** z-index: 9999 (quedaba detrás del cart-sidebar)
- **Ahora:** z-index: 100001-100002 (sobre el cart-sidebar)

## ⚡ Cambios Aplicados

**Archivo:** `address-selector-modal.css`
```css
.modal-overlay {
  z-index: 100001; /* Por encima del cart-sidebar (100000) */
}

.modal-container {
  position: relative;
  z-index: 100002; /* Asegurar que esté por encima del overlay */
}
```

---

**Última actualización:** 4 de diciembre de 2025
