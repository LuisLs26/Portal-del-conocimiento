# Evaluación de los Aprendizajes — Portal de Actividades Interactivas

Plataforma educativa moderna, interactiva y complementaria para el libro **“Evaluación de los aprendizajes”**.
Diseñada con el lenguaje visual de **Apple iOS (Liquid Glass)** y optimizada para dispositivos móviles (Android / iPhone) y computadoras de escritorio.

---

## 📖 Estructura de Actividades Semanales

| Semana | Actividad | Contenido Educativo | Ruta Directa |
|---|---|---|---|
| **1** | **Crucigrama** | Fundamentos, tipos y agentes de la evaluación formativa (9 palabras con intersecciones reales). | `/semana/1` |
| **2** | **Cuestionario** | Enfoque por competencias: capacidades, estándares, desempeños y retroalimentación (10 preguntas de aplicación). | `/semana/2` |
| **3** | **Relaciona Conceptos** | Propósitos, criterios e instrumentos de evaluación (10 parejas en 2 rondas dinámicas). | `/semana/3` |
| **4** | **Completa el Aprendizaje** | Repaso integrador de competencias con fichas interactivas arrastrables y texto con 8 espacios. | `/semana/4` |
| **5** | **Sopa de Letras** | Situaciones significativas, criterios y evidencias (cuadrícula dinámica 16×16 con 12 términos y selección táctil fluida). | `/semana/5` |

---

## 📱 Sistema de Códigos QR para el Libro Impreso

El portal cuenta con un **Centro de Gestión de Códigos QR** accesible en:
👉 `/qr`

### Funcionalidades:
- **Dominio configurable:** Permite ingresar la URL pública final de Cloudflare Pages (ej. `https://mi-portal.pages.dev`) para regenerar al instante todos los códigos QR y enlaces sin modificar el código fuente.
- **Códigos QR de alta resolución:**
  - Descarga individual en **PNG de 1000 × 1000 px** (óptimo contraste en blanco y negro para imprenta).
  - Descarga individual en formato vectorial **SVG**.
  - Descarga masiva de los 5 códigos en un único archivo comprimido **ZIP**.
- **Hoja A4 para imprimir:** Formato listo para impresión física con marcas de corte y títulos independientes.

---

## 🎨 Identidad Visual y Tecnologías

- **Paleta de color editorial:**
  - Verde oscuro: `#123D32`
  - Verde esmeralda: `#285C4A`
  - Dorado elegante: `#C5A15A`
  - Crema: `#F8F4E9`
  - Borgoña: `#782F43`
  - Blanco cálido: `#FFFCF7`
  - Gris oscuro: `#28332E`
- **Tipografías:** *Playfair Display* (títulos académicos) y *Plus Jakarta Sans* / *SF Pro* (interfaz y actividades).
- **Efectos:** *Liquid Glass* translúcido con desenfoque de fondo (`backdrop-filter: blur`), bordes con brillo especular, esquinas continuas tipo squircle y curvas de aceleración física de resortes (*Spring Physics*).
- **Audio procedimental táctil:** Sonidos sintetizados mediante Web Audio API (cero latencia, sin archivos de audio pesados y con botón de silencio).

---

## 🚀 Despliegue en Cloudflare Pages

La aplicación está preparada para ser alojada como una Single Page Application (SPA) estática sin necesidad de un servidor Node.js en producción.

### Parámetros de compilación en Cloudflare Pages:
- **Framework preset:** `Vite`
- **Build command (Comando de compilación):** `npm run build`
- **Build output directory (Directorio de salida):** `dist`

> El proyecto incluye el archivo `public/_redirects` (copiado a `dist/_redirects`) con la regla:
> `/*    /index.html   200`
> Esto asegura que el escaneo directo de cualquier código QR (`/semana/1`, `/semana/2`, `/qr`, etc.) cargue de forma inmediata sin errores 404.

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```
