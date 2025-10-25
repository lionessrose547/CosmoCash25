import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-space-medium rounded-lg shadow-lg w-full max-w-md m-4 border border-space-light/50 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-space-light/30">
          <h3 className="text-xl font-bold font-orbitron text-neon-orange">{title}</h3>
          <button onClick={onClose} className="text-stardust/70 hover:text-stardust text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Modal;
