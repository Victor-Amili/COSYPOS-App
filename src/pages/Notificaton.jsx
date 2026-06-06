import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { dummyNotifications } from "../datas/dummyData";

function Notificaton() {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Notification</h2>
          <p className="text-sm text-gray-400">You&apos;ve {unreadCount} unread notification</p>
        </div>
      </div>

      {/* Tabs and Mark All */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-pink-400 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "unread"
                ? "bg-pink-400 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            Unread
          </button>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-pink-400/20 text-pink-300 rounded-lg text-sm font-medium hover:bg-pink-400/30 transition-all"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              notification.read
                ? "bg-[#1e1e1e]"
                : "bg-[#1e1e1e] border border-white/5"
            }`}
          >
            {/* Icon Box */}
            <div className="w-12 h-12 rounded-xl bg-pink-400/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-pink-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white mb-0.5">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {notification.message}
              </p>
            </div>

            {/* Date */}
            <span className="text-xs text-gray-500 flex-shrink-0">
              {notification.date}
            </span>

            {/* Delete Button */}
            <button
              onClick={() => deleteNotification(notification.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-all flex-shrink-0"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notificaton;