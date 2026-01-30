import { Database } from "better-sqlite3";

export function createSession(
  db: Database,
  data: {
    partner: string;
    branch_name: string;
    start_date: string;
    end_date: string;
  }
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

  const result = stmt.run(
    data.partner,
    data.branch_name,
    data.start_date,
    data.end_date
  );

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

export function updateSessionSummary(
  db: Database,
  sessionId: number
) {
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
      issue_count = (
        SELECT COUNT(*)
        FROM grab_transactions
        WHERE session_id = ${sessionId}
          AND recon_status = 'discrepancy'
      ),
      status = 'Completed'
    WHERE id = ${sessionId}
  `);
}
