import { PartnerType, ReconRange, ReconResults } from "../types";
import { getDb } from "../utils";
import { insertSystemLog } from "./logService";


// ─── Config per partner ───────────────────────────────────────────────────────

const PARTNER_CONFIG = {
  GRAB: {
    module: "GRAB_SERVICE",
    posFilter: "%GRAB%",
    partnerTable: "grab_transactions",
    partnerDateCol: "created_on",
    partnerAmountCol: "amount",
    partnerNameCol: "store_name",
    mappingCol: "grab_name",
    extraPartnerCols: ", g.status, g.booking_id, g.category, g.short_order_id",
    extraPartnerWhere: `AND g.status IN ('Cancelled', 'Completed', 'Transferred')`,
    extraPartnerOrder: `g.category DESC, `,
    matchExtraWhere: `AND g.category IN ('Adjustment', 'Payment')
          AND g.status IN ('Completed', 'Transferred', 'Cancelled')`,
  },
  PANDA: {
    module: "PANDA_SERVICE",
    posFilter: "%PANDA%",
    partnerTable: "foodpanda_transactions",
    partnerDateCol: "order_date",
    partnerAmountCol: "gross_food_value",
    partnerNameCol: "partner_name",
    mappingCol: "foodpanda_name",
    extraPartnerCols: ", f.order_code",
    extraPartnerWhere: "",
    extraPartnerOrder: "",
    matchExtraWhere: "",
  },
} as const;

// ─── Run ──────────────────────────────────────────────────────────────────────

export const runReconciliation = (
  partnerType: PartnerType,
  startDate: string,
  endDate?: string,
  branchName?: string,
) => {
  const finalEndDate = endDate || startDate;
  const isAllBranches = !branchName || branchName === "ALL";
  const cfg = PARTNER_CONFIG[partnerType];
  const alias = partnerType === "GRAB" ? "g" : "f";

  try {
    const db = getDb();

    // ── POS entries ──────────────────────────────────────────────────────────
    let posSql = `
      SELECT id, branch_name, orddate, grschrg as amount, cusname, cusno
      FROM pos_transactions
      WHERE (orddate BETWEEN ? AND ?) AND cusname LIKE ?
    `;
    const posParams: any[] = [startDate, finalEndDate, cfg.posFilter];
    if (!isAllBranches) {
      posSql += ` AND branch_name = ?`;
      posParams.push(branchName);
    }
    const posEntries = db.prepare(posSql).all(...posParams) as any[];

    // ── Partner entries ──────────────────────────────────────────────────────
    let partnerSql = `
      SELECT ${alias}.id, ${alias}.${cfg.partnerNameCol}, ${alias}.${cfg.partnerDateCol},
             ${alias}.${cfg.partnerAmountCol}${cfg.extraPartnerCols}
      FROM ${cfg.partnerTable} ${alias}
    `;
    if (!isAllBranches) {
      partnerSql += `
        JOIN branch_mapping m ON ${alias}.${cfg.partnerNameCol} = m.${cfg.mappingCol}
        WHERE (date(${alias}.${cfg.partnerDateCol}) BETWEEN ? AND ?) AND m.pos_name = ?
      `;
    } else {
      partnerSql += ` WHERE (date(${alias}.${cfg.partnerDateCol}) BETWEEN ? AND ?)`;
    }
    if (cfg.extraPartnerWhere) partnerSql += ` ${cfg.extraPartnerWhere}`;
    partnerSql += ` ORDER BY ${cfg.extraPartnerOrder}${alias}.${cfg.partnerDateCol} DESC, ${alias}.${cfg.partnerNameCol} DESC`;

    const partnerParams = isAllBranches
      ? [startDate, finalEndDate]
      : [startDate, finalEndDate, branchName];
    const partnerEntries = db.prepare(partnerSql).all(...partnerParams) as any[];

    // ── Match query ──────────────────────────────────────────────────────────
    let matchQuery = `
      SELECT
        p.id AS pos_id,
        ${alias}.id AS partner_id,
        p.grschrg AS pos_amount,
        ${alias}.${cfg.partnerAmountCol} AS partner_amount,
        (p.grschrg - ${alias}.${cfg.partnerAmountCol}) AS amount_diff,
        p.branch_name,
        p.orddate
      FROM ${cfg.partnerTable} ${alias}
      JOIN branch_mapping m ON ${alias}.${cfg.partnerNameCol} = m.${cfg.mappingCol}
      JOIN pos_transactions p ON p.branch_name = m.pos_name
      WHERE p.orddate = date(${alias}.${cfg.partnerDateCol})
        AND (p.orddate BETWEEN ? AND ?)
        AND abs(p.grschrg - ${alias}.${cfg.partnerAmountCol}) <= 0.05
        AND p.cusname LIKE ?
        ${cfg.matchExtraWhere}
    `;
    if (!isAllBranches) matchQuery += ` AND p.branch_name = ?`;

    const matchParams = isAllBranches
      ? [startDate, finalEndDate, cfg.posFilter]
      : [startDate, finalEndDate, cfg.posFilter, branchName];
    const rawMatches = db.prepare(matchQuery).all(...matchParams) as any[];

    // ── Deduplicate matches ──────────────────────────────────────────────────
    const finalizedMatches: any[] = [];
    const usedPosIds = new Set<number>();
    const usedPartnerIds = new Set<number>();

    for (const match of rawMatches) {
      if (!usedPosIds.has(match.pos_id) && !usedPartnerIds.has(match.partner_id)) {
        finalizedMatches.push(match);
        usedPosIds.add(match.pos_id);
        usedPartnerIds.add(match.partner_id);
      }
    }

    const unmatchedPos = posEntries.filter((p) => !usedPosIds.has(p.id));
    const unmatchedPartner = partnerEntries.filter((r) => !usedPartnerIds.has(r.id));

    insertSystemLog({
      level: "INFO",
      module: cfg.module,
      action: "RECON_RUN",
      message: "Reconciliation triggered",
      description: `Period: ${startDate} to ${finalEndDate}`,
      user_name: "System",
    });

    return {
      matched: finalizedMatches,
      unmatchedPos,
      unmatchedPartner,
      range: { startDate, endDate: finalEndDate, branch: branchName || "ALL" },
    };
  } catch (error: any) {
    console.error(`Database Error in reconService [${partnerType}]:`, error);
    insertSystemLog({
      level: "ERROR",
      module: cfg.module,
      action: "API_ERROR",
      message: `Failed to run ${partnerType} recon`,
      description: error.message,
    });
    throw error;
  }
};

// ─── Save ─────────────────────────────────────────────────────────────────────

export const saveReconciliationResults = (
  partnerType: PartnerType,
  range: ReconRange,
  results: ReconResults,
) => {
  const db = getDb();
  const cfg = PARTNER_CONFIG[partnerType];
  const { matched, unmatchedPos, unmatchedPartner } = results;
  const { startDate, endDate, branch } = range;
  const isAll = branch === "ALL";

  const deleteSql = `
    DELETE FROM recon_results
    WHERE partner_type = ?
      AND (
        pos_id IN (
          SELECT id FROM pos_transactions
          WHERE (orddate BETWEEN ? AND ?)
          ${isAll ? "" : "AND branch_name = ?"}
        )
        OR
        partner_id IN (
          SELECT ${isAll ? "id" : `${partnerType === "GRAB" ? "g" : "f"}.id`}
          FROM ${cfg.partnerTable} ${isAll ? "" : `${partnerType === "GRAB" ? "g" : "f"}`}
          ${isAll ? "" : `JOIN branch_mapping m ON ${partnerType === "GRAB" ? "g" : "f"}.${cfg.partnerNameCol} = m.${cfg.mappingCol}`}
          WHERE (date(${isAll ? cfg.partnerDateCol : `${partnerType === "GRAB" ? "g" : "f"}.${cfg.partnerDateCol}`}) BETWEEN ? AND ?)
          ${isAll ? "" : "AND m.pos_name = ?"}
        )
      )
  `;
  const deleteParams = isAll
    ? [partnerType, startDate, endDate, startDate, endDate]
    : [partnerType, startDate, endDate, branch, startDate, endDate, branch];

  const insertStmt = db.prepare(`
    INSERT INTO recon_results (pos_id, partner_id, partner_type, match_level, recon_status, amount_difference)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    db.prepare(deleteSql).run(...deleteParams);

    for (const m of matched) {
      const matchLevel =
        m.match_level ?? (Math.abs(m.amount_diff ?? 0) < 0.001 ? "EXACT" : "TOLERANCE");
      insertStmt.run(
        m.pos_id,
        m.partner_id,
        partnerType,
        matchLevel,
        "MATCHED",
        m.amount_diff ?? 0,
      );
    }
    for (const p of unmatchedPos) {
      insertStmt.run(p.id, null, partnerType, "NONE", "UNMATCHED", p.amount);
    }
    for (const r of unmatchedPartner) {
      const amount = partnerType === "PANDA" ? (r.gross_food_value ?? 0) : (r.amount ?? 0);
      insertStmt.run(null, r.id, partnerType, "NONE", "UNMATCHED", amount);
    }
  });

  try {
    transaction();

    insertSystemLog({
      level: "INFO",
      module: cfg.module,
      action: "RECON_SAVE",
      message: `Reconciliation finalized for ${branch}`,
      description: `Period: ${startDate} to ${endDate}. Matched: ${matched.length}, Unmatched POS: ${unmatchedPos.length}, Unmatched Partner: ${unmatchedPartner.length}`,
      user_name: "System",
    });

    return {
      success: true,
      message: `Reconciliation for ${branch} finalized (${startDate} to ${endDate}).`,
    };
  } catch (error: any) {
    console.error(`Save Error in reconService [${partnerType}]:`, error);
    insertSystemLog({
      level: "ERROR",
      module: cfg.module,
      action: "RECON_SAVE",
      message: `Failed to finalize reconciliation for ${branch}`,
      description: error.message ?? "Unknown database error during transaction",
      user_name: "System",
    });
    throw error;
  }
};
