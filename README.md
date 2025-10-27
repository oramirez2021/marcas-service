# Marcas Service

Microservicio para gestión de marcas de fiscalización en el sistema de aduanas.

## Descripción

Este servicio proporciona funcionalidades para consultar y modificar marcas de fiscalización en guías courier, replicando la funcionalidad del sistema WebFiscalizaciones.

## Características

- 🔍 **Consulta de guías con marcas**: Obtiene guías marcadas para fiscalización
- ✏️ **Modificación de marcas**: Permite modificar el estado de las marcas
- 🗄️ **Integración Oracle**: Conecta directamente con la base de datos Oracle
- 🐳 **Docker Ready**: Configurado para contenedores y Kubernetes
- 📚 **Swagger UI**: Documentación automática de la API
- 🔒 **Autenticación JWT**: Seguridad basada en tokens

## Estructura del Proyecto

```
marcas-service/
├── src/
│   ├── marcas/                 # Módulo principal de marcas
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entities/          # Entidades de base de datos
│   │   ├── services/          # Servicios de negocio
│   │   ├── marcas.controller.ts
│   │   ├── marcas.service.ts
│   │   ├── marcas.module.ts
│   │   └── oracle.service.ts
│   ├── auth/                  # Módulo de autenticación
│   ├── config/                # Configuración y validación
│   └── main.ts
├── scripts/                   # Scripts de utilidad
├── layers/                    # AWS Lambda layers
├── docker-compose.yml         # Configuración Docker
├── Dockerfile                 # Imagen Docker
└── package.json
```

## Instalación

### Prerrequisitos

- Node.js 20+
- Oracle Instant Client
- Docker (opcional)

### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd marcas-service

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Compilar
npm run build

# Ejecutar
npm run start:dev
```

### Instalación con Docker

```bash
# Construir imagen
docker build -t marcas-service:latest .

# Ejecutar con docker-compose
docker-compose up --build
```

## Configuración

### Variables de Entorno

```bash
# Base de datos Oracle
DB_HOST=localhost
DB_PORT=1521
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_service_name

# Oracle Instant Client
ORACLE_HOME=/opt/oracle/instantclient_21_10
LD_LIBRARY_PATH=/opt/oracle/instantclient_21_10

# Aplicación
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

## Uso

### API Endpoints

#### Consultar Guías con Marcas

```http
GET /marcas/consulta?idManifiesto=12345&tipoAccion=VIS&guiaCourier=GT123456
```

**Parámetros:**
- `idManifiesto` (required): ID del manifiesto
- `tipoAccion` (optional): Tipo de acción (VIS, etc.)
- `guiaCourier` (optional): Número de guía específica

#### Modificar Marca

```http
POST /marcas/modificar
Content-Type: application/json

{
  "idGuia": 67890,
  "motivoMarca": "F",
  "observacion": "Revisión manual requerida"
}
```

### Swagger UI

Una vez iniciado el servicio, accede a la documentación interactiva:

```
http://localhost:3000/api/docs
```

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo
npm run start:debug        # Iniciar con Oracle configurado

# Construcción
npm run build              # Compilar TypeScript
npm run build:layer        # Construir layer de dependencias
npm run build:lambda       # Construir para AWS Lambda

# Docker
npm run docker:build       # Construir imagen Docker
npm run docker:run         # Ejecutar contenedor
npm run docker:k8s         # Ejecutar con Kubernetes

# Limpieza
npm run clean              # Limpiar archivos generados
```

## Desarrollo

### Estructura de Módulos

El servicio está organizado en módulos independientes:

- **MarcasModule**: Lógica principal de marcas
- **AuthModule**: Autenticación y autorización
- **OracleService**: Conexión y consultas a Oracle

### Agregar Nuevas Funcionalidades

1. Crear DTOs en `src/marcas/dto/`
2. Implementar lógica en `src/marcas/services/`
3. Agregar endpoints en `src/marcas/marcas.controller.ts`
4. Actualizar documentación Swagger

## Despliegue

### Docker

```bash
# Construir imagen
docker build -t marcas-service:latest .

# Ejecutar
docker run -p 3000:3000 --env-file .env marcas-service:latest
```

### Kubernetes

```bash
# Aplicar configuración
kubectl apply -f k8s/

# Verificar despliegue
kubectl get pods -l app=marcas-service
```

### AWS Lambda

```bash
# Construir para Lambda
npm run build:lambda

# Desplegar
sam deploy --guided
```

## Monitoreo

### Health Check

```http
GET /api/health
```

### Logs

Los logs se generan en formato estructurado con diferentes niveles:
- `LOG`: Información general
- `ERROR`: Errores y excepciones
- `WARN`: Advertencias
- `DEBUG`: Información de depuración

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, contactar al equipo de desarrollo.
