import { useState, useRef, useEffect } from 'react';
import { RxChevronDown, RxCheck } from 'react-icons/rx';
import { GrCluster } from 'react-icons/gr';

const SORT_OPTIONS = [
  { value: 'From', label: 'From' },
  { value: 'To', label: 'To' },
  { value: 'Creator', label: 'Creator' },
  { value: 'Media', label: 'Media' },
  { value: 'Event', label: 'Event' },
  { value: 'Location', label: 'Location' },
  { value: 'Year', label: 'Year' },
  { value: 'none', label: 'None' },
];

export default function SelectSort({ changeSort, sort, view }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (view !== 'graph') return null;

  const selectedOption =
    SORT_OPTIONS.find((option) => option.value === sort) || SORT_OPTIONS[0];

  const handleSelect = (value) => {
    changeSort(value);
    setIsOpen(false);
  };

  return (
    <div className='w-full h-full flex items-center'>
      <div className='w-full relative' ref={dropdownRef}>
        {/* Dropdown - positioned ABOVE the button */}
        {isOpen && (
          <div className='absolute bottom-full left-0 right-0 z-50 mb-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-80 overflow-hidden'>
            <div className='max-h-none overflow-y-auto'>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-600 transition-colors flex items-center justify-between ${
                    option.value === selectedOption.value
                      ? 'text-white'
                      : 'text-gray-300'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === selectedOption.value && (
                    <RxCheck className='text-green-400' size={16} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Select Button */}
        <div className='flex gap-3 items-center text-xs font-light'>
          <div className='flex gap-2 items-center text-gray-300'>
            <GrCluster size={13} />
            <span className=' whitespace-nowrap'>Cluster by:</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='bg-slate-700 text-white px-4 py-2 font-thin text-sm rounded-lg w-full outline-none text-center flex items-center justify-between hover:bg-slate-600 transition-colors'
          >
            <span className='text-gray-300'>{selectedOption.label}</span>
            <RxChevronDown
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              size={16}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
