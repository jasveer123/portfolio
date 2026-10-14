import type { ArchitectureLayer, Project } from "@/lib/project-data";

const LANES: { layer: ArchitectureLayer; label: string }[] = [
  { layer: "client", label: "Client" },
  { layer: "service", label: "Services" },
  { layer: "data", label: "Data" },
  { layer: "external", label: "External" },
];

const LANE_W = 200;
const NODE_W = 178;
const NODE_H = 54;
const ROW_H = 82;
const TOP = 46;

type Placed = { id: string; label: string; detail?: string; x: number; y: number };

/** Positions nodes in service lanes; observability sits under the client lane. */
export function layoutArchitecture(project: Project) {
  const placed: Placed[] = [];
  const laneCounts: Record<string, number> = {};
  for (const n of project.architecture.nodes) {
    const laneIndex = n.layer === "observability" ? 0 : LANES.findIndex((l) => l.layer === n.layer);
    const key = String(laneIndex);
    const row = laneCounts[key] ?? 0;
    laneCounts[key] = row + 1;
    placed.push({ id: n.id, label: n.label, detail: n.detail, x: laneIndex * LANE_W + (LANE_W - NODE_W) / 2, y: TOP + row * ROW_H });
  }
  const rows = Math.max(1, ...Object.values(laneCounts));
  return { placed, height: TOP + rows * ROW_H + 10 };
}

export function ArchitectureDiagram({ project }: { project: Project }) {
  const { placed, height } = layoutArchitecture(project);
  const byId = Object.fromEntries(placed.map((p) => [p.id, p]));
  const usedLanes = new Set<ArchitectureLayer>(project.architecture.nodes.map((n) => (n.layer === "observability" ? "client" : n.layer)));

  return (
    <figure className="figure">
      <svg
        className="arch"
        viewBox={`0 0 ${LANES.length * LANE_W} ${height}`}
        role="img"
        aria-label={`Architecture of ${project.title}: ${project.architecture.edges
          .map((e) => `${byId[e.from]?.label} to ${byId[e.to]?.label}${e.label ? ` (${e.label})` : ""}`)
          .join("; ")}.`}
      >
        {LANES.map((lane, i) =>
          usedLanes.has(lane.layer) ? (
            <g key={lane.layer}>
              <rect className="boundary" x={i * LANE_W + 6} y={8} width={LANE_W - 12} height={height - 12} rx={4} />
              <text className="boundary-label" x={i * LANE_W + 16} y={28}>
                {lane.label}
              </text>
            </g>
          ) : null,
        )}
        {project.architecture.edges.map((e) => {
          const a = byId[e.from];
          const b = byId[e.to];
          if (!a || !b) return null;
          const forward = b.x >= a.x;
          const sameLane = a.x === b.x;
          const x1 = sameLane ? a.x + NODE_W / 2 : forward ? a.x + NODE_W : a.x;
          const y1 = sameLane ? a.y + NODE_H : a.y + NODE_H / 2;
          const x2 = sameLane ? b.x + NODE_W / 2 : forward ? b.x : b.x + NODE_W;
          const y2 = sameLane ? b.y : b.y + NODE_H / 2;
          const dx = sameLane ? 0 : (x2 - x1) * 0.45;
          const d = sameLane
            ? `M${x1},${y1} C${x1},${y1 + 14} ${x2},${y2 - 14} ${x2},${y2}`
            : `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
          return (
            <g key={`${e.from}-${e.to}`}>
              <path className="edge" d={d} />
              {e.label && (
                <text className="edge-label" x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {placed.map((n) => (
          <g key={n.id} className="node" transform={`translate(${n.x},${n.y})`}>
            <rect width={NODE_W} height={NODE_H} rx={2} />
            <text className="node-title" x={12} y={23}>
              {n.label}
            </text>
            {n.detail && (
              <text className="node-detail" x={12} y={40}>
                {n.detail}
              </text>
            )}
          </g>
        ))}
      </svg>
      <figcaption>Service boundaries and data flow — reconstructed from the stack; no confidential internals shown.</figcaption>
    </figure>
  );
}
