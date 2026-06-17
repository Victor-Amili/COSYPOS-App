import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import InventoryModal from "../components/modals/InventoryModal";
import CustomSelect from "../components/CustomSelect";

const STOCK_OPTIONS = [
  { label: "All", value: "All" },
  { label: "In Stock", value: "in-stock" },
  { label: "Low Stock", value: "low-stock" },
  { label: "Out of Stock", value: "out-of-stock" }
];
const VALUE_OPTIONS = ["Litre", "Kg", "Gram", "Piece"].map((v) => ({ value: v, label: v }));
const STATUS_FILTERS = ["All", "active", "inactive", "draft"];

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [inventoryModal, setInventoryModal] = useState({ open: false, data: null });

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [valueFilter, setValueFilter] = useState("Litre");
  const [quantity, setQuantity] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);

  // Original File Structure: Fetches dynamic filter options from 'categories'
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      const cats = snap.docs.map((d) => d.data().name);
      setCategories(["All", ...cats]);
    });
    return () => unsub();
  }, []);

  // Original File Structure: Listens directly to the 'products' collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Original File Structure: Deletes directly from 'products'
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    await deleteDoc(doc(db, "products", id));
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setCategoryFilter("All");
    setStockFilter("All");
    setValueFilter("Litre");
    setQuantity("");
    setPriceMin("");
    setPriceMax("");
  };

  // Original File Structure: Filter logic matches your original data fields
  const filteredItems = items.filter((item) => {
    if (statusFilter !== "All" && item.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (categoryFilter !== "All" && item.categoryName !== categoryFilter) return false;
    if (stockFilter !== "All" && item.stockStatus !== stockFilter) return false;
    if (priceMin && parseFloat(item.price) < parseFloat(priceMin)) return false;
    if (priceMax && parseFloat(item.price) > parseFloat(priceMax)) return false;
    return true;
  });
  
  const statusCounts = {
    All: items.length,
    active: items.filter((i) => i.status === "active").length,
    inactive: items.filter((i) => i.status === "inactive").length,
    draft: items.filter((i) => i.status === "draft").length,
  };

  // Format dynamic categories to pass safely into your CustomSelect components
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <div className="text-white">

      {/* Mobile: total + add button */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <p><span className="text-2xl font-bold">{filteredItems.length}</span><span className="text-white/50 text-sm ml-2">total products</span></p>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-sm transition">
            Filters
          </button>
          <button onClick={() => setInventoryModal({ open: true, data: null })} className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-4 py-2 rounded-xl transition text-sm">
            + Add
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">

        {/* ── FILTER PANEL ── */}
        <aside className={`w-full md:w-72 flex-shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
          <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 space-y-6">

            {/* Product Status */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Product Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FILTERS.map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition border ${
                      statusFilter === s ? "border-brand/50 bg-brand/10 text-white" : "border-white/10 bg-[#2a2a2a] text-white/60 hover:border-white/20"
                    }`}>
                    <span>{s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${statusFilter === s ? "bg-brand text-gray-800" : "bg-white/10 text-white/50"}`}>
                      {statusCounts[s]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category (New Appearance + Original Database Options) */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Category</h3>
              <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
            </div>

            {/* Stock (New Appearance + Original Value Parameters) */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Stock</h3>
              <CustomSelect value={stockFilter} onChange={setStockFilter} options={STOCK_OPTIONS} />
            </div>

            {/* Value */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Value</h3>
              <CustomSelect value={valueFilter} onChange={setValueFilter} options={VALUE_OPTIONS} />
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Piece / Item / Quantity</h3>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="50"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
            </div>

            {/* Price */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Price</h3>
              <div className="space-y-2">
                <div className="relative">
                  <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                </div>
                <div className="relative">
                  <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                </div>
              </div>
            </div>

            <button onClick={handleResetFilters} className="w-full bg-brand/20 hover:bg-brand/30 text-brand font-semibold py-3 rounded-xl transition text-sm">
              Reset Filters
            </button>
          </div>
        </aside>

        {/* ── PRODUCT LIST ── */}
        <div className="flex-1 min-w-0">
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between mb-5">
            <p><span className="text-2xl font-bold">{filteredItems.length}</span><span className="text-white/50 text-sm ml-2">total products</span></p>
            <button onClick={() => setInventoryModal({ open: true, data: null })} className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition text-sm">
              Add New Inventory
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-[#1a1a1a] rounded-2xl p-12 text-center text-white/30 text-sm border border-white/5">
                Loading inventory...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-2xl p-12 text-center text-white/30 text-sm border border-white/5">
                No inventory items found.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4 border border-white/5 hover:border-white/10 transition">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">🍽</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      Stocked Product : <span className="text-brand font-semibold">{item.stock || 0} In Stock</span>
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-white/40 text-xs">Status</p>
                      <p className="text-white text-sm font-medium mt-0.5">{item.status || "—"}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-white/40 text-xs">Category</p>
                      <p className="text-white text-sm font-medium mt-0.5">{item.categoryName || "—"}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-white/40 text-xs">Retail Price</p>
                      <p className="text-white text-sm font-semibold mt-0.5">${parseFloat(item.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setInventoryModal({ open: true, data: item })} className="text-white/40 hover:text-white transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400/60 hover:text-red-400 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <InventoryModal
        isOpen={inventoryModal.open}
        onClose={() => setInventoryModal({ open: false, data: null })}
        item={inventoryModal.data}
        onSaved={() => setInventoryModal({ open: false, data: null })}
      />
    </div>
  );
}