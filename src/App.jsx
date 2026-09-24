import { useState } from "react";
import { Star } from "lucide-react";
import PorcentajeDeCantidad from "./tabs/PorcentajeDeCantidad.jsx";
import QuePorcentaje from "./tabs/QuePorcentaje.jsx";
import AumentoDescuento from "./tabs/AumentoDescuento.jsx";
import GraficoCircular from "./tabs/GraficoCircular.jsx";
import Desafio from "./tabs/Desafio.jsx";
import HelpGateModal from "./components/HelpGateModal.jsx";

const TABS = [
  { id: "cantidad", label: "1 · Calcular el %", Component: PorcentajeDeCantidad },
  { id: "que", label: "2 · ¿Qué % es?", Component: QuePorcentaje },
  { id: "precios", label: "3 · Aumentos y descuentos", Component: AumentoDescuento },
  { id: "circular", label: "4 · Gráfico circular", Component: GraficoCircular },
  { id: "desafio", label: "5 · Desafío", Component: Desafio },
];

export default function App() {
  const [tab, setTab] = useState("cantidad");
  const [solved, setSolved] = useState(0);
  const { Component } = TABS.find((t) => t.id === tab);

  return (
    <div className="board-app">
      <header className="board-header">
        <h1 className="board-title">Porcentajes en acción</h1>
        <p className="board-subtitle">
          Porcentajes: calcular cantidades, hallar el %, aumentos y descuentos, y gráfico circular
        </p>
        <span className="solved-badge">
          <Star size={13} fill="#E0704B" color="#E0704B" /> {solved} {solved === 1 ? "ejercicio resuelto" : "ejercicios resueltos"}
        </span>
      </header>

      <nav className="tabs-row" aria-label="Secciones">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`chalk-tab ${tab === t.id ? "chalk-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="paper">
        <Component key={tab} onSolved={() => setSolved((n) => n + 1)} />
      </main>

      <HelpGateModal />
    </div>
  );
}
