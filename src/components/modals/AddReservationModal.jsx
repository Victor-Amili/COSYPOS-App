import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";
import CustomSelect from "../CustomSelect";
import CustomTimePicker from "../CustomTimePicker";

const FLOOR_TABLES = {
  "1st Floor": ["Bar", "A1", "A2", "B1", "B2", "B3", "C1", "C2"],
  "2nd Floor": ["D1", "D2", "D3", "E1", "E2", "F1", "F2"],
  "3rd Floor": ["G1", "G2", "H1", "H2", "H3"],
};
const FLOORS = ["1st Floor", "2nd Floor", "3rd Floor"];
const STATUS_OPTIONS = ["Confirmed", "Pending", "Cancelled"].map((s) => ({ value: s, label: s }));
const TITLE_OPTIONS = ["Mr", "Mrs", "Ms", "Dr"].map((t) => ({ value: t, label: t }));
const PAYMENT_METHODS = ["Visa Card", "Mastercard", "Cash", "Bank Transfer"].map((p) => ({ value: p, label: p }));
const DURATION_OPTIONS = [{ value: "1", label: "1 hour" }, { value: "2", label: "2 hours" }, { value: "3", label: "3 hours" }];
const GUEST_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${String(n).padStart(2, "0")} ${n === 1 ? "person" : "persons"}` }));
const HOURS_ALL = Array.from({ length: 13 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function toYMD(date) { return date.toISOString().split("T")[0]; }
function getDateLabel(dateStr) {
  const today = toYMD(new Date());
  const tomorrow = toYMD(new Date(Date.now() + 86400000));
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date((value || toYMD(new Date())) + "T00:00:00"));
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toYMD(new Date());
  return (
    <div className="relative" ref={ref}>
      <label className="text-white/60 text-xs mb-1.5 block">Reservation Date</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm hover:border-brand/50 transition">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={value ? "text-white" : "text-white/30"}>{value ? getDateLabel(value) : "Select date"}</span>
        </div>
        <span className="text-white/40">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition">‹</button>
            <span className="text-white text-sm font-medium">{MONTHS[month]} {year}</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition">›</button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => <div key={d} className="text-center text-white/30 text-xs py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = toYMD(new Date(year, month, day));
              const isSelected = dateStr === value;
              const isToday = dateStr === today;
              return (
                <button key={day} type="button" onClick={() => { onChange(dateStr); setOpen(false); }}
                  className={`w-full aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center
                    ${isSelected ? "bg-brand text-gray-800" : isToday ? "border border-brand/50 text-brand" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
            <button type="button" onClick={() => { onChange(toYMD(new Date())); setOpen(false); }} className="flex-1 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition">Today</button>
            <button type="button" onClick={() => { onChange(toYMD(new Date(Date.now() + 86400000))); setOpen(false); }} className="flex-1 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition">Tomorrow</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddReservationModal({ isOpen, onClose, reservation = null, prefill = {}, onSaved }) {
  const isEdit = !!reservation;
  const [form, setForm] = useState({
    floor: prefill.floor || "1st Floor",
    tableNumber: prefill.tableNumber || "Bar",
    paxNumber: "",
    reservateDate: prefill.date || "",
    reservationTime: prefill.time || "",
    duration: prefill.duration || "1",
    depositFee: "",
    status: "Confirmed",
    title: "Mr",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    customerId: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
    paymentMethod: "Visa Card",
  });
  const [bookedHours, setBookedHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reservation) {
      setForm({ duration: "1", ...reservation });
    } else {
      setForm((prev) => ({
        ...prev,
        floor: prefill.floor || "1st Floor",
        tableNumber: prefill.tableNumber || "Bar",
        reservateDate: prefill.date || "",
        reservationTime: prefill.time || "",
        duration: prefill.duration || "1",
        customerId: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
      }));
    }
    setError("");
  }, [reservation, isOpen]);

  // Fetch booked hours whenever table or date changes
  useEffect(() => {
    if (!form.tableNumber || !form.reservateDate) { setBookedHours([]); return; }
    const fetchBooked = async () => {
      try {
        const q = query(collection(db, "reservations"),
          where("tableNumber", "==", form.tableNumber),
          where("reservateDate", "==", form.reservateDate)
        );
        const snap = await getDocs(q);
        const booked = [];
        snap.docs.forEach((d) => {
          const r = d.data();
          if (isEdit && d.id === reservation?.id) return; // skip self when editing
          const startHour = parseInt(r.reservationTime?.slice(0, 2), 10);
          const dur = parseInt(r.duration || "1", 10);
          for (let i = 0; i < dur; i++) {
            booked.push(`${String(startHour + i).padStart(2, "0")}:00`);
          }
        });
        setBookedHours(booked);
      } catch (e) { console.error(e); }
    };
    fetchBooked();
  }, [form.tableNumber, form.reservateDate]);

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (field === "floor") {
      setForm((prev) => ({ ...prev, floor: val, tableNumber: FLOOR_TABLES[val][0], reservationTime: "" }));
    }
  };

  // Compute disabled hours considering duration
  const getDisabledHours = () => {
    const dur = parseInt(form.duration || "1", 10);
    return HOURS_ALL.filter((hour) => {
      const startIdx = HOURS_ALL.indexOf(hour);
      for (let i = 0; i < dur; i++) {
        if (bookedHours.includes(HOURS_ALL[startIdx + i])) return true;
      }
      // Also disable if booking would exceed closing time
      if (startIdx + dur > HOURS_ALL.length) return true;
      return false;
    });
  };

  const handleSave = async () => {
    if (!form.paxNumber) { setError("Please select the number of guests."); return; }
    if (!form.reservateDate) { setError("Please select a reservation date."); return; }
    if (!form.reservationTime) { setError("Please select a reservation time."); return; }
    if (!form.depositFee) { setError("Please enter the deposit fee."); return; }
    if (!form.firstName.trim()) { setError("Please enter the customer's first name."); return; }
    if (!form.lastName.trim()) { setError("Please enter the customer's last name."); return; }
    if (!form.phoneNumber.trim()) { setError("Please enter a phone number."); return; }
    if (!form.emailAddress.trim()) { setError("Please enter an email address."); return; }

    const duration = parseInt(form.duration, 10);
    const startHour = parseInt(form.reservationTime.slice(0, 2), 10);
    if (startHour + duration > 21) {
      setError(`This booking would end at ${startHour + duration}:00 but we close at 21:00.`);
      return;
    }

    // Double-booking check
    const disabledHours = getDisabledHours();
    if (disabledHours.includes(form.reservationTime)) {
      setError("This time slot is already booked. Please choose another time.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = { ...form, duration: String(duration), fullName: `${form.firstName} ${form.lastName}` };
      if (isEdit) {
        await updateDoc(doc(db, "reservations", reservation.id), data);
      } else {
        await addDoc(collection(db, "reservations"), data);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tableOptions = (FLOOR_TABLES[form.floor] || []).map((t) => ({ value: t, label: t }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end items-stretch bg-black/60">
      <div className="bg-[#1a1a1a] w-full max-w-2xl min-h-screen overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">{isEdit ? "Edit Reservation" : "Add New Reservation"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">›</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Reservation Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Reservation Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomSelect label="Floor" value={form.floor} onChange={(val) => handleChange("floor", val)} options={FLOORS.map((f) => ({ value: f, label: f }))} />
              <CustomSelect label="Table Number" value={form.tableNumber} onChange={(val) => handleChange("tableNumber", val)} options={tableOptions} />
              <CustomSelect label="No of Guests" value={form.paxNumber} onChange={(val) => handleChange("paxNumber", val)} options={GUEST_OPTIONS} placeholder="Select guests" />
              <DatePicker value={form.reservateDate} onChange={(val) => handleChange("reservateDate", val)} />
              <CustomTimePicker label="Reservation Time" value={form.reservationTime} onChange={(val) => handleChange("reservationTime", val)} disabledHours={getDisabledHours()} />
              <CustomSelect label="Duration" value={form.duration} onChange={(val) => handleChange("duration", val)} options={DURATION_OPTIONS} />
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Deposit Fee</label>
                <div className="relative">
                  <input type="number" value={form.depositFee} onChange={(e) => handleChange("depositFee", e.target.value)} placeholder="60.00"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                </div>
              </div>
              <CustomSelect label="Status" value={form.status} onChange={(val) => handleChange("status", val)} options={STATUS_OPTIONS} />
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Customer Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Customer Details</h3>
            <div className="space-y-4">
              <CustomSelect label="Title" value={form.title} onChange={(val) => handleChange("title", val)} options={TITLE_OPTIONS} />
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Full Name</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="First name"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                  <input type="text" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Last name"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Phone Number</label>
                  <input type="tel" value={form.phoneNumber} onChange={(e) => handleChange("phoneNumber", e.target.value)} placeholder="+1 (123) 123 4654"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Email Address</label>
                  <input type="email" value={form.emailAddress} onChange={(e) => handleChange("emailAddress", e.target.value)} placeholder="email@example.com"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Additional Information */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Additional Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#2a2a2a] rounded-xl px-4 py-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-sm">Customer ID</span>
                </div>
                <span className="text-white text-sm font-medium">{form.customerId}</span>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl px-4 py-3 border border-white/10">
                <CustomSelect label="" value={form.paymentMethod} onChange={(val) => handleChange("paymentMethod", val)} options={PAYMENT_METHODS} />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-end gap-4 pt-2">
            <button onClick={onClose} className="text-white/60 text-sm underline hover:text-white transition">Cancel</button>
            <button onClick={handleSave} disabled={loading}
              className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
