import { useState } from "react";
import toast from "react-hot-toast";

const TestingPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleRunRecon = async () => {
    setLoading(true);
    try {
      const data = await window.api.runGrabRecon();

      if (!data || data.length === 0) {
        toast.error("No reconciliation results found.");
        setResults([]);
        return;
      }

      setResults(data);
      console.log("Reconciliation Results:", data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRunRecon}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? "Running…" : "Start"}
      </button>
    </div>
  );
};

export default TestingPage;
