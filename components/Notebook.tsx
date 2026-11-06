"use client";
import { useState } from "react";
import { stages } from "@/src/program";
export function Notebook() {
  const [index, set] = useState(0),
    stage = stages[index];
  return (
    <div className="notebook">
      <div className="platehead mono">
        <span className="spot" /> The build notebook{" "}
        <span>Plate 0{index + 1} / 04</span>
      </div>
      <img
        key={stage.key}
        className="plate"
        src={"/art/" + stage.key + ".svg"}
        width="700"
        height="510"
        alt={stage.label + " edition of the illustrated spiral notebook"}
      />
      <div className="platecap" aria-live="polite">
        <span className="mono">Wk {stage.weeks}</span>
        <strong>{stage.title}</strong>
      </div>
      <div
        className="tabs"
        role="group"
        aria-label="Explore the four program stages"
      >
        {stages.map((s, i) => (
          <button key={s.key} aria-pressed={index === i} onClick={() => set(i)}>
            <i>0{i + 1}</i>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
