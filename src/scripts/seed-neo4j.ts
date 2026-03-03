/**
 * Neo4j Seed Script
 *
 * Reads all boards and tasks from PostgreSQL via Prisma, then upserts them
 * into Neo4j as nodes and creates CONTAINS relationships.
 *
 * Run after starting the Neo4j container:
 *   npx tsx src/scripts/seed-neo4j.ts
 */

import dotenv from "dotenv";
dotenv.config();

import neo4j from "neo4j-driver";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ── Prisma ────────────────────────────────────────────────────────────────────
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── Neo4j ─────────────────────────────────────────────────────────────────────
const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

async function seed() {
  console.log("Fetching data from PostgreSQL...");

  const boards = await prisma.board.findMany({ include: { tasks: true } });

  if (boards.length === 0) {
    console.log("No boards found in PostgreSQL. Create some boards first, then re-run this script.");
    return;
  }

  console.log(`Found ${boards.length} board(s) with a total of ${boards.flatMap(b => b.tasks).length} task(s).`);

  const session = driver.session();

  try {
    console.log("Syncing to Neo4j...");

    for (const board of boards) {
      // Upsert Board node
      await session.run(
        `MERGE (b:Board {id: $id})
         SET b.name  = $name,
             b.color = $color`,
        { id: board.id, name: board.name, color: board.color ?? "#6366f1" }
      );

      for (const task of board.tasks) {
        // Upsert Task node
        await session.run(
          `MERGE (t:Task {id: $id})
           SET t.title    = $title,
               t.status   = $status,
               t.priority = $priority`,
          {
            id: task.id,
            title: task.title,
            status: task.status,
            priority: task.priority,
          }
        );

        // Create CONTAINS relationship
        await session.run(
          `MATCH (b:Board {id: $boardId}), (t:Task {id: $taskId})
           MERGE (b)-[:CONTAINS]->(t)`,
          { boardId: board.id, taskId: task.id }
        );
      }

      console.log(`  ✓ Board "${board.name}" (${board.tasks.length} tasks)`);
    }

    // ── Sample DEPENDS_ON relationships ──────────────────────────────────────
    const allTasks = boards.flatMap(b => b.tasks);

    if (allTasks.length >= 2) {
      console.log("\nCreating sample DEPENDS_ON relationships...");

      // task[1] depends on task[0]
      await session.run(
        `MATCH (a:Task {id: $from}), (b:Task {id: $to})
         MERGE (a)-[:DEPENDS_ON]->(b)`,
        { from: allTasks[1].id, to: allTasks[0].id }
      );
      console.log(`  ✓ Task "${allTasks[1].title}" DEPENDS_ON "${allTasks[0].title}"`);
    }

    if (allTasks.length >= 3) {
      // task[2] depends on task[1]
      await session.run(
        `MATCH (a:Task {id: $from}), (b:Task {id: $to})
         MERGE (a)-[:DEPENDS_ON]->(b)`,
        { from: allTasks[2].id, to: allTasks[1].id }
      );
      console.log(`  ✓ Task "${allTasks[2].title}" DEPENDS_ON "${allTasks[1].title}"`);
    }

    console.log("\nNeo4j seed complete.");
    console.log("Open the Neo4j Browser at http://localhost:7474 and run:");
    console.log("  MATCH (n) RETURN n");
  } finally {
    await session.close();
  }
}

seed()
  .catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await driver.close();
  });
