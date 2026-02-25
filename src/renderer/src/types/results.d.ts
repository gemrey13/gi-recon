export type FilterState = {
  branch?: string;
  fromDate?: string;
  toDate?: string;
};

export type ReconcileGroup = {
  branch: string;
  date: string;
  status: MatchStatus;
  issueCount: number;
  matchRate: number;
  totalCount: number;
  exactCount: number;
  items: MatchResult[];
};

export type MatchItem = {
  pos?: PosTransaction;
  grab?: GrabTransaction;
  variance: number;
  status: MatchStatus;
};

export type MatchStatus = "exact_match" | "tolerance_match" | "discrepancy" | "unmatched";

export type PosTransaction = {
  id: number;
  branch: string;
  branch_name: string;
  cslipno: string;
  orddate: string;
  ordtime: string;
  cusno: string;
  cusname: string;
  grschrg: number;
  totchrg: number;
  balance: number;

  recon_status?: MatchStatus;
  recon_grab_id?: number;
  recon_variance?: number;
  recon_notes?: string;
  recon_at?: string;

  [key: string]: any; // keeps flexibility for other columns
};

export type GrabTransaction = {
  id: number;
  store_name: string;
  created_on: string;
  amount: number;
  total: number;
  short_order_id?: string;
  booking_id?: string;

  recon_status?: MatchStatus;
  recon_pos_id?: number;
  recon_variance?: number;
  recon_notes?: string;
  recon_at?: string;

  [key: string]: any;
};

export type ReconcileResponse = ReconcileGroup[];
