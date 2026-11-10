# Auditoría de manejo de errores

El objetivo es que ningún error rompa la aplicación ni deje al usuario sin saber qué pasó. Esta auditoría estática de `uis/`, `services/`, `scripts/` y `packages/` se hizo primero con un agente de IA, sin cambiar código. Después se revisaron los hallazgos y se corrigieron por capa en la rama `feature/error-handling-audit`. Al final está el estado de las correcciones.

## Resumen por capa

| Capa                                          | CRÍTICO |  ALTO |  MEDIO |   BAJO |  Total |
| --------------------------------------------- | ------: | ----: | -----: | -----: | -----: |
| Frontend (`uis/`)                             |       0 |     1 |     12 |     14 |     27 |
| Backend (`services/api/`, `packages/shared/`) |       0 |     0 |      5 |      9 |     14 |
| Scripts (`scripts/`)                          |       0 |     2 |      3 |      1 |      6 |
| **Total**                                     |   **0** | **3** | **20** | **24** | **47** |

Categorías: 1 Falta de try/catch · 2 Catch demasiado amplio · 3 Fallo silencioso · 4 Error crudo a UI/API · 5 Datos sensibles en errores/logs · 6 Falta de estados de carga/error · 7 Sin ruta de recuperación · 8 Scripts sin `sys.exit`

## CRÍTICO

Ninguno.

## ALTO

| Capa     | Ubicación                                                                                         | Cat. | Problema                                                                                                                                                                            | Corrección breve                                                               |
| -------- | ------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Scripts  | [scripts/analyze.py](scripts/analyze.py#L108-L109)                                                | 8    | Error de argumentos imprime y sale con código 0 (también en [L115-L116](scripts/analyze.py#L115-L116) y [L124-L126](scripts/analyze.py#L124-L126)).                                 | Usar `sys.exit(1)` en cada rama de error.                                      |
| Scripts  | [scripts/seed_incidents.py](scripts/seed_incidents.py#L59-L64)                                    | 8    | Sale con código 0 aunque haya filas inválidas.                                                                                                                                      | Usar `sys.exit(1)` si `invalid` no está vacío, o documentar el comportamiento. |
| Frontend | [account/profile/page.tsx](<uis/backoffice/app/(authenticated)/account/profile/page.tsx#L48-L65>) | 6, 3 | Si falla la carga, el formulario queda visible y vacío; guardar puede borrar datos del perfil ([guardado](<uis/backoffice/app/(authenticated)/account/profile/page.tsx#L87-L108>)). | Ocultar el formulario si no hay datos cargados y mostrar error con reintento.  |

## MEDIO

| Capa     | Ubicación                                                                                                            | Cat. | Problema                                                                                             | Corrección breve                                                    |
| -------- | -------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Frontend | [lib/api.ts](uis/backoffice/lib/api.ts#L14)                                                                          | 1, 4 | `fetch` sin captura; un fallo de red llega como `TypeError` crudo.                                   | Capturar en `apiFetch` y lanzar un mensaje en español.              |
| Frontend | [lib/api.ts](uis/talent-pipeline-tracker/lib/api.ts#L27) (también L37, L49, L66, L86, L103, L116, L131)              | 1    | Ninguna llamada `fetch` captura errores de red.                                                      | Envolver en `try/catch` y lanzar un error controlado.               |
| Frontend | [components/CandidateList.tsx](uis/talent-pipeline-tracker/components/CandidateList.tsx)                             | 7    | Sin botón de reintento ni enlace de regreso al fallar la carga.                                      | Añadir reintento y enlace a inicio.                                 |
| Frontend | [components/CandidateDetail.tsx](uis/talent-pipeline-tracker/components/CandidateDetail.tsx)                         | 7    | Sin reintento ni enlace de regreso al fallar la carga.                                               | Añadir reintento y enlace de regreso.                               |
| Frontend | [components/CandidateNotes.tsx](uis/talent-pipeline-tracker/components/CandidateNotes.tsx#L36-L37)                   | 7    | Error de carga de notas sin reintento.                                                               | Añadir botón de reintento.                                          |
| Frontend | [components/AuthGuard.tsx](uis/talent-pipeline-tracker/components/AuthGuard.tsx#L38)                                 | 7    | Estado de error sin reintento ni enlace a login.                                                     | Mostrar enlace a login y reintento.                                 |
| Frontend | [register/page.tsx](uis/backoffice/app/register/page.tsx#L122-L138)                                                  | 3, 7 | Si la cuenta se crea pero el login falla, el mensaje da a entender que la cuenta no se creó.         | Mostrar que la cuenta existe y ofrecer ir a login.                  |
| Frontend | [forgot-password/page.tsx](uis/backoffice/app/forgot-password/page.tsx#L24-L31)                                      | 3    | No se revisa `response.ok`; un error del servidor muestra éxito.                                     | Comprobar `response.ok` y mostrar error.                            |
| Frontend | [incidencias/page.tsx](<uis/backoffice/app/(authenticated)/incidencias/page.tsx#L90-L93>)                            | 4    | Si la respuesta de éxito no es JSON válido, se muestra el texto crudo de `SyntaxError`.              | Validar la respuesta antes de parsear y mostrar mensaje en español. |
| Frontend | [suppliers/api.ts](<uis/backoffice/app/(authenticated)/suppliers/api.ts#L43-L47>)                                    | 4    | Un fallo de red se propaga como `TypeError` crudo.                                                   | Capturar en el wrapper y devolver mensaje en español.               |
| Frontend | [suppliers/page.tsx](<uis/backoffice/app/(authenticated)/suppliers/page.tsx#L35-L37>)                                | 7    | Sin reintento al fallar la carga de proveedores.                                                     | Añadir botón de reintento.                                          |
| Frontend | [gestor-incidencias/nueva/page.tsx](<uis/backoffice/app/(authenticated)/gestor-incidencias/nueva/page.tsx#L90-L119>) | 3    | El error del campo `status` se guarda en un campo que no se renderiza.                               | Renderizar el error junto al campo.                                 |
| Backend  | [services/api/database.py](services/api/database.py#L9)                                                              | 1    | Apertura de TinyDB sin manejo de error; si falla el archivo, la API no arranca con mensaje claro.    | Envolver la apertura y registrar la ruta y el error.                |
| Backend  | [services/api/auth/database.py](services/api/auth/database.py#L9)                                                    | 1    | Igual que la base principal.                                                                         | Igual que la base principal.                                        |
| Backend  | [services/api/auth/services.py](services/api/auth/services.py#L42-L43)                                               | 1    | `users.insert` y `profiles.insert` no son atómicos; si el segundo falla queda un usuario sin perfil. | Revertir el usuario si falla el perfil.                             |
| Backend  | [services/api/auth/services.py](services/api/auth/services.py#L84-L85)                                               | 1    | `delete_user` borra usuario y perfil en dos pasos; un fallo deja datos inconsistentes.               | Borrar en un único paso o revertir.                                 |
| Backend  | [services/api/seed.py](services/api/seed.py#L173-L178)                                                               | 1    | `SupplierCreate.model_validate` sin captura; un dato inválido detiene la carga a medias.             | Validar cada registro con captura y reporte.                        |
| Scripts  | [scripts/analyze.py](scripts/analyze.py#L24) (y [L115](scripts/analyze.py#L115))                                     | 5    | Los mensajes de error imprimen la ruta absoluta del archivo y el texto de la excepción.              | Mostrar solo el nombre del archivo.                                 |
| Scripts  | [scripts/seed_incidents.py](scripts/seed_incidents.py#L25)                                                           | 1    | `read_text` no maneja `UnicodeDecodeError`.                                                          | Capturar el error y salir con código 1.                             |
| Scripts  | [scripts/seed_incidents.py](scripts/seed_incidents.py#L55-L56)                                                       | 1    | Las inserciones en `incidents` y `seed_imports` no son atómicas.                                     | Insertar en un único paso o revertir.                               |

## BAJO

| Capa     | Ubicación                                                                                                                                                                             | Cat. | Problema                                                                                                        | Corrección breve                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Frontend | [lib/api.ts](uis/talent-pipeline-tracker/lib/api.ts#L33) (también L43, L59, L79)                                                                                                      | 1    | `response.json()` sin captura tras una respuesta correcta.                                                      | Envolver en `try/catch`.                            |
| Frontend | [lib/api.ts](uis/talent-pipeline-tracker/lib/api.ts#L11)                                                                                                                              | 1    | Si `NEXT_PUBLIC_API_URL` no está definida, la URL queda relativa y falla en silencio.                           | Validar la variable al arrancar.                    |
| Frontend | [components/CandidateNotes.tsx](uis/talent-pipeline-tracker/components/CandidateNotes.tsx#L69)                                                                                        | 3    | Si la nota se añade pero falla la recarga, el mensaje es engañoso.                                              | Separar el mensaje de guardado y el de recarga.     |
| Frontend | [app/login/page.tsx](uis/talent-pipeline-tracker/app/login/page.tsx#L51-L52)                                                                                                          | 3    | `catch` sin registro del error original.                                                                        | Registrar el error en consola o en un logger.       |
| Frontend | [components/AuthGuard.tsx](uis/talent-pipeline-tracker/components/AuthGuard.tsx#L39)                                                                                                  | 3    | `catch {}` sin registro.                                                                                        | Registrar el error.                                 |
| Frontend | [app/login/page.tsx](uis/backoffice/app/login/page.tsx#L61-L62)                                                                                                                       | 3    | `catch` sin registro del error original.                                                                        | Registrar el error.                                 |
| Frontend | [register/page.tsx](uis/backoffice/app/register/page.tsx#L138)                                                                                                                        | 3    | `catch {}` sin registro.                                                                                        | Registrar el error.                                 |
| Frontend | [components/UserMenu.tsx](uis/backoffice/components/UserMenu.tsx#L20)                                                                                                                 | 3    | `.catch(() => {})` deja el nombre en "…" sin aviso.                                                             | Mostrar estado de error o un valor por defecto.     |
| Frontend | [gestor-incidencias/page.tsx](<uis/backoffice/app/(authenticated)/gestor-incidencias/page.tsx#L88>) (y [L132](<uis/backoffice/app/(authenticated)/gestor-incidencias/page.tsx#L132>)) | 3    | `catch {}` sin registro; en 401 el mensaje no indica sesión expirada.                                           | Registrar y mostrar mensaje según el estado HTTP.   |
| Frontend | [gestor-incidencias/nueva/page.tsx](<uis/backoffice/app/(authenticated)/gestor-incidencias/nueva/page.tsx#L119>)                                                                      | 3, 7 | `catch {}` sin registro y sin reintento.                                                                        | Registrar el error y añadir reintento.              |
| Frontend | [incidencias/page.tsx](<uis/backoffice/app/(authenticated)/incidencias/page.tsx#L24-L26>)                                                                                             | 3    | `getApiError` descarta el error de parseo y devuelve un mensaje genérico.                                       | Registrar el error original.                        |
| Frontend | [suppliers/api.ts](<uis/backoffice/app/(authenticated)/suppliers/api.ts#L27>)                                                                                                         | 4    | Mensaje de validación de Pydantic en inglés mostrado tal cual.                                                  | Traducir o mapear los mensajes.                     |
| Frontend | [suppliers/api.ts](<uis/backoffice/app/(authenticated)/suppliers/api.ts#L47>)                                                                                                         | 1    | `response.json()` sin captura tras respuesta correcta.                                                          | Envolver en `try/catch`.                            |
| Frontend | [suppliers/SupplierForm.tsx](<uis/backoffice/app/(authenticated)/suppliers/SupplierForm.tsx#L96>)                                                                                     | 4    | El texto crudo del error de red se muestra al usuario.                                                          | Mostrar mensaje en español.                         |
| Frontend | [suppliers/SupplierRow.tsx](<uis/backoffice/app/(authenticated)/suppliers/SupplierRow.tsx>)                                                                                           | 6    | `new Date(...)` y `rateFormatters[currency]` pueden lanzar durante el render. Línea no capturada en la lectura. | Validar moneda y fecha antes de formatear.          |
| Backend  | [services/api/main.py](services/api/main.py#L28-L33)                                                                                                                                  | 3    | El manejador global devuelve 500 sin registrar la excepción.                                                    | Registrar con `logger.exception`.                   |
| Backend  | [services/api/routes/auth.py](services/api/routes/auth.py#L26)                                                                                                                        | 1    | `user["hashed_password"]` sin comprobar la clave.                                                               | Usar `user.get(...)` y comprobar.                   |
| Backend  | [services/api/routes/incident_manager.py](services/api/routes/incident_manager.py#L38-L39)                                                                                            | 1    | El helper de conversión asume campos presentes en el documento.                                                 | Validar campos antes de convertir.                  |
| Backend  | [services/api/routes/incidents.py](services/api/routes/incidents.py#L37)                                                                                                              | 1    | `file.read()` fuera de bloque `try` (el `except` está en [L43](services/api/routes/incidents.py#L43)).          | Mover la lectura dentro del `try`.                  |
| Backend  | [services/api/routes/suppliers.py](services/api/routes/suppliers.py#L21-L23)                                                                                                          | 1    | `document_to_supplier` sin captura de datos incompletos.                                                        | Validar antes de convertir.                         |
| Backend  | [services/api/auth/security.py](services/api/auth/security.py#L22-L23)                                                                                                                | 1    | `int(os.getenv(...))` lanza error si el valor no es numérico.                                                   | Validar y dar mensaje claro al arrancar.            |
| Backend  | [services/api/auth/services.py](services/api/auth/services.py#L127-L128)                                                                                                              | 2    | `except Exception` amplio, aunque sí registra con `logger.exception`.                                           | Capturar excepciones concretas del envío de correo. |
| Backend  | [packages/shared/incidents_analysis/analysis.py](packages/shared/incidents_analysis/analysis.py#L29-L30)                                                                              | 1    | `parse_csv_text` no captura `csv.Error`.                                                                        | Capturar en quien lo llama.                         |
| Backend  | [packages/shared/incident_manager/csv_mapping.py](packages/shared/incident_manager/csv_mapping.py#L40)                                                                                | 3    | `transform_csv_row` devuelve `None` sin motivo; el mensaje final es genérico.                                   | Devolver el motivo del fallo.                       |
| Scripts  | [scripts/analyze.py](scripts/analyze.py#L121)                                                                                                                                         | 1    | `input()` sin manejo de `EOFError` ni de interrupción.                                                          | Capturar `EOFError` y `KeyboardInterrupt`.          |

## Patrones aplicados

### Frontend

- Tres estados explícitos: cargando, éxito y error.
- `try/catch` acotado a cada `fetch` y a cada `response.json()`.
- `finally` para limpiar el estado de carga.
- Mensajes en español, sin códigos ni JSON crudo.
- Toda pantalla de error ofrece "Intentar de nuevo" y "Volver al inicio" o enlace a iniciar sesión.
- Mensaje de sesión expirada compartido (`SESSION_EXPIRED_MESSAGE`).
- `?.` y `??` en datos que pueden faltar.

### Backend

- `try/except` acotado con excepciones concretas.
- `HTTPException` con el código correcto y mensaje corto en español.
- Detalle técnico solo en el log del servidor (`logger.exception`).
- Manejador global que devuelve un 500 genérico.
- Nunca `str(exc)`, tracebacks, rutas ni claves al cliente.

### Scripts

- Errores en stderr.
- `sys.exit(1)` en fallos críticos.
- Validación del archivo (existe, no está vacío, columnas esperadas) antes de procesar.
- Filas inválidas informadas con número de fila y motivo.
- Sin rutas completas en la salida.

## Estado de las correcciones

Estado de la rama `feature/error-handling-audit` frente a `main` (`git diff main...HEAD`, 32 archivos).

### Corregidos

| Archivo                                                                                                     | Severidad | Qué se hizo                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [scripts/analyze.py](scripts/analyze.py)                                                                    | ALTO      | Errores de argumentos y de lectura salen con código 1 y van a stderr.                                                                         |
| [scripts/seed_incidents.py](scripts/seed_incidents.py)                                                      | ALTO      | Sale con código 1 si hay filas inválidas; el detalle va a stderr con el número de fila.                                                       |
| [account/profile/page.tsx](<uis/backoffice/app/(authenticated)/account/profile/page.tsx>)                   | ALTO      | Estados de carga y error con reintento; el formulario solo aparece con datos cargados.                                                        |
| [lib/api.ts](uis/backoffice/lib/api.ts)                                                                     | MEDIO     | `apiFetch` captura fallos de red y lanza un mensaje en español.                                                                               |
| [lib/api.ts](uis/talent-pipeline-tracker/lib/api.ts)                                                        | MEDIO     | Las llamadas `fetch` capturan errores de red y de respuesta no válida con mensajes controlados.                                               |
| [CandidateList.tsx](uis/talent-pipeline-tracker/components/CandidateList.tsx)                               | MEDIO     | Botón de reintento y enlace a inicio al fallar la carga.                                                                                      |
| [CandidateDetail.tsx](uis/talent-pipeline-tracker/components/CandidateDetail.tsx)                           | MEDIO     | Botón de reintento y enlace a inicio al fallar la carga.                                                                                      |
| [CandidateNotes.tsx](uis/talent-pipeline-tracker/components/CandidateNotes.tsx)                             | MEDIO     | Botón de reintento al fallar la carga de notas.                                                                                               |
| [AuthGuard.tsx](uis/talent-pipeline-tracker/components/AuthGuard.tsx)                                       | MEDIO     | Reintento y enlace a login cuando no se puede verificar la sesión.                                                                            |
| [register/page.tsx](uis/backoffice/app/register/page.tsx)                                                   | MEDIO     | Si el login falla tras crear la cuenta, indica que la cuenta existe y enlaza a login.                                                         |
| [forgot-password/page.tsx](uis/backoffice/app/forgot-password/page.tsx)                                     | MEDIO     | Comprueba `response.ok` y muestra error si la petición falla.                                                                                 |
| [incidencias/page.tsx](<uis/backoffice/app/(authenticated)/incidencias/page.tsx>)                           | MEDIO     | Valida la respuesta antes de parsearla; ya no muestra el texto crudo de `SyntaxError`.                                                        |
| [suppliers/api.ts](<uis/backoffice/app/(authenticated)/suppliers/api.ts>)                                   | MEDIO     | Captura fallos de red en el wrapper y devuelve un mensaje en español.                                                                         |
| [suppliers/page.tsx](<uis/backoffice/app/(authenticated)/suppliers/page.tsx>)                               | MEDIO     | Botón de reintento al fallar la carga de proveedores.                                                                                         |
| [gestor-incidencias/nueva/page.tsx](<uis/backoffice/app/(authenticated)/gestor-incidencias/nueva/page.tsx>) | MEDIO     | Muestra el error de `status` junto al campo.                                                                                                  |
| [gestor-incidencias/nueva/page.tsx](<uis/backoffice/app/(authenticated)/gestor-incidencias/nueva/page.tsx>) | MEDIO     | Al fallar el envío conserva los datos y el botón vuelve a estar activo (`finally`), así que sirve como reintento. Probado con la API apagada. |
| [services/api/database.py](services/api/database.py)                                                        | MEDIO     | La apertura de la base registra la ruta y la causa, y la API falla al arrancar con mensaje claro.                                             |
| [services/api/auth/database.py](services/api/auth/database.py)                                              | MEDIO     | Igual que la base principal.                                                                                                                  |
| [services/api/seed.py](services/api/seed.py)                                                                | MEDIO     | Valida cada proveedor por separado; los inválidos se omiten e informan por campo.                                                             |
| [scripts/seed_incidents.py](scripts/seed_incidents.py)                                                      | MEDIO     | Captura `UnicodeDecodeError` y sale con código 1.                                                                                             |
| [lib/api.ts](uis/talent-pipeline-tracker/lib/api.ts)                                                        | BAJO      | `response.json()` se lee con `readJson`, que devuelve un error controlado.                                                                    |
| [lib/api.ts](uis/talent-pipeline-tracker/lib/api.ts)                                                        | BAJO      | Si falta `NEXT_PUBLIC_API_URL`, lanza un error claro en lugar de fallar en silencio.                                                          |
| [CandidateNotes.tsx](uis/talent-pipeline-tracker/components/CandidateNotes.tsx)                             | BAJO      | Mensajes separados para guardado y recarga de la lista.                                                                                       |
| [UserMenu.tsx](uis/backoffice/components/UserMenu.tsx)                                                      | BAJO      | Muestra "Mi cuenta" en lugar de "…" si falla la carga del usuario.                                                                            |
| [gestor-incidencias/page.tsx](<uis/backoffice/app/(authenticated)/gestor-incidencias/page.tsx>)             | BAJO      | Muestra sesión expirada en 401 y un mensaje de carga en los demás casos.                                                                      |
| [suppliers/api.ts](<uis/backoffice/app/(authenticated)/suppliers/api.ts>)                                   | BAJO      | Los errores de validación de la API ya no se muestran en inglés.                                                                              |
| [suppliers/api.ts](<uis/backoffice/app/(authenticated)/suppliers/api.ts>)                                   | BAJO      | `response.json()` tras una respuesta correcta se captura y devuelve un error controlado.                                                      |
| [SupplierRow.tsx](<uis/backoffice/app/(authenticated)/suppliers/SupplierRow.tsx>)                           | BAJO      | Moneda y fecha se validan antes de formatear.                                                                                                 |
| [SupplierForm.tsx](<uis/backoffice/app/(authenticated)/suppliers/SupplierForm.tsx>)                         | BAJO      | Revisado sin cambios: usa `err.message` con respaldo en español, tiene `finally` y el botón se deshabilita mientras guarda.                   |
| [analysis.py](packages/shared/incidents_analysis/analysis.py)                                               | BAJO      | Sin cambios en el paquete; los scripts capturan `csv.Error`.                                                                                  |
| [services/api/main.py](services/api/main.py)                                                                | BAJO      | Registra la excepción no controlada con `logger.exception`.                                                                                   |
| [services/api/routes/auth.py](services/api/routes/auth.py)                                                  | BAJO      | Lee `hashed_password` con `get` y comprueba su presencia.                                                                                     |
| [services/api/routes/incident_manager.py](services/api/routes/incident_manager.py)                          | BAJO      | La conversión de fechas tolera campos ausentes o inválidos.                                                                                   |
| [services/api/routes/incidents.py](services/api/routes/incidents.py)                                        | BAJO      | La lectura del archivo subido está dentro del `try`.                                                                                          |
| [services/api/routes/suppliers.py](services/api/routes/suppliers.py)                                        | BAJO      | Un documento incompleto se registra y devuelve un 500 limpio.                                                                                 |
| [services/api/auth/security.py](services/api/auth/security.py)                                              | BAJO      | Los tiempos de expiración se validan al arrancar con mensaje claro.                                                                           |
| [scripts/analyze.py](scripts/analyze.py)                                                                    | BAJO      | Captura `EOFError` y `KeyboardInterrupt` en la pregunta de exportación.                                                                       |

### Fuera de alcance (decisión consciente)

- **Inserciones no atómicas** en [services/api/auth/services.py](services/api/auth/services.py) (crear y borrar usuario) y en [scripts/seed_incidents.py](scripts/seed_incidents.py): requieren rediseñar cómo se guardan los datos, y la consigna pide no refactorizar.
- **Catch vacíos** (login de ambas apps, `AuthGuard` del talent tracker, `gestor-incidencias` y `getApiError` en `incidencias`): se priorizó mostrar un mensaje al usuario en lugar de agregar `console.error`.
- **Backoffice con la API apagada**: muestra "Algo falló en el servidor" en lugar del mensaje de conexión, porque Next.js hace de proxy y responde 500. El mensaje es correcto para el usuario; cambiarlo implicaría tocar la configuración del proxy.
- **Proveedor dañado** en [services/api/routes/suppliers.py](services/api/routes/suppliers.py): devuelve un 500 limpio en lugar de omitirse, para no ocultar datos en silencio.

### Pendientes

- [services/api/auth/services.py](services/api/auth/services.py#L127-L128): el `except Exception` del envío de correo sigue amplio; falta confirmar qué excepciones lanza el proveedor.
- [csv_mapping.py](packages/shared/incident_manager/csv_mapping.py#L40): `transform_csv_row` sigue devolviendo `None` sin motivo; cambiar la firma afecta a sus llamadores.

### Cómo se probó

- Backoffice con la API apagada: listados, resumen, registrar incidencia y reintento al volver la API.
- Talent Tracker en modo sin conexión del navegador.
- Scripts con archivo inexistente, vacío y sin columnas: código de salida 1.
