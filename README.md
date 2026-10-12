# Portal del conocimiento

Cinco actividades educativas con interfaz móvil en blanco, gris y azul, acceso directo y códigos QR.

| Ruta | Actividad | Reglas |
| --- | --- | --- |
| `/semana/1` | Crucigrama | Nueve palabras conectadas, pistas numeradas, intersecciones válidas, cambio de orientación y escritura con teclado del teléfono o teclado integrado. |
| `/semana/2` | Cuestionario | Diez preguntas, selección modificable antes de confirmar, explicación, puntuación y revisión de respuestas. |
| `/semana/3` | Relacionar | Diez parejas en dos rondas, definiciones desordenadas, selección por toques y parejas identificadas con el mismo número. |
| `/semana/4` | Completar | Ocho espacios dentro del texto, banco sin duplicados, devolución y reemplazo de términos; los aciertos quedan bloqueados al comprobar. |
| `/semana/5` | Sopa | Tablero de 16 × 16, doce palabras, ocho direcciones y selección recta con captura y cancelación de puntero. |

El progreso, las transiciones breves y los sonidos distinguen selección, acierto, error y finalización. Los efectos de sonido se mantienen activos; no hay botón de silencio. Se respeta la preferencia del sistema de reducir movimiento. El resaltado del gesto en la sopa actualiza únicamente las casillas afectadas, sin un renderizado de React por cada movimiento.

## QR y publicación

Las cinco rutas educativas abren directamente el juego con la navegación normal. No se solicita pantalla completa ni se muestran controles flotantes de sonido o salida. Los QR anteriores con `?modo=actividad` continúan abriendo la misma actividad, sin activar un modo especial.

En `/qr`, configura la dirección pública real donde está alojada la aplicación. Se utiliza el dominio guardado o el de la página actual; no se presupone un sitio publicado. Si pegas un enlace de actividad, se extrae su dominio para evitar rutas duplicadas. No se admiten direcciones incompletas ni protocolos diferentes de HTTP/HTTPS.

La generación cancela resultados antiguos al cambiar el dominio. Las descargas PNG, SVG, ZIP e impresión A4 se habilitan cuando los cinco códigos están preparados. El ZIP contiene los cinco PNG, los cinco SVG y un manifiesto con los enlaces.

Para Cloudflare Pages:

- Comando de compilación: `npm run build`.
- Directorio publicado: `dist`.
- `public/_redirects` conserva la apertura y recarga directa de las rutas educativas.

La compilación sincroniza también `index.html` y `assets/` en la raíz para el alojamiento estático existente y elimina únicamente fragmentos generados obsoletos. Subir el repositorio a GitHub no confirma por sí solo el despliegue público.

## Desarrollo y pruebas

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run test:mobile
```

Las pruebas móviles se ejecutan secuencialmente, con un solo navegador de prueba para reducir el consumo de RAM. Utilizan Google Chrome instalado, con eventos táctiles y pantallas 360 × 800, 375 × 812, 390 × 844 y 430 × 932. Para otro entorno, cambia `launchOptions.channel` en `playwright.config.ts` o instala el navegador de Playwright.

Vitest comprueba cruces, generación, puntuación, parejas y banco de palabras; valida 100 sopas completas y diez crucigramas generados. Playwright resuelve los cinco juegos, introduce errores, reinicia, recarga rutas directas, cambia la orientación del crucigrama y cancela un gesto en la sopa. Además decodifica los cinco QR, verifica el ZIP, la hoja de impresión, la ausencia de controles flotantes y pantalla completa, los sonidos y el movimiento reducido.

Las pruebas se ejecutan con emulación móvil en Chrome. El teclado real de iOS/Android, la sensación del gesto y el rendimiento en un Android de gama baja requieren comprobación en dispositivos físicos.
