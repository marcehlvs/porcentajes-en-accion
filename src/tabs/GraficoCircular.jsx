import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import { toggleHelp } from "../helpGate";
import { AnswerInput } from "../components/ui.jsx";
import PieChart from "../components/PieChart.jsx";
import Protractor from "../components/Protractor.jsx";
import { genGraficoCircular, checkAnswer } from "../math/percent.js";
import { toNumber, mul, div, frac } from "../math/fraction.js";
import { useSolveOnce } from "../hooks.js";

export default function GraficoCircular({ onSolved }) {
  const [n, setN] = useState(0);
  return <Ejercicio key={n} onNext={() => setN((v) => v + 1)} onSolved={onSolved} />;
}

function Ejercicio({ onNext, onSolved }) {
  const [ex] = useState(() => genGraficoCircular());
  const markSolved = useSolveOnce(onSolved);

  const angulos = ex.datos.map((d) => div(mul(d.p, frac(360)), frac(100)));

  const [vals, setVals] = useState(() => ex.datos.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [drawnOk, setDrawnOk] = useState(() => ex.datos.map(() => false));

  const cellOk = vals.map((v, i) => checkAnswer(v, angulos[i]));
  const allOk = checked && cellOk.every(Boolean);
  const revealHint = wrongCount >= 3;
  const allDrawn = drawnOk.every(Boolean);

  const setVal = (i, v) => {
    setVals((prev) => prev.map((old, j) => (j === i ? v : old)));
    setChecked(false);
  };

  const check = () => {
    setChecked(true);
    if (!vals.every((v, i) => checkAnswer(v, angulos[i]))) {
      setWrongCount((w) => w + 1);
    }
  };

  const markDrawn = (i) => {
    setDrawnOk((prev) => {
      const next = prev.map((old, j) => (j === i ? true : old));
      if (next.every(Boolean)) markSolved();
      return next;
    });
  };

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Armá el gráfico circular</h3>
          <p className="ex-prompt">
            Se encuestó a un curso sobre "{ex.tema}". Cada porcentaje ocupa una porción proporcional del círculo
            (360°). Calculá cuántos grados le corresponden a cada categoría.
          </p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}>
          <RotateCcw size={14} /> otra encuesta
        </button>
      </div>

      {ex.datos.map((d, i) => (
        <div className="category-row" key={d.nombre}>
          <span className="category-row__swatch" style={{ background: d.color }} />
          <span className="category-row__name">{d.nombre}</span>
          <span>{toNumber(d.p)}% →</span>
          <AnswerInput
            value={vals[i]}
            onChange={(v) => setVal(i, v)}
            state={checked ? (cellOk[i] ? "ok" : "bad") : undefined}
            hint={checked && !cellOk[i] && revealHint ? toNumber(angulos[i]) : undefined}
            suffix="°"
            width={60}
            label={`grados para ${d.nombre}`}
          />
        </div>
      ))}

      <div className="ex-actions">
        <button className="btn btn--primary" onClick={check} disabled={vals.some((v) => v.trim() === "")}>
          Verificar ángulos
        </button>
        <button className="btn btn--ghost" onClick={() => toggleHelp(showHelp, setShowHelp)}>
          {showHelp ? <EyeOff size={14} /> : <Eye size={14} />} {showHelp ? "ocultar cuentas" : "ver las cuentas"}
        </button>
      </div>

      {checked && (
        <p className={`feedback ${allOk ? "feedback--ok" : "feedback--bad"}`}>
          {allOk
            ? "¡Perfecto! Así queda armado el gráfico circular."
            : revealHint
            ? `Seguís con ángulos para revisar: mirá los valores marcados en rojo y repasá con "ver las cuentas".`
            : "Hay ángulos para revisar (en rojo). Recordá: el círculo completo son 360°. Probá de nuevo."}
        </p>
      )}

      {showHelp && (
        <div className="hand-calc">
          <p className="hc-title">El círculo completo representa el 100%, que son 360°</p>
          {ex.datos.map((d, i) => (
            <p key={d.nombre}>
              {d.nombre}: {toNumber(d.p)}% de 360° = ({toNumber(d.p)} ÷ 100) × 360 = <strong>{toNumber(angulos[i])}°</strong>
            </p>
          ))}
        </div>
      )}

      {allOk && !allDrawn && (
        <>
          <p className="ex-prompt">
            Ahora trazá cada ángulo a mano: arrastrá la manija sobre el transportador hasta marcar los grados que
            calculaste (el 0° está arriba, como las 12 en el reloj).
          </p>
          <div className="protractor-grid">
            {ex.datos.map((d, i) => (
              <Protractor
                key={d.nombre}
                label={`${d.nombre} (${toNumber(angulos[i])}°)`}
                target={toNumber(angulos[i])}
                color={d.color}
                confirmed={drawnOk[i]}
                onConfirmed={() => markDrawn(i)}
              />
            ))}
          </div>
        </>
      )}

      {allOk && allDrawn ? (
        <>
          <PieChart datos={ex.datos} showLabels label={`Gráfico circular: ${ex.tema}`} />
          <div className="legend">
            {ex.datos.map((d) => (
              <span className="legend__item" key={d.nombre}>
                <span className="legend__swatch" style={{ background: d.color }} /> {d.nombre}
              </span>
            ))}
          </div>
          <div className="ex-actions">
            <button className="btn btn--primary" onClick={onNext}>Siguiente encuesta</button>
          </div>
        </>
      ) : !allOk ? (
        <p className="note">Verificá los ángulos para ver el gráfico terminado.</p>
      ) : null}
    </div>
  );
}
