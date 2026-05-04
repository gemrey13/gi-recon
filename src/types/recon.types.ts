export type PartnerType = "GRAB" | "PANDA" | "ALL";
export type MatchLevel = "EXACT" | "TOLERANCE" | "NONE" | "MANUAL_SINGLE" | "MANUAL_BATCH" | "MANUAL_TOLERANCE";
export type ReconStatus = "MATCHED" | "UNMATCHED";

// ─── POS ─────────────────────────────────────────────────────────────────────

export interface PosTransaction {
  id: number;
  branch_name: string;
  orddate: string;
  amount: number;
  cusname: string;
  cusno: string;
}

// ─── Partner Transactions ─────────────────────────────────────────────────────

export interface UnmatchedPandaTransaction {
  id: number;
  partner_name: string;
  order_date: string; // 'YYYY-MM-DD'
  gross_food_value: number;
  order_code: string;
}

export interface UnmatchedGrabTransaction {
  id: number;
  store_name: string;
  created_on: string; // 'YYYY-MM-DD HH:mm:ss'
  amount: number;
  status: GrabStatus;
  booking_id: string;
  category: GrabCategory;
  short_order_id: string;
  // computed in service
  is_batched?: boolean;
  id_count?: number;
}

export type GrabStatus = "Completed" | "Cancelled" | "Transferred";
export type GrabCategory = "Payment" | "Adjustment";

// ─── Matched ──────────────────────────────────────────────────────────────────

export interface MatchedTransaction {
  pos_id: number;
  partner_id: number;
  pos_amount: number;
  partner_amount: number;
  amount_diff: number;
  branch_name: string;
  orddate: string; // 'YYYY-MM-DD'
  match_level?: MatchLevel;
  // grab-only fields (present when partnerType === 'GRAB')
  status?: GrabStatus;
}

// ─── Range ────────────────────────────────────────────────────────────────────

export interface ReconRange {
  startDate: string;
  endDate: string;
  branch: string;
}

// ─── Top-level ReconData ──────────────────────────────────────────────────────

export type UnmatchedPartnerTransaction = UnmatchedGrabTransaction | UnmatchedPandaTransaction;

export interface ReconData {
  matched: MatchedTransaction[];
  unmatchedPos: PosTransaction[];
  unmatchedPartner: UnmatchedPartnerTransaction[];
  range: ReconRange;
}

// ─── Helpers (narrow unmatchedPartner by partner type) ────────────────────────

export interface GrabReconData extends ReconData {
  unmatchedPartner: UnmatchedGrabTransaction[];
}

export interface PandaReconData extends ReconData {
  unmatchedPartner: UnmatchedPandaTransaction[];
}
// ─── Save response ────────────────────────────────────────────────────────────

export interface ReconSaveResponse {
  success: boolean;
  message: string;
}

// ─── Branch ────────────────────────────────────────────────────────────

export interface Branch {
  pos_code: string;
  pos_name: string;
  partner_name: string;
  grab_name?: string;
  foodpanda_name?: string;
}