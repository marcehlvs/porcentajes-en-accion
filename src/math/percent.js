import { frac, mul, div, add, sub, toNumber, format, eq } from "./fraction.js";

/* Todos los generadores reciben un rng (por defecto Math.random) para poder
   probarlos con semillas fijas. */

const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const F = (n, d = 1) => frac(n, d);

/* ---------------------------------------------------------------- */
/* Cálculo exacto con fracciones                                      */
/* ---------------------------------------------------------------- */

/** p % de "cantidad", exacto (p y cantidad son fracciones). */
export function percentOf(p, cantidad) {
  return div(mul(p, cantidad), F(100));
}

/** Qué % representa "parte" sobre "total" (total ≠ 0). */
export function whatPercent(parte, total) {
  return mul(div(parte, total), F(100));
}

/** Precio final tras aplicar un % de descuento. */
export function applyDiscount(precio, p) {
  return sub(precio, percentOf(p, precio));
}

/** Precio final tras aplicar un % de aumento. */
export function applyIncrease(precio, p) {
  return add(precio, percentOf(p, precio));
}

/** "$1.234,50" — formatea una fracción como número con coma decimal (hasta 2 decimales). */
export function formatMoney(f) {
  const n = toNumber(f);
  const s = Math.abs(n % 1) < 1e-9 ? n.toFixed(0) : n.toFixed(2).replace(/0$/, "");
  return `$${s.replace(".", ",")}`;
}

/** "35" o "12,5" — formatea una fracción como número con coma decimal. */
export function formatNum(f) {
  const n = toNumber(f);
  return Number.isInteger(n) ? String(n) : String(n).replace(".", ",");
}

/** Devuelve true si el texto ingresado (admite coma o punto) es igual a la fracción esperada. */
export function checkAnswer(input, expected) {
  if (typeof input !== "string" || input.trim() === "") return false;
  const cleaned = input.replace(/\s+/g, "").replace(",", ".");
  const v = Number(cleaned);
  if (Number.isNaN(v)) return false;
  return Math.abs(v - toNumber(expected)) < 1e-6;
}

/* ---------------------------------------------------------------- */
/* Solapa 1 · Calcular el % de una cantidad                            */
/* ---------------------------------------------------------------- */

const PERCENTS_NICE = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80];

/**
 * p % de una cantidad. Se eligen p y la cantidad para que el resultado dé
 * exacto (sin decimales periódicos): cantidad es múltiplo de 100/gcd(p,100).
 */
export function genPorcentajeDeCantidad(rng = Math.random) {
  const p = pick(rng, PERCENTS_NICE);
  const g = gcd(p, 100);
  const step = 100 / g; // cantidad debe ser múltiplo de esto para que p% dé entero
  const cantidad = step * int(rng, 1, Math.floor(400 / step));
  const resultado = percentOf(F(p), F(cantidad));
  return { p: F(p), cantidad: F(cantidad), resultado };
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/* ---------------------------------------------------------------- */
/* Solapa 2 · ¿Qué % representa?                                       */
/* ---------------------------------------------------------------- */

const TOTALS = [4, 5, 8, 10, 20, 25, 40, 50, 100, 200];

/** "parte" de "total" ¿qué %? Se eligen para que el % dé siempre un entero. */
export function genQuePorcentaje(rng = Math.random) {
  const total = pick(rng, TOTALS);
  const step = total / gcd(total, 100); // parte debe ser múltiplo de esto
  const parte = step * int(rng, 1, Math.floor((total - 1) / step));
  const p = whatPercent(F(parte), F(total));
  return { parte: F(parte), total: F(total), p };
}

/* ---------------------------------------------------------------- */
/* Solapa 3 · Aumentos y descuentos                                    */
/* ---------------------------------------------------------------- */

const PRECIOS = [200, 300, 400, 500, 600, 800, 900, 1000, 1200, 1500, 2000, 2500];

/** Un precio, un % de cambio (aumento o descuento) y el precio final, exacto. */
export function genAumentoDescuento(rng = Math.random) {
  const tipo = rng() < 0.5 ? "aumento" : "descuento";
  const precio = pick(rng, PRECIOS);
  // porcentajes cuyo 100/gcd divide al precio, para que el cambio dé entero
  const candidatos = PERCENTS_NICE.filter((p) => precio % (100 / gcd(p, 100)) === 0);
  const p = pick(rng, candidatos.length ? candidatos : [10, 50]);
  const cambio = percentOf(F(p), F(precio));
  const final = tipo === "aumento" ? add(F(precio), cambio) : sub(F(precio), cambio);
  const factor = tipo === "aumento" ? add(F(1), div(F(p), F(100))) : sub(F(1), div(F(p), F(100)));
  return { tipo, precio: F(precio), p: F(p), cambio, final, factor };
}

/* ---------------------------------------------------------------- */
/* Solapa 4 · Gráfico circular                                         */
/* ---------------------------------------------------------------- */

const TEMAS = [
  { nombre: "Deporte favorito", categorias: ["Fútbol", "Vóley", "Básquet", "Otro"] },
  { nombre: "Cómo van a la escuela", categorias: ["A pie", "Colectivo", "Bici", "Auto"] },
  { nombre: "Música preferida", categorias: ["Pop", "Rock", "Cuarteto", "Trap"] },
  { nombre: "Mascota en casa", categorias: ["Perro", "Gato", "Otra", "Ninguna"] },
];
const COLORS = ["#E0704B", "#5FA8A0", "#3B6FB5", "#C9A227"];

/**
 * 3 o 4 categorías con % que suman 100, en múltiplos de 5 para que el ángulo
 * (p% de 360°) dé un número simple.
 */
export function genGraficoCircular(rng = Math.random) {
  const tema = pick(rng, TEMAS);
  const n = 3 + (rng() < 0.5 ? 1 : 0);
  const nombres = tema.categorias.slice(0, n);
  // repartir 20 "quintos" (cada uno = 5%) entre n categorías, todas ≥ 1 quinto
  const quintos = Array(n).fill(1);
  let restante = 20 - n;
  while (restante > 0) {
    quintos[int(rng, 0, n - 1)] += 1;
    restante -= 1;
  }
  const datos = nombres.map((nombre, i) => ({
    nombre,
    color: COLORS[i],
    p: F(quintos[i] * 5),
  }));
  return { tema: tema.nombre, datos };
}

/* ---------------------------------------------------------------- */
/* Solapa 5 · Desafío — problemas de porcentaje mezclados               */
/* ---------------------------------------------------------------- */

const SUJETOS = ["alumnos", "personas", "vecinos", "socios del club", "hinchas"];
const OBJETOS = ["una mochila", "una bicicleta", "un par de zapatillas", "un celular", "una remera"];

/**
 * Genera un problema con enunciado y respuesta exacta.
 * tipo: "cantidad" | "que_porcentaje" | "cambio_precio"
 */
export function genDesafio(rng = Math.random) {
  const tipo = pick(rng, ["cantidad", "cantidad", "que_porcentaje", "cambio_precio", "cambio_precio"]);

  if (tipo === "cantidad") {
    const p = pick(rng, PERCENTS_NICE);
    const g = gcd(p, 100);
    const step = 100 / g;
    const total = step * int(rng, 1, Math.floor(300 / step));
    const sujeto = pick(rng, SUJETOS);
    const resultado = percentOf(F(p), F(total));
    return {
      tipo,
      enunciado: `En un grupo de ${total} ${sujeto}, el ${p}% cumple cierta condición. ¿Cuántos ${sujeto} son?`,
      respuesta: resultado,
      sufijo: sujeto,
    };
  }

  if (tipo === "que_porcentaje") {
    const total = pick(rng, TOTALS);
    const step = total / gcd(total, 100);
    const parte = step * int(rng, 1, Math.floor((total - 1) / step));
    const sujeto = pick(rng, SUJETOS);
    const p = whatPercent(F(parte), F(total));
    return {
      tipo,
      enunciado: `De ${total} ${sujeto}, ${parte} cumplen cierta condición. ¿Qué porcentaje representan?`,
      respuesta: p,
      sufijo: "%",
    };
  }

  // cambio_precio
  const esAumento = rng() < 0.5;
  const precio = pick(rng, PRECIOS);
  const candidatos = PERCENTS_NICE.filter((p) => precio % (100 / gcd(p, 100)) === 0);
  const p = pick(rng, candidatos.length ? candidatos : [10, 50]);
  const objeto = pick(rng, OBJETOS);
  const cambio = percentOf(F(p), F(precio));
  const final = esAumento ? add(F(precio), cambio) : sub(F(precio), cambio);
  return {
    tipo,
    enunciado: `${objeto[0].toUpperCase()}${objeto.slice(1)} cuesta $${precio} y ${esAumento ? `aumenta un ${p}%` : `tiene un descuento del ${p}%`}. ¿Cuál es el precio final?`,
    respuesta: final,
    sufijo: "$",
  };
}

export { F, gcd, pick as pickRng, int as intRng, eq, format };
