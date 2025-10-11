'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmModalProps) {
  const [isClosing, setIsClosing] = useState(false);

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

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          icon: 'text-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const colors = getVariantColors();

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
        isClosing ? 'opacity-0' : 'opacity-100'
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          'relative bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#3c4043] max-w-md w-full p-6 transition-all duration-200',
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-in zoom-in-95'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-[#3c4043] rounded-lg transition-colors"
        >
          <X size={20} className="text-[#9aa0a6]" />
        </button>

        {/* Icon */}
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', colors.bg, colors.border, 'border')}>
          <AlertTriangle size={24} className={colors.icon} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-[#e8eaed] mb-2">{title}</h3>

        {/* Message */}
        <p className="text-[#9aa0a6] mb-6 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="px-4 py-2 text-[#e8eaed] hover:bg-[#3c4043]"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn('px-4 py-2 text-white font-medium', colors.button)}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
