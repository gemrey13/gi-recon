interface PartnerTitleProps {
  onAddPartner: () => void;
  onAddPartnerBatch: () => void;
  title: string;
}

const PartnerTitle = ({ onAddPartner, onAddPartnerBatch, title }: PartnerTitleProps) => {
  return (
    <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
      <div>
        <h1 className="title-header">{title} Reconciliation</h1>
        <p className="description-header">
          Sync your POS logs with {title} merchant reports to identify discrepancies.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onAddPartner} className="btn-primary bg-indigo-600 hover:bg-indigo-500">
          <span>+</span> Manual Entry
        </button>
        <button onClick={onAddPartnerBatch} className="btn-primary bg-green-600 hover:bg-green-500">
          <span>↑</span> Batch Import Records
        </button>
      </div>
    </div>
  );
};

export default PartnerTitle;
