import type { JSX } from "react";

// Small motion graphics for the service tiles. Pure SVG, animated in globals.css under "Motion graphics".
// The loops only run once the tile has scrolled in ([data-in]) and never when reduced motion is on;
// the static frame shows the finished state, so nothing depends on the animation to be understood.

export type GraphicName = "chat" | "tickets" | "coverage" | "crm" | "inbox" | "flow";

const box = { viewBox: "0 0 240 140", className: "mg-svg", "aria-hidden": true, focusable: false } as const;

function Chat() {
  return (
    <svg {...box}>
      <g className="mg-a mg-a1">
        <rect className="mg-soft" x="16" y="14" width="126" height="28" rx="10" />
        <rect className="mg-line" x="30" y="25" width="78" height="6" rx="3" />
      </g>
      <g className="mg-a mg-a2">
        <rect className="mg-amber" x="92" y="52" width="132" height="28" rx="10" />
        <rect className="mg-ink" x="106" y="63" width="88" height="6" rx="3" />
      </g>
      <g className="mg-a mg-a3">
        <rect className="mg-soft" x="16" y="90" width="100" height="28" rx="10" />
        <rect className="mg-line" x="30" y="101" width="56" height="6" rx="3" />
      </g>
      <g className="mg-a mg-a4 mg-typing">
        <rect className="mg-amber-dim" x="166" y="96" width="58" height="26" rx="10" />
        <circle className="mg-ink mg-dot1" cx="182" cy="109" r="4" />
        <circle className="mg-ink mg-dot2" cx="195" cy="109" r="4" />
        <circle className="mg-ink mg-dot3" cx="208" cy="109" r="4" />
      </g>
    </svg>
  );
}

function Tickets() {
  const rows = [16, 56, 96];
  return (
    <svg {...box}>
      {rows.map((y, i) => (
        <g key={y} className={`mg-row mg-r${i + 1}`}>
          <rect className="mg-soft" x="16" y={y} width="208" height="30" rx="8" />
          <rect className="mg-line" x="30" y={y + 9} width={[92, 70, 104][i]} height="5" rx="2.5" />
          <rect className="mg-line mg-line--dim" x="30" y={y + 18} width={[54, 80, 44][i]} height="4" rx="2" />
          <circle className="mg-ring" cx="200" cy={y + 15} r="9" />
          <circle className="mg-fill" cx="200" cy={y + 15} r="9" />
          <path className="mg-check" d={`M195 ${y + 15} l3.5 3.5 l6.5 -7`} pathLength={1} />
        </g>
      ))}
    </svg>
  );
}

function Coverage() {
  const ticks = Array.from({ length: 25 }, (_, i) => 16 + i * (208 / 24));
  return (
    <svg {...box}>
      <rect className="mg-soft" x="16" y="52" width="208" height="30" rx="8" />
      <rect className="mg-amber mg-window" x="16" y="52" width="208" height="30" rx="8" />
      {ticks.map((x, i) => (
        <rect key={i} className="mg-tick" x={x - 0.75} y={i % 6 === 0 ? 88 : 90} width="1.5" height={i % 6 === 0 ? 10 : 5} />
      ))}
      <text className="mg-label" x="16" y="116">
        12 am
      </text>
      <text className="mg-label" x="120" y="116" textAnchor="middle">
        12 pm
      </text>
      <text className="mg-label" x="224" y="116" textAnchor="end">
        12 am
      </text>
      <circle className="mg-amber mg-sun" cx="16" cy="34" r="7" />
    </svg>
  );
}

function Crm() {
  const rows = [18, 44, 70, 96];
  return (
    <svg {...box}>
      {rows.map((y, r) => (
        <g key={y}>
          <rect className="mg-soft" x="16" y={y} width="208" height="20" rx="5" />
          {[0, 1, 2].map((c) => (
            <rect
              key={c}
              className={`mg-cell mg-c${r * 3 + c + 1}`}
              x={26 + c * 68}
              y={y + 7}
              width={[46, 38, 30][c]}
              height="6"
              rx="3"
            />
          ))}
        </g>
      ))}
      <rect className="mg-amber mg-scan" x="12" y="16" width="3" height="24" rx="1.5" />
    </svg>
  );
}

function Inbox() {
  const days = Array.from({ length: 10 }, (_, i) => i);
  return (
    <svg {...box}>
      <g className="mg-env">
        <rect className="mg-soft" x="16" y="22" width="88" height="62" rx="8" />
        <path className="mg-stroke" d="M22 30 L60 58 L98 30" />
      </g>
      <g className="mg-badge">
        <circle className="mg-amber" cx="102" cy="24" r="13" />
        <text className="mg-badge-n" x="102" y="29" textAnchor="middle">
          0
        </text>
      </g>
      {days.map((i) => (
        <rect
          key={i}
          className={`mg-day mg-d${i + 1}`}
          x={128 + (i % 5) * 19}
          y={34 + Math.floor(i / 5) * 26}
          width="15"
          height="20"
          rx="3"
        />
      ))}
      <rect className="mg-line mg-line--dim" x="16" y="100" width="88" height="5" rx="2.5" />
      <rect className="mg-line mg-line--dim" x="16" y="112" width="60" height="5" rx="2.5" />
      <rect className="mg-line mg-line--dim" x="128" y="94" width="91" height="5" rx="2.5" />
    </svg>
  );
}

function Flow() {
  const nodes = [36, 120, 204];
  return (
    <svg {...box}>
      <rect className="mg-soft" x="36" y="40" width="168" height="4" rx="2" />
      <rect className="mg-amber mg-track" x="36" y="40" width="168" height="4" rx="2" />
      {nodes.map((x, i) => (
        <g key={x}>
          <circle className="mg-node" cx={x} cy="42" r="13" />
          <circle className={`mg-amber mg-node-on mg-n${i + 1}`} cx={x} cy="42" r="13" />
        </g>
      ))}
      {[78, 96, 114].map((y, i) => (
        <g key={y}>
          <rect className="mg-soft" x="16" y={y} width="208" height="8" rx="4" />
          <rect className={`mg-amber mg-bar mg-b${i + 1}`} x="16" y={y} width={[176, 132, 98][i]} height="8" rx="4" />
        </g>
      ))}
    </svg>
  );
}

const map: Record<GraphicName, () => JSX.Element> = {
  chat: Chat,
  tickets: Tickets,
  coverage: Coverage,
  crm: Crm,
  inbox: Inbox,
  flow: Flow,
};

export function Graphic({ name }: { name: GraphicName }) {
  const G = map[name];
  return (
    <div className={`mg mg--${name}`}>
      <G />
    </div>
  );
}
