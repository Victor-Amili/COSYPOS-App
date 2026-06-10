import { useState, useEffect, useRef } from "react";
import { db, storage } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MENU_OPTIONS = ["Normal Menu", "Special Deals", "New Year Special", "Deserts and Drinks"];

export default function CategoryModal({ isOpen, onClose, category = null, onSaved }) {
  const isEdit = !!category;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    menu: "",
    description: "",
    icon: "",
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        menu: category.menu || "",
        description: category.description || "",
        icon: category.icon || "",
      });
      setIconPreview(category.icon || null);
    } else {
      setForm({ name: "", menu: "", description: "", icon: "" });
      setIconPreview(null);
      setIconFile(null);
    }
  }, [category, isOpen]);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      let iconUrl = form.icon;
      if (iconFile) {
        const storageRef = ref(storage, `category-icons/${Date.now()}_${iconFile.name}`);
        await uploadBytes(storageRef, iconFile);
        iconUrl = await getDownloadURL(storageRef);
      }

      const data = { ...form, icon: iconUrl };

      if (isEdit) {
        await updateDoc(doc(db, "categories", category.id), data);
      } else {
        await addDoc(collection(db, "categories"), { ...data, itemCount: 0 });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error saving category:", err);
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
            {isEdit ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            ›
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Icon Upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-xl bg-[#2a2a2a] border border-white/10 flex items-center justify-center cursor-pointer hover:border-pink-400/50 transition overflow-hidden"
            >
              {iconPreview ? (
                <img src={iconPreview} alt="icon preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/30">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                    <path d="M21 15l-5-5L5 21" strokeWidth="1.5" />
                  </svg>
                  <span className="text-sm">Select icon here</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white/60 text-sm underline hover:text-pink-400 transition"
            >
              Change Icon
            </button>
          </div>

          {/* Category Name */}
          <div>
            <label className="text-white text-sm font-medium block mb-2">Category Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter Category name"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400/60 transition text-sm"
            />
          </div>

          {/* Select Menu */}
          <div>
            <label className="text-white text-sm font-medium block mb-2">Select Menu</label>
            <select
              name="menu"
              value={form.menu}
              onChange={handleChange}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-400/60 transition text-sm appearance-none"
            >
              <option value="">Select menu</option>
              {MENU_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-white text-sm font-medium block mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="write your category description here"
              rows={4}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-400/60 transition text-sm resize-none"
            />
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
