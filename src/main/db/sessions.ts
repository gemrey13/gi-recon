import { Database } from "better-sqlite3";
import { convertToMDY } from "./utils";

type TCreateSessionData = {
  partner: string;
  branch_name: string;
  start_date: string;
  end_date: string;
};

export function createSession(
  db: Database,
  data: TCreateSessionData,
): number {
  const stmt = db.prepare(`
    INSERT INTO sessions (
      partner,
      branch_name,
      start_date,
      end_date
    )
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(data.partner, data.branch_name, data.start_date, data.end_date);

  return Number(result.lastInsertRowid);
}

export function applyMatches(db: Database, matches: any[]) {
  const updatePOS = db.prepare(`
    UPDATE pos_transactions
    SET recon_status = ?, linked_grab_id = ?
    WHERE id = ?
  `);

  const updateGrab = db.prepare(`
    UPDATE grab_transactions
    SET recon_status = ?, linked_pos_id = ?, variance = ?
    WHERE id = ?
  `);

  const tx = db.transaction(() => {
    for (const m of matches) {
      updatePOS.run(m.status, m.grabId, m.posId);
      updateGrab.run(m.status, m.posId, m.variance, m.grabId);
    }
  });

  tx();
}

export function updateSessionSummary(db: Database, sessionId: number) {
  db.exec(`
    UPDATE sessions
    SET
      total_pos_amt = (
        SELECT SUM(grschrg)
        FROM pos_transactions
        WHERE session_id = ${sessionId}
      ),
      total_partner_amt = (
        SELECT SUM(amount)
        FROM grab_transactions
        WHERE session_id = ${sessionId}
      ),
      total_net_payout = (
        SELECT SUM(total)
        FROM grab_transactions
        WHERE session_id = ${sessionId}
      ),
      issue_count = (
        SELECT COUNT(*)
        FROM grab_transactions
        WHERE session_id = ${sessionId}
          AND recon_status IN ('discrepancy', 'id_mismatch', 'unreconciled')
      ),
      status = 'Completed'
    WHERE id = ${sessionId}
  `);
}

export interface FetchSessionFilters {
  searchQuery?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface SessionRow {
  id: number;
  branch: string;
  date: string;
  displayDate: string;
  total: number;
  issues: number;
  status: string;
}

/**
 * Fetch sessions from the database with optional filtering
 */
export function fetchSessions(db: Database, filters: FetchSessionFilters = {}): SessionRow[] {
  const { searchQuery, startDate, endDate } = filters;

  let startDateFilter = startDate;
  let endDateFilter = endDate;

  if (startDateFilter) startDateFilter = convertToMDY(startDateFilter);
  if (endDateFilter) endDateFilter = convertToMDY(endDateFilter);

  let sql = `SELECT *
             FROM sessions
             WHERE 1=1`;
  const params: any[] = [];

  if (searchQuery) {
    // Search either session ID or branch name
    sql += ` AND (id LIKE ? OR LOWER(branch_name) LIKE ?)`;
    const q = `%${searchQuery.toLowerCase()}%`;
    params.push(q, q);
  }

  // Date range filter
  if (startDate || endDate) {
    sql += ` AND (
      strftime('%Y-%m-%d', substr(start_date,7,4) || '-' || substr(start_date,1,2) || '-' || substr(start_date,4,2))
      BETWEEN ? AND ?
    )`;
    const from = startDate || "1900-01-01";
    const to = endDate || "2100-12-31";
    params.push(from, to);
  }

  sql += ` ORDER BY start_date DESC, id DESC`;

  const rows = db.prepare(sql).all(...params);

  return rows.map((row: any) => ({
    id: row.id,
    branch: row.branch_name,
    date: row.start_date,
    displayDate: row.start_date
      ? new Date(row.start_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    total: row.total_net_payout || 0, // Use total_net_payout as total
    total_pos: row.total_pos_amt || 0,
    total_grab: row.total_partner_amt || 0,
    issues: row.issue_count || 0,
    status: row.status || "Pending",
  }));
}
