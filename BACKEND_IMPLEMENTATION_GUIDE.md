# 🚀 Guía de Implementación del Backend - Endpoint de Menús

## ⚠️ Estado Actual
- ❌ Backend corriendo pero sin endpoint `/api/menus`
- ❌ Error 404 NOT FOUND
- ❌ Error CORS

## ✅ Solución Completa

---

## 📁 PASO 1: Instalar Flask-CORS

En la terminal del backend (`C:\desarrolloFrontend\ANG-ULAUR\ms_delivery`), ejecuta:

```bash
pip install flask-cors
```

---

## 📁 PASO 2: Crear archivo `menu_routes.py`

**Ubicación:** `C:\desarrolloFrontend\ANG-ULAUR\ms_delivery\menu_routes.py`

**Contenido completo del archivo:**

```python
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime

menu_bp = Blueprint('menus', __name__)

@menu_bp.route('/api/menus', methods=['GET', 'OPTIONS'])
@cross_origin(origins='http://localhost:4200')
def get_menus():
    """Obtener todos los menús"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Importar aquí para evitar circular imports
        from models import Menu
        
        menus = Menu.query.all()
        result = []
        
        for menu in menus:
            menu_dict = {
                'id': menu.id,
                'restaurant_id': menu.restaurant_id,
                'product_id': menu.product_id,
                'price': float(menu.price),
                'availability': menu.availability,
                'created_at': menu.created_at.isoformat() if hasattr(menu, 'created_at') and menu.created_at else None
            }
            
            # Agregar información del producto si existe la relación
            if hasattr(menu, 'product') and menu.product:
                menu_dict['product'] = {
                    'id': menu.product.id,
                    'name': menu.product.name,
                    'description': getattr(menu.product, 'description', ''),
                    'price': float(menu.product.price),
                    'category': getattr(menu.product, 'category', ''),
                    'imageUrl': getattr(menu.product, 'image_url', None)
                }
            else:
                menu_dict['product'] = None
            
            # Agregar información del restaurante si existe la relación
            if hasattr(menu, 'restaurant') and menu.restaurant:
                menu_dict['restaurant'] = {
                    'id': menu.restaurant.id,
                    'name': menu.restaurant.name,
                    'address': getattr(menu.restaurant, 'address', ''),
                    'phone': getattr(menu.restaurant, 'phone', ''),
                    'email': getattr(menu.restaurant, 'email', '')
                }
            else:
                menu_dict['restaurant'] = None
            
            result.append(menu_dict)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ Error en get_menus: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@menu_bp.route('/api/menus/<int:id>', methods=['GET', 'OPTIONS'])
@cross_origin(origins='http://localhost:4200')
def get_menu(id):
    """Obtener un menú específico"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        from models import Menu
        menu = Menu.query.get_or_404(id)
        
        return jsonify({
            'id': menu.id,
            'restaurant_id': menu.restaurant_id,
            'product_id': menu.product_id,
            'price': float(menu.price),
            'availability': menu.availability
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 404


@menu_bp.route('/api/menus', methods=['POST'])
@cross_origin(origins='http://localhost:4200')
def create_menu():
    """Crear un nuevo menú"""
    try:
        from models import db, Menu, Product, Restaurant
        
        data = request.get_json()
        print(f"📥 Datos recibidos: {data}")
        
        # Validaciones
        if not data.get('restaurant_id'):
            return jsonify({'error': 'restaurant_id es obligatorio'}), 400
        
        if not data.get('product_id'):
            return jsonify({'error': 'product_id es obligatorio'}), 400
        
        if not data.get('price'):
            return jsonify({'error': 'price es obligatorio'}), 400
        
        if float(data.get('price')) <= 0:
            return jsonify({'error': 'price debe ser mayor a 0'}), 400
        
        # Verificar que el restaurante existe
        restaurant = Restaurant.query.get(data['restaurant_id'])
        if not restaurant:
            return jsonify({'error': f'Restaurante con id {data["restaurant_id"]} no encontrado'}), 404
        
        # Verificar que el producto existe
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': f'Producto con id {data["product_id"]} no encontrado'}), 404
        
        # Crear el menú
        menu = Menu(
            restaurant_id=int(data['restaurant_id']),
            product_id=int(data['product_id']),
            price=float(data['price']),
            availability=data.get('availability', True),
            created_at=datetime.utcnow()
        )
        
        db.session.add(menu)
        db.session.commit()
        
        print(f"✅ Menú creado exitosamente: ID {menu.id}")
        
        return jsonify({
            'id': menu.id,
            'restaurant_id': menu.restaurant_id,
            'product_id': menu.product_id,
            'price': float(menu.price),
            'availability': menu.availability,
            'created_at': menu.created_at.isoformat()
        }), 201
        
    except Exception as e:
        print(f"❌ Error en create_menu: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@menu_bp.route('/api/menus/<int:id>', methods=['PUT', 'PATCH'])
@cross_origin(origins='http://localhost:4200')
def update_menu(id):
    """Actualizar un menú existente"""
    try:
        from models import db, Menu, Product
        
        menu = Menu.query.get_or_404(id)
        data = request.get_json()
        
        print(f"📝 Actualizando menú {id} con: {data}")
        
        # Actualizar precio si se proporciona
        if 'price' in data:
            if float(data['price']) <= 0:
                return jsonify({'error': 'price debe ser mayor a 0'}), 400
            menu.price = float(data['price'])
        
        # Actualizar disponibilidad si se proporciona
        if 'availability' in data:
            menu.availability = bool(data['availability'])
        
        # Actualizar producto si se proporciona
        if 'product_id' in data:
            product = Product.query.get(data['product_id'])
            if not product:
                return jsonify({'error': 'Producto no encontrado'}), 404
            menu.product_id = int(data['product_id'])
        
        db.session.commit()
        
        print(f"✅ Menú {id} actualizado exitosamente")
        
        return jsonify({
            'id': menu.id,
            'restaurant_id': menu.restaurant_id,
            'product_id': menu.product_id,
            'price': float(menu.price),
            'availability': menu.availability
        }), 200
        
    except Exception as e:
        print(f"❌ Error en update_menu: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@menu_bp.route('/api/menus/<int:id>', methods=['DELETE', 'OPTIONS'])
@cross_origin(origins='http://localhost:4200')
def delete_menu(id):
    """Eliminar un menú"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        from models import db, Menu
        
        menu = Menu.query.get_or_404(id)
        
        db.session.delete(menu)
        db.session.commit()
        
        print(f"🗑️ Menú {id} eliminado exitosamente")
        
        return '', 204
        
    except Exception as e:
        print(f"❌ Error en delete_menu: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

---

## 📁 PASO 3: Agregar modelo Menu a `models.py`

**Ubicación:** `C:\desarrolloFrontend\ANG-ULAUR\ms_delivery\models.py`

**Agregar esta clase al final del archivo:**

```python
from datetime import datetime

class Menu(db.Model):
    __tablename__ = 'menus'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    availability = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones (ajusta 'Restaurant' y 'Product' según los nombres de tus clases)
    restaurant = db.relationship('Restaurant', backref='menus')
    product = db.relationship('Product', backref='menus')
    
    def __repr__(self):
        return f'<Menu {self.id}: Restaurant {self.restaurant_id} - Product {self.product_id}>'
```

**NOTA:** Si tus modelos de Restaurant y Product tienen nombres diferentes, ajusta las relaciones.

---

## 📁 PASO 4: Modificar `app.py` (o tu archivo principal)

**Ubicación:** `C:\desarrolloFrontend\ANG-ULAUR\ms_delivery\app.py`

**Agregar estos imports al inicio del archivo:**

```python
from flask_cors import CORS
from menu_routes import menu_bp
```

**Después de crear la app (`app = Flask(__name__)`), agregar:**

```python
# Configuración de CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:4200", "http://127.0.0.1:4200"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Registrar blueprint de menús
app.register_blueprint(menu_bp)
print("✅ Blueprint de menús registrado")
```

---

## 📁 PASO 5: Crear la tabla en la base de datos

**Opción A - Con Flask shell:**

```bash
cd C:\desarrolloFrontend\ANG-ULAUR\ms_delivery
python
```

Dentro de Python:

```python
from app import app, db
from models import Menu

with app.app_context():
    db.create_all()
    print("✅ Tabla 'menus' creada!")

exit()
```

**Opción B - Con Flask-Migrate (si lo usas):**

```bash
flask db migrate -m "Add menus table"
flask db upgrade
```

---

## 📁 PASO 6: Reiniciar el servidor Flask

1. Detén el servidor actual (Ctrl+C en la terminal donde corre)
2. Vuelve a ejecutar:

```bash
python run.py
```

Deberías ver:
```
✅ Blueprint de menús registrado
 * Running on http://127.0.0.1:5000
```

---

## 🧪 PASO 7: Probar el endpoint

**Prueba 1 - Desde PowerShell:**

```powershell
curl http://127.0.0.1:5000/api/menus
```

**Resultado esperado:** `[]` (array vacío, sin error 404)

**Prueba 2 - Desde el navegador:**

Ve a: `http://localhost:4200/admin/manage`
- Click en "Gestión de Menús"
- Selecciona un restaurante
- Selecciona un producto
- Ingresa un precio
- Click en "Agregar al Menú"

---

## ❓ Solución de Problemas

### Error: "ModuleNotFoundError: No module named 'flask_cors'"
**Solución:** `pip install flask-cors`

### Error: "Table 'menus' doesn't exist"
**Solución:** Ejecuta el Paso 5 nuevamente

### Error: "No module named 'menu_routes'"
**Solución:** Verifica que `menu_routes.py` esté en la misma carpeta que `app.py`

### Error 404 persiste
**Solución:** 
1. Verifica que en `app.py` hayas agregado `app.register_blueprint(menu_bp)`
2. Reinicia el servidor Flask
3. Busca en la consola del servidor el mensaje "✅ Blueprint de menús registrado"

### Error CORS persiste
**Solución:**
1. Verifica que hayas agregado la configuración CORS en `app.py`
2. Asegúrate de que esté ANTES de registrar los blueprints
3. Reinicia el servidor Flask

---

## ✅ Checklist Final

- [ ] Flask-CORS instalado
- [ ] Archivo `menu_routes.py` creado
- [ ] Modelo `Menu` agregado a `models.py`
- [ ] CORS configurado en `app.py`
- [ ] Blueprint registrado en `app.py`
- [ ] Tabla `menus` creada en la base de datos
- [ ] Servidor Flask reiniciado
- [ ] `curl http://127.0.0.1:5000/api/menus` retorna `[]` sin error 404
- [ ] Frontend puede crear menús sin errores CORS

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona, comparte:
1. El error exacto que ves en la consola del backend
2. El error que ves en el navegador (F12 > Console)
3. El resultado de `curl http://127.0.0.1:5000/api/menus`

¡Listo! 🚀
