# Propuesta de arquitectura del backend de Brasaland

## 1. Contexto de la empresa y objetivos

Brasaland opera 14 restaurantes propios: 10 en Colombia, entre Medellín, Bogotá y Cali, y 4 en Florida, entre Miami y Orlando. La empresa trabaja en dos países, con COP y USD y con atención en español e inglés. Tiene unas 115 personas.

Actualmente no cuenta con una API interna ni con datos consolidados. Cada país utiliza un punto de venta distinto y muchos procesos dependen de hojas de cálculo. La API central debe ofrecer una base común para gestionar locales, menú, ventas, clientes y el programa Brasa Points, y proveedores. También conviene incluir los registros de desperdicio que ya aparecen en los tipos del Hito 2.

El objetivo es que las aplicaciones y equipos de Brasaland consulten y actualicen información mediante una API común, con reglas consistentes para todos los locales. El frontend de RRHH es un sistema aparte y no forma parte del alcance inicial de esta API.

Los tipos de Hito 2 —MenuItem, SaleTransaction, Location y WasteRecord— sirven como punto de partida para identificar estos dominios; están definidos en `src/types/models.ts`.

## 2. Patrón de arquitectura elegido

Se propone una **arquitectura en capas con límites inspirados en hexagonal**. Las rutas HTTP reciben y responden solicitudes; los casos de uso coordinan acciones del negocio; el dominio contiene conceptos y reglas; y la infraestructura implementa los detalles para guardar y consultar información. El dominio no depende de FastAPI ni de la infraestructura.

Este enfoque encaja con Brasaland porque la API reunirá información de 14 locales, dos países y sistemas de punto de venta distintos. Las reglas de ventas, disponibilidad de menú, clientes y proveedores deben ser comunes aunque cambie la forma de comunicarse o almacenar los datos. Separar esas responsabilidades permite empezar con un backend central manejable para un equipo pequeño y modificar una integración sin trasladar sus detalles a todas las rutas.

**Por qué no MVC como patrón principal:** MVC organiza una aplicación alrededor de modelos, vistas y controladores. En este caso, el frontend es independiente y la necesidad central no es construir vistas, sino consolidar datos y mantener reglas de negocio comunes entre países, monedas y locales. Las capas expresan mejor esa separación para una API.

**Por qué no serverless como primera opción:** el problema descrito es construir una API interna central que sirva a varios dominios y que más adelante pueda integrar puntos de venta. No se ha identificado una necesidad de cargas puntuales o variables que justifique dividir desde el inicio la lógica en funciones separadas. Un backend modular en capas es una base más sencilla para el equipo actual.

## 3. Estructura de carpetas y módulos

El backend viviría en `backend/`, separado de las interfaces de usuario. El paquete Python se llamaría `brasaland_api`. La estructura propuesta es:

```text
backend/
  brasaland_api/
    __init__.py
    main.py
    core/
      config.py
    api/
      v1/
        router.py
        routes/
          locations.py
          menu_items.py
          sales.py
          waste_records.py
          customers.py
          loyalty.py
          suppliers.py
    schemas/
    domain/
    use_cases/
    repositories/
    infrastructure/
  .env.example
```

- `main.py` crea la aplicación FastAPI y registra el router principal.
- `core/` contiene configuración transversal; `config.py` concentra los valores que cambian entre entornos.
- `api/v1/router.py` reúne los routers de dominio. `api/v1/routes/` contiene un archivo por dominio y se ocupa de HTTP, no de implementar reglas complejas.
- `schemas/` contiene modelos Pydantic para validar solicitudes y definir respuestas de la API.
- `domain/` contiene los conceptos y reglas del negocio, como las condiciones de disponibilidad de un producto o el cálculo de puntos.
- `use_cases/` contiene las acciones de aplicación, por ejemplo registrar una venta, crear un cliente o canjear puntos.
- `repositories/` define las operaciones que los casos de uso necesitan para consultar o guardar información, sin acoplarlos a una implementación concreta.
- `infrastructure/` contiene las implementaciones concretas de acceso a datos e integración con sistemas externos.

El criterio es separar por responsabilidad y mantener el flujo desde HTTP hacia los casos de uso y el dominio. Así, las rutas pueden cambiar sin mover las reglas del negocio, y la infraestructura puede cambiar sin obligar a reescribir esas reglas. Los nombres de módulos y paquetes seguirán la convención Python de minúsculas y guion bajo (PEP 8).

## 4. Routers y endpoints por dominio

Todos los endpoints se agruparían bajo `/api/v1`. Cada archivo de `routes/` define un `APIRouter` de su dominio, y el router de versión los incluye.

**Locales — `locations.py`**

- `GET /api/v1/locations`: listar y filtrar por país, ciudad o estado.
- `GET /api/v1/locations/{location_id}`: consultar un local.
- `POST /api/v1/locations`: registrar un local.
- `PATCH /api/v1/locations/{location_id}`: actualizar datos de un local.

**Menú — `menu_items.py`**

- `GET /api/v1/menu-items`: listar y filtrar por país, categoría o disponibilidad.
- `GET /api/v1/menu-items/{item_id}`: consultar un producto.
- `POST /api/v1/menu-items`: crear un producto del menú.
- `PATCH /api/v1/menu-items/{item_id}`: actualizar un producto, incluida su disponibilidad.

**Ventas — `sales.py`**

- `GET /api/v1/sales`: consultar ventas por local, país y periodo.
- `GET /api/v1/sales/{sale_id}`: consultar una venta.
- `POST /api/v1/sales`: registrar una venta recibida desde un sistema autorizado.
- `GET /api/v1/sales/summary`: obtener métricas agregadas para un periodo y ámbito seleccionados.

**Desperdicio — `waste_records.py`**

- `GET /api/v1/waste-records`: consultar registros por local, fecha o motivo.
- `POST /api/v1/waste-records`: registrar un desperdicio.

**Clientes — `customers.py`**

- `POST /api/v1/customers`: registrar un cliente.
- `GET /api/v1/customers/{customer_id}`: consultar un cliente.
- `PATCH /api/v1/customers/{customer_id}`: actualizar sus datos o preferencias.

**Fidelización — `loyalty.py`**

- `GET /api/v1/customers/{customer_id}/loyalty`: consultar el saldo de Brasa Points.
- `GET /api/v1/customers/{customer_id}/loyalty/transactions`: consultar movimientos de puntos.
- `POST /api/v1/customers/{customer_id}/loyalty/transactions`: registrar una acumulación o un canje.

**Proveedores — `suppliers.py`**

- `GET /api/v1/suppliers`: listar proveedores.
- `GET /api/v1/suppliers/{supplier_id}`: consultar un proveedor.
- `POST /api/v1/suppliers`: registrar un proveedor.
- `PATCH /api/v1/suppliers/{supplier_id}`: actualizar sus datos.
- `GET /api/v1/suppliers/{supplier_id}/price-history`: consultar su historial de precios.

Las rutas concretas podrán ajustarse al cerrar requisitos y permisos. La separación por dominio debe mantenerse para que la API no termine en un único router difícil de entender.

## 5. Convenciones de FastAPI y fuentes

- **Routers separados y composición central:** la guía oficial de FastAPI [Bigger Applications - Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/) muestra cómo dividir una aplicación en módulos, definir `APIRouter` e incluir routers desde la aplicación principal. Se adopta ese enfoque y se agrupan las rutas por dominio.
- **Modelos Pydantic:** se usarán para validar los datos recibidos y describir las respuestas, siguiendo lo visto en el curso y la documentación oficial de FastAPI [Request Body](https://fastapi.tiangolo.com/tutorial/body/).
- **Configuración centralizada:** las opciones que varían por entorno se concentrarán en `core/config.py`, en vez de quedar duplicadas en routers. Es una decisión de organización de este proyecto; FastAPI no la impone.
- **Versionado de rutas:** `/api/v1` permite identificar el contrato inicial y preparar cambios futuros con una versión nueva cuando sean incompatibles.

## 6. Frontend y backend como sistemas separados

El frontend Next.js y el backend FastAPI serán aplicaciones separadas. Se comunicarán por HTTP usando los endpoints de la API; el frontend no accederá directamente al almacenamiento del backend. La URL base de la API se configurará por entorno en el frontend. No se pondrán secretos en variables que puedan llegar al navegador.

El backend configurará CORS para permitir los orígenes explícitos del frontend en cada entorno. Desarrollo permitirá el origen local correspondiente; producción permitirá los dominios publicados. No se dejará CORS abierto a cualquier origen en producción.

El archivo `.env` puede guardar valores locales de desarrollo, pero no se subirá al repositorio y debe estar incluido en `.gitignore`. Conviene mantener `.env.example` versionado con los nombres de las variables y valores ilustrativos no sensibles, para que el equipo sepa qué configuración necesita.

FastAPI no carga `.env` automáticamente. El proceso que ejecuta la aplicación debe exponer esos valores como variables de entorno. Esta propuesta no añade una librería para cargar archivos `.env`; si el equipo decide usar una, deberá ser una decisión explícita y compatible con las herramientas del curso.

Se recomienda un **monorepo** con el backend en `backend/` y los frontends en `uis/`. El repositorio ya organiza interfaces de usuario en `uis/`, y mantener los proyectos juntos facilita coordinar cambios del contrato en un equipo pequeño. Las aplicaciones siguen siendo independientes: cada una conserva sus responsabilidades y puede ejecutarse y publicarse por separado.

El frontend de RRHH revisado es Next.js y delega la creación de candidaturas en `createCandidate` desde `uis/talent-pipeline-tracker/app/candidates/new/page.tsx`. Como está conectado a una API REST externa y se mantiene en otra rama, no se asume que ya consuma la futura API de Brasaland. RRHH queda fuera del alcance inicial de esta propuesta.

## 7. Riesgos y puntos de atención

- **Reglas duplicadas en los routers:** ventas, disponibilidad o puntos podrían comportarse de manera distinta según el endpoint. Para prevenirlo, mantener las reglas en `domain/` y `use_cases/`, dejando a los routers la validación HTTP y la delegación.
- **Acoplamiento entre modelos de API y negocio:** cambios en el contrato HTTP podrían forzar cambios innecesarios en las reglas internas. Para prevenirlo, separar los schemas Pydantic de los modelos y conceptos del dominio.
- **Métricas monetarias inconsistentes:** los tipos de Hito 2 expresan precio y costo con valores USD y COP. No se deben sumar directamente importes de monedas distintas ni presentar ambos valores como si fueran dos importes de una misma transacción. Cada venta debe conservar la moneda en que ocurrió; cualquier conversión para reportes debe seguir una regla explícita y documentada.
- **Integraciones de puntos de venta con formatos distintos:** cada país usa un sistema distinto, por lo que una integración podría filtrar sus diferencias al dominio. Para reducir el impacto, concentrar la adaptación en `infrastructure/` y convertir los datos al modelo común antes de ejecutar los casos de uso.
- **CORS o secretos mal configurados:** una política demasiado abierta o credenciales expuestas en el frontend crean riesgos evitables. Mantener orígenes permitidos específicos por entorno y no guardar secretos en `.env.example` ni en variables públicas del frontend.

## 8. Decisiones técnicas iniciales y próximos pasos

- Usar FastAPI con routers separados por dominio, modelos Pydantic y versión inicial `/api/v1`.
- Usar arquitectura en capas con límites inspirados en hexagonal; mantener `use_cases/` como capa de aplicación.
- Usar **uv** para gestionar el entorno y las dependencias, porque es la herramienta vista en el curso para proyectos en equipo. `pyproject.toml` declarará el proyecto y sus dependencias; `uv.lock` fijará las versiones resueltas para que el equipo instale el mismo conjunto y se reduzca el problema de «en mi máquina funciona». Ambos archivos deben versionarse en el repositorio. El entorno virtual generado por uv se mantiene local y no se versiona.
- Definir en la configuración los valores que cambian entre desarrollo y producción, y mantener `.env` fuera del repositorio con `.env.example` como referencia sin secretos.
- Confirmar los campos definitivos de ventas, clientes, fidelización y proveedores, en especial el tratamiento de la moneda de cada transacción y las reglas de acumulación y canje de puntos.
- Acordar los filtros y permisos de cada dominio antes de publicar endpoints para el frontend.
- Diseñar cómo los sistemas de punto de venta de Colombia y Florida entregarán sus ventas a la API, manteniendo sus diferencias fuera del dominio central.
- Implementar primero una ruta representativa por dominio y validar la estructura antes de ampliar el contrato.
