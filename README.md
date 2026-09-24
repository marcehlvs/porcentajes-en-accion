# Porcentajes en acción

App para practicar **porcentajes** en 1° año de secundaria: calcular el % de una
cantidad, hallar qué % representa una parte sobre un total, aumentos y descuentos
de precios, y gráfico circular (cálculo de ángulos centrales). Hecha con
React + Vite, con la misma estética de pizarrón que
[funcion-lineal-app](https://github.com/marcehlvs/funcion-lineal-app) y
[estadistica-app](https://github.com/marcehlvs/estadistica-app).

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # compila a dist/
npm run lint
npm run deploy    # compila y publica en GitHub Pages (rama gh-pages)
```

> El sitio publicado **solo se actualiza con `npm run deploy`**; subir a `main` no alcanza.
> Antes de desplegar, revisá `vite.config.js` (`base`) y `index.html` para que coincidan
> con el nombre real del repositorio en GitHub.

## Estructura

```
src/
  math/
    fraction.js    Fracciones exactas (sin errores de decimales) — reutilizado tal cual
    percent.js      Cálculo de porcentajes + generadores de ejercicios (todos aceptan un rng)
  components/
    PieChart.jsx    Gráfico circular en SVG a partir de una lista de {nombre, color, p}
    ui.jsx          AnswerInput (reutilizado)
  tabs/            Una solapa por archivo (Cantidad, Que%, Precios, Circular, Desafío)
  styles.css       Misma paleta pizarrón/papel, con acento coral propio (#E0704B)
```

## Decisiones de diseño

- **Resultados siempre exactos:** los generadores eligen porcentajes y cantidades
  para que el resultado dé un número entero (o con pocos decimales), evitando que
  un alumno de 1° año se enrede con decimales periódicos.
- **Dos métodos por ejercicio:** "dividir entre 100 y multiplicar" y "fracción
  equivalente" (o "factor multiplicador" en aumentos/descuentos), para reforzar
  que son caminos distintos al mismo resultado.
- **Gráfico circular:** se pide primero calcular el ángulo central (p% de 360°)
  de cada categoría; al acertar todos, se revela el gráfico armado con esos
  ángulos exactos.
- **Desafío:** mezcla los tres tipos de problema en enunciados con contexto
  (alumnos, precios de objetos), con vidas y puntaje que premia rachas de aciertos.
