const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}
const supabase = require('./supabaseClient');

// No‑op exec – kept for compatibility with the original SQLite init script
function exec(sql) {
  // The original SQLite file created tables; with Supabase we manage schema via SQL editor.
  // This function intentionally does nothing.
  return;
}

// Helper to map a single row result
function mapSingle(response) {
  if (response.error) {
    console.error('Supabase error:', response.error);
    return undefined;
  }
  return response.data?.[0];
}

// Helper to map an array result
function mapArray(response) {
  if (response.error) {
    console.error('Supabase error:', response.error);
    return [];
  }
  return response.data ?? [];
}

// Very small query parser – supports the patterns used in the codebase.
function prepare(sql) {
  const trimmed = sql.trim().toLowerCase();

  // SELECT … FROM table WHERE column = ?
  if (trimmed.startsWith('select')) {
    const match = /select\s+(.+)\s+from\s+(\w+)\s+where\s+(\w+)\s*=\s*\?/.exec(sql);
    if (!match) throw new Error('Unsupported SELECT pattern: ' + sql);
    const [, fields, table, column] = match;
    const fieldList = fields.trim() === '*' ? '*' : fields.split(',').map(f => f.trim());
    return {
      get: async (value) => {
        const { data, error } = await supabase
          .from(table)
          .select(fieldList.join(','))
          .eq(column, value)
          .single();
        if (error) console.error(error);
        return data;
      },
      all: async (value) => {
        const { data, error } = await supabase
          .from(table)
          .select(fieldList.join(','))
          .eq(column, value);
        if (error) console.error(error);
        return data ?? [];
      },
    };
  }

  if (trimmed.startsWith('insert')) {
    const match = /insert\s+into\s+(\w+)\s*\(([^)]+)\)\s+values\s*\(([^)]+)\)/i.exec(sql);
    if (!match) throw new Error('Unsupported INSERT pattern: ' + sql);
    const [, table, cols] = match;
    const columns = cols.split(',').map(c => c.trim());
    return {
      run: async (...values) => {
        const row = {};
        columns.forEach((col, idx) => (row[col] = values[idx]));
        const { data, error } = await supabase.from(table).insert(row).select().single();
        if (error) console.error(error);
        return data;
      },
    };
  }

  // UPDATE table SET col1 = ?, col2 = ? WHERE id = ?
  if (trimmed.startsWith('update')) {
    const match = /update\s+(\w+)\s+set\s+([^ ]+)\s+where\s+(\w+)\s*=\s*\?/.exec(sql);
    if (!match) throw new Error('Unsupported UPDATE pattern: ' + sql);
    const [, table, setPart, whereCol] = match;
    const setCols = setPart.split(',').map(s => s.split('=')[0].trim());
    return {
      run: async (...values) => {
        const whereVal = values[values.length - 1];
        const setVals = values.slice(0, -1);
        const updates = {};
        setCols.forEach((c, i) => (updates[c] = setVals[i]));
        const { data, error } = await supabase.from(table).update(updates).eq(whereCol, whereVal);
        if (error) console.error(error);
        return data;
      },
    };
  }

  // DELETE FROM table WHERE id = ?
  if (trimmed.startsWith('delete')) {
    const match = /delete\s+from\s+(\w+)\s+where\s+(\w+)\s*=\s*\?/.exec(sql);
    if (!match) throw new Error('Unsupported DELETE pattern: ' + sql);
    const [, table, col] = match;
    return {
      run: async (value) => {
        const { data, error } = await supabase.from(table).delete().eq(col, value);
        if (error) console.error(error);
        return data;
      },
    };
  }

  throw new Error('Unsupported SQL statement: ' + sql);
}

module.exports = { exec, prepare };
