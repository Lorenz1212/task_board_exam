/**
 * Neo4j sync helpers — called from server actions after Prisma writes.
 * All functions are fire-and-forget: errors are logged but never thrown,
 * so a Neo4j outage can't break the main task board.
 */

import { neo4jDriver } from "@/app/lib/neo4j";

async function run(query: string, params: Record<string, unknown> = {}) {
  const session = neo4jDriver.session();
  try {
    await session.run(query, params);
  } finally {
    await session.close();
  }
}

// ── Boards ────────────────────────────────────────────────────────────────────

export function syncBoardCreated(id: number, name: string, color: string) {
  run(
    `MERGE (b:Board {id: $id}) SET b.name = $name, b.color = $color`,
    { id, name, color }
  ).catch(err => console.error("[neo4j] syncBoardCreated", err));
}

export function syncBoardUpdated(id: number, name?: string, color?: string) {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  if (name !== undefined)  { sets.push("b.name = $name");   params.name = name; }
  if (color !== undefined) { sets.push("b.color = $color"); params.color = color; }
  if (sets.length === 0) return;

  run(
    `MATCH (b:Board {id: $id}) SET ${sets.join(", ")}`,
    params
  ).catch(err => console.error("[neo4j] syncBoardUpdated", err));
}

export function syncBoardDeleted(id: number) {
  run(
    `MATCH (b:Board {id: $id}) DETACH DELETE b`,
    { id }
  ).catch(err => console.error("[neo4j] syncBoardDeleted", err));
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function syncTaskCreated(
  id: number,
  boardId: number,
  title: string,
  status: string,
  priority: string
) {
  run(
    `MERGE (t:Task {id: $id})
     SET t.title = $title, t.status = $status, t.priority = $priority
     WITH t
     MATCH (b:Board {id: $boardId})
     MERGE (b)-[:CONTAINS]->(t)`,
    { id, boardId, title, status, priority }
  ).catch(err => console.error("[neo4j] syncTaskCreated", err));
}

export function syncTaskUpdated(
  id: number,
  fields: { title?: string; status?: string; priority?: string }
) {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  if (fields.title    !== undefined) { sets.push("t.title = $title");       params.title    = fields.title; }
  if (fields.status   !== undefined) { sets.push("t.status = $status");     params.status   = fields.status; }
  if (fields.priority !== undefined) { sets.push("t.priority = $priority"); params.priority = fields.priority; }
  if (sets.length === 0) return;

  run(
    `MATCH (t:Task {id: $id}) SET ${sets.join(", ")}`,
    params
  ).catch(err => console.error("[neo4j] syncTaskUpdated", err));
}

export function syncTaskDeleted(id: number) {
  run(
    `MATCH (t:Task {id: $id}) DETACH DELETE t`,
    { id }
  ).catch(err => console.error("[neo4j] syncTaskDeleted", err));
}
