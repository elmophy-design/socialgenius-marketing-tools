// frontend/src/contexts/ModalContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);
  const [modalHistory, setModalHistory] = useState([]);

  // Open modal
  const openModal = useCallback((modalName, modalData = {}) => {
    const modalId = Date.now();
    
    setModals(prev => [
      ...prev,
      {
        id: modalId,
        name: modalName,
        data: modalData,
        isOpen: true,
        openedAt: new Date().toISOString(),
      },
    ]);

    setModalHistory(prev => [...prev, { id: modalId, name: modalName }]);

    return modalId;
  }, []);

  // Close modal
  const closeModal = useCallback((modalId) => {
    setModals(prev =>
      prev.map(modal =>
        modal.id === modalId ? { ...modal, isOpen: false } : modal
      )
    );

    // Remove from history
    setTimeout(() => {
      setModals(prev => prev.filter(modal => modal.id !== modalId));
      setModalHistory(prev => prev.filter(m => m.id !== modalId));
    }, 300); // Match CSS transition duration
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals(prev =>
      prev.map(modal => ({ ...modal, isOpen: false }))
    );

    setTimeout(() => {
      setModals([]);
      setModalHistory([]);
    }, 300);
  }, []);

  // Close current modal
  const closeCurrentModal = useCallback(() => {
    if (modals.length > 0) {
      const lastModal = modals[modals.length - 1];
      closeModal(lastModal.id);
    }
  }, [modals, closeModal]);

  // Close modal by name
  const closeModalByName = useCallback((modalName) => {
    const modalToClose = modals.find(modal => modal.name === modalName);
    if (modalToClose) {
      closeModal(modalToClose.id);
    }
  }, [modals, closeModal]);

  // Update modal data
  const updateModalData = useCallback((modalId, newData) => {
    setModals(prev =>
      prev.map(modal =>
        modal.id === modalId
          ? { ...modal, data: { ...modal.data, ...newData } }
          : modal
      )
    );
  }, []);

  // Check if modal is open
  const isModalOpen = useCallback((modalName) => {
    return modals.some(modal => modal.name === modalName && modal.isOpen);
  }, [modals]);

  // Get modal data
  const getModalData = useCallback((modalName) => {
    const modal = modals.find(m => m.name === modalName);
    return modal?.data || {};
  }, [modals]);

  // Open confirm modal
  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning',
  }) => {
    const modalId = openModal('confirm', {
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        closeModal(modalId);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        closeModal(modalId);
      },
      type,
    });

    return modalId;
  }, [openModal, closeModal]);

  // Open alert modal
  const alert = useCallback(({
    title = 'Alert',
    message,
    buttonText = 'OK',
    onClose,
    type = 'info',
  }) => {
    const modalId = openModal('alert', {
      title,
      message,
      buttonText,
      onClose: () => {
        if (onClose) onClose();
        closeModal(modalId);
      },
      type,
    });

    return modalId;
  }, [openModal, closeModal]);

  // Open prompt modal
  const prompt = useCallback(({
    title = 'Input Required',
    message,
    placeholder = 'Enter value...',
    defaultValue = '',
    confirmText = 'Submit',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'info',
    inputType = 'text',
  }) => {
    const modalId = openModal('prompt', {
      title,
      message,
      placeholder,
      defaultValue,
      confirmText,
      cancelText,
      onConfirm: (value) => {
        if (onConfirm) onConfirm(value);
        closeModal(modalId);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        closeModal(modalId);
      },
      type,
      inputType,
    });

    return modalId;
  }, [openModal, closeModal]);

  // Open loading modal
  const showLoading = useCallback((message = 'Loading...') => {
    const modalId = openModal('loading', { message });
    return modalId;
  }, [openModal]);

  // Hide loading modal
  const hideLoading = useCallback(() => {
    closeModalByName('loading');
  }, [closeModalByName]);

  // Modal stack management
  const getModalStack = useCallback(() => {
    return modals.filter(modal => modal.isOpen);
  }, [modals]);

  const getActiveModal = useCallback(() => {
    const openModals = getModalStack();
    return openModals.length > 0 ? openModals[openModals.length - 1] : null;
  }, [getModalStack]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    const hasOpenModal = modals.some(modal => modal.isOpen);
    
    if (hasOpenModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Compensate for scrollbar
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [modals]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Close modal on Escape
      if (e.key === 'Escape' && modals.length > 0) {
        closeCurrentModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modals, closeCurrentModal]);

  const value = {
    modals: getModalStack(),
    openModal,
    closeModal,
    closeAllModals,
    closeCurrentModal,
    closeModalByName,
    updateModalData,
    isModalOpen,
    getModalData,
    confirm,
    alert,
    prompt,
    showLoading,
    hideLoading,
    getActiveModal,
    modalHistory,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Render all open modals */}
      {modals
        .filter(modal => modal.isOpen)
        .map((modal, index) => (
          <div key={modal.id} className="modal-portal">
            {React.cloneElement(
              getModalComponent(modal.name),
              {
                ...modal.data,
                isOpen: true,
                onClose: () => closeModal(modal.id),
                modalIndex: index,
              }
            )}
          </div>
        ))}
    </ModalContext.Provider>
  );
};

// Helper function to get modal components
const getModalComponent = (modalName) => {
  // This would import your actual modal components
  // For now, return a placeholder
  return <div>Modal: {modalName}</div>;
};