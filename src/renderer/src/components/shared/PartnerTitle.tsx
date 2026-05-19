interface PartnerTitleProps {
  onAddPartner: () => void;
  onAddPartnerBatch: () => void;
  title: string;
}

const PartnerTitle = ({ onAddPartner, onAddPartnerBatch, title }: PartnerTitleProps) => {
  return (
    <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {title} Reconciliation
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Sync your POS logs with {title} merchant reports to identify discrepancies.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAddPartner}
          className="btn-primary bg-indigo-600 hover:bg-indigo-500">
          <span>+</span> Manual Entry
        </button>
        <button
          onClick={onAddPartnerBatch}
          className="btn-primary bg-green-600 hover:bg-green-500">
          <span>↑</span> Batch Import Records
        </button>
      </div>
    </div>
  );
};

export default PartnerTitle;
