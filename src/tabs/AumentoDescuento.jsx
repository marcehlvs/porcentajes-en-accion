import { useState } from "react";
import { RotateCcw, Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { toggleHelp } from "../helpGate";
import { AnswerInput } from "../components/ui.jsx";
import { genAumentoDescuento, formatMoney, formatNum, checkAnswer } from "../math/percent.js";
import { toNumber } from "../math/fraction.js";
import { useSolveOnce } from "../hooks.js";

export default function AumentoDescuento({ onSolved }) {
  const [n, setN] = useState(0);
  return <Ejercicio key={n} onNext={() => setN((v) => v + 1)} onSolved={onSolved} />;
}

function Ejercicio({ onNext, onSolved }) {
  const [ex] = useState(() => genAumentoDescuento());
  const markSolved = useSolveOnce(onSolved);

  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const precio = toNumber(ex.precio);
  const p = toNumber(ex.p);
  const esAumento = ex.tipo === "aumento";
  const ok = checked && checkAnswer(value, ex.final);
  const revealHint = wrongCount >= 3;

  const check = () => {
    setChecked(true);
    if (checkAnswer(value, ex.final)) {
      markSolved();
    } else {
      setWrongCount((w) => w + 1);
    }
  };

  const factorTxt = formatNum(ex.factor);

  return (
    <div>
      <div className="ex-header">
        <div>
          <h3 className="ex-title">
            {esAumento ? <TrendingUp size={17} style={{ verticalAlign: "-3px" }} /> : <TrendingDown size={17} style={{ verticalAlign: "-3px" }} />}
            {" "}Aumentos y descuentos
          </h3>
          <p className="ex-prompt">Calculá el precio final después del {esAumento ? "aumento" : "descuento"}.</p>
        </div>
        <button className="btn btn--ghost" onClick={onNext}>
          <RotateCcw size={14} /> otro ejercicio
        </button>
      </div>

      <div className="eq-big">
        Un producto cuesta {formatMoney(ex.precio)} y {esAumento ? `aumenta un ${p}%` : `tiene un descuento del ${p}%`}.
      </div>
      <p className="ex-prompt">¿Cuál es el precio final?</p>

      <div className="answer-row">
        <span className="answer-row__label">Precio final ($):</span>
        <AnswerInput
          value={value}
          onChange={(v) => { setValue(v); setChecked(false); }}
          state={checked ? (ok ? "ok" : "bad") : undefined}
          hint={checked && !ok && revealHint ? formatNum(ex.final) : undefined}
          width={90}
          label="precio final"
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
            : `Todavía no. Revisá si tenías que sumar o restar, y probá de nuevo.`}
        </p>
      )}

      {showHelp && (
        <div className="hand-calc">
          <p className="hc-title">Paso 1 · calculá el {p}% del precio</p>
          <p className="hc-formula">{p}% de {precio} = ({p} ÷ 100) × {precio} = {formatNum(ex.cambio)}</p>

          <p className="hc-title">Paso 2 · {esAumento ? "sumalo" : "restalo"} al precio original</p>
          <p className="hc-formula">
            {precio} {esAumento ? "+" : "−"} {formatNum(ex.cambio)} = <strong>{formatNum(ex.final)}</strong>
          </p>

          <p className="hc-title">Atajo · factor multiplicador</p>
          <p className="hc-note">
            {esAumento
              ? `Aumentar un ${p}% equivale a multiplicar por (1 + ${p}/100) = ${factorTxt}.`
              : `Descontar un ${p}% equivale a multiplicar por (1 − ${p}/100) = ${factorTxt}.`}
            {" "}Es decir: {precio} × {factorTxt} = {formatNum(ex.final)}.
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
