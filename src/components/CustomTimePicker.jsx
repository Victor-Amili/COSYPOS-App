import { useState, useRef, useEffect } from "react";

// Robust array generation for explicit 09:00 through 21:00 hour blocks
const ALL_HOURS = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 9;
  return `${String(hour).padStart(2, "0")}:00`;
});

export default function CustomTimePicker({ label, value, onChange, disabledHours = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && <label className="text-white/60 text-xs mb-1.5 block">{label}</label>}
      
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between bg-[#2a2a2a] border rounded-xl px-4 py-3 text-sm transition
          ${open ? "border-brand/60" : "border-white/10 hover:border-white/20"}`}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={value ? "text-white" : "text-white/30"}>
            {value || "Select time"}
          </span>
        </div>
        <svg className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 grid grid-cols-3 gap-1 max-h-56 overflow-y-auto global-scrollbar">
            {ALL_HOURS.map((hour) => {
              // Ensure match verification works even if formatting references differ slightly
              const isDisabled = disabledHours.some(dh => dh?.trim() === hour);
              const isSelected = value?.trim() === hour;

              return (
                <button
                  key={hour}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(hour);
                      setOpen(false);
                    }
                  }}
                  className={`py-2 rounded-lg text-xs font-medium transition relative
                    ${isSelected 
                      ? "bg-brand text-gray-800 font-semibold" 
                      : isDisabled 
                        ? "bg-white/5 text-white/20 cursor-not-allowed" 
                        : "text-white hover:bg-white/10"
                    }`}
                >
                  {hour}
                  {isDisabled && !isSelected && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-400/60" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="px-3 pb-2 pt-1 border-t border-white/5 bg-[#161616]">
            <p className="text-white/30 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 inline-block" /> Unavailable
            </p>
          </div>
        </div>
      )}
    </div>
  );
}