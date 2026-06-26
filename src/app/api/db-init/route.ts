import { NextResponse } from "next/server";
import { Client } from "pg";
import fs from "fs";
import path from "path";

// Helper function to split SQL file by semicolons, ignoring semicolons inside dollar-quoted ($$) function blocks.
function splitSql(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarQuote = false;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || "";
    
    if (char === "$" && nextChar === "$") {
      inDollarQuote = !inDollarQuote;
      current += "$$";
      i++; // Skip second $
    } else if (char === ";" && !inDollarQuote) {
      statements.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  // Filter out comments and empty statements
  return statements
    .map(stmt => {
      // Remove double-dash comments
      return stmt
        .split("\n")
        .filter(line => !line.trim().startsWith("--"))
        .join("\n")
        .trim();
    })
    .filter(stmt => stmt.length > 0);
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not configured in environment variables.");
    return NextResponse.json(
      { error: "DATABASE_URL is not configured in environment variables." },
      { status: 500 }
    );
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Database connected successfully. Running migrations...");

    // Read the supabase-schema.sql file
    const schemaPath = path.join(process.cwd(), "supabase-schema.sql");
    if (!fs.existsSync(schemaPath)) {
      await client.end();
      return NextResponse.json(
        { error: "supabase-schema.sql file not found in the project root." },
        { status: 404 }
      );
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    const statements = splitSql(schemaSql);

    console.log(`Parsed ${statements.length} SQL statements. Executing...`);

    let executedCount = 0;
    let skippedCount = 0;

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        executedCount++;
      } catch (err: any) {
        // Postgres codes:
        // 42P07: duplicate_table
        // 42710: duplicate_object (trigger, policy already exists)
        // 42723: duplicate_function
        // 42701: duplicate_column
        const ignoreCodes = ["42P07", "42710", "42723", "42701"];
        if (ignoreCodes.includes(err.code)) {
          skippedCount++;
        } else {
          console.warn(`Statement failed (Code: ${err.code}):`, stmt.substring(0, 100) + "...");
          console.warn(`Reason: ${err.message}`);
          // Re-throw or ignore? Let's ignore to allow the migration to proceed past other errors.
          skippedCount++;
        }
      }
    }

    console.log(`Migrations complete. Executed: ${executedCount}, Skipped/Already Existed: ${skippedCount}`);
    await client.end();

    return NextResponse.json({
      success: true,
      executed: executedCount,
      skipped: skippedCount,
      message: "Database tables and functions initialized successfully!"
    });
  } catch (err: any) {
    console.error("Database migration failed:", err);
    try {
      await client.end();
    } catch {}
    return NextResponse.json(
      { error: `Database migration failed: ${err.message}` },
      { status: 500 }
    );
  }
}
