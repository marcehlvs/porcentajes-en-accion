import { useRef, useState } from "react";
import { Check, X } from "lucide-react";

/* Transportador interactivo: el usuario arrastra un manija sobre un círculo
   graduado (0°–360°, con el 0 arriba, sentido horario, igual convención que
   PieChart) para trazar a mano el ángulo que ya calculó numéricamente.
   target: ángulo esperado en grados. tolerance: margen aceptado en grados. */

const CX = 110;
const CY = 110;
const R = 92;
const TOLERANCE = 3;

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function angleFromPoint(cx, cy, x, y) {
  const rad = Math.atan2(y - cy, x - cx);
  let deg = (rad * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return deg;
}

function sectorD(cx, cy, r, endDeg) {
  if (endDeg <= 0) return "";
  if (endDeg >= 359.999) {
    const mid = polar(cx, cy, r, 180);
    const start = polar(cx, cy, r, 0);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${mid.x} ${mid.y} A ${r} ${r} 0 1 1 ${start.x} ${start.y} Z`;
  }
  const start = polar(cx, cy, r, 0);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = endDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function Protractor({ target, color = "#3B6FB5", label, onConfirmed, confirmed = false }) {
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null); // null | true | false
  const svgRef = useRef(null);
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  const setFromEvent = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 220;
    const y = ((e.clientY - rect.top) / rect.height) * 220;
    const raw = angleFromPoint(CX, CY, x, y);
    setAngle(Math.round(raw / 5) * 5); // ayuda a "enganchar" en múltiplos de 5°
    setResult(null);
  };

  const onPointerDown = (e) => {
    if (confirmed) return;
    e.target.setPointerCapture?.(e.pointerId);
    setFromEvent(e);
  };
  const onPointerMove = (e) => {
    if (confirmed || e.buttons !== 1) return;
    setFromEvent(e);
  };

  const check = () => {
    const ok = Math.abs(angle - target) <= TOLERANCE;
    setResult(ok);
    if (ok) onConfirmed?.();
  };

  const handlePos = polar(CX, CY, R, angle);

  return (
    <div className="protractor">
      <p className="protractor__label" style={{ color }}>
        {label}
      </p>
      <svg
        ref={svgRef}
        viewBox="0 0 220 220"
        className="protractor__svg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        role="img"
        aria-label={`Transportador para trazar ${angle} grados`}
      >
        <circle cx={CX} cy={CY} r={R} className="protractor__circle" />
        {ticks.map((t) => {
          const isMajor = t % 30 === 0;
          const inner = polar(CX, CY, isMajor ? R - 10 : R - 5, t);
          const outer = polar(CX, CY, R, t);
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              className={isMajor ? "protractor__tick protractor__tick--major" : "protractor__tick"}
            />
          );
        })}
        {angle > 0 && <path d={sectorD(CX, CY, R, angle)} fill={color} opacity={0.35} />}
        <line x1={CX} y1={CY} x2={handlePos.x} y2={handlePos.y} className="protractor__radius" stroke={color} />
        <circle
          cx={handlePos.x}
          cy={handlePos.y}
          r={9}
          fill={color}
          className="protractor__handle"
          style={{ cursor: confirmed ? "default" : "grab" }}
        />
        <line x1={CX} y1={CY} x2={CX} y2={CY - R} className="protractor__zero" />
      </svg>
      <div className="protractor__readout">
        <span>
          Marcaste: <strong>{angle}°</strong>
        </span>
        {!confirmed && (
          <button className="btn btn--ghost btn--tiny" onClick={check} disabled={angle === 0}>
            Verificar trazo
          </button>
        )}
        {confirmed && (
          <span className="protractor__ok">
            <Check size={14} /> correcto
          </span>
        )}
        {result === false && (
          <span className="protractor__bad">
            <X size={14} /> probá de nuevo (te falta {Math.round(Math.abs(angle - target))}° para llegar)
          </span>
        )}
      </div>
    </div>
  );
}
