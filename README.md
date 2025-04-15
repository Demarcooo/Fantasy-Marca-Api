# 📊 Scraper de Jugadores - Movistar Fantasy Marca

Este script en Node.js utiliza **Puppeteer Extra** con el plugin **Stealth** para simular una sesión iniciada en [fantasy.marca.com](https://fantasy.marca.com), acceder a la ficha de un jugador específico, y extraer su **nombre**, **apellido** y **valor de mercado** desde el sitio web.

## 🚀 Requisitos

- Node.js instalado
- Cuenta en [fantasy.marca.com](https://fantasy.marca.com)
- Sesión iniciada previamente (cookies y localStorage guardados)

## 📂 Archivos necesarios

Antes de ejecutar el script, asegúrate de tener:

- `cookies.json`: archivo con las cookies de una sesión activa.
- `localStorage.json`: archivo con el contenido del localStorage de la misma sesión.

Ambos archivos pueden ser exportados manualmente desde el navegador utilizando extensiones como "EditThisCookie" y herramientas de desarrollo.

## 🧠 ¿Qué hace este script?

1. Lanza un navegador con Puppeteer (modo **no headless**).
2. Carga las cookies y localStorage para simular que ya estás logueado.
3. Accede al sitio de Fantasy Marca como usuario autenticado.
4. Navega a la ficha del jugador cuyo ID fue definido.
5. Extrae y muestra en consola:
   - Nombre
   - Apellido
   - Valor del jugador

## ✏️ ¿Cómo cambiar el jugador?

El ID del jugador se define en esta línea del script:

```js
const id = '48683' // ID del jugador Mbappé
