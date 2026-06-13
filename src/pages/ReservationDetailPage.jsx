import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";

// Table images - replace with real images
const TABLE_IMAGES = {
  Bar: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&h=400&fit=crop",
  A1: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop",
  A2: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&h=400&fit=crop",
  B1: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&h=400&fit=crop",
  B2: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop",
  B3: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=1200&h=400&fit=crop",
  C1: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=400&fit=crop",
  C2: "https://images.unsplash.com/photo-1560053608-13721b975af5?w=1200&h=400&fit=crop",
  default: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop",
};

const ALL_TABLES = ["Bar", "A1", "A2", "B1", "B2", "B3", "C1", "C2", "D1", "D2", "D3", "E1", "E2", "F1", "F2", "G1", "G2", "H1", "H2", "H3"];
const FLOORS = ["1st", "2nd", "3rd"];

export default function ReservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFloor, setActiveFloor] = useState("1st");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "reservations", id), (snap) => {
      if (snap.exists()) setReservation({ id: snap.id, ...snap.data() });
      else navigate("/reservation");
    });
    return () => unsub();
  }, [id]);

  const handleCancelReservation = async () => {
    if (!window.confirm("Cancel this reservation?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "reservations", id));
      navigate("/reservation");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTable = async (newTable) => {
    try {
      await updateDoc(doc(db, "reservations", id), { tableNumber: newTable });
      setShowTablePicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!reservation) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        Loading reservation...
      </div>
    );
  }

  const tableImage = TABLE_IMAGES[reservation.tableNumber] || TABLE_IMAGES.default;

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
              { label: "Reservation Date", value: reservation.reservationDate },
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

      {/* Customer Details */}
      <section className="mb-5">
        <h2 className="text-white font-semibold text-base mb-3">Customer Details</h2>
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Title", value: reservation.title },
              { label: "Full Name", value: reservation.customer ? `${reservation.customer.firstName} ${reservation.customer.lastName}` : "—" },
              { label: "Phone Number", value: reservation.customer?.phone },
              { label: "Email Address", value: reservation.customer?.email },
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
              { label: "Customer ID", value: reservation.customerId || reservation.reservationId  },
              { label: "Payment Method", value: reservation.paymentMethod },
              { label: "Name", value: reservation.customer ? `${reservation.customer.firstName} ${reservation.customer.lastName}` : "—" },
              { label: "Floor", value: reservation.floor },
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
          onClick={() => setShowTablePicker(true)}
          className="bg-brand hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
        >
          Change Table
        </button>
      </div>

      {/* Table Picker Modal */}
      {showTablePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <h2 className="text-white text-lg font-semibold">Select New Table</h2>
              <button onClick={() => setShowTablePicker(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-2">
                {ALL_TABLES.map((table) => (
                  <button
                    key={table}
                    onClick={() => handleChangeTable(table)}
                    className={`py-3 rounded-xl text-sm font-medium transition border ${reservation.tableNumber === table
                        ? "bg-brand/20 border-brand/50 text-brand"
                        : "bg-[#2a2a2a] border-white/10 text-white hover:border-white/30"
                      }`}
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
