import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { Token } from '../../types/tokens';
import Mint from './Mint';

type Props = {
  open: boolean;
  onClose: () => void;
  token: Token['token'];
  defaultQuantity?: number;
};

export default function CollectModal({
  open,
  onClose,
  token,
  defaultQuantity = 1,
}: Props) {
  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    setQuantity(defaultQuantity);
  }, [defaultQuantity, open]);

  const name = token?.name || `#${token?.tokenId}`;
  const image =
    token?.imageSmall ||
    token?.image ||
    token?.imageLarge ||
    token?.imageOriginal;

  const qtyValid = useMemo(() => {
    if (!Number.isFinite(quantity)) return false;
    if (quantity < 1) return false;
    if (!Number.isInteger(quantity)) return false;
    return true;
  }, [quantity]);

  useEffect(() => {
    if (!qtyValid) setError('Enter a number greater or equal to 1');
    else setError(null);
  }, [qtyValid]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      <div className='w-full max-w-md rounded-lg bg-slate-900 border border-slate-700 shadow-xl overflow-hidden'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-slate-700'>
          <h2 className='text-lg font-semibold'>Collect</h2>
          <button
            onClick={onClose}
            className='rounded-md px-2 py-1 text-slate-300 hover:text-white hover:bg-slate-700'
            aria-label='Close'
          >
            ✕
          </button>
        </div>
        <div className='p-4 flex gap-3'>
          <div className='shrink-0 w-16 h-16 bg-slate-800 rounded overflow-hidden flex items-center justify-center'>
            {image ? (
              <Image
                src={image}
                alt={name}
                width={64}
                height={64}
                className='object-cover w-full h-full'
              />
            ) : (
              <div className='text-xs text-slate-500'>No image</div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='text-base font-medium truncate'>{name}</div>
            <div className='text-xs text-slate-400 break-words'>
              ID: {token?.tokenId}
            </div>
            {/* Quantity input */}
            <div className='mt-3'>
              <label
                htmlFor='collect-qty'
                className='block text-sm text-slate-300 mb-1'
              >
                Quantity
              </label>
              <div className='flex items-center gap-2'>
                <button
                  className='px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50'
                  onClick={() =>
                    setQuantity((q) => Math.max(1, (Number(q) || 1) - 1))
                  }
                  disabled={quantity <= 1}
                  aria-label='Decrease quantity'
                >
                  −
                </button>
                <input
                  id='collect-qty'
                  type='number'
                  min={1}
                  step={1}
                  inputMode='numeric'
                  className='w-24 rounded bg-slate-800 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500'
                  value={Number.isFinite(quantity) ? quantity : ''}
                  onChange={(e) =>
                    setQuantity(Math.floor(Number(e.target.value)))
                  }
                />
                <button
                  className='px-2 py-1 rounded bg-slate-800 hover:bg-slate-700'
                  onClick={() =>
                    setQuantity((q) => Math.max(1, (Number(q) || 1) + 1))
                  }
                  aria-label='Increase quantity'
                >
                  +
                </button>
              </div>
              {error && (
                <div className='mt-1 text-xs text-red-400'>{error}</div>
              )}
            </div>
          </div>
        </div>
        <div className='px-4 pb-4'>
          <Mint
            token={token}
            quantity={qtyValid ? quantity : undefined}
            className={`w-full py-2 rounded-md ${
              qtyValid
                ? 'bg-[#01ff00] text-black hover:opacity-90'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            onSuccess={() => onClose()}
            onError={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
