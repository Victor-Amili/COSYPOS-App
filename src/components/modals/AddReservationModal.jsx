import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

const TABLE_NUMBERS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
const STATUS_OPTIONS = ["Confirmed", "Pending", "Cancelled"];
const TITLE_OPTIONS = ["Mr", "Mrs", "Ms", "Dr"];
const PAYMENT_METHODS = ["Visa Card", "Mastercard", "Cash", "Bank Transfer"];

export default function AddReservationModal({ isOpen, onClose, reservation = null, prefill = {}, onSaved }) {
  const isEdit = !!reservation;

  const [form, setForm] = useState({
    tableNumber: prefill.tableNumber || "01",
    paxNumber: "",
    reservateDate: prefill.date || "",
    reservationTime: prefill.time || "",
    depositFee: "",
    status: "Confirmed",
    title: "Mr",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    customerId: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
    paymentMethod: "Visa Card",
    floor: prefill.floor || "1st Floor",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservation) {
      setForm({ ...reservation });
    } else {
      setForm((prev) => ({
        ...prev,
        tableNumber: prefill.tableNumber || "01",
        reservateDate: prefill.date || "",
        reservationTime: prefill.time || "",
        floor: prefill.floor || "1st Floor",
        customerId: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
      }));
    }
  }, [reservation, isOpen, prefill.tableNumber, prefill.date, prefill.time, prefill.floor]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.firstName.trim()) return;
    setLoading(true);
    try {
      const data = { ...form, fullName: `${form.firstName} ${form.lastName}` };
      if (isEdit) {
        await updateDoc(doc(db, "reservations", reservation.id), data);
      } else {
        await addDoc(collection(db, "reservations"), data);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error saving reservation:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">{isEdit ? "Edit Reservation" : "Add New Reservation"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">›</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Reservation Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Reservation Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Table Number */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Table Number</label>
                <div className="relative">
                  <select name="tableNumber" value={form.tableNumber} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/60 transition text-sm appearance-none">
                    {TABLE_NUMBERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▾</span>
                </div>
              </div>

              {/* Pax Number */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Pax Number</label>
                <input type="text" name="paxNumber" value={form.paxNumber} onChange={handleChange} placeholder="05 persons"
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
              </div>

              {/* Reservate Date */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Reservate Date</label>
                <input type="date" name="reservateDate" value={form.reservateDate} onChange={handleChange}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/60 transition text-sm" />
              </div>

              {/* Reservation Time */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Reservation Time</label>
                <input type="time" name="reservationTime" value={form.reservationTime} onChange={handleChange}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/60 transition text-sm" />
              </div>

              {/* Deposit Fee */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Deposit Fee</label>
                <div className="relative">
                  <input type="number" name="depositFee" value={form.depositFee} onChange={handleChange} placeholder="60.00"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Status</label>
                <div className="relative">
                  <select name="status" value={form.status} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/60 transition text-sm appearance-none">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Customer Details */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Customer Details</h3>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Title</label>
                <div className="relative">
                  <select name="title" value={form.title} onChange={handleChange}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/60 transition text-sm appearance-none">
                    {TITLE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▾</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Full Name</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Phone Number</label>
                  <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+1 (123) 123 4654"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Email Address</label>
                  <input type="email" name="emailAddress" value={form.emailAddress} onChange={handleChange} placeholder="email@example.com"
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
              {/* Customer ID */}
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

              {/* Payment Method */}
              <div className="flex items-center justify-between bg-[#2a2a2a] rounded-xl px-4 py-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-sm">Payment Method</span>
                </div>
                <div className="relative">
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
                    className="bg-transparent text-white text-sm focus:outline-none appearance-none pr-5">
                    {PAYMENT_METHODS.map((p) => <option key={p} value={p} className="bg-[#2a2a2a]">{p}</option>)}
                  </select>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">▾</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button onClick={onClose} className="text-white/60 text-sm underline hover:text-white transition">Cancel</button>
            <button onClick={handleSave} disabled={loading}
              className="bg-brand hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
