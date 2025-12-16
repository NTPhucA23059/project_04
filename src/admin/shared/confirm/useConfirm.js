import { useState, useCallback } from 'react';

/**
 * Custom hook for confirmation dialogs
 * Usage:
 * const confirm = useConfirm();
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete User',
 *     message: 'Are you sure you want to delete this user?',
 *     type: 'danger'
 *   });
 *   if (confirmed) {
 *     // proceed with deletion
 *   }
 * };
 */
export function useConfirm() {
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'warning' });
  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = useCallback(({ title, message, type = 'warning' }) => {
    return new Promise((resolve) => {
      setDialog({ isOpen: true, title, message, type });
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setDialog({ isOpen: false, title: '', message: '', type: 'warning' });
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setDialog({ isOpen: false, title: '', message: '', type: 'warning' });
  }, [resolvePromise]);

  return {
    confirm,
    dialog,
    handleConfirm,
    handleCancel,
  };
}





