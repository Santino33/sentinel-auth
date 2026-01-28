# Auth Module Core

Este módulo proporciona el núcleo de autenticación y autorización basado en JSON Web Tokens (JWT) para el proyecto Sentinel.

## Estructura

- `jwt.service.ts`: Manejo de bajo nivel de tokens (firmado, verificación, decodificación).
- `auth.service.ts`: Lógica de negocio de autenticación (login, validación de usuario).
- `auth.guard.ts`: Middlewares de Express para proteger rutas (AuthN y AuthZ).
- `auth.types.ts`: Definiciones de tipos para payloads de JWT y usuarios.
- `auth.module.ts`: Punto de entrada para obtener las instancias de los servicios.

## Claims del Token

El JWT contiene los siguientes claims:

- `sub`: ID único del usuario.
- `email`: Correo electrónico del usuario.
- `role`: Rol del usuario (ej: `ADMIN`, `USER`).
- `projectId`: (Opcional) ID del proyecto al que pertenece el usuario.
- `iat`: Timestamp de emisión.
- `exp`: Timestamp de expiración.

## Guía de Uso

### 1. Generación de Token (Login)

Cuando un usuario se autentica correctamente (ej. vía email/password), se utiliza el `AuthService` para generar su token:

```typescript
import { authService } from "./modules/auth/auth.module";

const tokenData = await authService.login({
  id: user.id,
  email: user.email,
  role: user.role,
  projectId: user.projectId,
});

// Devuelve { accessToken, expiresIn }
```

### 2. Protección de Rutas (AuthN)

Para proteger un endpoint, usa el `authGuard`:

```typescript
import { authGuard } from "../modules/auth/auth.guard";

router.post("/projects", authGuard, projectController.create);
```

### 3. Autorización por Roles (AuthZ)

Para restringir acceso a roles específicos:

```typescript
import { authGuard, rolesGuard } from "../modules/auth/auth.guard";

router.delete(
  "/users/:id",
  authGuard,
  rolesGuard(["ADMIN"]),
  userController.delete,
);
```

### 4. Acceso al Usuario Autenticado

El `authGuard` inyecta la información del usuario en el objeto `Request` de Express:

```typescript
const userId = req.user.id;
const userRole = req.user.role;
```

## Configuración

Asegúrate de tener las siguientes variables en tu archivo `.env`:

- `JWT_SECRET`: Llave secreta para firmar los tokens.
- `JWT_EXPIRES_IN`: Tiempo de expiración (ej: `1h`, `7d`).

## Consideraciones de Seguridad

- **Sin Blacklist**: Por ahora, los tokens son válidos hasta su expiración. El diseño permite añadir una capa de verificación contra Redis o DB en `AuthService.validateToken` en el futuro.
- **Secret Management**: Nunca compartas el `JWT_SECRET`.
- **Expiración Corta**: Se recomienda usar tiempos de expiración cortos para Access Tokens.
