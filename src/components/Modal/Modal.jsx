import { useEffect, useRef } from "react";

// Native <dialog>: focus is trapped inside and Esc closes it for free.
const Modal = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="modal-title"
      className="w-[min(90vw,28rem)] p-0 bg-primary text-darkGreen shadow-xl backdrop:bg-darkGreen/70"
    >
      <div className="p-6 flex flex-col gap-5">
        <h2 id="modal-title" className="font-display text-3xl tracking-wide">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  isBusy = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="font-body font-light text-lg">{message}</p>
    <div className="flex justify-end gap-3">
      <button
        type="button"
        className="border border-darkGreen px-4 py-1"
        onClick={onClose}
        disabled={isBusy}
      >
        Cancel
      </button>
      <button
        type="button"
        className="bg-red text-primary px-4 py-1 disabled:opacity-60"
        onClick={onConfirm}
        disabled={isBusy}
      >
        {isBusy ? "Working…" : confirmText}
      </button>
    </div>
  </Modal>
);

export default Modal;
