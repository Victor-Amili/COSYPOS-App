import { FiDollarSign, FiDownload } from "react-icons/fi"
import { FaMoneyBillWave } from "react-icons/fa"
import { MdTableRestaurant } from "react-icons/md"
import { useNavigate } from "react-router-dom"

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

  const chartData = [
    { month: "JAN", sales: 3000, revenue: 1900 },
    { month: "FEB", sales: 4000, revenue: 2200 },
    { month: "MAR", sales: 2300, revenue: 2200 },
    { month: "APR", sales: 3500, revenue: 2000 },
    { month: "MAY", sales: 4800, revenue: 3000 },
    { month: "JUN", sales: 4000, revenue: 3200 },
    { month: "JUL", sales: 4700, revenue: 3000 },
    { month: "AUG", sales: 4200, revenue: 3400 },
    { month: "SEP", sales: 4100, revenue: 2800 },
    { month: "OCT", sales: 3300, revenue: 3000 },
    { month: "NOV", sales: 2700, revenue: 2000 },
    { month: "DEC", sales: 4700, revenue: 2600 }
  ]

  return (
    <div className="w-full">

      {/* ================= TOP CARDS ================= */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 mt-3">

        {/* Card 1 */}
        <div className="bg-[#1d1d1d] rounded-2xl p-5 w-full lg:w-[380px] h-[180px] flex justify-between">

          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-300">Daily Sales</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">$2K</h1>
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
              <p className="text-sm text-gray-300">Monthly Revenue</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">$55K</h1>
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
              <p className="text-sm text-gray-300">Table Occupancy</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">25 Tables</h1>
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

            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between bg-[#2e2e2e] rounded-xl p-3">

                <div className="flex items-center gap-3">
                  <img
                    src="https://via.placeholder.com/80x80"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-white text-sm font-semibold">Jollof Rice</h3>
                    <p className="text-gray-300 text-xs">Serving: 01 person</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[#F5C6CC] text-xs font-semibold">In Stock</span>
                  <p className="text-white text-sm font-bold">$55.00</p>
                </div>

              </div>
            ))}

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

            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between bg-[#2e2e2e] rounded-xl p-3">

                <div className="flex items-center gap-3">
                  <img
                    src="https://via.placeholder.com/80x80"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-white text-sm font-semibold">Grilled Chicken</h3>
                    <p className="text-gray-300 text-xs">Serving: 01 person</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[#F5C6CC] text-xs font-semibold">In Stock</span>
                  <p className="text-white text-sm font-bold">$65.00</p>
                </div>

              </div>
            ))}

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
                }}/>

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