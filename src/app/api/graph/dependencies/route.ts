import { NextRequest, NextResponse } from "next/server";
import { neo4jDriver } from "@/app/lib/neo4j";

interface DependencyBody {
  fromTaskId: number;
  toTaskId: number;
}

// POST /api/graph/dependencies — add a DEPENDS_ON edge between two tasks
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: DependencyBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { fromTaskId, toTaskId } = body;

  if (!fromTaskId || !toTaskId || typeof fromTaskId !== "number" || typeof toTaskId !== "number") {
    return NextResponse.json(
      { error: "fromTaskId and toTaskId must be numbers." },
      { status: 400 }
    );
  }

  if (fromTaskId === toTaskId) {
    return NextResponse.json(
      { error: "A task cannot depend on itself." },
      { status: 400 }
    );
  }

  const session = neo4jDriver.session();

  try {
    const result = await session.run(
      `MATCH (a:Task {id: $from}), (b:Task {id: $to})
       MERGE (a)-[r:DEPENDS_ON]->(b)
       RETURN a.id AS fromId, b.id AS toId`,
      { from: fromTaskId, to: toTaskId }
    );

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: "One or both task nodes not found in the graph. Run the seed script first." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { type: "DEPENDS_ON", from: fromTaskId, to: toTaskId },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/graph/dependencies]", err);
    return NextResponse.json({ error: "Failed to create dependency." }, { status: 500 });
  } finally {
    await session.close();
  }
}

// DELETE /api/graph/dependencies — remove a DEPENDS_ON edge
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  let body: DependencyBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { fromTaskId, toTaskId } = body;

  if (!fromTaskId || !toTaskId || typeof fromTaskId !== "number" || typeof toTaskId !== "number") {
    return NextResponse.json(
      { error: "fromTaskId and toTaskId must be numbers." },
      { status: 400 }
    );
  }

  const session = neo4jDriver.session();

  try {
    await session.run(
      `MATCH (a:Task {id: $from})-[r:DEPENDS_ON]->(b:Task {id: $to})
       DELETE r`,
      { from: fromTaskId, to: toTaskId }
    );

    return NextResponse.json({ message: "Dependency removed." });
  } catch (err) {
    console.error("[DELETE /api/graph/dependencies]", err);
    return NextResponse.json({ error: "Failed to remove dependency." }, { status: 500 });
  } finally {
    await session.close();
  }
}
