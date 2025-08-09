// ToastProvider.jsx - Global toast notifications with theme-aware styling
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

let incrementalId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((options) => {
    const {
      message,
      type = 'info', // 'success' | 'error' | 'warning' | 'info'
      duration = 4000,
      icon,
    } = options || {};

    if (!message) return;

    const id = ++incrementalId;
    const toast = { id, message, type, icon };
    setToasts((prev) => [toast, ...prev]);

    const timeout = setTimeout(() => removeToast(id), duration);
    timeoutsRef.current.set(id, timeout);

    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.icon && <div className="toast-icon">{toast.icon}</div>}
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Close notification">
              ×
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;


