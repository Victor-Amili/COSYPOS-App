import { useState, useEffect } from "react"
import { db } from "../firebase/config"
import { collection, onSnapshot } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  //   Legend,
} from "recharts"



const tabs = ["Reservation Report", "Revenue Report", "Staff Report"]
const filterTabs = ["Confirmed", "Pending", "Cancelled"]

const lineColors = {
  confirmed: "#e75480",
  pending: "#c084a0",
  cancelled: "#7d3f5a",
}

export default function ReservationReport() {
  const [activeTab] = useState("Reservation Report")
  const [activeFilter, setActiveFilter] = useState("Confirmed")
  const navigate = useNavigate()

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch reservations from Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reservations"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setReservations(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Compute pie data from real reservations
  const pieData = [
    {
      name: "Confirmed",
      value: reservations.filter(r => r.status === "confirmed").length,
      color: "#e75480"
    },
    {
      name: "Pending",
      value: reservations.filter(r => r.status === "pending").length,
      color: "#c084a0"
    },
    {
      name: "Cancelled",
      value: reservations.filter(r => r.status === "cancelled").length,
      color: "#7d3f5a"
    },
  ]

  // Compute monthly line data
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
  const lineData = monthNames.map((month, i) => {
    const monthReservations = reservations.filter(r => {
      if (!r.reservationDate) return false
      const date = new Date(r.reservationDate + "T00:00:00")
      return date.getMonth() === i
    })

    return {
      month,
      confirmed: monthReservations.filter(r => r.status === "confirmed").length,
      pending: monthReservations.filter(r => r.status === "pending").length,
      cancelled: monthReservations.filter(r => r.status === "cancelled").length,
    }
  })

  // Compute table data from real reservations
  const tableData = reservations.slice(0, 5).map(r => ({
    id: r.reservationId || r.id.slice(-8),
    name: r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : "Unknown",
    phone: r.customer?.phone || "N/A",
    date: r.reservationDate ? new Date(r.reservationDate + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, ". ") : "—",
    checkIn: r.checkIn || r.reservationTime || "—",
    checkOut: r.checkOut || "—",
    total: r.depositFee ? `$${r.depositFee.toFixed(2)}` : "—",
  }))

  const tabRoutes = {
    "Reservation Report": "/reports",
    "Revenue Report": "/revenue-report",
    "Staff Report": "/staff-report",
  }
  const [startDate] = useState("01/04/2024")
  const [endDate] = useState("08/04/2024")

  return (
    <div className="text-white min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>
      {loading && (
        <div className="text-center py-12 text-gray-500">Loading report data...</div>
      )}

      {/* Tabs + Date + Generate */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Report Type Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => navigate(tabRoutes[tab])}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab
                  ? "bg-[#F5C6CC] text-[#7D5B67]"
                  : "bg-transparent text-gray-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date Range */}
        <div className="flex items-center gap-2 bg-[#1d1d1d] px-4 py-2 rounded-lg text-sm text-gray-300">
          <span>📅</span>
          <span>{startDate} — {endDate}</span>
        </div>

        {/* Generate Report */}
        <button className="bg-[#F5C6CC] text-[#7D5B67] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          Generate Report
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Donut Chart */}
        <div id="reservation-donut-chart" className="bg-[#1d1d1d] rounded-2xl p-5">
          <h2 className="text-base font-semibold mb-4">Total Reservation</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <PieChart width={200} height={200}>
                <Pie
                  data={pieData}
                  cx={100}
                  cy={100}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#2d2d2d", border: "none", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-2xl font-bold">{reservations.length}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-300">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div id="reservation-line-chart" className="bg-[#1d1d1d] rounded-2xl p-5">
          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {filterTabs.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all
                  ${activeFilter === f
                    ? "bg-[#F5C6CC] text-[#7D5B67]"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#2d2d2d", border: "none", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                stroke={lineColors.confirmed}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="awaited"
                stroke={lineColors.awaited}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke={lineColors.cancelled}
                strokeWidth={2}
                dot={false}
              />


            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div id="reservation-table" className="bg-[#1d1d1d] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-[#2a2a2a] hover:bg-[#252525] transition-colors ${i % 2 === 0 ? "bg-[#1d1d1d]" : "bg-[#212121]"
                    }`}
                >
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Reservation ID</div>
                    <div className="text-white font-medium">{row.id}</div>
                  </td>
                  <td className="w-px"><div className="w-px h-6 bg-[#3a3a3a] mx-auto"></div></td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Customer Name</div>
                    <div className="text-white">{row.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Phone Number</div>
                    <div className="text-white">{row.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Reservation Date</div>
                    <div className="text-white">{row.date}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Check In</div>
                    <div className="text-white">{row.checkIn}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Check Out</div>
                    <div className="text-white">{row.checkOut}</div>
                  </td>
                  <td className="w-px"><div className="w-px h-6 bg-[#3a3a3a] mx-auto"></div></td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Total</div>
                    <div className="text-white font-semibold">{row.total}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}