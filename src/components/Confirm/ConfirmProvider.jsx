// ConfirmProvider.jsx - Global confirm dialog with theme-aware styling
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Confirm.css';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
};

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result = false) => {
    setDialog(null);
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: options?.title || 'Are you sure?',
        message: options?.message || 'Please confirm this action.',
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        tone: options?.tone || 'default', // 'default' | 'danger'
      });
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!dialog) return;
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, close]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-modal">
            <div className="confirm-header">
              <h3>{dialog.title}</h3>
            </div>
            <div className="confirm-content">
              <p>{dialog.message}</p>
            </div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => close(false)}>
                {dialog.cancelText}
              </button>
              <button
                className={`btn-confirm ${dialog.tone === 'danger' ? 'danger' : ''}`}
                onClick={() => close(true)}
                autoFocus
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;


