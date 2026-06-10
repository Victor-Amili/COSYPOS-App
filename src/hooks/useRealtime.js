// src/hooks/useRealtime.js
import { useState, useEffect } from "react";
import { subscribeToOrders, subscribeToOrdersByStatus } from "../services/orderService";
import { subscribeToTables } from "../services/tableService";
import { subscribeToReservations } from "../services/reservationService";
import { subscribeToNotifications } from "../services/notificationService";

/**
 * Hook for real-time orders
 */
export const useRealtimeOrders = (status = null) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = status
      ? subscribeToOrdersByStatus(status, (data) => {
          setOrders(data);
          setLoading(false);
        })
      : subscribeToOrders((data) => {
          setOrders(data);
          setLoading(false);
        });

    return () => unsubscribe();
  }, [status]);

  return { orders, loading };
};

/**
 * Hook for real-time tables
 */
export const useRealtimeTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTables((data) => {
      setTables(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { tables, loading };
};

/**
 * Hook for real-time reservations
 */
export const useRealtimeReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReservations((data) => {
      setReservations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { reservations, loading };
};

/**
 * Hook for real-time notifications
 */
export const useRealtimeNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const unsubscribe = subscribeToNotifications(userId, (data) => {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount, loading };
};
