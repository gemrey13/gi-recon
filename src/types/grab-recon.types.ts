export interface GrabItem {
  id: string;
  booking_id: string;
  short_order_id: string;
  amount: number;
  created_on: string;
  store_name: string;
  is_batched: boolean;
  id_count: number;
  category?: string;
  status?: string;
}

export interface PosItem {
  id: string;
  cusno: string;
  cusname: string;
  orddate: string;
  branch_name: string;
  amount: number;
}

export interface MatchedItem {
  pos_id: string;
  grab_id: string;
  pos_amount: number;
  grab_amount: number;
  amount_diff: number;
  branch_name: string;
  orddate: string;
  status: string;
  match_level?: "AUTO" | "MANUAL_SINGLE" | "MANUAL_BATCH";
}

export interface ReconRange {
  branch: string;
  startDate: string;
  endDate: string;
}

export interface ReconData {
  matched: MatchedItem[];
  unmatchedPos: PosItem[];
  unmatchedGrab: GrabItem[];
  range: ReconRange;
}

export interface ReconDataPanda {
  matched: MatchedItem[];
  unmatchedPos: PosItem[];
  unmatchedPanda: GrabItem[];
  range: ReconRange;
}


export interface Branch {
  pos_code: string;
  pos_name: string;
  partner_name: string;
}
