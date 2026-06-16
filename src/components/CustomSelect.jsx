import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ label, value, onChange, options = [], placeholder = "Select", disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div className="relative" ref={ref}>
      {label && <label className="text-white/60 text-xs mb-1.5 block">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center justify-between bg-[#2a2a2a] border rounded-xl px-4 py-3 text-sm transition
          ${open ? "border-brand/60" : "border-white/10 hover:border-white/20"}
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={selected ? "text-white" : "text-white/30"}>{selected ? selected.label : placeholder}</span>
        <svg className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between
                  ${String(opt.value) === String(value) ? "bg-brand/20 text-brand" : "text-white hover:bg-white/5"}`}
              >
                {opt.label}
                {String(opt.value) === String(value) && (
                  <svg className="w-4 h-4 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
