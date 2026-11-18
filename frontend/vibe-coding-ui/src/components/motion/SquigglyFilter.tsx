import React from "react";

export function SquigglyFilter() {
  return (
    <svg className="hidden" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="squiggly-0">
          <feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="0" />
          <feDisplacementMap id="displacement" in="SourceGraphic" in2="noise" scale="4" />
        </filter>
        <filter id="squiggly-1">
          <feTurbulence id="turbulence-1" baseFrequency="0.02" numOctaves="3" result="noise" seed="2" />
          <feDisplacementMap id="displacement-1" in="SourceGraphic" in2="noise" scale="4" />
        </filter>
      </defs>
    </svg>
  );
}
