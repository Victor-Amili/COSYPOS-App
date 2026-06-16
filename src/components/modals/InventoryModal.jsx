import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { db, storage } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomSelect from "../CustomSelect";

const CATEGORIES = ["Pizza","Burger","Chicken","Bakery","Beverage","Seafood"].map((c) => ({ value: c, label: c }));
const STOCK_OPTIONS = ["Instock","Out of Stock","Low Stock"].map((s) => ({ value: s, label: s }));
const STATUS_OPTIONS = ["Active","Inactive","Draft"].map((s) => ({ value: s, label: s }));

export default function InventoryModal({ isOpen, onClose, item = null, onSaved }) {
  const isEdit = !!item;
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name:"",category:"",quantity:"1",stock:"Instock",status:"Active",price:"",perishable:"yes",image:"" });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setForm({ name:item.name||"",category:item.category||"",quantity:item.quantity||"1",stock:item.stock||"Instock",status:item.status||"Active",price:item.price||"",perishable:item.perishable||"yes",image:item.image||"" });
      setImagePreview(item.image||null);
    } else {
      setForm({ name:"",category:"",quantity:"1",stock:"Instock",status:"Active",price:"",perishable:"yes",image:"" });
      setImagePreview(null); setImageFile(null);
    }
    setError("");
  }, [item, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Please enter a product name."); return; }
    setError("");
    setLoading(true);
    try {
      let imageUrl = form.image;
      if (imageFile && storage) {
        try {
          const storageRef = ref(storage, `inventory/${Date.now()}_${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(storageRef);
        } catch (imgErr) { console.warn("Image upload failed:", imgErr); }
      }
      const data = { ...form, image: imageUrl };
      if (isEdit) { await updateDoc(doc(db, "inventory", item.id), data); }
      else { await addDoc(collection(db, "inventory"), data); }
      onSaved?.(); onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please check your connection and try again.");
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end items-stretch bg-black/60">
      <div className="bg-[#1a1a1a] w-full max-w-lg h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-white text-xl font-semibold">{isEdit ? "Edit Inventory" : "Add New Inventory"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">›</button>
        </div>
        <div className="px-6 py-5 space-y-5">
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
            <button onClick={() => fileInputRef.current?.click()} className="text-white/60 text-sm underline hover:text-brand transition">Change Profile Picture</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Enter inventory name"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
            </div>
            <CustomSelect label="Category" value={form.category} onChange={(val) => setForm((p) => ({ ...p, category: val }))} options={[{ value:"", label:"All" }, ...CATEGORIES]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1.5 block">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="Enter quantity"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
            </div>
            <CustomSelect label="Stock" value={form.stock} onChange={(val) => setForm((p) => ({ ...p, stock: val }))} options={STOCK_OPTIONS} />
          </div>
          <CustomSelect label="Status" value={form.status} onChange={(val) => setForm((p) => ({ ...p, status: val }))} options={STATUS_OPTIONS} />
          <div>
            <label className="text-white/60 text-xs mb-1.5 block">Price</label>
            <div className="relative">
              <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="Enter inventory price"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-brand/60 transition text-sm" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs mb-3 block">Perishable</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="perishable" value="yes" checked={form.perishable==="yes"} onChange={(e) => setForm((p) => ({ ...p, perishable: e.target.value }))} className="w-4 h-4 accent-brand" />
                <span className="text-white text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="perishable" value="no" checked={form.perishable==="no"} onChange={(e) => setForm((p) => ({ ...p, perishable: e.target.value }))} className="w-4 h-4 accent-brand" />
                <span className="text-white text-sm">No</span>
              </label>
            </div>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button onClick={onClose} className="text-white/60 text-sm underline hover:text-white transition">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="bg-brand hover:opacity-90 text-gray-800 font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
