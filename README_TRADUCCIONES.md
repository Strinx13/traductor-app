# Sistema de Traducciones - Traductor App

## 🚀 Implementación del Sistema de Traducciones

Este sistema permite gestionar traducciones de etiquetas y calcular automáticamente los porcentajes de avance basado en los idiomas disponibles.

## 📋 Características Implementadas

### ✅ **Backend (Node.js + Express)**
- **Nueva tabla `traducciones`** con relaciones a etiquetas e idiomas
- **Rutas completas** para CRUD de traducciones
- **Cálculo automático** de porcentajes de traducción
- **Validaciones** para evitar duplicados
- **Actualización automática** de porcentajes al crear/editar/eliminar traducciones

### ✅ **Frontend (Angular)**
- **Componente de traducciones** reutilizable
- **Interfaz intuitiva** para gestionar traducciones
- **Barra de progreso** visual
- **Validaciones** en tiempo real
- **Botón de traducciones** en cada etiqueta

### ✅ **Base de Datos**
- **Tabla `traducciones`** con foreign keys
- **Índices optimizados** para rendimiento
- **Datos de ejemplo** incluidos
- **Script SQL completo** para configuración

## 🗄️ Estructura de la Base de Datos

```sql
-- Tabla de traducciones
CREATE TABLE traducciones (
    id_traduccion INT AUTO_INCREMENT PRIMARY KEY,
    id_etiqueta INT NOT NULL,
    id_idioma INT NOT NULL,
    texto_traduccion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_etiqueta) REFERENCES etiquetas(id_etiqueta) ON DELETE CASCADE,
    FOREIGN KEY (id_idioma) REFERENCES idiomas(id_idioma) ON DELETE CASCADE,
    UNIQUE KEY unique_etiqueta_idioma (id_etiqueta, id_idioma)
);
```

## 📊 Cálculo de Porcentajes

El sistema calcula automáticamente los porcentajes de traducción:

- **4 idiomas disponibles** = 25% por idioma
- **2 idiomas disponibles** = 50% por idioma
- **1 idioma disponible** = 100% por idioma

**Ejemplo:**
- Si tienes 4 idiomas (ES, EN, PT, FR) y una etiqueta solo tiene traducción en español → 25%
- Si la misma etiqueta tiene traducción en español e inglés → 50%
- Si tiene traducción en todos los idiomas → 100%

## 🛠️ Instalación y Configuración

### 1. **Configurar la Base de Datos**
```bash
# Ejecutar el script SQL
mysql -u tu_usuario -p < database_setup.sql
```

### 2. **Instalar Dependencias del Backend**
```bash
cd backend
npm install
```

### 3. **Configurar Variables de Entorno**
Crear archivo `.env` en la carpeta `backend`:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=traductor_app
PORT=3000
```

### 4. **Iniciar el Backend**
```bash
cd backend
npm start
```

### 5. **Instalar Dependencias del Frontend**
```bash
npm install
```

### 6. **Iniciar el Frontend**
```bash
ng serve
```

## 🎯 Uso del Sistema

### **Gestionar Traducciones**
1. Ve a la sección de **Etiquetas**
2. Selecciona un módulo
3. Haz clic en el botón 🌐 (globo) de cualquier etiqueta
4. Agrega traducciones para los idiomas disponibles
5. El porcentaje se actualiza automáticamente

### **Funcionalidades Disponibles**
- ✅ **Agregar traducciones** para idiomas no traducidos
- ✅ **Editar traducciones** existentes
- ✅ **Eliminar traducciones** individuales
- ✅ **Ver progreso** en tiempo real
- ✅ **Validaciones** para evitar duplicados

## 🔧 API Endpoints

### **Traducciones**
- `GET /api/traducciones` - Obtener todas las traducciones
- `GET /api/traducciones/etiqueta/:id` - Traducciones por etiqueta
- `GET /api/traducciones/idioma/:id` - Traducciones por idioma
- `POST /api/traducciones` - Crear nueva traducción
- `PUT /api/traducciones/:id` - Actualizar traducción
- `DELETE /api/traducciones/:id` - Eliminar traducción

## 📁 Estructura de Archivos

```
src/app/microfrontends/etiquetas/
├── etiqueta-form/           # Formulario de etiquetas
├── traducciones/            # Componente de traducciones
│   ├── traducciones.component.ts
│   ├── traducciones.component.html
│   └── traducciones.component.css
└── etiquetas-table/         # Tabla principal de etiquetas

backend/src/routes/
├── etiquetas.routes.ts      # Rutas de etiquetas
├── traducciones.routes.ts   # Nuevas rutas de traducciones
├── idiomas.routes.ts        # Rutas de idiomas
└── modulos.routes.ts        # Rutas de módulos
```

## 🎨 Características de la UI

- **Modal responsivo** para gestionar traducciones
- **Barra de progreso** visual con animaciones
- **Botones intuitivos** con iconos
- **Validaciones** en tiempo real
- **Feedback visual** para todas las acciones

## 🔄 Flujo de Trabajo

1. **Crear idiomas** en la sección Idiomas
2. **Crear módulos** en la sección Módulos
3. **Crear etiquetas** en la sección Etiquetas
4. **Gestionar traducciones** haciendo clic en el botón 🌐
5. **Ver progreso** actualizado automáticamente

## 🚀 Beneficios del Sistema

- ✅ **Automatización completa** del cálculo de porcentajes
- ✅ **Interfaz intuitiva** para gestionar traducciones
- ✅ **Validaciones robustas** para evitar errores
- ✅ **Escalabilidad** para agregar más idiomas
- ✅ **Rendimiento optimizado** con índices de BD
- ✅ **Mantenibilidad** con código modular

¡El sistema está listo para usar! 🎉 