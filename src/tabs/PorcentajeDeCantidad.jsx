import { useState } from "react";
import { RotateCcw, Eye, EyeOff } from "lucide-react";
import { toggleHelp } from "../helpGate";
import { AnswerInput } from "../components/ui.jsx";
import { genPorcentajeDeCantidad, formatNum, checkAnswer, gcd } from "../math/percent.js";
import { toNumber } from "../math/fraction.js";
import { useSolveOnce } from "../hooks.js";

export default function PorcentajeDeCantidad({ onSolved }) {
  const [n, setN] = useState(0);
  return <Ejercicio key={n} onNext={() => setN((v) => v + 1)} onSolved={onSolved} />;
}

function Ejercicio({ onNext, onSolved }) {
  const [ex] = useState(() => genPorcentajeDeCantidad());
  const markSolved = useSolveOnce(onSolved);

  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const p = toNumber(ex.p);
  const cantidad = toNumber(ex.cantidad);
  const ok = checked && checkAnswer(value, ex.resultado);
  const revealHint = wrongCount >= 3;

  const check = () => {
    setChecked(true);
    if (checkAnswer(value, ex.resultado)) {
      markSolved();
    } else {
      setWrongCount((w) => w + 1);
    }
  };

  const g = gcd(p, 100);
  const num = p / g;
  const den = 100 / g;

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">Calculá el porcentaje</h3>
          <p className="ex-prompt">Hallá el resultado y escribilo en el recuadro. Si hace falta, usá decimales con coma.</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}>
          <RotateCcw size={14} /> otro ejercicio
        </button>
      </div>

      <div className="eq-big">
        ¿Cuánto es el {p}% de {cantidad}?
      </div>

      <div className="answer-row">
        <span className="answer-row__label">Resultado:</span>
        <AnswerInput
          value={value}
          onChange={(v) => { setValue(v); setChecked(false); }}
          state={checked ? (ok ? "ok" : "bad") : undefined}
          hint={checked && !ok && revealHint ? formatNum(ex.resultado) : undefined}
          width={90}
          label="resultado del porcentaje"
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
            : `Todavía no. Probá con las cuentas de abajo y volvé a intentar.`}
        </p>
      )}

      {showHelp && (
        <div className="hand-calc">
          <p className="hc-title">Método 1 · dividir entre 100 y multiplicar</p>
          <p className="hc-formula">{p}% de {cantidad} = ({p} ÷ 100) × {cantidad} = {(p / 100).toString().replace(".", ",")} × {cantidad}</p>
          <p>Resultado: <strong>{formatNum(ex.resultado)}</strong></p>

          <p className="hc-title">Método 2 · fracción equivalente</p>
          <p className="hc-formula">
            {p}% = {num}/{den} {den !== 100 ? `(simplificando ${p}/100)` : ""}
          </p>
          <p className="hc-note">
            Entonces: {num}/{den} × {cantidad} = ({cantidad} ÷ {den}) × {num} = {formatNum(ex.resultado)}
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
