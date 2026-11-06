"use client";
import { useState } from "react";
import { projects } from "@/src/program";
export function ProjectShelf() {
  const [idx, set] = useState(0),
    p = projects[idx];
  return (
    <div className="shelf">
      <div className={"projectprint " + p.art}>
        <div className="mono">Student project / 0{idx + 1}</div>
        <svg viewBox="0 0 240 145" aria-hidden="true">
          {p.art === "book" ? (
            Array.from({ length: 11 }, (_, i) => (
              <path
                key={i}
                d={
                  "M18 " +
                  (55 + i * 4) +
                  "Q65 " +
                  (18 + i * 4) +
                  " 118 " +
                  (54 + i * 4) +
                  "Q172 " +
                  (18 + i * 4) +
                  " 222 " +
                  (55 + i * 4) +
                  "L214 " +
                  (60 + i * 4) +
                  "Q159 " +
                  (30 + i * 4) +
                  " 118 " +
                  (63 + i * 4) +
                  "Q67 " +
                  (30 + i * 4) +
                  " 25 " +
                  (63 + i * 4) +
                  "Z"
                }
              />
            ))
          ) : p.art === "leaf" ? (
            Array.from({ length: 13 }, (_, i) => (
              <path
                key={i}
                d={
                  "M65 129 Q" +
                  (18 + i * 4) +
                  " " +
                  (19 + i * 3) +
                  " 184 12 Q" +
                  (196 - i * 5) +
                  " " +
                  (109 - i * 2) +
                  " 65 129Z"
                }
              />
            ))
          ) : (
            <g>
              <path d="M75 101Q99 63 115 62Q131 58 162 98Q180 136 141 124Q119 113 98 125Q61 139 75 101Z" />
              {[
                [61, 63, 15, 23],
                [99, 39, 15, 26],
                [138, 37, 15, 25],
                [173, 59, 15, 22],
              ].map(([x, y, rx, ry]) => (
                <ellipse key={x} cx={x} cy={y} rx={rx} ry={ry} />
              ))}
            </g>
          )}
        </svg>
        <strong>{p.name}</strong>
        <small>Studio illustration</small>
      </div>
      <div className="projectlist">
        {projects.map((item, i) => (
          <div className={i === idx ? "selected" : ""} key={item.name}>
            <button aria-expanded={i === idx} onClick={() => set(i)}>
              <span className="mono">0{i + 1}</span>
              <span>{item.name}</span>
              <b aria-hidden="true">{i === idx ? "↙" : "↗"}</b>
            </button>
            {i === idx && (
              <p>
                <small>{item.category}</small>
                {item.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
