import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../firebase/config"
import { collection, onSnapshot } from "firebase/firestore"
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
} from "recharts"

// ─── Data ────────────────────────────────────────────────────────────────────

const tabs = ["Reservation Report", "Revenue Report", "Staff Report"]
const filterTabs = ["Completed", "In Process", "Pending", "Cancelled"]
const lineColors = {
  confirmed: "#e75480",
  awaited:   "#c084a0",
  cancelled: "#7d3f5a",
  failed:    "#f9a8c9",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RevenueReport() {
  const [activeTab]       = useState("Revenue Report")
  const [activeFilter, setActiveFilter] = useState("Confirmed")
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch orders and products
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => {
      unsubOrders()
      unsubProducts()
    }
  }, [])

  // Compute pie data: revenue by status
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const pieData = [
    { 
      name: "Completed", 
      value: orders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.total || 0), 0), 
      color: "#e75480" 
    },
    { 
      name: "In Process", 
      value: orders.filter(o => o.status === "in-process").reduce((sum, o) => sum + (o.total || 0), 0), 
      color: "#c084a0" 
    },
    { 
      name: "Pending", 
      value: orders.filter(o => o.status === "pending").reduce((sum, o) => sum + (o.total || 0), 0), 
      color: "#7d3f5a" 
    },
    { 
      name: "Cancelled", 
      value: orders.filter(o => o.status === "cancelled").reduce((sum, o) => sum + (o.total || 0), 0), 
      color: "#f9a8c9" 
    },
  ]

  // Compute monthly line data
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
  const lineData = monthNames.map((month, i) => {
    const monthOrders = orders.filter(o => {
      if (!o.date) return false
      const date = new Date(o.date + "T00:00:00")
      return date.getMonth() === i
    })
    
    return {
      month,
      confirmed: monthOrders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.total || 0), 0),
      awaited: monthOrders.filter(o => o.status === "in-process").reduce((sum, o) => sum + (o.total || 0), 0),
      cancelled: monthOrders.filter(o => o.status === "cancelled").reduce((sum, o) => sum + (o.total || 0), 0),
      failed: 0,
    }
  })

  // Compute table data: top selling products
  // Count product sales from orders
  const productSales = {}
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const name = item.name || "Unknown"
      if (!productSales[name]) {
        productSales[name] = { name, qty: 0, revenue: 0 }
      }
      productSales[name].qty += item.qty || 1
      productSales[name].revenue += (item.price || 0) * (item.qty || 1)
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const tableData = topProducts.map((p, i) => {
    const product = products.find(prod => prod.name === p.name)
    const costPrice = product?.costPrice || 0
    const sellPrice = product?.price || 0
    const profit = p.revenue - (costPrice * p.qty)
    const margin = sellPrice > 0 ? ((profit / (sellPrice * p.qty)) * 100).toFixed(2) : "0.00"
    
    return {
      sNo: String(i + 1).padStart(2, "0"),
      food: p.name,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, ". "),
      sellPrice: `$${sellPrice.toFixed(2)}`,
      profit: `$${profit.toFixed(2)}`,
      margin: `${margin}%`,
      total: `$${p.revenue.toFixed(2)}`,
    }
  })

  const tabRoutes = {
    "Reservation Report": "/reports",
    "Revenue Report": "/revenue-report",
    "Staff Report": "/staff-report",
  }

  return (
    <div className="text-white min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>

      {/* Tabs + Date + Generate */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-[#1d1d1d] px-4 py-2 rounded-lg text-sm text-gray-300">
          <span>📅</span>
          <span>01/04/2024 — 08/04/2024</span>
        </div>
        <button className="bg-[#F5C6CC] text-[#7D5B67] px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
          Generate Report
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Donut Chart */}
        <div id="revenue-donut-chart" className="bg-[#1d1d1d] rounded-2xl p-5">
          <h2 className="text-base font-semibold mb-4">Total Revenue</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <PieChart width={200} height={200}>
                <Pie
                  data={pieData}
                  cx={100} cy={100}
                  innerRadius={65} outerRadius={95}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-2xl font-bold">${totalRevenue.toFixed(0)}</span>
              </div>
            </div>
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
        <div id="revenue-line-chart" className="bg-[#1d1d1d] rounded-2xl p-5">
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
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#2d2d2d", border: "none", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} />
              <Line type="monotone" dataKey="confirmed" stroke={lineColors.confirmed} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="awaited"   stroke={lineColors.awaited}   strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cancelled" stroke={lineColors.cancelled} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="failed"    stroke={lineColors.failed}    strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Table */}
      <div id="revenue-table" className="bg-[#1d1d1d] rounded-2xl overflow-hidden">
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
                    <div className="text-xs text-[#F5C6CC]">S.No</div>
                    <div className="text-white">{row.sNo}</div>
                  </td>
                  <td className="w-px"><div className="w-px h-6 bg-[#3a3a3a] mx-auto"></div></td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Top Selling Food</div>
                    <div className="text-white">{row.food}</div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Revenue By Date</div>
                    <div className="text-white">{row.date}</div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Sell Price</div>
                    <div className="text-white">{row.sellPrice}</div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Profit</div>
                    <div className="text-white">{row.profit}</div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Profit Margin</div>
                    <div className="text-white">{row.margin}</div>
                  </td>
                  <td className="w-px"><div className="w-px h-6 bg-[#3a3a3a] mx-auto"></div></td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#F5C6CC]">Total Revenue</div>
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