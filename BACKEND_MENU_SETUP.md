# 🔧 Configuración del Backend para Gestión de Menús

## 📋 Resumen
Este documento contiene las instrucciones para configurar el endpoint `/api/menus` en tu backend Flask.

## ⚠️ Errores Actuales
- **404 NOT FOUND**: El endpoint `/api/menus` no existe en el backend
- **CORS Error**: El backend necesita configuración CORS para permitir peticiones desde Angular

---

## 🛠️ Paso 1: Instalar Flask-CORS

```bash
pip install flask-cors
```

---

## 🛠️ Paso 2: Crear el Modelo Menu

En tu archivo `models.py` (o donde tengas tus modelos), agrega:

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
    
    # Relaciones
    restaurant = db.relationship('Restaurant', backref='menus')
    product = db.relationship('Product', backref='menus')
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'product_id': self.product_id,
            'price': float(self.price),
            'availability': self.availability,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
```

---

## 🛠️ Paso 3: Crear las Rutas de Menu

Crea un archivo `menu_routes.py`:

```python
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from models import db, Menu, Product, Restaurant
from datetime import datetime

menu_bp = Blueprint('menus', __name__)

# GET all menus
@menu_bp.route('/api/menus', methods=['GET'])
@cross_origin()
def get_menus():
    try:
        menus = Menu.query.all()
        result = []
        for m in menus:
            menu_data = m.to_dict()
            
            # Agregar información del producto
            if m.product:
                menu_data['product'] = {
                    'id': m.product.id,
                    'name': m.product.name,
                    'description': m.product.description,
                    'price': float(m.product.price),
                    'category': m.product.category,
                    'imageUrl': getattr(m.product, 'image_url', None)
                }
            
            # Agregar información del restaurante
            if m.restaurant:
                menu_data['restaurant'] = {
                    'id': m.restaurant.id,
                    'name': m.restaurant.name,
                    'address': m.restaurant.address,
                    'phone': m.restaurant.phone,
                    'email': m.restaurant.email
                }
            
            result.append(menu_data)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET menu by id
@menu_bp.route('/api/menus/<int:id>', methods=['GET'])
@cross_origin()
def get_menu(id):
    try:
        menu = Menu.query.get_or_404(id)
        menu_data = menu.to_dict()
        
        if menu.product:
            menu_data['product'] = {
                'id': menu.product.id,
                'name': menu.product.name,
                'description': menu.product.description,
                'price': float(menu.product.price),
                'category': menu.product.category
            }
        
        return jsonify(menu_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# POST create menu
@menu_bp.route('/api/menus', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_menu():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        # Validaciones
        if not data.get('restaurant_id') or not data.get('product_id'):
            return jsonify({'error': 'restaurant_id y product_id son obligatorios'}), 400
        
        if not data.get('price') or float(data.get('price')) <= 0:
            return jsonify({'error': 'price debe ser mayor a 0'}), 400
        
        # Verificar que el restaurante existe
        restaurant = Restaurant.query.get(data['restaurant_id'])
        if not restaurant:
            return jsonify({'error': 'Restaurante no encontrado'}), 404
        
        # Verificar que el producto existe
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # Crear menú
        menu = Menu(
            restaurant_id=data['restaurant_id'],
            product_id=data['product_id'],
            price=float(data['price']),
            availability=data.get('availability', True),
            created_at=datetime.utcnow()
        )
        
        db.session.add(menu)
        db.session.commit()
        
        return jsonify(menu.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# PUT update menu
@menu_bp.route('/api/menus/<int:id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_menu(id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        menu = Menu.query.get_or_404(id)
        data = request.get_json()
        
        if 'price' in data:
            if float(data['price']) <= 0:
                return jsonify({'error': 'price debe ser mayor a 0'}), 400
            menu.price = float(data['price'])
        
        if 'availability' in data:
            menu.availability = data['availability']
        
        if 'product_id' in data:
            product = Product.query.get(data['product_id'])
            if not product:
                return jsonify({'error': 'Producto no encontrado'}), 404
            menu.product_id = data['product_id']
        
        db.session.commit()
        
        return jsonify(menu.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# DELETE menu
@menu_bp.route('/api/menus/<int:id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_menu(id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        menu = Menu.query.get_or_404(id)
        db.session.delete(menu)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

---

## 🛠️ Paso 4: Configurar CORS en app.py

En tu archivo principal `app.py`:

```python
from flask import Flask
from flask_cors import CORS
from menu_routes import menu_bp

app = Flask(__name__)

# Configurar CORS para permitir peticiones desde Angular
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Registrar el blueprint de menús
app.register_blueprint(menu_bp)

# ... resto de tu configuración
```

---

## 🛠️ Paso 5: Crear la Tabla en la Base de Datos

En tu terminal de Python o en un script:

```python
from app import app, db
from models import Menu

with app.app_context():
    db.create_all()
    print("Tabla 'menus' creada exitosamente!")
```

O si usas Flask-Migrate:

```bash
flask db migrate -m "Add menus table"
flask db upgrade
```

---

## 🛠️ Paso 6: Actualizar el Modelo Product (Opcional)

Si quieres agregar el campo `image_url` al modelo Product:

```python
class Product(db.Model):
    # ... campos existentes ...
    image_url = db.Column(db.String(500), nullable=True)
```

Luego ejecuta la migración:

```bash
flask db migrate -m "Add image_url to products"
flask db upgrade
```

---

## ✅ Verificación

Una vez configurado todo, verifica que tu backend esté corriendo en:
- **URL**: http://127.0.0.1:5000
- **Endpoints disponibles**:
  - GET `/api/menus` - Listar todos los menús
  - GET `/api/menus/:id` - Obtener un menú específico
  - POST `/api/menus` - Crear un menú
  - PUT `/api/menus/:id` - Actualizar un menú
  - DELETE `/api/menus/:id` - Eliminar un menú

---

## 🧪 Prueba con curl

```bash
# Crear un menú
curl -X POST http://127.0.0.1:5000/api/menus \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": 1,
    "product_id": 1,
    "price": 25000,
    "availability": true
  }'

# Listar menús
curl http://127.0.0.1:5000/api/menus

# Actualizar un menú
curl -X PUT http://127.0.0.1:5000/api/menus/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 28000,
    "availability": false
  }'

# Eliminar un menú
curl -X DELETE http://127.0.0.1:5000/api/menus/1
```

---

## 🎯 Resultado Esperado

Después de implementar estos cambios:

1. ✅ El frontend Angular podrá crear menús
2. ✅ Podrás editar precios y disponibilidad
3. ✅ Podrás eliminar menús
4. ✅ Verás la lista de productos por restaurante
5. ✅ No habrá errores de CORS

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que Flask esté corriendo en puerto 5000
2. Verifica los logs del backend para ver errores específicos
3. Usa las herramientas de desarrollo del navegador (F12) para ver las peticiones HTTP
4. Verifica que las tablas existan en la base de datos

¡Listo! 🚀
