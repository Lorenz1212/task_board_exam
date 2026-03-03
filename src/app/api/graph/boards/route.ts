import { NextResponse } from "next/server";
import { neo4jDriver } from "@/app/lib/neo4j";

export interface GraphNode {
  type: "Board" | "Task";
  id: number;
  name?: string;
  color?: string;
  title?: string;
  status?: string;
  priority?: string;
}

export interface GraphEdge {
  type: "CONTAINS" | "DEPENDS_ON";
  from: number;
  to: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function GET(): Promise<NextResponse<GraphData | { error: string }>> {
  const session = neo4jDriver.session();

  try {
    const result = await session.run(`
      MATCH (b:Board)
      OPTIONAL MATCH (b)-[:CONTAINS]->(t:Task)
      OPTIONAL MATCH (t)-[d:DEPENDS_ON]->(dep:Task)
      RETURN
        b,
        collect(distinct t)                              AS tasks,
        collect(distinct CASE WHEN dep IS NOT NULL
          THEN {from: t.id, to: dep.id} END)            AS deps
    `);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seenNodeIds = new Set<string>();

    for (const record of result.records) {
      const board = record.get("b").properties;
      const boardKey = `Board:${board.id}`;

      if (!seenNodeIds.has(boardKey)) {
        seenNodeIds.add(boardKey);
        nodes.push({
          type: "Board",
          id: board.id.toNumber ? board.id.toNumber() : board.id,
          name: board.name,
          color: board.color ?? "#6366f1",
        });
      }

      const tasks: Array<{ properties: Record<string, unknown> }> = record.get("tasks");
      for (const taskRecord of tasks) {
        if (!taskRecord) continue;
        const task = taskRecord.properties;
        const taskId = task.id && (task.id as { toNumber?: () => number }).toNumber
          ? (task.id as { toNumber: () => number }).toNumber()
          : (task.id as number);
        const taskKey = `Task:${taskId}`;

        if (!seenNodeIds.has(taskKey)) {
          seenNodeIds.add(taskKey);
          nodes.push({
            type: "Task",
            id: taskId,
            title: task.title as string,
            status: task.status as string,
            priority: task.priority as string,
          });
        }

        const boardId = board.id.toNumber ? board.id.toNumber() : board.id;
        edges.push({ type: "CONTAINS", from: boardId, to: taskId });
      }

      const deps: Array<{ from: unknown; to: unknown } | null> = record.get("deps");
      for (const dep of deps) {
        if (!dep || dep.from == null || dep.to == null) continue;
        const fromId = (dep.from as { toNumber?: () => number }).toNumber
          ? (dep.from as { toNumber: () => number }).toNumber()
          : (dep.from as number);
        const toId = (dep.to as { toNumber?: () => number }).toNumber
          ? (dep.to as { toNumber: () => number }).toNumber()
          : (dep.to as number);
        edges.push({ type: "DEPENDS_ON", from: fromId, to: toId });
      }
    }

    return NextResponse.json({ nodes, edges });
  } catch (err) {
    console.error("[GET /api/graph/boards]", err);
    return NextResponse.json({ error: "Failed to fetch graph data." }, { status: 500 });
  } finally {
    await session.close();
  }
}
