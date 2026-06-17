import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { db, storage } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomSelect from "../CustomSelect";

const STOCK_OPTIONS = [
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" }
];
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "draft", label: "Draft" }
];

export default function InventoryModal({ isOpen, onClose, item = null, onSaved }) {
  const isEdit = !!item;
  const fileInputRef = useRef(null);

  const [dbCategories, setDbCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    categoryName: "",
    categoryId: "",
    itemId: "",
    stock: "0",
    stockStatus: "in-stock",
    status: "active",
    price: "",
    costPrice: "",
    isPerishable: true,
    description: "",
    availability: "In Stock",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FIXED: Real-time collection snap listening to capture true docId fields directly
  useEffect(() => {
    if (!isOpen) return;
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setDbCategories(snap.docs.map((d) => {
        const cData = d.data();
        return { 
          value: cData.name, 
          label: cData.name,
          docId: d.id // Captures exact document IDs like "cat_pizza", "cat_bakery"
        };
      }));
    });
    return () => unsub();
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        categoryName: item.categoryName || "",
        categoryId: item.categoryId || "",
        itemId: item.itemId || "",
        stock: String(item.stock || 0),
        stockStatus: item.stockStatus || "in-stock",
        status: item.status || "active",
        price: String(item.price || ""),
        costPrice: String(item.costPrice || ""),
        isPerishable: item.isPerishable !== false,
        description: item.description || "",
        availability: item.availability || "In Stock",
        image: item.image || "",
      });
      setImagePreview(item.image || null);
    } else {
      setForm({
        name: "",
        categoryName: "",
        categoryId: "",
        itemId: "",
        stock: "0",
        stockStatus: "in-stock",
        status: "active",
        price: "",
        costPrice: "",
        isPerishable: true,
        description: "",
        availability: "In Stock",
        image: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setError("");
  }, [item, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Please enter a product name."); return; }
    setError("");
    setLoading(true);

    try {
      let imageUrl = form.image || "";
      if (imageFile && storage) {
        try {
          const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(storageRef);
        } catch (imgErr) {
          console.warn("Image upload failed:", imgErr);
        }
      }

      const finalPrice = parseFloat(form.price) || 0;
      
      // Look up true matching ID reference from live categories tracking array
      const matchingCategory = dbCategories.find(c => c.value === form.categoryName);
      const computedCategoryId = matchingCategory ? matchingCategory.docId : `cat_${(form.categoryName || "general").toLowerCase()}`;

      // Strictly matches your Firestore snapshot key mappings completely
      const data = {
        name: form.name.trim(),
        description: form.description || "",
        price: finalPrice,
        costPrice: parseFloat(form.costPrice) || 0,
        categoryName: form.categoryName || "",
        categoryId: computedCategoryId, // Inject exact target string doc identifier key
        image: imageUrl,
        stock: parseInt(form.stock, 10) || 0,
        stockStatus: form.stockStatus || "in-stock",
        status: form.status || "active",
        isPerishable: form.isPerishable,
        availability: parseInt(form.stock || "0", 10) > 0 ? "In Stock" : "Out of Stock",
      };

      if (isEdit) {
        await updateDoc(doc(db, "products", item.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        const generatedItemId = `#${Math.floor(Math.random() * 90000000) + 10000000}`;
        await addDoc(collection(db, "products"), {
          ...data,
          itemId: form.itemId || generatedItemId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        await addDoc(collection(db, "notifications"), {
          title: "New Product Added",
          message: `${data.name} added to ${data.categoryName} — $${finalPrice.toFixed(2)}`,
          type: "inventory",
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Inventory save failure:", err);
      setError("Failed to save product: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end items-stretch bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] w-full max-w-lg h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">{isEdit ? "Edit Inventory" : "Add New Inventory"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">›</button>
        </div>
        
        <div className="px-6 py-5 space-y-5">
          {/* Image Uploader */}
          <div className="flex flex-col items-center gap-2">
            <div onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-xl bg-[#2a2a2a] border border-white/10 flex items-center justify-center cursor-pointer hover:border-brand/50 transition overflow-hidden">
              {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" /> : (
                <div className="flex flex-col items-center gap-2 text-white/30">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" /><path d="M21 15l-5-5L5 21" strokeWidth="1.5" /></svg>
                  <span className="text-sm">Upload product image</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white/60 text-sm underline hover:text-brand transition">Change Profile Picture</button>
          </div>

          {/* Name & Category Controls Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Enter inventory name"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
            </div>
            <CustomSelect label="Category" value={form.categoryName} onChange={(val) => setForm((p) => ({ ...p, categoryName: val }))} options={dbCategories} placeholder="Select Category" />
          </div>

          {/* Quantities & Availability Trackers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} placeholder="0"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
            </div>
            <CustomSelect label="Stock Status" value={form.stockStatus} onChange={(val) => setForm((p) => ({ ...p, stockStatus: val }))} options={STOCK_OPTIONS} />
          </div>

          <CustomSelect label="Status" value={form.status} onChange={(val) => setForm((p) => ({ ...p, status: val }))} options={STATUS_OPTIONS} />

          {/* Pricing Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Retail Price</label>
              <div className="relative">
                <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0.00"
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Cost Price</label>
              <div className="relative">
                <input type="number" value={form.costPrice} onChange={(e) => setForm((p) => ({ ...p, costPrice: e.target.value }))} placeholder="0.00"
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/60 text-xs mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Enter product description" rows={3}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm resize-none" />
          </div>

          {/* Perishability */}
          <div>
            <label className="text-white/60 text-xs mb-3 block">Perishable</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="isPerishable" checked={form.isPerishable === true} onChange={() => setForm((p) => ({ ...p, isPerishable: true }))} className="w-4 h-4 accent-brand" />
                <span className="text-white text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="isPerishable" checked={form.isPerishable === false} onChange={() => setForm((p) => ({ ...p, isPerishable: false }))} className="w-4 h-4 accent-brand" />
                <span className="text-white text-sm">No</span>
              </label>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

          <div className="flex items-center justify-end gap-4 pt-2">
            <button type="button" onClick={onClose} className="text-white/60 text-sm underline hover:text-white transition">Cancel</button>
            <button type="button" onClick={handleSave} disabled={loading} className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}