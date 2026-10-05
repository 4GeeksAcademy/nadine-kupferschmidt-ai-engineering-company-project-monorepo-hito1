# CONTEXT.md — Brasaland

## Hito 1: Sitio Web Público de tu Empresa

_These instructions are [available in English](./CONTEXT-brasaland.en.md)._

> Este documento describe tu empresa y la situación concreta para la que estás construyendo este hito. Léelo completo antes de escribir ningún código. Todo lo que construyas debe reflejar este contexto.

---

## Tu empresa

**Brasaland** es una cadena de restaurantes de comida a la brasa fundada en 2008 en Medellín, Colombia. Lo que comenzó como un único local familiar ha crecido hasta convertirse en una cadena de 14 restaurantes propios operando en Colombia y Estados Unidos (Florida). La empresa emplea aproximadamente 115 personas entre personal de cocina y sala, gestión de operaciones, y el equipo corporativo con sede en Medellín y oficina comercial en Miami. La facturación anual ronda los 6 millones de dólares. La marca se construye sobre tres pilares: calidad consistente del producto en cada local, experiencia cálida y confiable para el cliente, y rapidez en el servicio.

---

## Tu departamento y el problema que debes resolver

Trabajas en **Brasaland Digital**, el equipo interno creado por la CEO Mariana Restrepo para liderar la transformación digital de la empresa, y reportas directamente al CTO Nicolás Park. El sitio web corporativo actual de Brasaland es de 2019, no permite pedidos en línea, y solo muestra el menú. No refleja que la empresa opera en dos países ni presenta adecuadamente la experiencia de marca. Camila Ospina (Gerente de Marketing) necesita un sitio web renovado que presente la marca profesionalmente, muestre las ubicaciones en ambos países, y capture información de personas interesadas en formar parte del programa de fidelización digital.

---

## Tu stakeholder

**Camila Ospina**, Gerente de Marketing

> Hola,
>
> Necesitamos relanzar nuestro sitio web corporativo. Debe presentar Brasaland como lo que somos: una cadena seria de restaurantes a la brasa con presencia en Colombia y Estados Unidos. Quiero una landing page que explique nuestra propuesta de valor, muestre nuestras ubicaciones en ambos países, y presente nuestro nuevo programa de fidelización digital "Brasa Points". También necesito una página con un formulario para que las personas puedan registrarse en el programa de fidelización. Actualmente usamos tarjetas físicas que se pierden y no generan datos. Quiero capturar: nombre, email, teléfono, país, ciudad, ubicación favorita, preferencias alimentarias, y cómo nos conocieron. El sitio debe ser responsive, accesible, y optimizado para SEO. El soporte multiidioma (español e inglés) es opcional pero altamente recomendado; empieza con un idioma base. Usa Tailwind y asegúrate de que las validaciones funcionen perfectamente.

---

## Alcance de idioma

- El soporte multiidioma es **opcional pero altamente recomendado** por la operación de Brasaland en Colombia y Estados Unidos.
- Debes escoger un **idioma base** para toda la experiencia del sitio y del formulario.
- Si implementas un segundo idioma, trátalo como una mejora (sin reducir la calidad/completitud del idioma base).

## Contenido de la landing page

Tu landing page debe incluir las siguientes secciones, en este orden:

### Header

- Logo o nombre "Brasaland"
- Selector de idioma (ES | EN) si implementas un segundo idioma
- Navegación: Inicio | Ubicaciones | Menú | Brasa Points | Contacto

### Hero

- **Titular:** "El sabor de la brasa, en cada bocado"
- **Subtítulo:** "Desde 2008 sirviendo las mejores carnes a la brasa en Colombia y Estados Unidos. 14 ubicaciones, una misma pasión por la calidad y el sabor."
- **Call to action:** Botón "Únete a Brasa Points" que enlace al formulario

### Nuestra Historia (párrafo + imagen)

Fundada en Medellín en 2008, Brasaland comenzó como un sueño familiar: compartir el auténtico sabor de la carne a la brasa con calidad constante y servicio cálido. Hoy somos 14 restaurantes en dos países, pero mantenemos la misma receta de éxito: productos frescos, técnicas tradicionales, y pasión por cada plato que servimos.

### Lo que nos hace únicos (3 columnas)

1. **Calidad Consistente**
   - Mismas recetas y estándares en todos los locales
   - Ingredientes frescos seleccionados diariamente
2. **Experiencia Cálida**
   - Servicio amable y atento
   - Ambiente familiar en cada visita

3. **Rapidez**
   - Tu comida lista en minutos
   - Sin sacrificar sabor ni calidad

### Nuestras Ubicaciones (2 columnas)

- **Colombia**
  - 10 restaurantes en Medellín, Bogotá y Cali
  - Horario: Lun-Dom 11:00 - 22:00

- **Estados Unidos (Florida)**
  - 4 restaurantes en Miami y Orlando
  - Horario: Mon-Sun 11:00 AM - 10:00 PM

### Brasa Points (sección destacada)

#### Gana puntos con cada visita

- Acumula 1 punto por cada $10.000 COP o $5 USD
- Canjea tus puntos por descuentos y platos gratis
- Ofertas exclusivas para miembros
- Registro 100% digital - ¡ya no más tarjetas de papel!

### Contacto

- Email: <hola@brasaland.com>
- Colombia: +57 4 123 4567
- Florida: +1 305 123 4567

### Footer

- © 2025 Brasaland. Todos los derechos reservados.
- Instagram | Facebook

---

## Campos del formulario de registro Brasa Points

Tu formulario debe capturar la siguiente información:

| Campo                                | Tipo     | Validación                                                                          | Obligatorio |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------------- | ----------- |
| **Nombre completo**                  | text     | Mínimo 2 palabras                                                                   | Sí          |
| **Email**                            | email    | Formato válido de email                                                             | Sí          |
| **Teléfono**                         | tel      | Formato: +[código país] [número]                                                    | Sí          |
| **País**                             | select   | Colombia / Estados Unidos                                                           | Sí          |
| **Ciudad**                           | select   | Medellín / Bogotá / Cali / Miami / Orlando (según país)                             | Sí          |
| **Ubicación favorita de Brasaland**  | select   | Lista de 14 restaurantes según país y ciudad                                        | No          |
| **Preferencias alimentarias**        | checkbox | Sin restricciones / Vegetariano / Sin gluten / Otro                                 | No          |
| **¿Cómo nos conociste?**             | select   | Redes sociales / Recomendación / Pasando por el local / Búsqueda en internet / Otro | Sí          |
| **Fecha de nacimiento**              | date     | Mayor de 18 años                                                                    | Sí          |
| **Acepto términos del programa**     | checkbox | Debe estar marcado para enviar                                                      | Sí          |
| **Quiero recibir ofertas por email** | checkbox | Opcional, por defecto no marcado                                                    | No          |

---

## Validaciones específicas

1. **Nombre completo:** Debe contener al menos nombre y apellido
2. **Email:** Debe ser formato válido (contener @ y dominio)
3. **Teléfono:** Debe comenzar con + seguido del código de país (+57 para Colombia, +1 para USA)
4. **Ciudad:** Las opciones de ciudad deben cambiar dinámicamente según el país seleccionado
5. **Ubicación favorita:** Las opciones deben filtrarse según país y ciudad seleccionados
6. **Fecha de nacimiento:** El usuario debe ser mayor de 18 años (validar fecha)
7. **Términos del programa:** El checkbox debe estar marcado para poder enviar

---

## Lógica de campos dependientes

**País → Ciudad:**

- Si selecciona "Colombia": mostrar Medellín, Bogotá, Cali
- Si selecciona "Estados Unidos": mostrar Miami, Orlando

**País + Ciudad → Ubicación favorita:**

- Colombia - Medellín: Brasaland El Poblado, Brasaland Laureles, Brasaland Envigado, Brasaland Sabaneta
- Colombia - Bogotá: Brasaland Usaquén, Brasaland Chapinero, Brasaland Zona Rosa
- Colombia - Cali: Brasaland Granada, Brasaland Ciudad Jardín, Brasaland Unicentro
- USA - Miami: Brasaland Brickell, Brasaland Coral Gables
- USA - Orlando: Brasaland Downtown, Brasaland International Drive

---

## Mensajes de error esperados

Cuando un campo no cumpla la validación, muestra estos mensajes específicos:

- **Nombre completo:** "Ingresa tu nombre completo (nombre y apellido)"
- **Email:** "Ingresa un email válido (ejemplo: <nombre@correo.com>)"
- **Teléfono:** "El teléfono debe incluir código de país (ejemplo: +57 300 123 4567 o +1 305 123 4567)"
- **País:** "Selecciona tu país"
- **Ciudad:** "Selecciona tu ciudad"
- **Cómo nos conociste:** "Cuéntanos cómo conociste Brasaland"
- **Fecha de nacimiento:** "Debes ser mayor de 18 años para registrarte en Brasa Points"
- **Términos del programa:** "Debes aceptar los términos del programa Brasa Points para continuar"

---

## Mensaje de éxito

Cuando el formulario se valide correctamente (simular envío), mostrar:

> **¡Bienvenido a Brasa Points!**
>
> Tu registro ha sido exitoso. Recibirás un email de confirmación en los próximos minutos con los detalles de tu cuenta y cómo empezar a acumular puntos.
>
> ¡Ya puedes disfrutar de tus beneficios en cualquiera de nuestras 14 ubicaciones!

---

## Restricción específica

El programa Brasa Points está diseñado para **clientes mayores de 18 años que quieren acumular puntos con sus visitas**. No es un formulario de reservas ni de pedidos en línea. El sitio debe incluir un mensaje visible que diga: "¿Quieres hacer un pedido? Llama a tu ubicación favorita o visítanos directamente. ¡Pronto tendremos pedidos en línea!"

---

## Schema.org markup requerido

Implementa el siguiente marcado Schema.org en tu landing page:

Si entregas un solo idioma, configura `availableLanguage` únicamente con ese idioma base.

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Brasaland",
  "description": "Cadena de restaurantes de comida a la brasa en Colombia y Estados Unidos",
  "url": "https://brasaland.com",
  "foundingDate": "2008",
  "servesCuisine": "Grilled food, Colombian cuisine",
  "priceRange": "$$",
  "address": [
    {
      "@type": "PostalAddress",
      "addressCountry": "CO",
      "addressLocality": "Medellín",
      "addressRegion": "Antioquia"
    },
    {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressLocality": "Miami",
      "addressRegion": "FL"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+57-4-123-4567",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": [
    "https://instagram.com/brasaland",
    "https://facebook.com/brasaland"
  ]
}
```

---

# CONTEXTO — Brasaland

**Hito 2: Fundamentos de Programación**  
**Empresa:** Brasaland — Cadena de Restaurantes de Comida a la Parrilla  
**Tu Rol:** Desarrollador Junior, Equipo Brasaland Digital  
**Responsable del Proyecto:** Felipe Guerrero, Director de Operaciones

---

## Acerca de Brasaland

Brasaland es una cadena de restaurantes de comida a la parrilla con 14 locaciones propias en Colombia y Estados Unidos (Florida). La empresa se enfoca en calidad de producto consistente, experiencia cálida al cliente, y velocidad de servicio. Eres parte de Brasaland Digital, el equipo interno que lidera la transformación digital de la empresa.

---

## Tu Asignación

Felipe Guerrero, el Director de Operaciones, necesita que construyas la lógica central de procesamiento de datos para el sistema de operaciones de restaurantes de Brasaland. Actualmente, los gerentes de locación manejan todo manualmente — rastreando ventas, calculando márgenes, gestionando desperdicios, y ordenando ingredientes. Este hito se enfoca en construir las funciones TypeScript que alimentarán la analítica de ventas, control de desperdicios, y scoring de performance de locaciones.

Esto es programación pura — sin IA, sin prompting. Felipe necesita código que funcione de manera confiable en 14 locaciones en dos países con diferentes monedas y regulaciones.

---

## Lo que Estás Construyendo

Implementarás un conjunto de utilidades TypeScript para:

1. **Modelar ítems de menú, ventas y locaciones** usando interfaces
2. **Filtrar y buscar datos de ventas** por locación, fecha y producto
3. **Calcular puntajes de performance de locaciones** basados en múltiples métricas
4. **Computar métricas financieras** (ingreso, costo, margen) en múltiples monedas
5. **Generar reportes de operaciones** con datos agregados
6. **Validar datos** antes de procesarlos

---

## Entidades de Negocio

### Ítem de Menú (MenuItem)

Representa un ítem en el menú de Brasaland.

**Interfaz: `MenuItem`**

```typescript
interface MenuItem {
  id: string; // ID del ítem (ej: "ITEM-PICANHA-250")
  name: string; // Nombre del ítem (ej: "Picanha 250g")
  category: MenuCategory; // Categoría de comida
  basePrice: Price; // Precio base (puede variar por locación)
  ingredientCost: Price; // Costo de ingredientes por unidad
  prepTimeMinutes: number; // Tiempo promedio de preparación
  isAvailableInColombia: boolean;
  isAvailableInUSA: boolean;
  allergens: string[]; // Lista de alérgenos
  status: MenuItemStatus;
}

interface Price {
  USD: number; // Precio en Dólares Estadounidenses
  COP: number; // Precio en Pesos Colombianos
}

type MenuCategory = "Meat" | "Side" | "Beverage" | "Dessert" | "Combo";
type MenuItemStatus = "Active" | "Seasonal" | "Discontinued";
```

**Reglas de Validación:**

- Ambos precios `USD` y `COP` deben ser > 0
- `prepTimeMinutes` debe ser > 0 y <= 60
- `name` no debe estar vacío
- El ítem debe estar disponible en al menos un país

---

### Transacción de Venta (SaleTransaction)

Representa una venta realizada en una locación de Brasaland.

**Interfaz: `SaleTransaction`**

```typescript
interface SaleTransaction {
  id: string; // ID de transacción (ej: "TXN-2024-15482")
  locationId: string; // Locación donde ocurrió la venta
  itemId: string; // Ítem de menú vendido
  quantity: number; // Número de unidades vendidas
  totalPrice: Price; // Precio total cobrado
  paymentMethod: PaymentMethod; // Cómo pagó el cliente
  timestamp: Date; // Cuándo ocurrió la venta
  waiterName: string; // Miembro del personal que atendió
}

type PaymentMethod = "Cash" | "Credit card" | "Debit card" | "Digital wallet";
```

**Reglas de Validación:**

- `quantity` debe ser > 0
- Ambos valores de precio deben ser > 0
- `waiterName` no debe estar vacío

---

### Locación (Location)

Representa una locación de restaurante Brasaland.

**Interfaz: `Location`**

```typescript
interface Location {
  id: string; // ID de locación (ej: "LOC-MEDELLIN-01")
  name: string; // Nombre de la locación
  city: string; // Nombre de la ciudad
  country: Country; // Colombia o USA
  openingYear: number; // Año de apertura
  seatingCapacity: number; // Número máximo de clientes
  staffCount: number; // Número de empleados
  monthlyRentCost: Price; // Renta mensual
  averageMonthlyUtilities: Price; // Servicios mensuales promedio
  manager: string; // Nombre del gerente de locación
  status: LocationStatus;
}

type Country = "Colombia" | "USA";
type LocationStatus = "Active" | "Temporarily closed" | "Under renovation";
```

**Reglas de Validación:**

- `openingYear` debe ser >= 2008 y <= año actual
- `seatingCapacity` debe ser > 0
- `staffCount` debe ser > 0
- Ambos costos de renta y servicios deben ser > 0

---

### Registro de Desperdicio (WasteRecord)

Rastrea desperdicio de comida en una locación.

**Interfaz: `WasteRecord`**

```typescript
interface WasteRecord {
  id: string; // ID de registro de desperdicio
  locationId: string; // Locación donde ocurrió el desperdicio
  itemId: string; // Ítem de menú desperdiciado
  quantity: number; // Número de unidades desperdiciadas
  reason: WasteReason; // Por qué se desperdició
  cost: Price; // Costo de ítems desperdiciados
  timestamp: Date; // Cuándo se registró
  reportedBy: string; // Miembro del personal que lo reportó
}

type WasteReason =
  | "Expired"
  | "Cooking error"
  | "Customer return"
  | "Damage"
  | "Other";
```

---

## Funciones Requeridas

Implementa estas funciones en los archivos apropiados según la estructura del README.

### 1. Operaciones de Colecciones (`src/utils/collections.ts`)

**`filterSalesByLocation(sales: SaleTransaction[], locationId: string): SaleTransaction[]`**

- Retorna todas las ventas de la locación especificada

**`filterSalesByDateRange(sales: SaleTransaction[], startDate: Date, endDate: Date): SaleTransaction[]`**

- Retorna ventas que ocurrieron entre las fechas de inicio y fin (inclusive)

**`filterMenuItemsByCategory(items: MenuItem[], category: MenuCategory): MenuItem[]`**

- Retorna ítems de menú en la categoría especificada

**`filterActiveLocations(locations: Location[]): Location[]`**

- Retorna locaciones con estado "Active"

**`sortLocationsByCapacity(locations: Location[], order: "asc" | "desc"): Location[]`**

- Retorna locaciones ordenadas por capacidad de asientos
- No debe mutar el array original

**`sortMenuItemsByPrice(items: MenuItem[], currency: "USD" | "COP", order: "asc" | "desc"): MenuItem[]`**

- Retorna ítems de menú ordenados por precio en la moneda especificada
- No debe mutar el array original

---

### 2. Operaciones de Búsqueda (`src/utils/search.ts`)

**`findLocationById(locations: Location[], id: string): Location | null`**

- Realiza búsqueda lineal para encontrar una locación por ID
- Retorna la locación si se encuentra, null en caso contrario

**`findMenuItemByName(items: MenuItem[], name: string): MenuItem | null`**

- Realiza búsqueda lineal para encontrar un ítem de menú por nombre
- La comparación de nombre debe ser case-insensitive
- Retorna el ítem si se encuentra, null en caso contrario

**`binarySearchLocationByCapacity(sortedLocations: Location[], targetCapacity: number): number`**

- Asume que el array ya está ordenado por capacidad de asientos (ascendente)
- Realiza búsqueda binaria para encontrar el índice de una locación con la capacidad objetivo
- Retorna el índice si se encuentra, -1 en caso contrario

---

### 3. Cálculos Financieros (`src/utils/transformations.ts`)

**`calculateDailyRevenue(sales: SaleTransaction[], date: Date, currency: "USD" | "COP"): number`**

- Calcula el ingreso total para una fecha específica en la moneda especificada
- Retorna total redondeado a 2 decimales

**`calculateLocationMargin(sales: SaleTransaction[], menuItems: MenuItem[], locationId: string, currency: "USD" | "COP"): number`**

- Calcula margen de ganancia para una locación
- Fórmula: ((Ingreso Total - Costo Total de Ingredientes) / Ingreso Total) \* 100
- Usa ventas de esa locación solamente
- Une ventas con ítems de menú para obtener costos de ingredientes
- Retorna margen como porcentaje (0-100), redondeado a 2 decimales

**`calculateWasteCost(wasteRecords: WasteRecord[], locationId: string, currency: "USD" | "COP"): number`**

- Calcula costo total de desperdicio para una locación en la moneda especificada
- Retorna total redondeado a 2 decimales

**`convertCurrency(amount: number, fromCurrency: "USD" | "COP", toCurrency: "USD" | "COP"): number`**

- Convierte entre USD y COP usando una tasa de cambio fija
- Usar tasa: 1 USD = 4000 COP
- Retorna cantidad convertida redondeada a 2 decimales
- Si origen y destino son iguales, retornar la cantidad original

---

### 4. Scoring de Performance de Locación (`src/utils/transformations.ts`)

**`scoreLocationPerformance(location: Location, sales: SaleTransaction[], wasteRecords: WasteRecord[], menuItems: MenuItem[]): number`**

Calcula un puntaje de performance (0-100) para una locación basado en:

- **Performance de ingresos (40 puntos máx):**
  - Calcular promedio diario de ingresos (ingresos totales / número de días operativos)
  - Días operativos = días desde apertura (estimar desde openingYear)
  - Puntaje: (ingreso diario promedio en USD / 1000) \* 40, con tope en 40

- **Eficiencia (30 puntos máx):**
  - Calcular eficiencia de asientos: (conteo total de ventas / seatingCapacity) \* 30, con tope en 30
  - Representa qué tan bien la locación usa su capacidad

- **Control de desperdicio (20 puntos máx):**
  - Calcular porcentaje de desperdicio: (costo total de desperdicio / ingreso total) \* 100
  - Puntaje: 20 - (porcentaje de desperdicio \* 2), mínimo 0
  - Menor desperdicio = mayor puntaje

- **Margen de ganancia (10 puntos máx):**
  - Usar función calculateLocationMargin
  - Puntaje: margen / 10, con tope en 10

Retorna puntaje total redondeado a 2 decimales

**`rankLocationsByPerformance(locations: Location[], sales: SaleTransaction[], wasteRecords: WasteRecord[], menuItems: MenuItem[]): Array<{location: Location, score: number}>`**

- Puntúa todas las locaciones
- Las retorna ordenadas por puntaje (más alto primero)
- Cada elemento contiene la locación y su puntaje

---

### 5. Agregaciones y Reportes (`src/utils/transformations.ts`)

**`countSalesByPaymentMethod(sales: SaleTransaction[]): Record<PaymentMethod, number>`**

- Retorna conteo de ventas para cada método de pago

**`calculateAverageTicket(sales: SaleTransaction[], currency: "USD" | "COP"): number`**

- Retorna valor promedio de venta en la moneda especificada
- Redondear a 2 decimales

**`findTopSellingItems(sales: SaleTransaction[], menuItems: MenuItem[], topN: number): Array<{item: MenuItem, totalSold: number}>`**

- Encuentra los N ítems de menú más vendidos
- Une ventas con ítems de menú
- Los retorna ordenados por cantidad vendida (más alto primero)
- Cada elemento contiene el ítem de menú y cantidad total vendida

**`groupWasteByReason(wasteRecords: WasteRecord[]): Record<WasteReason, WasteRecord[]>`**

- Agrupa registros de desperdicio por razón
- Retorna un objeto donde las claves son razones de desperdicio y los valores son arrays de registros

**`calculateCountryComparison(sales: SaleTransaction[], locations: Location[], menuItems: MenuItem[]): {Colombia: CountryMetrics, USA: CountryMetrics}`**

Retorna métricas comparativas para cada país:

```typescript
interface CountryMetrics {
  totalLocations: number;
  totalRevenue: Price;
  averageRevenuePerLocation: Price;
  totalSales: number;
}
```

---

### 6. Validaciones (`src/utils/validations.ts`)

**`validateMenuItem(item: MenuItem): { valid: boolean, errors: string[] }`**

- Valida todas las reglas de negocio para un ítem de menú
- Retorna un objeto con:
  - `valid`: true si todas las validaciones pasan, false en caso contrario
  - `errors`: array de mensajes de error (vacío si es válido)

**`validateSaleTransaction(sale: SaleTransaction): { valid: boolean, errors: string[] }`**

- Valida todas las reglas de negocio para una venta
- Retorna un objeto con:
  - `valid`: true si todas las validaciones pasan, false en caso contrario
  - `errors`: array de mensajes de error (vacío si es válido)

**`validateLocation(location: Location): { valid: boolean, errors: string[] }`**

- Valida todas las reglas de negocio para una locación
- Retorna un objeto con:
  - `valid`: true si todas las validaciones pasan, false en caso contrario
  - `errors`: array de mensajes de error (vacío si es válido)

---

## Datos de Ejemplo

Usa estos datos para probar tus funciones:

### Ítems de Menú de Ejemplo

```typescript
const sampleMenuItems: MenuItem[] = [
  {
    id: "ITEM-PICANHA-250",
    name: "Picanha 250g",
    category: "Meat",
    basePrice: { USD: 18.5, COP: 74000 },
    ingredientCost: { USD: 7.2, COP: 28800 },
    prepTimeMinutes: 15,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-FRIES",
    name: "Papas Fritas",
    category: "Side",
    basePrice: { USD: 4.5, COP: 18000 },
    ingredientCost: { USD: 1.2, COP: 4800 },
    prepTimeMinutes: 8,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-COKE",
    name: "Coca-Cola",
    category: "Beverage",
    basePrice: { USD: 2.5, COP: 10000 },
    ingredientCost: { USD: 0.8, COP: 3200 },
    prepTimeMinutes: 2,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
];
```

### Locaciones de Ejemplo

```typescript
const sampleLocations: Location[] = [
  {
    id: "LOC-MEDELLIN-01",
    name: "Brasaland Medellín Centro",
    city: "Medellín",
    country: "Colombia",
    openingYear: 2008,
    seatingCapacity: 80,
    staffCount: 12,
    monthlyRentCost: { USD: 1500, COP: 6000000 },
    averageMonthlyUtilities: { USD: 400, COP: 1600000 },
    manager: "Carlos Jiménez",
    status: "Active",
  },
  {
    id: "LOC-MIAMI-01",
    name: "Brasaland Miami Beach",
    city: "Miami",
    country: "USA",
    openingYear: 2018,
    seatingCapacity: 100,
    staffCount: 15,
    monthlyRentCost: { USD: 5500, COP: 22000000 },
    averageMonthlyUtilities: { USD: 800, COP: 3200000 },
    manager: "Jake Morrison",
    status: "Active",
  },
];
```

### Ventas de Ejemplo

```typescript
const sampleSales: SaleTransaction[] = [
  {
    id: "TXN-2024-15482",
    locationId: "LOC-MEDELLIN-01",
    itemId: "ITEM-PICANHA-250",
    quantity: 2,
    totalPrice: { USD: 37.0, COP: 148000 },
    paymentMethod: "Credit card",
    timestamp: new Date("2024-03-15T19:30:00"),
    waiterName: "María González",
  },
  {
    id: "TXN-2024-15483",
    locationId: "LOC-MIAMI-01",
    itemId: "ITEM-FRIES",
    quantity: 3,
    totalPrice: { USD: 13.5, COP: 54000 },
    paymentMethod: "Cash",
    timestamp: new Date("2024-03-15T20:15:00"),
    waiterName: "John Smith",
  },
];
```

---

## Criterios de Aceptación

Tu implementación será evaluada en:

1. **Type Safety:** Todas las interfaces definidas correctamente con tipos apropiados
2. **Corrección de Funciones:** Cada función produce el output esperado para los inputs dados
3. **Manejo de Casos Límite:** Las funciones manejan arrays vacíos, valores nulos y datos inválidos correctamente
4. **Lógica de Validación:** Las reglas de negocio se aplican con precisión
5. **Organización del Código:** Las funciones están en los archivos correctos según responsabilidad
6. **Convenciones de Nombres:** Variables, funciones y tipos siguen las convenciones de TypeScript
7. **Sin Mutaciones:** Las funciones de ordenamiento y filtrado no modifican los arrays originales
8. **Funciones Puras:** Las funciones solo trabajan con parámetros, sin variables globales
9. **Manejo de Monedas:** Todos los cálculos financieros funcionan correctamente tanto en USD como en COP

---

## Lo que Felipe Espera

> "Mira, tenemos 14 locaciones funcionando todos los días. Tu código necesita manejar pesos colombianos y dólares estadounidenses correctamente, trabajar con diferentes zonas horarias, y darme números precisos en los que pueda confiar. Sin atajos. Si el cálculo de margen está mal, estoy tomando malas decisiones. Constrúyelo bien."  
> — Felipe Guerrero, Director de Operaciones

---

## ¿Preguntas?

Si no estás seguro sobre algún requisito, consulta a tu mentor/a. En un entorno de trabajo real, le escribirías a Felipe por Slack.

---

_Este es un proyecto real de Brasaland. Lo que construyas aquí se convertirá en parte del sistema de operaciones en producción usado en 14 locaciones en Colombia y Florida._
