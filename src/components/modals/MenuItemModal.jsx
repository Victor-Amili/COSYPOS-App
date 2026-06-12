import { useState, useEffect, useRef } from "react";
import { db, storage } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CATEGORIES = ["Pizza", "Burger", "Chicken", "Bakery", "Beverage", "Seafood"];
const MENU_TABS = ["Normal Menu", "Special Deals", "New Year Special", "Deserts and Drinks"];
const AVAILABILITY = ["In Stock", "Out of Stock"];

export default function MenuItemModal({ isOpen, onClose, item = null, onSaved }) {
  const isEdit = !!item;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    menuTab: "",
    price: "",
    stock: "",
    availability: "In Stock",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "",
        menuTab: item.menuTab || "",
        price: item.price || "",
        stock: item.stock || "",
        availability: item.availability || "In Stock",
        image: item.image || "",
      });
      setImagePreview(item.image || null);
    } else {
      setForm({ name: "", description: "", category: "", menuTab: "", price: "", stock: "", availability: "In Stock", image: "" });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [item, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        const storageRef = ref(storage, `menu-items/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const itemId = `#${Math.floor(10000000 + Math.random() * 90000000)}`;
      const data = { ...form, image: imageUrl, ...(isEdit ? {} : { itemId }) };

      if (isEdit) {
        await updateDoc(doc(db, "menuItems", item.id), data);
      } else {
        await addDoc(collection(db, "menuItems"), data);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error saving menu item:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] w-full max-w-lg h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">
            {isEdit ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            ›
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-xl bg-[#2a2a2a] border border-white/10 flex items-center justify-center cursor-pointer hover:border-pink-400/50 transition overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/30">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                    <path d="M21 15l-5-5L5 21" strokeWidth="1.5" />
                  </svg>
                  <span className="text-sm">Upload product image</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white/60 text-sm underline hover:text-pink-400 transition"
            >
              Change Image
            </button>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400/60 transition text-sm"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium block mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400/60 transition text-sm appearance-none"
              >
                <option value="">Select</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white text-sm font-medium block mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400/60 transition text-sm resize-none"
            />
          </div>

          {/* Menu Tab & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Menu Section</label>
              <select
                name="menuTab"
                value={form.menuTab}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400/60 transition text-sm appearance-none"
              >
                <option value="">Select</option>
                {MENU_TABS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white text-sm font-medium block mb-2">Stock (items)</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400/60 transition text-sm"
              />
            </div>
          </div>

          {/* Price & Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400/60 transition text-sm"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium block mb-2">Availability</label>
              <select
                name="availability"
                value={form.availability}
                onChange={handleChange}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400/60 transition text-sm appearance-none"
              >
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              onClick={onClose}
              className="text-white/60 text-sm underline hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-pink-400 hover:bg-pink-500 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
