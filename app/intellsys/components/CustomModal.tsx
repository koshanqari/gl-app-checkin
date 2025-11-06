'use client';

import { useEffect } from 'react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function CustomModal({ isOpen, onClose, title, children, footer }: CustomModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-amber-500 bg-amber-50">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-amber-600 hover:text-amber-800 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-amber-50">
          {footer}
        </div>
      </div>
    </div>
  );
}

