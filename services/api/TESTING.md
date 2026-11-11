# Pruebas de la API de autenticación

Esta batería cubre los 12 endpoints de users, auth y profiles de la API de Brasaland. Cada endpoint tiene pruebas de camino feliz, de caso límite y de modo de fallo.

## Cómo ejecutar las pruebas

Los comandos se ejecutan desde `services/api`:

```bash
uv sync
uv run pytest
uv run pytest --cov=auth --cov=routes.auth --cov=routes.users --cov=routes.profiles --cov-report=term-missing
```

La cobertura se mide solo sobre los módulos de autenticación (la carpeta auth/ y las rutas auth, users y profiles), no sobre proveedores ni incidencias.

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
| Fallo  | Token de una cuenta borrada                  | 401 aunque el token no haya vencido          |
| Fallo  | Token de un usuario desactivado              | 401                                          |

### Contraseñas (forgot, reset, change) → test_password.py

| Endpoint | Tipo   | Caso                                           | Qué comprobamos                                              |
| -------- | ------ | ---------------------------------------------- | ------------------------------------------------------------ |
| forgot   | Feliz  | Email registrado y activo                      | Se "manda" el correo                                         |
| forgot   | Límite | Email no registrado                            | Mismo mensaje y no se manda nada                             |
| forgot   | Fallo  | Usuario desactivado                            | No se manda nada                                             |
| reset    | Feliz  | Código válido                                  | Funciona la nueva contraseña, ya no la vieja                 |
| reset    | Límite | El mismo código usado dos veces                | La segunda vez se rechaza                                    |
| reset    | Fallo  | Código vencido o inventado                     | 400 y la contraseña no cambia                                |
| change   | Feliz  | Contraseña actual correcta                     | Cambia y se puede entrar con la nueva                        |
| change   | Límite | Nueva contraseña de 7 caracteres               | Se rechaza y la vieja sigue sirviendo                        |
| change   | Fallo  | Contraseña actual incorrecta                   | 400 y no cambia nada                                         |
| forgot   | Límite | Falla el envío del correo                      | Responde 200 con el mismo mensaje que un email no registrado |
| reset    | Límite | Usuario desactivado después de pedir el código | 400 y la contraseña no cambia                                |
| reset    | Fallo  | Token de sesión usado como código de reset     | 400 y la contraseña no cambia                                |

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
| PUT      | Fallo  | Email inválido ("hola")              | 422 y el email no cambia            |
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

Después de medir la cobertura (91% con 41 tests), le pasé a Copilot las líneas sin cubrir y el código de auth/ y routes/, y le pedí que sugiriera casos límite y modos de fallo, sin escribir código, indicando si cada uno era importante para la seguridad o solo subía el porcentaje.

| Sugerencia de la IA                           | Decisión   | Motivo                                                                                             |
| --------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| Token de un usuario borrado o desactivado     | Agregada   | Seguridad: una cuenta eliminada o desactivada no debe conservar acceso hasta que venza el token    |
| Token de sesión usado como código de reset    | Agregada   | Seguridad: completa el test inverso que ya existía (código de reset usado como sesión)             |
| Falla el envío del correo de restablecimiento | Agregada   | Seguridad: no se nos había ocurrido; una respuesta distinta revelaría qué emails están registrados |
| Reset de un usuario desactivado               | Agregada   | Lógica de negocio: un código pedido antes de desactivar la cuenta no debe servir                   |
| Admin edita o borra un ID inexistente         | Descartada | El 404 ya está probado en GET /users/{id}; solo confirmaba el mismo comportamiento                 |
| Usuario sin perfil en /profiles/me            | Descartada | Solo ocurre si la base está dañada; solo subía el porcentaje                                       |

La IA también se usó para generar el código de los tests a partir del plan; cada test se revisó antes de confirmarlo (por ejemplo, se corrigió un test de perfil que miraba la base pero no comprobaba qué devolvía el endpoint).

## Resultados de cobertura

Resultado con 46 tests, todos pasando:

```text
Name                 Stmts   Miss  Cover   Missing
--------------------------------------------------
auth/__init__.py         0      0   100%
auth/database.py        14      3    79%   16-18
auth/mailer.py          19      8    58%   20-49
auth/models.py          53      0   100%
auth/security.py        66      7    89%   23-24, 29, 50-51, 97, 119
auth/services.py        85      3    96%   79, 95, 112
routes/auth.py          30      0   100%
routes/profiles.py      18      2    89%   19, 34
routes/users.py         52      4    92%   61, 92, 111, 122
--------------------------------------------------
TOTAL                  337     27    92%
```

Líneas sin cubrir a propósito:

- auth/mailer.py: el envío real de correos; en los tests se reemplaza con monkeypatch.
- auth/database.py 16-18 y auth/security.py 23-24, 29: errores de arranque por archivo dañado o configuración faltante, no son lógica de negocio.
- auth/services.py 79 y 95, routes/users.py 92 y 122: código al que no se puede llegar, porque las rutas ya comprueban antes que el usuario existe.
- Resto (hash dañado, token sin "sub" o sin "iat", usuario sin perfil): solo se alcanzan con datos dañados o tokens firmados a mano; se priorizó la calidad de los casos sobre el porcentaje.

## Tests del frontend (Jest)

Además de la API, se probaron con Jest las funciones de ayuda de autenticación del backoffice (uis/backoffice/lib/auth.ts): getToken, setToken y clearToken, que guardan, leen y borran el token de sesión en el localStorage del navegador.

### Cómo ejecutarlos

Los comandos se ejecutan desde `uis/backoffice`:

```bash
npm install
npx jest --coverage
```

También se pueden usar `npm test` y `npm run test:coverage`.

### Casos cubiertos

| Archivo             | Entorno           | Tipo   | Caso                                                    |
| ------------------- | ----------------- | ------ | ------------------------------------------------------- |
| auth.test.ts        | Navegador (jsdom) | Feliz  | setToken guarda el token y getToken lo devuelve         |
| auth.test.ts        | Navegador (jsdom) | Límite | setToken reemplaza un token anterior                    |
| auth.test.ts        | Navegador (jsdom) | Fallo  | getToken devuelve null si no hay sesión guardada        |
| auth.test.ts        | Navegador (jsdom) | Feliz  | clearToken borra el token                               |
| auth.test.ts        | Navegador (jsdom) | Fallo  | clearToken no falla si no había token                   |
| auth.server.test.ts | Servidor (node)   | Fallo  | getToken devuelve null cuando no existe window          |
| auth.server.test.ts | Servidor (node)   | Fallo  | setToken y clearToken no fallan cuando no existe window |

Next.js puede ejecutar el código en el servidor, donde no existe `window` ni `localStorage`; el archivo auth.server.test.ts simula ese entorno para comprobar que las funciones no rompen la app.

### Resultado

7 tests en 2 suites, todos pasando.

```text
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |
 auth.ts  |     100 |      100 |     100 |     100 |
----------|---------|----------|---------|---------|-------------------
```

### Configuración

- Se instalaron como devDependencies jest, @types/jest, ts-jest y jest-environment-jsdom (este último simula el navegador con localStorage).
- jest.config.js ajusta el tsconfig solo para los tests (module commonjs), porque la configuración de TypeScript de Next.js no es compatible con Jest; la app no cambia.

## Observaciones

- GET /users y GET /users/{user_id} permiten que cualquier usuario autenticado vea la lista de todos los usuarios, no solo un administrador. No se cambió porque no estaba en el alcance del ticket, pero se recomienda revisarlo. Los tests actuales comprueban que la contraseña cifrada nunca se incluye en esas respuestas.
- uis/talent-pipeline-tracker/lib/auth.ts es una copia idéntica de uis/backoffice/lib/auth.ts. Se probó solo la del backoffice; se recomienda mover estas funciones a packages/ para compartirlas entre las dos apps y probarlas una sola vez.
