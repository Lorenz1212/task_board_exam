import neo4j, { Driver } from "neo4j-driver";

function createDriver(): Driver {
  return neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
  );
}

const globalForNeo4j = globalThis as unknown as { neo4j: Driver | undefined };

export const neo4jDriver = globalForNeo4j.neo4j ?? createDriver();

if (process.env.NODE_ENV !== "production") globalForNeo4j.neo4j = neo4jDriver;
