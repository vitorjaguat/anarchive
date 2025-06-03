import { useState, useRef, useEffect } from 'react';
import {
  RxChevronDown,
  RxCheck,
  RxMagnifyingGlass,
  RxCross2,
} from 'react-icons/rx';

export default function SelectTag({ allTags, setFilter, filter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedTags, setSelectedTags] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter tags based on search term
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleTagSelect = (tag) => {
    if (!filter.includes(tag)) {
      const newSelectedTags = [...filter, tag];
      setFilter(newSelectedTags);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleTagRemove = (tagToRemove) => {
    const newSelectedTags = filter.filter((tag) => tag !== tagToRemove);
    setFilter(newSelectedTags);
    setIsOpen(false);
  };

  const clearAllTags = () => {
    setFilter([]);
  };

  return (
    <div className='w-full lg:max-w-[500px] xl:max-w-[800px] flex h-full items-center justify-center'>
      <div className='w-full relative' ref={dropdownRef}>
        {/* Dropdown - positioned ABOVE the button */}
        {isOpen && (
          <div className='absolute bottom-full left-0 right-0 z-50 mb-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-80 overflow-hidden'>
            {/* Options List - placed at top since dropdown opens upward */}
            <div className='max-h-56 overflow-y-auto'>
              {filteredTags.length === 0 ? (
                <div className='px-4 py-3 text-gray-400 text-sm text-center'>
                  No tags found
                </div>
              ) : (
                filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={
                      filter.includes(tag)
                        ? () => handleTagRemove(tag)
                        : () => handleTagSelect(tag)
                    }
                    // disabled={filter.includes(tag)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-600 transition-colors flex items-center justify-between ${
                      filter.includes(tag)
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-white'
                    }`}
                  >
                    <span>{tag}</span>
                    {filter.includes(tag) && (
                      <RxCheck className='text-green-400' size={16} />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Search Input - placed at bottom since dropdown opens upward */}
            <div className='p-3 border-t border-slate-600'>
              <div className='relative'>
                <RxMagnifyingGlass
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  size={16}
                />
                <input
                  ref={searchInputRef}
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search tags...'
                  className='bg-slate-600 text-white pl-10 pr-4 py-2 text-sm rounded w-full outline-none focus:bg-slate-500'
                />
              </div>
            </div>
          </div>
        )}

        {/* Selected Tags Display - positioned ABOVE the button */}
        {/* {selectedTags.length > 0 && (
          <div className='mb-2 flex flex-wrap gap-2'>
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2'
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleTagRemove(tag)}
                  className='hover:bg-blue-700 rounded-full p-1'
                >
                  <RxCross2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={clearAllTags}
              className='text-gray-400 hover:text-white text-sm underline'
            >
              Clear all
            </button>
          </div>
        )} */}

        {/* Main Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='bg-slate-700 text-white px-4 py-2 font-thin text-sm rounded-lg w-full outline-none text-center flex items-center justify-between hover:bg-slate-600 transition-colors'
        >
          <span className='text-gray-300'>
            {filter.length === 0
              ? 'Select content tags to filter fragments...'
              : `${filter.length} tag${filter.length > 1 ? 's' : ''} selected`}
          </span>
          <RxChevronDown
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            size={16}
          />
        </button>
      </div>
    </div>
  );
}
