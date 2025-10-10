import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../database.sqlite');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function convertParams(sql, params = []) {
  let index = 0;
  const convertedSql = sql.replace(/\$\d+/g, () => {
    index++;
    return '?';
  });
  return { sql: convertedSql, params };
}

export const pool = {
  query: function(sql, params = []) {
    const { sql: convertedSql, params: convertedParams } = convertParams(sql, params);
    
    const upperSql = sql.trim().toUpperCase();
    const stmt = db.prepare(convertedSql);
    
    if (upperSql.startsWith('SELECT')) {
      const rows = stmt.all(...convertedParams);
      return Promise.resolve({ rows });
    } 
    else if (upperSql.startsWith('DELETE') && sql.includes('RETURNING')) {
      const returningMatch = sql.match(/RETURNING\s+(.+?)(?:;|$)/i);
      const tableName = sql.match(/DELETE\s+FROM\s+(\w+)/i)[1];
      const whereMatch = sql.match(/WHERE\s+(.+?)\s+RETURNING/i);
      
      if (returningMatch && whereMatch) {
        const wherePart = whereMatch[1];
        const { sql: selectWhereSql, params: selectParams } = convertParams(wherePart, params.slice(-wherePart.split('$').length + 1));
        const selectSql = `SELECT ${returningMatch[1]} FROM ${tableName} WHERE ${selectWhereSql}`;
        const rowsToDelete = db.prepare(selectSql).all(...selectParams);
        
        stmt.run(...convertedParams);
        
        return Promise.resolve({ rows: rowsToDelete });
      }
      
      stmt.run(...convertedParams);
      return Promise.resolve({ rows: [] });
    }
    else if (upperSql.startsWith('UPDATE') && sql.includes('RETURNING')) {
      const info = stmt.run(...convertedParams);
      
      const returningMatch = sql.match(/RETURNING\s+(.+?)(?:;|$)/i);
      if (returningMatch && info.changes > 0) {
        const tableName = sql.match(/UPDATE\s+(\w+)/i)[1];
        const whereMatch = sql.match(/WHERE\s+(.+?)\s+RETURNING/i);
        
        if (whereMatch) {
          const wherePart = whereMatch[1];
          const { sql: selectWhereSql, params: selectParams } = convertParams(wherePart, params.slice(-wherePart.split('$').length + 1));
          const selectSql = `SELECT ${returningMatch[1]} FROM ${tableName} WHERE ${selectWhereSql}`;
          const result = db.prepare(selectSql).get(...selectParams);
          return Promise.resolve({ rows: result ? [result] : [] });
        }
      }
      return Promise.resolve({ rows: [] });
    }
    else if (upperSql.startsWith('INSERT') && sql.includes('RETURNING')) {
      const info = stmt.run(...convertedParams);
      const lastId = info.lastInsertRowid;
      
      const returningMatch = sql.match(/RETURNING\s+(.+?)(?:;|$)/i);
      if (returningMatch) {
        const selectSql = `SELECT ${returningMatch[1]} FROM ${sql.match(/INSERT\s+INTO\s+(\w+)/i)[1]} WHERE id = ?`;
        const result = db.prepare(selectSql).get(lastId);
        return Promise.resolve({ rows: [result] });
      }
      return Promise.resolve({ rows: [] });
    } 
    else {
      const info = stmt.run(...convertedParams);
      return Promise.resolve({ rows: [], rowCount: info.changes });
    }
  }
};

export default db;
