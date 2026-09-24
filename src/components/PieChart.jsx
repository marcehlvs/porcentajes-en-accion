import { toNumber } from "../math/fraction.js";

/* Gráfico circular en SVG. datos: [{ nombre, color, p (fracción, % de 0 a 100) }]
   La suma de los p no necesita dar exactamente 100 (se dibuja igual, a escala). */

const CX = 110;
const CY = 110;
const R = 92;

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sliceD(cx, cy, r, startDeg, endDeg) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  if (endDeg - startDeg >= 359.999) {
    // círculo completo: dos semicírculos, si no el arco no se puede describir
    const mid = polar(cx, cy, r, startDeg + 180);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 1 0 ${mid.x} ${mid.y} A ${r} ${r} 0 1 0 ${start.x} ${start.y} Z`;
  }
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

/**
 * datos: [{ nombre, color, p }]
 * picked: nombre de la categoría resaltada (opcional)
 * onSliceClick(nombre): opcional, hace clickeables las porciones
 * showLabels: si true, escribe el % dentro de cada porción
 */
export default function PieChart({ datos, picked, onSliceClick, showLabels = false, label = "Gráfico circular" }) {
  const total = datos.reduce((s, d) => s + toNumber(d.p), 0) || 1;
  const slices = datos.reduce((acc, d) => {
    const prevEnd = acc.length ? acc[acc.length - 1].endDeg : 0;
    const frac = toNumber(d.p) / total;
    const startDeg = prevEnd;
    const endDeg = prevEnd + frac * 360;
    const midDeg = (startDeg + endDeg) / 2;
    const labelPos = polar(CX, CY, R * 0.62, midDeg);
    return [...acc, { ...d, startDeg, endDeg, labelPos }];
  }, []);

  return (
    <div className="pie-wrap">
      <svg viewBox="0 0 220 220" className="pie-svg" role="img" aria-label={label}>
        {slices.map((s) => (
          <path
            key={s.nombre}
            d={sliceD(CX, CY, R, s.startDeg, s.endDeg)}
            fill={s.color}
            className={`pie-slice ${picked === s.nombre ? "pie-slice--picked" : ""}`}
            onClick={onSliceClick ? () => onSliceClick(s.nombre) : undefined}
            style={onSliceClick ? { cursor: "pointer" } : undefined}
          >
            <title>{s.nombre}</title>
          </path>
        ))}
        {showLabels &&
          slices.map((s) => (
            <text
              key={`t-${s.nombre}`}
              x={s.labelPos.x}
              y={s.labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="700"
              fill="#FAF7F0"
              style={{ pointerEvents: "none", fontFamily: "Inter, sans-serif" }}
            >
              {toNumber(s.p)}%
            </text>
          ))}
      </svg>
    </div>
  );
}
