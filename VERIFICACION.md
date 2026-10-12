# Reparación y verificación — 11 de octubre de 2026

| Antes | Después | Motivo |
| --- | --- | --- |
| Crucigrama: casillas inicializadas después del primer renderizado, tamaño fijo y ausencia de entrada para el teclado nativo. | Mapa disponible desde el primer renderizado, nueve palabras conectadas y validadas, generación con restricciones, orientación intercambiable, teclado nativo y casillas ampliadas de la palabra activa. | Permitir resolver una cuadrícula auténtica desde el teléfono, con letras compartidas. |
| Cuestionario: el primer toque confirmaba inmediatamente; progreso adelantado y distribución sesgada de alternativas. | Selección modificable, confirmación explícita, pregunta bloqueada, respuesta correcta y explicación, progreso por respuestas confirmadas, puntuación y revisión. | Evitar confirmaciones accidentales y mantener una puntuación exacta. |
| Relaciones: reinicio incompleto en la primera ronda, temporizadores sin limpieza y correspondencias poco identificables. | Dos columnas, definiciones desordenadas, parejas bloqueadas con el mismo número, diez parejas acumuladas y transición con limpieza del temporizador. | Hacer claras las correspondencias y permitir reiniciar en cualquier ronda. |
| Completar: comprobación de espacios incompletos y posibilidad de modificar respuestas correctas. | Ocho términos integrados en el texto, devolución y reemplazo sin duplicados, comprobación solo al completar y bloqueo de aciertos. | Corregir únicamente los errores conservando el trabajo correcto. |
| Sopa: cuadrícula fija demasiado ancha, pérdida del gesto, cancelación evaluada como respuesta y generación recursiva sin límite. | Tablero proporcional de 16 × 16, doce palabras verificadas, captura y cancelación, ocho direcciones, rutas encontradas conservadas, generación limitada y alternativa segura. | Reconocer gestos reales sin desplazar la página ni aceptar selecciones curvas. |
| Reinicio: un toque podía no activar el botón después de una selección táctil en la sopa. | El reinicio también responde directamente a la liberación de un toque válido, sin duplicar el clic posterior. | Reiniciar de forma fiable en teléfonos. |
| QR: dominios inválidos, dominio público supuesto, resultados antiguos durante cambios y descargas antes de terminar. | Dominio validado y normalizado; generación conjunta con cancelación de resultados antiguos; descargas e impresión habilitadas cuando los cinco códigos están listos. | Mantener el mismo enlace en el código, el PNG, el SVG y el manifiesto del ZIP. |
| Interfaz pequeña y muchos elementos simultáneos. | Títulos de 26 px, texto principal mayor, tarjetas con más espacio, casillas ampliadas de escritura y pistas/teclado adicional desplegables. | Mejorar la lectura conservando el formato exclusivo para teléfonos. |
| Audio sin limpieza explícita de conexiones. | Un contexto compartido, tonos breves y desconexión de osciladores. Los efectos permanecen activos sin botón de silencio. | Mantener efectos claros y evitar acumular conexiones de audio. |

## Pruebas de la reparación completa, antes de retirar los controles

- TypeScript: aprobado.
- Compilación de producción y sincronización del alojamiento estático: aprobadas.
- Vitest: **6 pruebas aprobadas**. Incluyen cruces, diez crucigramas generados, 100 sopas completas, selección inversa, puntuación, parejas, banco sin duplicados y validación de dominios.
- Playwright en Google Chrome: **28 pruebas aprobadas**, siete escenarios en cada pantalla: 360 × 800, 375 × 812, 390 × 844 y 430 × 932.
- En cada juego: error deliberado, resolución completa, finalización, reinicio y recarga de la URL directa. También se comprueba el cambio de orientación del crucigrama, las parejas bloqueadas, los aciertos conservados y la cancelación táctil de la sopa.
- QR: decodificación de las cinco imágenes, cambio de dominio, descarga de ZIP con cinco PNG y cinco SVG, manifiesto correcto y hoja de impresión.
- Controles: sonidos activos incluso con una preferencia antigua de silencio, ausencia de botones de silencio y salida flotante, ausencia de pantalla completa y movimiento reducido.
- Revisión visual de las cinco pantallas a 390 px.

## Actualización: retirada de controles

Se aprobaron TypeScript, la compilación y las seis pruebas de reglas después de retirar pantalla completa, sonido y X flotantes. Las pruebas móviles confirmaron la ausencia de esos controles y de pantalla completa, los sonidos activos, el acceso por QR, el crucigrama y otras interacciones; la ejecución completa se interrumpió por petición del usuario debido al consumo de RAM. No se afirma que los 28 escenarios se hayan completado en esta última actualización.

Se cerraron los navegadores y servidores de prueba iniciados para esta tarea. Playwright quedó configurado con un solo trabajador para limitar el consumo en futuras ejecuciones.

## Acceso directo y límites

Las cinco rutas `/semana/1` a `/semana/5` abren directamente la actividad, sin pasar por el inicio ni exigir comenzar. Se conserva la navegación normal del teléfono.

Por petición del usuario se retiraron la activación de pantalla completa, el botón de sonido y la X flotante. Los QR nuevos apuntan a las rutas sin parámetros de modo; los QR anteriores con `?modo=actividad` siguen abriendo la misma actividad, pero ya no activan ningún modo especial.

Las comprobaciones móviles se hicieron con emulación táctil en Chrome. No se comprobó en teléfonos físicos el teclado nativo de iOS/Android, la calidad percibida del sonido ni el rendimiento de un Android de gama baja. Tampoco se verificó un despliegue público de Cloudflare ni una impresión/lectura del QR con cámara física: los QR se decodificaron programáticamente y las rutas se probaron sobre la compilación local.
