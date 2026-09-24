import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import { toggleHelp } from "../helpGate";
import { AnswerInput } from "../components/ui.jsx";
import { genQuePorcentaje, formatNum, checkAnswer } from "../math/percent.js";
import { toNumber } from "../math/fraction.js";
import { useSolveOnce } from "../hooks.js";

export default function QuePorcentaje({ onSolved }) {
  const [n, setN] = useState(0);
  return <Ejercicio key={n} onNext={() => setN((v) => v + 1)} onSolved={onSolved} />;
}

function Ejercicio({ onNext, onSolved }) {
  const [ex] = useState(() => genQuePorcentaje());
  const markSolved = useSolveOnce(onSolved);

  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const parte = toNumber(ex.parte);
  const total = toNumber(ex.total);
  const ok = checked && checkAnswer(value, ex.p);
  const revealHint = wrongCount >= 3;

  const check = () => {
    setChecked(true);
    if (checkAnswer(value, ex.p)) {
      markSolved();
    } else {
      setWrongCount((w) => w + 1);
    }
  };

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">¿Qué porcentaje representa?</h3>
          <p className="ex-prompt">Encontrá qué porcentaje del total es la parte indicada.</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}>
          <RotateCcw size={14} /> otro ejercicio
        </button>
      </div>

      <div className="eq-big">
        {parte} de {total}, ¿qué porcentaje es?
      </div>

      <div className="answer-row">
        <span className="answer-row__label">Porcentaje:</span>
        <AnswerInput
          value={value}
          onChange={(v) => { setValue(v); setChecked(false); }}
          state={checked ? (ok ? "ok" : "bad") : undefined}
          hint={checked && !ok && revealHint ? formatNum(ex.p) : undefined}
          suffix="%"
          width={70}
          label="porcentaje que representa"
        />
      </div>

      <div className="ex-actions">
        <button className="btn btn--primary" onClick={check} disabled={value.trim() === ""}>Verificar</button>
        <button className="btn btn--ghost" onClick={() => toggleHelp(showHelp, setShowHelp)}>
          {showHelp ? <EyeOff size={14} /> : <Eye size={14} />} {showHelp ? "ocultar cuentas" : "ver las cuentas"}
        </button>
      </div>

      {checked && (
        <p className={`feedback ${ok ? "feedback--ok" : "feedback--bad"}`}>
          {ok
            ? "¡Correcto!"
            : revealHint
            ? `Seguís sin acertar: mirá el resultado marcado junto al recuadro y repasá la cuenta con "ver las cuentas".`
            : `Todavía no. Revisá la cuenta: ¿armaste bien la fracción parte/total? Probá de nuevo.`}
        </p>
      )}

      {showHelp && (
        <div className="hand-calc">
          <p className="hc-title">Armá la fracción parte/total y llevala a "de cada 100"</p>
          <p className="hc-formula">{parte}/{total} × 100 = ({parte} × 100) ÷ {total}</p>
          <p>
            = {parte * 100} ÷ {total} = <strong>{formatNum(ex.p)}%</strong>
          </p>
          <p className="hc-note">
            Otra forma: pensá cuántas veces entra {total} en 100 ({100 / total} veces) y multiplicá la parte por
            ese número: {parte} × {100 / total} = {formatNum(ex.p)}.
          </p>
        </div>
      )}

      {ok && (
        <div className="ex-actions">
          <button className="btn btn--primary" onClick={onNext}>Siguiente ejercicio</button>
        </div>
      )}
    </div>
  );
}
