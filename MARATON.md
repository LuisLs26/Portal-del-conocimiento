# Maratón — sexta actividad

Solo esta actividad utiliza multijugador. Las cinco actividades existentes siguen siendo individuales.

## Uso en clase

1. El docente abre `/maraton`, despliega **Soy docente** y crea una sala.
2. Comparte el QR de esa sala. Ese QR incluye su código; el estudiante solo escribe su nombre.
3. Espera a los participantes y pulsa **Dar la salida**. Hay 30 plazas de estudiantes; el docente no ocupa una.
4. Cada estudiante juega a su ritmo, sin rondas compartidas ni tiempo de espera. Los movimientos y el ranking aparecen en los demás teléfonos.
5. Los estudiantes ya finalizados pueden observar el ranking. El docente puede finalizar la carrera o comenzar otra con el mismo grupo.

El QR general del gestor abre Maratón, pero el QR que debe compartirse con los estudiantes es el que aparece dentro de la sala creada por el docente. Un código de sala también puede introducirse manualmente.

## Reglas

- Recorrido de 40 casillas, dado de 1 a 6 y cinco bloques de contenido.
- Casillas libres: conservan el avance y completan el turno.
- Casillas de pregunta: una respuesta correcta conserva el avance; una incorrecta retrocede dos casillas.
- Casillas estrella: al acertar se ganan dos casillas adicionales. El bono nunca salta la pregunta de la meta.
- Para terminar, hay que responder correctamente la pregunta de la casilla 40.
- La posición decide el ranking durante la carrera; los aciertos y errores resuelven empates. Los finalizados se ordenan por llegada validada por el servidor.
- No hay cuenta regresiva ni espera entre turnos. Una pregunta pendiente debe responderse antes de volver a lanzar. Un jugador desconectado no bloquea la clase.
- La carrera termina cuando todos llegan o cuando el docente la finaliza. Las salas mantienen su caducidad de cuatro horas.
- Las salas caducan a las cuatro horas y sus datos se eliminan. Los nombres duplicados reciben un sufijo para distinguirlos.

Las 40 preguntas son originales y se basan en el contenido de las páginas 4–23 del PDF proporcionado. Cada explicación muestra su página de referencia. Las respuestas correctas se mantienen en el módulo del servidor; no se incluyen en el paquete de la interfaz.

## Servidor y consumo

Cloudflare Workers + un Durable Object con almacenamiento SQLite por sala. El servidor controla dado, preguntas, validación, avance, plazos y clasificación; no acepta posiciones o puntos elegidos por un teléfono.

Las conexiones WebSocket pueden hibernar. Las actualizaciones se agrupan durante 180 ms, los mensajes entrantes están limitados, se aceptan como máximo 30 estudiantes y se reemplaza la conexión anterior cuando un mismo jugador vuelve a entrar. No hay sondeos constantes de toda la clase ni una base de datos adicional.

Las credenciales de estudiante y docente nunca se incluyen en el ranking. Se guardan solo en la sesión de la pestaña del navegador para recuperar el avance al recargar. Las acciones repetidas no permiten tirar o puntuar dos veces.

## Publicación en Cloudflare

Publicado en https://portal-del-conocimiento.pages.dev/maraton. El Worker `portal-maraton` y los enlaces de producción y preview están configurados en `wrangler.toml`.

1. Iniciar sesión con `npx wrangler login`.
2. Publicar el Worker con `npm run deploy:maraton`. El archivo `wrangler.maraton.jsonc` crea el enlace `MARATON_ROOMS` y la migración SQLite.
3. Publicar Pages con `npx wrangler pages deploy dist --project-name portal-del-conocimiento --branch main`. La configuración conserva el enlace `MARATON_SERVICE` al Worker `portal-maraton` en producción y preview.
4. Publicar de nuevo el portal. Pages detecta `functions/api/maraton/[[path]].ts` y dirige esas solicitudes al Worker; las rutas educativas restantes siguen siendo estáticas.
5. Confirmar que `/api/maraton/health` devuelve `{"ready":true}` y comprobar una sala pública entre dos teléfonos antes de la clase.

Como alternativa, se puede usar `VITE_MARATON_API_URL` durante la compilación para conectar directamente al Worker. En ese caso se configura `ALLOWED_ORIGINS` en el Worker con el dominio público del portal. No se deben publicar secretos como variables `VITE_*`.

## Comprobaciones realizadas

- TypeScript de interfaz y servidor: aprobados.
- Compilación del portal: aprobada.
- Paquete del Worker (`wrangler deploy --dry-run`): validado, aproximadamente 31 KiB sin comprimir.
- Ocho pruebas de Maratón: aprobadas. Incluyen 40 preguntas, 30 plazas, reglas de casillas, errores, expiraciones, carrera completa de 30 jugadores, reinicio y ausencia de respuestas pendientes/credenciales en el estado público.
- Una prueba utiliza **31 conexiones WebSocket reales locales**: docente y 30 estudiantes, ronda concurrente, ranking compartido, reconexión y tiradas duplicadas. Ejecuta el mismo actor de producción, con almacenamiento y temporizadores de Cloudflare adaptados al entorno local.
- Una prueba móvil, con **un navegador**: crear sala, mostrar QR, entrar con nombre, dado, selección modificable, respuesta, ranking y recarga. Comprueba ausencia de desbordamiento en 360, 375, 390 y 430 px.

También se verificó el despliegue público con 31 conexiones WebSocket: docente y 30 estudiantes, inicio, tiradas concurrentes, ranking idéntico y finalización. `/api/maraton/health` devuelve `{"ready":true}`. Estas pruebas no equivalen a medir 30 teléfonos físicos sobre el Wi-Fi del colegio.

## Desarrollo y pruebas ligeras

```sh
npm run dev:maraton
npm run dev
npm run typecheck
npm run typecheck:maraton
npm run test:maraton
npm run test:maraton:mobile
```

Las pruebas usan un solo trabajador. El servidor de `scripts/test-maraton-server.mjs` es exclusivamente una adaptación local para pruebas; el servicio que debe publicarse es el Worker de Cloudflare.


## Tablero de videojuego y vista del docente

Partida horizontal contenida en la pantalla, recorrido serpenteante de 40 casillas, fichas de peón, dado CSS 3D de seis caras y preguntas superpuestas. La interfaz gira visualmente en retrato; no depende del bloqueo de orientación del navegador ni requiere pantalla completa. En la laptop del docente se muestran tablero y 30 puestos simultáneamente (desde 1000 × 600). En teléfonos, la lista completa se consulta por páginas sin desplazar el tablero.

Referencias consultadas para la técnica del cubo y la organización del tablero: [Rolling-dice](https://github.com/Vaibh31/Rolling-dice) y [Ludo-Game](https://github.com/Rony7s/Ludo-Game). La implementación es propia y no incorpora código ni recursos de esos repositorios.

## Revisión visual del portal

| Antes | Ahora |
| --- | --- |
| Casillas pegadas a un marco rectangular | Pista continua con cuatro tramos y curvas visibles |
| Dado y controles sobre el recorrido | Zona de juego central con controles alineados |
| Títulos recortados en el inicio | Títulos completos y tarjetas con acentos de color |
| Entrada y juego con paletas diferentes | Entrada, preguntas y ranking coordinados en azul, rojo y amarillo |

Se mantuvo el formato de teléfono en las actividades individuales. La revisión automatizada utiliza un solo navegador.

## Revisión final de estabilidad y presentación

- Relacionar: tarjetas en una única cuadrícula. Cada fila comparte altura aunque la definición tenga más líneas; ambas columnas terminan al mismo nivel. Mensaje de resultado con espacio reservado para evitar saltos.
- Salas inexistentes o caducadas: se verifica su estado antes de repetir una conexión fallida, y se muestra una salida clara.
- Finalización anticipada: el primer puesto se describe como líder si todavía no cruzó la meta.
- Preguntas y ranking: los controles del tablero quedan inactivos mientras hay un panel abierto; el foco pasa al panel.
- Resultados individuales: el panel se adapta a la altura disponible y permite leerlo con pantallas bajas.
- Retirado el tablero anterior que ya no se utilizaba, reduciendo el paquete de Maratón.

La revisión no puede garantizar ausencia absoluta de errores en todos los teléfonos y redes. Las pruebas documentan las situaciones comprobadas.
