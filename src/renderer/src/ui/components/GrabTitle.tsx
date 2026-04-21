import { useState } from "react";
import toast from "react-hot-toast";

interface GrabTitleProps {
  onAddGrab: () => void;
}

const GrabTitle = ({ onAddGrab }: GrabTitleProps) => {
  const [loading, setLoading] = useState(false);

  const handleStartGrabImport = async () => {
    setLoading(true);
    try {
      const result = await window.api.startImportGrab();
      if (result.totalInserted === 0) {
        toast.error(`${result.message}`);
      } else {
        toast.success(`Inserted: ${result.message}`);
      }
    } catch (err: any) {
      toast.error(`Error ❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">GrabFood Overview</h1>
        <p className="text-slate-500 font-medium mt-1">
          Select a record to view transactions or add a new grab record.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAddGrab}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer">
          <span>+</span> Add Grab Record
        </button>
        <button
          onClick={handleStartGrabImport}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer">
          <span>+</span> Import Grab Folder
        </button>
      </div>
    </div>
  );
};

export default GrabTitle;
