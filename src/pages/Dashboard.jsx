import { FiDollarSign, FiDownload } from "react-icons/fi"
import { FaMoneyBillWave } from "react-icons/fa"
import { MdTableRestaurant } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { db } from "../firebase/config"
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

function Dashboard() {
  const barHeights = [35, 65, 58, 45, 30, 60, 78, 85]
  const navigate = useNavigate()

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const [dailySales, setDailySales] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [occupiedTables, setOccupiedTables] = useState(0)
  const [totalTables, setTotalTables] = useState(0)
  const [popularDishes, setPopularDishes] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real data from Firebase
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // 1. Listen to orders (real-time)
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const orders = snap.docs.map(d => d.data())

      // Calculate daily sales (today's paid orders)
      const todaySales = orders
        .filter(o => o.paymentStatus === "paid" && o.createdAt?.toDate?.() >= today)
        .reduce((sum, o) => sum + (o.total || 0), 0)
      setDailySales(todaySales)

      // Calculate monthly revenue (this month's paid orders)
      const monthRevenue = orders
        .filter(o => o.paymentStatus === "paid" && o.createdAt?.toDate?.() >= startOfMonth)
        .reduce((sum, o) => sum + (o.total || 0), 0)
      setMonthlyRevenue(monthRevenue)

      // Build chart data (group by month)
      const monthlyData = {}
      orders.forEach(o => {
        if (o.paymentStatus !== "paid") return
        const date = o.createdAt?.toDate?.() || new Date()
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
        if (!monthlyData[month]) monthlyData[month] = { month, sales: 0, revenue: 0 }
        monthlyData[month].sales += 1
        monthlyData[month].revenue += o.total || 0
      })
      // Fill in missing months with 0
      const allMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
      setChartData(allMonths.map(m => monthlyData[m] || { month: m, sales: 0, revenue: 0 }))
    })

    // 2. Listen to tables (real-time)
    const unsubTables = onSnapshot(collection(db, "tables"), (snap) => {
      const tables = snap.docs.map(d => d.data())
      setTotalTables(tables.length)
      setOccupiedTables(tables.filter(t => t.status === "occupied").length)
    })

    // 3. Fetch popular dishes (one-time, or you could listen)
    const fetchPopular = async () => {
      const snap = await getDocs(collection(db, "orders"))
      const orders = snap.docs.map(d => d.data())

      const dishCounts = {}
      orders.forEach(o => {
        o.items?.forEach(item => {
          if (!dishCounts[item.productId]) {
            dishCounts[item.productId] = {
              name: item.name,
              count: 0,
              price: item.price,
              image: item.image || ""
            }
          }
          dishCounts[item.productId].count += item.qty
        })
      })

      const sorted = Object.values(dishCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setPopularDishes(sorted)
      setLoading(false)
    }

    fetchPopular()

    return () => {
      unsubOrders()
      unsubTables()
    }
  }, [])
  return (
    <div className="w-full">

      {/* ================= TOP CARDS ================= */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-3">

        {/* Card 1 */}
        <div className="bg-[#1d1d1d] rounded-2xl p-5 w-full lg:w-[380px] h-[180px] flex justify-between">

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                ${(dailySales / 1000).toFixed(1)}K
              </h1>
            </div>
            <p className="text-xs text-gray-300">{currentDate}</p>
          </div>

          <div className="flex flex-col justify-between items-end">
            <button
              onClick={() => navigate("/orders")}
              className="w-8 h-8 rounded-full bg-[#F5C6CC] flex items-center justify-center
              hover:bg-[#59c9a5] transition"
            >
              <FiDollarSign size={15} className="text-[#071013]" />
            </button>

            <div className="flex items-end gap-1">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-2 rounded-full bg-[#59c9a5]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1d1d1d] rounded-2xl p-5 w-full flex-1 h-[180px] flex justify-between">

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                ${(monthlyRevenue / 1000).toFixed(0)}K
              </h1>
            </div>
            <p className="text-xs text-gray-300">{currentDate}</p>
          </div>

          <div className="flex flex-col justify-between items-end">
            <button
              onClick={() => navigate("/reports")}
              className="w-8 h-8 rounded-full bg-[#F5C6CC] flex items-center justify-center
              hover:bg-[#59c9a5] transition"
            >
              <FaMoneyBillWave size={15} className="text-[#071013]" />
            </button>

            <div className="flex items-end gap-1">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-2 rounded-full bg-[#b9e3c6]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1d1d1d] rounded-2xl p-5 w-full flex-1 h-[180px] flex justify-between">

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                {occupiedTables} Tables
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end">
            <button
              onClick={() => navigate("/reports")}
              className="w-8 h-8 rounded-full bg-[#F5C6CC] flex items-center justify-center
              hover:bg-[#59c9a5] transition"
            >
              <MdTableRestaurant size={15} className="text-[#071013]" />
            </button>

            <div className="flex items-end gap-1">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-2 rounded-full bg-[#59c9a5]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*  MIDDLE SECTION */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">

        {/* LEFT CARD */}
        <div className="bg-[#1d1d1d] rounded-2xl flex-1 p-4 h-[420px] flex flex-col">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Popular Dishes</h2>
            <span
              onClick={() => navigate("/menu")}
              className="text-[#F5C6CC] text-sm cursor-pointer underline"
            >
              See All
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">

            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : popularDishes.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              popularDishes.map((dish, i) => (
                <div key={i} className="flex items-center justify-between bg-[#2e2e2e] rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={dish.image || "https://via.placeholder.com/80x80"}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-white text-sm font-semibold">{dish.name}</h3>
                      <p className="text-gray-300 text-xs">Sold: {dish.count} times</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[#F5C6CC] text-xs font-semibold">Popular</span>
                    <p className="text-white text-sm font-bold">${dish.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-[#1d1d1d] rounded-2xl flex-1 p-4 h-[420px] flex flex-col">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Popular Dishes</h2>
            <span
              onClick={() => navigate("/menu")}
              className="text-[#F5C6CC] text-sm cursor-pointer underline"
            >
              See All
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">

            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : popularDishes.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              popularDishes.map((dish, i) => (
                <div key={i} className="flex items-center justify-between bg-[#2e2e2e] rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={dish.image || "https://via.placeholder.com/80x80"}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-white text-sm font-semibold">{dish.name}</h3>
                      <p className="text-gray-300 text-xs">Sold: {dish.count} times</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[#F5C6CC] text-xs font-semibold">Popular</span>
                    <p className="text-white text-sm font-bold">${dish.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

      </div>

      {/*  CHART  */}
      <div className="mt-6 bg-[#1d1d1d] rounded-3xl p-4">

        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">

          {/*  OVERVIEW HEADER (MOBILE SAFE)  */}
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">

            {/* LEFT SIDE */}
            <div>

              <h2 className="text-white text-xl lg:text-2xl font-bold">
                Overview
              </h2>

              {/* Legend stays SAME on desktop, wraps only on mobile */}
              <div className="flex items-center gap-4 mt-2 flex-wrap">

                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#FFD6E5]" />
                  <span className="text-gray-300 text-xs">Sales</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#F7F6E7]" />
                  <span className="text-gray-300 text-xs">Revenue</span>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE (RESPONSIVE ONLY) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

              {/* Filters
    <div className="flex bg-[#071013] rounded-xl p-1 text-xs">

      <button className="px-3 py-1 bg-[#F5C6CC] text-black rounded-lg">
        Monthly
      </button>

      <button className="px-3 py-1 text-white">
        Daily
      </button>

      <button className="px-3 py-1 text-white">
        Weekly
      </button>

    </div>

    {/* Export */}
              {/* <button className="flex items-center gap-2 border border-gray-600 px-3 py-1 rounded-xl text-white text-xs">
      <FiDownload size={14} />
      Export
    </button> */}

            </div>

          </div>

          <div className="flex flex-wrap  gap-3 items-center">

            <div className="flex gap-2 bg-[#071013] rounded-xl p-3">
              <button className="px-3 py-2 hover:bg-[#F5C6CC] hover:text-black text-white rounded-lg">Monthly</button>
              <button className=" px-3 py-2 text-white rounded-lg hover:bg-[#F5C6CC] hover:text-black ">Daily</button>
              <button className=" px-3 py-2 text-white rounded-lg hover:bg-[#F5C6CC] hover:text-black">Weekly</button>
            </div>

            <button className="flex items-center gap-2 border border-[#F5C6CC] px-3 py-2 rounded-xl text-white
            hover:bg-[#F5C6CC] hover:text-black transition">
              <FiDownload />
              Export
            </button>

          </div>

        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>

              <CartesianGrid stroke="rgba(255,255,255,0.12)" vertical={false} />

              <XAxis dataKey="month" tick={{ fill: "#ccc" }} />
              <YAxis
                orientation="right"
                ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                tickFormatter={(v) => v === 0 ? "0" : `${v / 1000}k`}
                tick={{ fill: "#ccc" }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#071013",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "none",
                }} />

              <Line type="monotone" dataKey="sales" stroke="#FFD6E5" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="revenue" stroke="#F7F6E7" strokeWidth={2} dot={false} />

            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  )
}

export default Dashboard