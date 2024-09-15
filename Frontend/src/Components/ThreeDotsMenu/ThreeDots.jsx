import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

const ThreeDotsMenu = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleButtonClick = (event) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (action) => (event) => {
    event.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div className="three-dots-menu" ref={menuRef}>
      <button onClick={handleButtonClick} className="three-dots-button bg-blue-400">
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <ul className="menu-options">
          {options.map((option, index) => (
            <li key={index} onClick={handleOptionClick(option.action)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThreeDotsMenu;