import { useState } from "react"
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

const pieData = [
  { name: "Confirmed", value: 110, color: "#e75480" },
  { name: "Awaited", value: 40, color: "#c084a0" },
  { name: "Cancelled", value: 25, color: "#7d3f5a" },
  { name: "Failed", value: 17, color: "#f9a8c9" },
]

const lineData = [
  { month: "JAN", confirmed: 3000, awaited: 1500, cancelled: 800, failed: 400 },
  { month: "FEB", confirmed: 2500, awaited: 2000, cancelled: 1000, failed: 600 },
  { month: "MAR", confirmed: 3500, awaited: 1800, cancelled: 700, failed: 300 },
  { month: "APR", confirmed: 2800, awaited: 2200, cancelled: 1200, failed: 500 },
  { month: "MAY", confirmed: 4000, awaited: 1600, cancelled: 900, failed: 450 },
  { month: "JUN", confirmed: 3800, awaited: 2400, cancelled: 1100, failed: 550 },
  { month: "JUL", confirmed: 4200, awaited: 2000, cancelled: 800, failed: 300 },
  { month: "AUG", confirmed: 3600, awaited: 2600, cancelled: 1300, failed: 600 },
  { month: "SEP", confirmed: 3000, awaited: 1900, cancelled: 950, failed: 400 },
  { month: "OCT", confirmed: 2700, awaited: 1700, cancelled: 850, failed: 350 },
  { month: "NOV", confirmed: 3100, awaited: 2100, cancelled: 1000, failed: 480 },
  { month: "DEC", confirmed: 4500, awaited: 2500, cancelled: 1200, failed: 520 },
]

const tableData = Array(5).fill({
  id: "#12354564",
  name: "Watson Joyce",
  phone: "+1 (123) 123 4654",
  date: "28. 03. 2024",
  checkIn: "03 : 18 PM",
  checkOut: "05 : 00 PM",
  total: "$250.00",
})

const tabs = ["Reservation Report", "Revenue Report", "Staff Report"]
const filterTabs = ["Confirmed", "Awaited", "Cancelled", "Failed"]

const lineColors = {
  confirmed: "#e75480",
  awaited: "#c084a0",
  cancelled: "#7d3f5a",
  failed: "#f9a8c9",
}

export default function ReservationReport() {
  const [activeTab] = useState("Reservation Report")
const [activeFilter, setActiveFilter] = useState("Confirmed")
  const navigate = useNavigate()

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
                <span className="text-2xl font-bold">192</span>
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
              <Line
                type="monotone"
                dataKey="failed"
                stroke={lineColors.failed}
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
                  className={`border-b border-[#2a2a2a] hover:bg-[#252525] transition-colors ${
                    i % 2 === 0 ? "bg-[#1d1d1d]" : "bg-[#212121]"
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