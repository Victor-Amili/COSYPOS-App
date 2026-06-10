import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import AddReservationModal from "../components/modals/AddReservationModal";

const FLOORS = ["1st Floor", "2nd Floor", "3rd Floor"];
const FLOOR_TABLES = {
  "1st Floor": ["Bar", "A1", "A2", "B1", "B2", "B3", "C1", "C2"],
  "2nd Floor": ["D1", "D2", "D3", "E1", "E2", "F1", "F2"],
  "3rd Floor": ["G1", "G2", "H1", "H2", "H3"],
};
const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`);
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toYMD(date) {
  return date.toISOString().split("T")[0];
}

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
  const [viewDate, setViewDate] = useState(new Date(value + "T00:00:00"));
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

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDay = (day) => {
    const d = new Date(year, month, day);
    onChange(toYMD(d));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm hover:border-brand/50 transition min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{getDateLabel(value)}</span>
        </div>
        <span className="text-white/40">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-4 w-72">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition">‹</button>
            <span className="text-white text-sm font-medium">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-white/30 text-xs py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = toYMD(new Date(year, month, day));
              const isSelected = dateStr === value;
              const isToday = dateStr === today;
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  className={`w-full aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center
                    ${isSelected ? "bg-brand text-white" : isToday ? "border border-brand/50 text-brand" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick selects */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
            <button onClick={() => { onChange(toYMD(new Date())); setOpen(false); }}
              className="flex-1 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition">
              Today
            </button>
            <button onClick={() => { onChange(toYMD(new Date(Date.now() + 86400000))); setOpen(false); }}
              className="flex-1 py-1.5 rounded-lg text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition">
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReservationPage() {
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState("1st Floor");
  const [reservations, setReservations] = useState([]);
  const [modal, setModal] = useState({ open: false, prefill: {} });
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reservations"), (snap) => {
      setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const tables = FLOOR_TABLES[activeFloor];

  const getReservationsForCell = (table, hour) => {
    return reservations.filter((r) => {
      const rHour = r.reservationTime?.slice(0, 2);
      return (
        r.tableNumber === table &&
        rHour === hour.slice(0, 2) &&
        r.floor === activeFloor &&
        r.reservateDate === selectedDate
      );
    });
  };

  const handleCellClick = (table, hour) => {
    setModal({
      open: true,
      prefill: {
        tableNumber: table,
        time: `${hour.slice(0, 2)}:00`,
        floor: activeFloor,
        date: selectedDate,
      },
    });
  };

  return (
    <div className="text-white">
      {/* Floor Tabs + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {FLOORS.map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                activeFloor === floor
                  ? "bg-brand text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {floor}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <button
            onClick={() => setModal({ open: true, prefill: { floor: activeFloor } })}
            className="bg-brand hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap"
          >
            Add New Reservation
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <div className="min-w-[900px]">
          {/* Time Header */}
          <div className="flex border-b border-white/5 bg-[#1a1a1a]">
            <div className="w-24 flex-shrink-0" />
            {HOURS.map((hour) => (
              <div key={hour} className="flex-1 text-center text-white/40 text-xs py-3 border-l border-white/5">
                {hour}
              </div>
            ))}
          </div>

          {/* Table Rows */}
          {tables.map((table) => (
            <div key={table} className="flex border-b border-white/5 hover:bg-white/[0.02] transition min-h-[72px]">
              {/* Table Label */}
              <div className="w-24 flex-shrink-0 flex items-center justify-center text-white/50 text-sm font-medium border-r border-white/5">
                {table}
              </div>

              {/* Hour Cells */}
              {HOURS.map((hour) => {
                const cellReservations = getReservationsForCell(table, hour);
                return (
                  <div
                    key={hour}
                    onClick={() => cellReservations.length === 0 && handleCellClick(table, hour)}
                    className="flex-1 border-l border-white/5 p-1 relative"
                  >
                    {cellReservations.map((res) => (
                      <div
                        key={res.id}
                        onClick={(e) => { e.stopPropagation(); navigate(`/reservation/${res.id}`); }}
                        className={`w-full h-full min-h-[60px] rounded-lg p-2 cursor-pointer transition hover:opacity-90 ${
                          res.status === "Confirmed" ? "bg-brand/30 border border-brand/40" : "bg-white/10 border border-white/20"
                        }`}
                      >
                        <p className="text-white text-xs font-medium truncate">{res.fullName || `${res.firstName} ${res.lastName}`}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20H7m10 0a2 2 0 002-2v-1a5 5 0 00-10 0v1a2 2 0 002 2m10 0V10M7 20V10m0 0a5 5 0 0110 0" />
                          </svg>
                          <span className="text-white/50 text-xs">{res.paxNumber || "01"}</span>
                        </div>
                      </div>
                    ))}
                    {cellReservations.length === 0 && (
                      <div className="w-full h-full min-h-[60px] rounded-lg cursor-pointer hover:bg-white/5 transition" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <AddReservationModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, prefill: {} })}
        prefill={modal.prefill}
        onSaved={() => setModal({ open: false, prefill: {} })}
      />
    </div>
  );
}
