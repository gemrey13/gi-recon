import { useAppSound } from "@renderer/hooks/useAppSound";
import { PartnerType } from "@shared/recon.types";
import { AppConfiguration, BatchImportConfig, XlsxOptions } from "@shared/settings.types";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [config, setConfig] = useState<AppConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "PANDA" | "GRAB" | "pos">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showZipPassword, setShowZipPassword] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        // Accessing Electron IPC layer
        const data = await window.api.readConfig();
        setConfig(data);
      } catch (err) {
        console.error("Failed to load configuration:", err);
      }
    }
    loadConfig();
  }, []);

  const handleGeneralChange = (key: keyof AppConfiguration, value: any) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  const handlePartnerChange = (partner: PartnerType, key: keyof BatchImportConfig, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      partners: {
        ...config.partners,
        [partner]: {
          ...config.partners[partner],
          [key]: value,
        },
      },
    });
  };

  const handleNestedXlsxChange = (partner: PartnerType, key: keyof XlsxOptions, value: any) => {
    if (!config) return;
    const currentPartner = config.partners[partner] || {};
    setConfig({
      ...config,
      partners: {
        ...config.partners,
        [partner]: {
          ...currentPartner,
          xlsxOptions: {
            ...currentPartner.xlsxOptions,
            [key]: value,
          },
        },
      },
    });
  };

  const { playSound } = useAppSound();
  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await window.api.saveConfig(config);
      setSaveStatus("success");
      playSound("success");
      setTimeout(() => setSaveStatus("idle"), 3000); // Reset badge state after 3s
    } catch (err) {
      console.error("Failed to save configuration:", err);
      setSaveStatus("error");
      playSound("error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="title-header">Settings</h1>
          <p className="description-header">
            Configure your app behavior, directories, and data processing keys.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {saveStatus === "success" && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 text-xs font-medium">
              Changes Saved Successfully
            </span>
          )}
          {saveStatus === "error" && (
            <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100 text-xs font-medium">
              Error Saving Settings
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary bg-indigo-600 hover:bg-indigo-500">
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation */}
        <nav className="lg:col-span-3 flex flex-col gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("general")}
            className={`tab-button-setting ${
              activeTab === "general" ? "tab-active-setting" : "tab-idle-setting"
            }`}>
            General App Settings
          </button>
          <button
            onClick={() => setActiveTab("PANDA")}
            className={`tab-button-setting ${
              activeTab === "PANDA" ? "tab-active-setting" : "tab-idle-setting"
            }`}>
            Foodpanda (PANDA)
          </button>
          <button
            onClick={() => setActiveTab("GRAB")}
            className={`tab-button-setting ${
              activeTab === "GRAB" ? "tab-active-setting" : "tab-idle-setting"
            }`}>
            Grab (GRAB)
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className={`tab-button-setting ${
              activeTab === "pos" ? "tab-active-setting" : "tab-idle-setting"
            }`}>
            POS Settings
          </button>
        </nav>

        {/* Dynamic Panels */}
        <main className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* General View Panel */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                General App Settings
              </h2>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-col gap-1">
                  <label className="label-setting">Display Navigation Sidebar</label>
                  <span className="text-xs text-slate-500">
                    Keep the sidebar navigation open by default.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showSidebar}
                  onChange={(e) => handleGeneralChange("showSidebar", e.target.checked)}
                  className="w-5 h-5 rounded border border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                />
              </div>
            </div>
          )}

          {/* Partner Configurations View Panels */}
          {(activeTab === "PANDA" || activeTab === "GRAB") && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {activeTab === "PANDA" ? "Foodpanda Configuration" : "Grab Configuration"}
                </h2>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 text-[10px] font-bold uppercase tracking-widest">
                  {activeTab} Data Source
                </span>
              </div>

              {/* Input Form Group: Root Directory */}
              <div className="flex flex-col gap-2">
                <label className="label-setting">Root Folder Directory Path</label>
                <input
                  type="text"
                  value={config.partners[activeTab]?.rootFolder || ""}
                  onChange={(e) => handlePartnerChange(activeTab, "rootFolder", e.target.value)}
                  placeholder="e.g. C:\delivery-data"
                  className="button-setting"
                />
                <span className="text-xs text-slate-500">
                  Absolute storage track containing localized files for bulk parsing execution.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Form Group: Worksheet Name */}
                <div className="flex flex-col gap-2">
                  <label className="label-setting">Target Sheet Name</label>
                  <input
                    type="text"
                    value={config.partners[activeTab]?.sheetName || ""}
                    onChange={(e) => handlePartnerChange(activeTab, "sheetName", e.target.value)}
                    placeholder="Sheet1"
                    className="button-setting"
                  />
                  <span className="text-xs text-slate-500">
                    Specific spreadsheet tab targeted for workbook processing logic.
                  </span>
                </div>

                {/* Input Form Group: Skip Row Primary Key Identifier */}
                <div className="flex flex-col gap-2">
                  <label className="label-setting">Skip Rows Tracking Key</label>
                  <input
                    type="text"
                    value={config.partners[activeTab]?.skipKey || ""}
                    onChange={(e) => handlePartnerChange(activeTab, "skipKey", e.target.value)}
                    placeholder="Order ID"
                    className="button-setting"
                  />
                  <span className="text-xs text-slate-500">
                    Primary mapping identifier keyword to skip empty or meta-header rows.
                  </span>
                </div>
              </div>

              {/* Extended Optional parameters blocks - e.g. SheetJS cellDates option flag */}
              {config.partners[activeTab]?.xlsxOptions !== undefined && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Advanced Parser Engine Hooks
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <label className="label-setting">
                        Force Cell Dates Aggregation (`cellDates`)
                      </label>
                      <span className="text-xs text-slate-500">
                        Converts system raw timestamps directly into JavaScript native Date
                        instances.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!config.partners[activeTab]?.xlsxOptions?.cellDates}
                      onChange={(e) =>
                        handleNestedXlsxChange(activeTab, "cellDates", e.target.checked)
                      }
                      className="w-5 h-5 rounded border border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "pos" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                POS Settings
              </h2>

              <div className="flex flex-col gap-2">
                <label className="label-setting">Target Year</label>
                <input
                  type="number"
                  value={config.pos.year}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      pos: { ...config.pos, year: Number(e.target.value) },
                    })
                  }
                  placeholder="2026"
                  className="button-setting"
                />
                <span className="text-xs text-slate-500">
                  Only transactions from this year will be imported from POS backup files.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-setting">ZIP Password</label>
                <div className="relative">
                  <input
                    type={showZipPassword ? "text" : "password"}
                    value={config.pos.zipPassword}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        pos: { ...config.pos, zipPassword: e.target.value },
                      })
                    }
                    placeholder="Enter ZIP password"
                    className="button-setting pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowZipPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showZipPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  Password used to decrypt the branch backup ZIP files.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
