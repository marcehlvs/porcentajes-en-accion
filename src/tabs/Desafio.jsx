import { useState } from "react";
import { Heart, Trophy, Target } from "lucide-react";
import { AnswerInput } from "../components/ui.jsx";
import { genDesafio, formatNum, checkAnswer } from "../math/percent.js";

const START_LIVES = 3;
const BEST_KEY = "porcentajes-en-accion:mejor-puntaje";

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0; // sin almacenamiento disponible: se juega igual
  }
}
function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* sin almacenamiento disponible: no pasa nada */
  }
}

export default function Desafio({ onSolved }) {
  const [levelNo, setLevelNo] = useState(0);
  const [problem, setProblem] = useState(() => genDesafio());
  const [value, setValue] = useState("");
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [wrongHere, setWrongHere] = useState(0);
  const [phase, setPhase] = useState("playing"); // "playing" | "won" | "over"
  const [gained, setGained] = useState(0);

  const nextProblem = (n) => {
    setLevelNo(n);
    setProblem(genDesafio());
    setValue("");
    setWrongHere(0);
    setPhase("playing");
  };

  const restart = () => {
    setLives(START_LIVES);
    setScore(0);
    setStreak(0);
    nextProblem(0);
  };

  const finishGame = (finalScore) => {
    setPhase("over");
    if (finalScore > best) {
      setBest(finalScore);
      saveBest(finalScore);
    }
  };

  const submit = () => {
    const ok = checkAnswer(value, problem.respuesta);
    if (ok) {
      const points = Math.max(25, 100 - 25 * wrongHere) + 10 * streak;
      const total = score + points;
      setScore(total);
      setGained(points);
      setStreak((s) => s + 1);
      setPhase("won");
      if (total > best) {
        setBest(total);
        saveBest(total);
      }
      onSolved?.();
    } else {
      const left = lives - 1;
      setLives(left);
      setStreak(0);
      setWrongHere((w) => w + 1);
      if (left === 0) finishGame(score);
    }
  };

  const sufijo = problem.sufijo === "%" || problem.sufijo === "$" ? problem.sufijo : undefined;

  return (
    <div>
      <div className="game-bar">
        <div className="game-bar__group">
          <span>Problema <span className="game-bar__num">{levelNo + 1}</span></span>
          <span>Puntos <span className="game-bar__num">{score}</span></span>
          <span>Racha <span className="game-bar__num">{streak}</span></span>
        </div>
        <div className="game-bar__group">
          <span className="hearts" aria-label={`${lives} vidas`}>
            {Array.from({ length: START_LIVES }, (_, i) => (
              <Heart key={i} size={18} color="#E0704B" fill={i < lives ? "#E0704B" : "none"} />
            ))}
          </span>
          <span title="Mejor puntaje"><Trophy size={15} style={{ verticalAlign: "-2px" }} /> {best}</span>
        </div>
      </div>

      {phase === "over" ? (
        <div className="game-over">
          <h3>¡Se acabaron las vidas!</h3>
          <p className="ex-prompt" style={{ margin: "0 auto 12px" }}>
            Llegaste al problema {levelNo + 1} con <strong>{score}</strong> puntos. Tu mejor puntaje es <strong>{best}</strong>.
          </p>
          <button className="btn btn--primary" onClick={restart}>Jugar de nuevo</button>
        </div>
      ) : (
        <>
          <div className="ex-header">
            <div>
              <h3 className="ex-title"><Target size={17} style={{ verticalAlign: "-3px" }} /> Problemas de porcentaje</h3>
              <p className="ex-prompt">Respondé rápido, pero con cuidado: cada error te cuesta una vida.</p>
            </div>
          </div>

          <div className="game-eq">{problem.enunciado}</div>

          <div className="answer-row">
            <span className="answer-row__label">Respuesta:</span>
            <AnswerInput
              value={value}
              onChange={setValue}
              suffix={sufijo}
              width={90}
              label="respuesta al problema"
              disabled={phase !== "playing"}
            />
          </div>

          {phase === "playing" ? (
            <div className="ex-actions">
              <button className="btn btn--primary" onClick={submit} disabled={value.trim() === ""}>¡Listo!</button>
            </div>
          ) : (
            <>
              <p className="feedback feedback--ok">
                ¡Correcto! +{gained} puntos{streak > 1 ? ` (racha de ${streak})` : ""}. La respuesta era {formatNum(problem.respuesta)}.
              </p>
              <div className="ex-actions">
                <button className="btn btn--primary" onClick={() => nextProblem(levelNo + 1)}>Siguiente problema</button>
              </div>
            </>
          )}

          {phase === "playing" && wrongHere > 0 && (
            <p className="feedback feedback--bad">
              Esa respuesta no es correcta. Te quedan {lives} {lives === 1 ? "vida" : "vidas"}. ¡Probá de nuevo!
            </p>
          )}
        </>
      )}
    </div>
  );
}
