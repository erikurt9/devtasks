import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const StorageGauge = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);
  const [databaseBreakdown, setDatabaseBreakdown] = useState({});
  const { dark } = useTheme();

  useEffect(() => {
    const calculateStorageUsage = () => {
      const storage = window.localStorage;
      let totalBytes = 0;
      const databaseBreakdown = {};

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        const value = storage.getItem(key);
        const bytes = (key.length + value.length) * 2;

        if (key.startsWith('tasks') || key.startsWith('snippets') || key.startsWith('resources')) {
          const database = key.split('_')[0];
          databaseBreakdown[database] = (databaseBreakdown[database] || 0) + bytes;
        }

        totalBytes += bytes;
      }

      setStorageUsage(totalBytes);
      setDatabaseBreakdown(databaseBreakdown);
    };

    calculateStorageUsage();

    window.addEventListener('storage', calculateStorageUsage);

    return () => {
      window.removeEventListener('storage', calculateStorageUsage);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    if (!e.relatedTarget || !e.relatedTarget.classList.contains('popover')) {
      setIsFocused(false);
    }
  };

  const showPopover = isHovered || isFocused;

  const storageQuota = 5 * 1024 * 1024; // 5MB
  const percentageUsage = (storageUsage / storageQuota) * 100;

  return (
    <div className="relative">
      <button
        className={`p-2 rounded-lg transition-colors duration-200 ${
          dark
            ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
            : 'bg-white hover:bg-neutral-100 text-black'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 4.726l1.414 1.414L17.85 6.5H20l-3.447-3.447z" />
        </svg>
      </button>

      {showPopover && (
        <div
          className={`absolute top-full right-0 z-10 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-zinc-900 text-black dark:text-white ${
            dark ? 'border border-zinc-800' : 'border border-neutral-200'
          }`}
        >
          <div className="p-4">
            <h2 className="text-sm font-bold mb-2">Storage Usage</h2>
            <p className="text-xs mb-2">
              {((storageUsage / 1024).toFixed(2))} KB / {((storageQuota / 1024).toFixed(2))} KB
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-lg dark:bg-zinc-700">
              <div
                className={`h-2 bg-blue-500 rounded-lg ${
                  dark ? 'dark:bg-blue-300' : ''
                }`}
                style={{ width: `${percentageUsage}%` }}
              />
            </div>
            <h2 className="text-sm font-bold mt-4 mb-2">Database Breakdown</h2>
            <ul>
              {Object.keys(databaseBreakdown).map((database) => (
                <li key={database} className="text-xs mb-1">
                  {database}: {((databaseBreakdown[database] / 1024).toFixed(2))} KB
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageGauge;