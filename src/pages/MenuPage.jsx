import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import CategoryModal from "../components/modals/CategoryModal";
import MenuItemModal from "../components/modals/MenuItemModal";

const MENU_TABS = ["Normal Menu", "Special Deals", "New Year Special", "Deserts and Drinks"];

const CATEGORY_ICONS = {
  All: "⊞", Pizza: "🍕", Burger: "🍔", Chicken: "🍗", Bakery: "🍞", Beverage: "☕", Seafood: "🦐",
};

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("Normal Menu");
  const [selectedItems, setSelectedItems] = useState([]);
  const [categoryModal, setCategoryModal] = useState({ open: false, data: null });
  const [menuItemModal, setMenuItemModal] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubItems = onSnapshot(collection(db, "products"), (snap) => {
      setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
       setLoading(false);
    });
    return () => { unsubCat(); unsubItems(); };
  }, []);

  const allCategories = [
    { id: "all", name: "All", icon: "", itemCount: menuItems.length },
    ...categories,
  ];

const filteredItems = menuItems.filter((item) => {
  const catMatch = selectedCategory === "All" || item.categoryName === selectedCategory;
  
  const itemCategory = categories.find(c => c.name === item.categoryName);
  const tabMap = {
    "Normal Menu": "normal",
    "Special Deals": "special-deals",
    "New Year Special": "new-year-special",
    "Deserts and Drinks": "desserts-drinks"
  };
  const tabMatch = itemCategory?.menuType === tabMap[activeTab];
  
  return catMatch && tabMatch;
});

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, "products", id));
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteDoc(doc(db, "categories", id));
  };

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedItems(selectedItems.length === filteredItems.length ? [] : filteredItems.map((i) => i.id));
  };

  return (
    <div className="text-white space-y-8">

      {/* ── CATEGORIES ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Categories</h2>
          <button
            onClick={() => setCategoryModal({ open: true, data: null })}
            className="hidden md:flex bg-brand hover:opacity-90 text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition text-sm"
          >
            Add New Category
          </button>
        </div>

        {/* Desktop: horizontal scroll */}
        <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allCategories.map((cat) => (
            <CategoryCard
              key={cat.id} cat={cat}
              isActive={selectedCategory === cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              onEdit={cat.id !== "all" ? () => setCategoryModal({ open: true, data: cat }) : null}
              onDelete={cat.id !== "all" ? () => handleDeleteCategory(cat.id) : null}
            />
          ))}
        </div>

        {/* Mobile: 2-col grid */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {allCategories.map((cat) => (
            <CategoryCard
              key={cat.id} cat={cat}
              isActive={selectedCategory === cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              onEdit={cat.id !== "all" ? () => setCategoryModal({ open: true, data: cat }) : null}
              onDelete={cat.id !== "all" ? () => handleDeleteCategory(cat.id) : null}
            />
          ))}
        </div>

        <div className="mt-4 md:hidden flex justify-center">
          <button
            onClick={() => setCategoryModal({ open: true, data: null })}
            className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-6 py-2.5 rounded-xl transition text-sm"
          >
            Add New Category
          </button>
        </div>
      </section>

      {/* ── MENU ITEMS ── */}
      <section>
        <h2 className="text-lg md:text-xl font-semibold mb-4">Special menu all items</h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {MENU_TABS.map((tab) => (
              <button
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab ? "bg-brand text-gray-800" : "text-white/50 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMenuItemModal({ open: true, data: null })}
            className="hidden sm:flex bg-brand hover:opacity-90 text-gray-800 font-semibold px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap"
          >
            Add Menu Item
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-2xl overflow-hidden border border-white/5">
          <table className="w-full">
            <thead className="bg-[#1a1a1a]">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-brand"
                  />
                </th>
                {["Product", "Product Name", "Item ID", "Stock", "Category", "Price", "Availability", ""].map((h) => (
                  <th key={h} className="px-4 py-4 text-left text-white/40 text-xs uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-white/30 text-sm">
                     {loading ? "Loading..." : "No items found. Add a menu item to get started."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className={`border-t border-white/5 ${idx % 2 === 0 ? "bg-[#161616]" : "bg-[#1a1a1a]"} hover:bg-white/5 transition`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelectItem(item.id)} className="w-4 h-4 accent-brand" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#2a2a2a]">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">🍽</div>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                    </td>
                    <td className="px-4 py-4 text-white/50 text-sm">{item.itemId || "—"}</td>
                    <td className="px-4 py-4 text-white/70 text-sm">{item.stock ? `${item.stock} items` : "—"}</td>
                    <td className="px-4 py-4 text-white/70 text-sm">{item.category || "—"}</td>
                    <td className="px-4 py-4 text-white text-sm font-medium">${parseFloat(item.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-medium ${item.availability === "In Stock" ? "text-green-400" : "text-red-400"}`}>
                        {item.availability || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setMenuItemModal({ open: true, data: item })} className="text-white/40 hover:text-white transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-400/60 hover:text-red-400 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card list */}
        <div className="md:hidden space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">No items found.</div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-[#1a1a1a] rounded-xl p-4 flex gap-3 border border-white/5">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-white/20 text-xl">🍽</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">{item.category} · {item.itemId}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setMenuItemModal({ open: true, data: item })} className="text-white/40 hover:text-white transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-400/60 hover:text-red-400 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-white font-semibold text-sm">${parseFloat(item.price || 0).toFixed(2)}</span>
                    <span className="text-white/40 text-xs">{item.stock} items</span>
                    <span className={`text-xs font-medium ${item.availability === "In Stock" ? "text-green-400" : "text-red-400"}`}>{item.availability}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile: Add button */}
        <div className="mt-6 sm:hidden flex justify-center">
          <button
            onClick={() => setMenuItemModal({ open: true, data: null })}
            className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-8 py-3 rounded-xl transition text-sm"
          >
            Add New Items
          </button>
        </div>
      </section>

      {/* Modals */}
      <CategoryModal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, data: null })}
        category={categoryModal.data}
        onSaved={() => {}}
      />
      <MenuItemModal
        isOpen={menuItemModal.open}
        onClose={() => setMenuItemModal({ open: false, data: null })}
        item={menuItemModal.data}
        onSaved={() => {}}
      />
    </div>
  );
}

function CategoryCard({ cat, isActive, onClick, onEdit, onDelete }) {
  return (
    <div
      onClick={onClick}
      className={`relative flex-shrink-0 w-36 md:w-40 rounded-2xl p-4 cursor-pointer transition-all border group ${
        isActive ? "bg-brand/20 border-brand/50" : "bg-[#1a1a1a] border-white/5 hover:border-white/20"
      }`}
    >
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white text-xs transition">✎</button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-5 h-5 rounded bg-red-400/10 hover:bg-red-400/20 flex items-center justify-center text-red-400/60 hover:text-red-400 text-xs transition">✕</button>
          )}
        </div>
      )}
      <div className="text-2xl mb-6">
        {cat.icon && !cat.icon.match(/[\u{1F300}-\u{1FFFF}]/u)
          ? <img src={cat.icon} alt={cat.name} className="w-8 h-8 object-contain" />
          : <span>{cat.icon || CATEGORY_ICONS[cat.name] || "🍽"}</span>
        }
      </div>
      <p className={`text-sm font-semibold ${isActive ? "text-pink-300" : "text-white"}`}>{cat.name}</p>
      <p className="text-white/40 text-xs mt-0.5">{cat.itemCount ?? 0} items</p>
    </div>
  );
}
