import { useEffect, useRef, useState } from 'react';
import { RxChevronDown, RxCheck } from 'react-icons/rx';
import { TbChartDots3 } from 'react-icons/tb';
import { CONSTELLATIONS } from '@/utils/constellations';

interface ConstellationsBtnProps {
  constellations: string[];
  changeConstellations: (constellations: string[]) => void;
  showMineIsChecked: boolean;
  setShowMineIsChecked: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export default function ConstellationsBtn({
  constellations,
  changeConstellations,
  showMineIsChecked,
  setShowMineIsChecked,
}: ConstellationsBtnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCount = constellations.length + (showMineIsChecked ? 1 : 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleConstellation = (constellation: string) => {
    if (constellations.includes(constellation)) {
      changeConstellations(constellations.filter((c) => c !== constellation));
    } else {
      changeConstellations([...constellations, constellation]);
    }
  };

  return (
    <div className='w-full h-full flex items-center'>
      <div className='w-full relative' ref={dropdownRef}>
        {/* Dropdown - positioned ABOVE the button */}
        {isOpen && (
          <div className='absolute bottom-full left-0 right-0 z-50 mb-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-80 overflow-hidden'>
            <div className='max-h-56 overflow-y-auto'>
              {CONSTELLATIONS.map((constellation) => {
                const isSelected = constellations.includes(constellation);
                return (
                  <button
                    key={constellation}
                    onClick={() => {
                      toggleConstellation(constellation);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-600 transition-colors flex items-center justify-between ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    <span>{constellation}</span>
                    {isSelected && (
                      <RxCheck className='text-green-400' size={16} />
                    )}
                  </button>
                );
              })}
              <div className='mx-2 border-t border-slate-600' />
              <button
                onClick={() => {
                  setShowMineIsChecked((prev) => !prev);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-600 transition-colors flex items-center justify-between ${
                  showMineIsChecked ? 'text-white' : 'text-gray-300'
                }`}
              >
                <span>Collected by me</span>
                {showMineIsChecked && (
                  <RxCheck className='text-green-400' size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Main Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='relative bg-slate-700 text-white px-4 py-2 font-thin text-sm rounded-lg w-full outline-none text-center flex items-center justify-between hover:bg-slate-600 transition-colors'
        >
          <span className='flex items-center gap-2 text-gray-300'>
            <TbChartDots3 size={16} />
            Constellations
          </span>
          <div className='flex items-center gap-2'>
            <RxChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              size={16}
            />
          </div>
          {selectedCount > 0 && (
            <div className='absolute -bottom-1.5 -left-1.5 min-w-[18px] h-[18px] rounded-full bg-[#01ff00] text-black text-[11px] font-semibold leading-[4px] text-center flex items-center justify-center'>
              {selectedCount}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
