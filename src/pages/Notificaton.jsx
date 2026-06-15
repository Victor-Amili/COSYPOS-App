import { useState, useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { db } from "../firebase/config";
import { collection, onSnapshot, doc, deleteDoc, writeBatch, query, orderBy } from "firebase/firestore";

function Notificaton() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // In Notificaton.jsx, you could add filter tabs:
  const typeFilters = ["all", "order", "reservation", "inventory", "staff"];

  // Fetch notifications from Firebase
  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    const batch = writeBatch(db);
    unreadNotifications.forEach((n) => {
      const ref = doc(db, "notifications", n.id);
      batch.update(ref, { read: true });
    });

    try {
      await batch.commit();
      // onSnapshot will update local state automatically
    } catch (error) {
      console.error("Error marking all as read:", error);
      alert("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      // onSnapshot will update local state automatically
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-0">
      {/* Subtitle — close to page title, small bottom margin */}
      <p className="text-xs sm:text-sm text-gray-400 mb-10 sm:mb-12">
        You&apos;ve {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
      </p>

      {/* Tabs and Mark All — stacked on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${activeTab === "all"
              ? "bg-[#F5C6CC] text-[#7D5B67]"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none ${activeTab === "unread"
              ? "bg-[#F5C6CC] text-[#7D5B67]"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
          >
            Unread
          </button>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3 sm:px-4 py-2 bg-[#F5C6CC]/20 text-[#7D5B67] rounded-lg text-xs sm:text-sm font-medium hover:bg-[#F5C6CC]/30 transition-all whitespace-nowrap"
        >
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2 sm:space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-xs sm:text-sm">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs sm:text-sm">
            No notifications
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all ${notification.read
                ? "bg-[#1e1e1e]"
                : "bg-[#1e1e1e] border border-white/5"
                }`}
            >
              {/* Icon */}
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#F5C6CC]/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5C6CC]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-white mb-0.5">
                  {notification.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                  {notification.message}
                </p>
              </div>

              {/* Date — hidden on very small screens */}
              <span className="hidden sm:block text-xs text-gray-500 flex-shrink-0">
                {notification.createdAt?.toDate
                  ? notification.createdAt.toDate().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : notification.date || "—"}
              </span>

              {/* Delete button */}
              <button
                onClick={() => deleteNotification(notification.id)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-red-500/30 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notificaton;