import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, onSnapshot, deleteDoc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import CustomSelect from "../components/CustomSelect";
import CustomTimePicker from "../components/CustomTimePicker";

// Table images
const TABLE_IMAGES = {
  Bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&h=400&fit=crop",
  A1: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop",
  A2: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=1200&h=400&fit=crop",
  B1: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop",
  B2: "https://plus.unsplash.com/premium_photo-1661954531673-440d23a6eb79?w=1200&h=400&fit=crop",
  B3: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=1200&h=400&fit=crop",
  C1: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=400&fit=crop",
  C2: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop",
  D1: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&h=400&fit=crop",
  D2: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=1200&h=400&fit=crop",
  D3: "https://images.unsplash.com/photo-1508424757105-b6d5ad9329d0?w=1200&h=400&fit=crop",
  E1: "https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=1200&h=400&fit=crop",
  E2: "https://plus.unsplash.com/premium_photo-1670984939096-f3cfd48c7408?w=1200&h=400&fit=crop",
  F1: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop",
  F2: "https://images.unsplash.com/photo-1583354608715-177553a4035e?w=1200&h=400&fit=crop",
  G1: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&h=400&fit=crop",
  G2: "https://images.unsplash.com/photo-1613274554329-70f997f5789f?w=1200&h=400&fit=crop",
  H1: "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?w=1200&h=400&fit=crop",
  H2: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&h=400&fit=crop",
  H3: "https://plus.unsplash.com/premium_photo-1661953124283-76d0a8436b87?w=1200&h=400&fit=crop",
  default: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop",
};

const ALL_TABLES = ["Bar", "A1", "A2", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "D3", "E1", "E2", "F1", "F2", "G1", "G2", "H1", "H2", "H3"];

const TABLE_TO_FLOOR = {
  Bar: "1st Floor", A1: "1st Floor", A2: "1st Floor", B1: "1st Floor", B2: "1st Floor", B3: "1st Floor", C1: "1st Floor", C2: "1st Floor",
  D1: "2nd Floor", D2: "2nd Floor", D3: "2nd Floor", E1: "2nd Floor", E2: "2nd Floor", F1: "2nd Floor", F2: "2nd Floor",
  G1: "3rd Floor", G2: "3rd Floor", H1: "3rd Floor", H2: "3rd Floor", H3: "3rd Floor",
};

const FLOOR_TABLES_DETAIL = {
  "1st Floor": ["Bar", "A1", "A2", "B1", "B2", "B3", "C1", "C2"],
  "2nd Floor": ["D1", "D2", "D3", "E1", "E2", "F1", "F2"],
  "3rd Floor": ["G1", "G2", "H1", "H2", "H3"],
};

const GUEST_OPTIONS = [1,2,3,4,5].map((n) => ({ value: String(n), label: `${String(n).padStart(2,"0")} ${n===1?"person":"persons"}` }));
const DURATION_OPTIONS = [{ value: "1", label: "1 hour" }, { value: "2", label: "2 hours" }, { value: "3", label: "3 hours" }];
const HOURS_ALL = Array.from({ length: 13 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pickerFloor, setPickerFloor] = useState("1st Floor");
  const [loading, setLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({ tableNumber: "", paxNumber: "", reservationTime: "", floor: "", duration: "1" });
  const [bookedHours, setBookedHours] = useState([]);

  // Original File Structure: Listens directly to doc in 'reservations'
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "reservations", id), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setReservation(data);
        
        // Normalize loaded floor parameter formats securely
        const currentFloor = data.floor ? (data.floor.endsWith("Floor") ? data.floor : `${data.floor} Floor`) : "1st Floor";
        
        setEditForm({
          tableNumber: data.tableNumber || "",
          paxNumber: data.paxNumber || "",
          reservationTime: data.reservationTime || "",
          floor: currentFloor,
          duration: data.duration || "1",
        });
        setPickerFloor(currentFloor);
      } else navigate("/reservation");
    });
    return () => unsub();
  }, [id, navigate]);

  // Original File Structure: Collates busy blocks using original fallback keys
  useEffect(() => {
    const targetDate = reservation?.reservationDate || reservation?.reservateDate;
    if (!editForm.tableNumber || !targetDate) return;

    const fetchBooked = async () => {
      try {
        const q = query(collection(db, "reservations"),
          where("tableNumber", "==", editForm.tableNumber),
          where("reservateDate", "==", targetDate)
        );
        const snap = await getDocs(q);
        const booked = [];
        snap.docs.forEach((d) => {
          if (d.id === id) return;
          const r = d.data();
          const startHour = parseInt(r.reservationTime?.slice(0, 2), 10);
          const dur = parseInt(r.duration || "1", 10);
          for (let i = 0; i < dur; i++) {
            booked.push(`${String(startHour + i).padStart(2, "0")}:00`);
          }
        });
        setBookedHours(booked);
        if (booked.includes(editForm.reservationTime)) {
          setEditForm((prev) => ({ ...prev, reservationTime: "" }));
        }
      } catch (e) { console.error(e); }
    };
    fetchBooked();
  }, [editForm.tableNumber, id, reservation?.reservationDate, reservation?.reservateDate]);

  const getDisabledHours = () => {
    const dur = parseInt(editForm.duration || "1", 10);
    return HOURS_ALL.filter((hour) => {
      const startIdx = HOURS_ALL.indexOf(hour);
      for (let i = 0; i < dur; i++) {
        if (bookedHours.includes(HOURS_ALL[startIdx + i])) return true;
      }
      if (startIdx + dur > HOURS_ALL.length) return true;
      return false;
    });
  };

  const handleCancelReservation = async () => {
    if (!window.confirm("Cancel this reservation?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "reservations", id));
      navigate("/reservation");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEditSave = async () => {
    if (!editForm.paxNumber) { setEditError("Please select number of guests."); return; }
    if (!editForm.reservationTime) { setEditError("Please select a new time."); return; }
    const startHour = parseInt(editForm.reservationTime.slice(0, 2), 10);
    const dur = parseInt(editForm.duration || "1", 10);
    if (startHour + dur > 21) { setEditError(`Booking would end at ${startHour + dur}:00 but we close at 21:00.`); return; }
    if (getDisabledHours().includes(editForm.reservationTime)) { setEditError("This time slot is already booked. Choose another."); return; }
    setEditError("");
    try {
      // Maps configuration targets safely back to standard short codes for Firestore
      const targetFloorCode = (TABLE_TO_FLOOR[editForm.tableNumber] || editForm.floor).replace(" Floor", "");
      const currentDeposit = parseFloat(reservation.depositFee || 0);
      
      await updateDoc(doc(db, "reservations", id), {
        tableNumber: editForm.tableNumber,
        floor: targetFloorCode,
        paxNumber: editForm.paxNumber,
        reservationTime: editForm.reservationTime,
        duration: editForm.duration,
        depositFee: (currentDeposit + 30).toFixed(2),
      });
      setShowEditModal(false);
    } catch (err) { console.error(err); }
  };

  if (!reservation) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        Loading reservation...
      </div>
    );
  }

  const tableImage = TABLE_IMAGES[reservation.tableNumber] || TABLE_IMAGES.default;
  const displayDate = reservation.reservationDate || reservation.reservateDate;
  const displayFloorName = reservation.floor ? (reservation.floor.endsWith("Floor") ? reservation.floor : `${reservation.floor} Floor`) : "—";

  return (
    <div className="text-white max-w-4xl">
      {/* Hero Image */}
      <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-6">
        <img src={tableImage} alt={`Table ${reservation.tableNumber}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-5">
          <p className="text-white text-xl font-semibold">Table # {reservation.tableNumber}</p>
        </div>
      </div>

      {/* Reservation Details */}
      <section className="mb-5">
        <h2 className="text-white font-semibold text-base mb-3">Reservation Details</h2>
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: "Table Number", value: reservation.tableNumber },
              { label: "Pax Number", value: reservation.paxNumber },
              { label: "Reservation Date", value: displayDate },
              { label: "Reservation Time", value: reservation.reservationTime },
              { label: "Deposit Fee", value: reservation.depositFee ? `${reservation.depositFee} $` : "—" },
              { label: "Status", value: reservation.status },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <p className="text-white text-sm font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Details (Original Nested Fallback Structures) */}
      <section className="mb-5">
        <h2 className="text-white font-semibold text-base mb-3">Customer Details</h2>
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Title", value: reservation.customer.title },
              { label: "Full Name", value: reservation.customer ? `${reservation.customer.firstName} ${reservation.customer.lastName}` : (reservation.fullName || "—") },
              { label: "Phone Number", value: reservation.customer?.phone || reservation.phoneNumber },
              { label: "Email Address", value: reservation.customer?.email || reservation.emailAddress },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <p className="text-white text-sm font-medium break-all">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="mb-8">
        <h2 className="text-white font-semibold text-base mb-3">Additional Information</h2>
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Customer ID", value: reservation.customerId || reservation.reservationId },
              { label: "Payment Method", value: reservation.paymentMethod },
              { label: "Name", value: reservation.customer ? `${reservation.customer.firstName} ${reservation.customer.lastName}` : (reservation.fullName || "—") },
              { label: "Floor", value: displayFloorName },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <p className="text-white text-sm font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleCancelReservation}
          disabled={loading}
          className="text-white/60 text-sm underline hover:text-white transition"
        >
          Cancel Reservation
        </button>
        <button
          onClick={() => { setShowEditModal(true); setEditError(""); }}
          className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-6 py-3 rounded-xl transition text-sm"
        >
          Edit Reservation
        </button>
      </div>

      {/* Edit Drawer Panel */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setShowEditModal(false)}>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] w-full sm:w-96 flex flex-col
              fixed bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
              sm:static sm:rounded-none sm:max-h-full sm:min-h-screen overflow-y-auto border-l border-white/5 shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
              <div>
                <h2 className="text-white text-base font-semibold">Edit Reservation</h2>
                <p className="text-brand text-xs mt-0.5">+$30.00 amendment fee applies</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition text-sm">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="w-full h-36 rounded-xl overflow-hidden relative">
                <img
                  src={TABLE_IMAGES[editForm.tableNumber] || TABLE_IMAGES.Bar}
                  alt={editForm.tableNumber}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-semibold">Table # {editForm.tableNumber}</p>
              </div>

              <CustomSelect
                label="Floor"
                value={editForm.floor}
                onChange={(val) => {
                  setEditForm((prev) => ({ ...prev, floor: val, tableNumber: FLOOR_TABLES_DETAIL[val][0], reservationTime: "" }));
                  setPickerFloor(val);
                }}
                options={Object.keys(FLOOR_TABLES_DETAIL).map((f) => ({ value: f, label: f }))}
              />

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Table Number</label>
                <div className="grid grid-cols-4 gap-2">
                  {FLOOR_TABLES_DETAIL[editForm.floor]?.map((table) => (
                    <button
                      key={table}
                      onClick={() => setEditForm((prev) => ({ ...prev, tableNumber: table, reservationTime: "" }))}
                      className={`py-2.5 rounded-xl text-sm font-medium transition border ${
                        editForm.tableNumber === table
                          ? "bg-brand/20 border-brand/50 text-brand"
                          : "bg-[#2a2a2a] border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      {table}
                    </button>
                  ))}
                </div>
              </div>

              <CustomSelect
                label="No of Guests"
                value={editForm.paxNumber}
                onChange={(val) => setEditForm((prev) => ({ ...prev, paxNumber: val }))}
                options={GUEST_OPTIONS}
                placeholder="Select guests"
              />

              <CustomSelect
                label="Duration (hours)"
                value={editForm.duration}
                onChange={(val) => setEditForm((prev) => ({ ...prev, duration: val, reservationTime: "" }))}
                options={DURATION_OPTIONS}
              />

              <CustomTimePicker
                label="New Reservation Time"
                value={editForm.reservationTime}
                onChange={(val) => setEditForm((prev) => ({ ...prev, reservationTime: val }))}
                disabledHours={getDisabledHours()}
              />

              <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-3">
                <p className="text-white/70 text-xs">Amendment fee of <span className="text-brand font-semibold">$30.00</span> added to current deposit of <span className="text-white font-semibold">${parseFloat(reservation.depositFee || 0).toFixed(2)}</span>.</p>
                <p className="text-white font-semibold text-sm mt-1">New total: ${(parseFloat(reservation.depositFee || 0) + 30).toFixed(2)}</p>
              </div>

              {editError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{editError}</div>
              )}

              <div className="flex items-center justify-end gap-4 pt-2">
                <button onClick={() => setShowEditModal(false)} className="text-white/60 text-sm underline hover:text-white transition">Cancel</button>
                <button onClick={handleEditSave} className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-6 py-3 rounded-xl transition text-sm">
                  Confirm Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}