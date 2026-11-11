# Pruebas de la API de autenticación

Esta batería cubre los 12 endpoints de users, auth y profiles de la API de Brasaland. Cada endpoint tiene pruebas de camino feliz, de caso límite y de modo de fallo.

## Cómo ejecutar las pruebas

Los comandos se ejecutan desde `services/api`:

```bash
uv sync
uv run pytest
uv run pytest --cov=auth --cov=routes --cov-report=term-missing
```

Las pruebas usan una base de datos temporal y no tocan `auth.json`.

## Plan de pruebas

### POST /users (registro) → test_register.py

| Tipo   | Caso                       | Qué comprobamos                               |
| ------ | -------------------------- | --------------------------------------------- |
| Feliz  | Email y contraseña válidos | Se crea con rol user, activo, y con su perfil |
| Límite | Email ya registrado        | 409 y no se crea un segundo usuario           |
| Fallo  | Email inválido ("hola")    | Se rechaza y no se guarda nada                |
| Fallo  | Contraseña de 7 caracteres | Se rechaza y no se guarda nada                |

### POST /auth/login → test_login.py

| Tipo   | Caso                                        | Qué comprobamos                                             |
| ------ | ------------------------------------------- | ----------------------------------------------------------- |
| Feliz  | Credenciales correctas                      | El token pertenece a ese usuario                            |
| Límite | Usuario desactivado                         | 401, no hay token                                           |
| Fallo  | Contraseña incorrecta / email que no existe | 401, no hay token y el mensaje es el mismo en los dos casos |

### GET /auth/me (token) → test_token.py

| Tipo   | Caso                                         | Qué comprobamos                              |
| ------ | -------------------------------------------- | -------------------------------------------- |
| Feliz  | Token válido                                 | Devuelve el email y el perfil de ese usuario |
| Límite | Token al que le falta 1 minuto para vencer   | Todavía sirve                                |
| Límite | Usar un código de reset como token de sesión | Se rechaza                                   |
| Fallo  | Token vencido, mal formado o sin token       | 401                                          |

### Contraseñas (forgot, reset, change) → test_password.py

| Endpoint | Tipo   | Caso                             | Qué comprobamos                              |
| -------- | ------ | -------------------------------- | -------------------------------------------- |
| forgot   | Feliz  | Email registrado y activo        | Se "manda" el correo                         |
| forgot   | Límite | Email no registrado              | Mismo mensaje y no se manda nada             |
| forgot   | Fallo  | Usuario desactivado              | No se manda nada                             |
| reset    | Feliz  | Código válido                    | Funciona la nueva contraseña, ya no la vieja |
| reset    | Límite | El mismo código usado dos veces  | La segunda vez se rechaza                    |
| reset    | Fallo  | Código vencido o inventado       | 400 y la contraseña no cambia                |
| change   | Feliz  | Contraseña actual correcta       | Cambia y se puede entrar con la nueva        |
| change   | Límite | Nueva contraseña de 7 caracteres | Se rechaza y la vieja sigue sirviendo        |
| change   | Fallo  | Contraseña actual incorrecta     | 400 y no cambia nada                         |

### Perfil (GET y PUT /profiles/me) → test_profiles.py

| Endpoint | Tipo   | Caso                                      | Qué comprobamos                                    |
| -------- | ------ | ----------------------------------------- | -------------------------------------------------- |
| GET /me  | Feliz  | Con token                                 | Devuelve el perfil de quien tiene el token         |
| GET /me  | Límite | Usuario registrado sin nombre ni teléfono | El perfil existe con esos campos vacíos            |
| GET /me  | Fallo  | Sin token                                 | 401                                                |
| PUT /me  | Feliz  | Cambiar el nombre                         | Cambia el nombre y el email del usuario no se toca |
| PUT /me  | Límite | Mandar solo el teléfono                   | El nombre se mantiene                              |
| PUT /me  | Fallo  | Sin token                                 | 401                                                |

### Usuarios (GET, PUT, DELETE /users) → test_users.py

| Endpoint | Tipo   | Caso                                 | Qué comprobamos                     |
| -------- | ------ | ------------------------------------ | ----------------------------------- |
| GET      | Feliz  | Logueada                             | Ve la lista y puede ver un usuario  |
| GET      | Límite | ID que no existe                     | 404                                 |
| GET      | Límite | Cualquier respuesta                  | Nunca incluye la contraseña cifrada |
| GET      | Fallo  | Sin token                            | 401                                 |
| PUT      | Feliz  | Cambia su propio email               | El email se actualiza               |
| PUT      | Límite | Usuario normal intenta hacerse admin | 403 y sigue siendo user             |
| PUT      | Límite | Email que ya usa otra persona        | 409                                 |
| PUT      | Fallo  | A intenta editar a B                 | 403 y B no cambia                   |
| DELETE   | Feliz  | Borra su propia cuenta               | Se borran el usuario y su perfil    |
| DELETE   | Límite | Un admin borra a otra persona        | Se permite                          |
| DELETE   | Fallo  | A intenta borrar a B                 | 403 y B sigue existiendo            |

## Por qué elegí estos casos

- Se prueban decisiones de la API (quién puede hacer qué, qué se rechaza y qué se guarda en la base), no el formato de las respuestas.
- Se prioriza la seguridad: tokens vencidos o mal formados, permisos entre usuarios y códigos de reset de un solo uso.
- El login usa el mismo mensaje para email inexistente y contraseña incorrecta, para no revelar qué emails están registrados; los tests lo comprueban.
- El envío de correos se reemplaza por una función falsa en los tests, para no mandar correos reales y poder comprobar si la API decidió enviarlo.
- Los tests usan una base de datos temporal (variable AUTH_DB_PATH) que se vacía antes de cada test, para que un test no afecte a otro.

## Bugs encontrados

### 1. El registro aceptaba emails sin formato válido

- **Cómo se detectó:** el test test_register_rejects_invalid_email (tests/test_register.py) falló: POST /users con el email "hola" respondía 201 y creaba el usuario.
- **Causa:** en auth/models.py, UserCreate.email era un str sin ninguna validación de formato.
- **Solución:** se agregó la función is_valid_email en auth/services.py (revisa que no haya espacios, que haya un solo "@", texto antes del "@" y un dominio con punto que no esté al principio ni al final). Las rutas POST /users y PUT /users/{user_id} ahora responden 422 si el email no es válido. Se eligió una validación propia en lugar de EmailStr para no agregar dependencias nuevas.
- **Se aplicó también a la edición:** sin este cambio, un usuario podría registrarse bien y después cambiar su email a uno inválido.
- **Estado:** corregido; el test ahora pasa.

## Flujo de trabajo con IA

Pendiente.

## Resultados de cobertura

Pendiente: se completa al final.
