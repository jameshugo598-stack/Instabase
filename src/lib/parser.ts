export type Column = { name: string; type: string };

export type Table = {
  name: string;
  columns: Column[];
};

export function parseD2(input: string): Table[] {
  const tables: Table[] = [];
  const tableRegex = /(\w+)\s*:\s*\{([^}]+)\}/g;
  let match;

  while ((match = tableRegex.exec(input)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const lines = body.split(/(?:\n|;)/).map((l) => l.trim()).filter((l) => l.length > 0);

    let isSqlTable = false;
    const columns: Column[] = [];

    for (const line of lines) {
      const parts = line.split(':').map((s) => s.trim());
      if (parts.length >= 2) {
        const key = parts[0];
        const value = parts.slice(1).join(':').trim();
        
        if (key === 'shape' && value === 'sql_table') {
          isSqlTable = true;
        } else if (key && value) {
          columns.push({ name: key, type: value });
        }
      }
    }

    if (isSqlTable) {
      tables.push({
        name: tableName,
        columns,
      });
    }
  }

  return tables;
}

export function generateSql(tables: Table[], vectorSearchTables: Record<string, boolean>): string {
  if (tables.length === 0) return '-- No valid tables found.\n-- Use shape: sql_table';

  return tables
    .map((t) => {
      const cols = t.columns.map((c) => `  ${c.name} ${c.type.toUpperCase()}`);
      if (vectorSearchTables[t.name]) {
        cols.push(`  embedding F32_BLOB(768)`);
      }
      return `CREATE TABLE ${t.name} (\n${cols.join(',\n')}\n);`;
    })
    .join('\n\n');
}
