'use client';

import { useState } from 'react';

interface DataTableProps {
  data: Array<{ [key: string]: string }>;
  onUpdateCell: (rowIndex: number, field: string, value: string) => void;
}

export function DataTable({ data, onUpdateCell }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
        <h3 className="text-xl font-bold text-white mb-4">Survey Data</h3>
        <p className="text-white/60">No data available</p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleCellClick = (rowIndex: number, field: string, value: string) => {
    setEditingCell({ row: rowIndex, field });
    setEditValue(value);
  };

  const handleCellBlur = () => {
    if (editingCell) {
      onUpdateCell(startIndex + editingCell.row, editingCell.field, editValue);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Survey Data (Editable)</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Previous
          </button>
          <span className="text-white/80 text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left p-3 text-white/80 font-semibold sticky left-0 bg-white/10">
                #
              </th>
              {headers.slice(0, 10).map((header, index) => (
                <th
                  key={index}
                  className="text-left p-3 text-white/80 font-semibold min-w-[150px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="p-3 text-white/60 font-mono sticky left-0 bg-white/10">
                  {startIndex + rowIndex + 1}
                </td>
                {headers.slice(0, 10).map((header, colIndex) => {
                  const isEditing =
                    editingCell?.row === rowIndex && editingCell?.field === header;
                  const value = row[header] || '';

                  return (
                    <td
                      key={colIndex}
                      className="p-3 text-white/90 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => !isEditing && handleCellClick(rowIndex, header, value)}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full bg-white/20 text-white px-2 py-1 rounded border border-white/30 focus:outline-none focus:border-blue-400"
                        />
                      ) : (
                        <div className="truncate max-w-[200px]" title={value}>
                          {value || '-'}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-white/60 text-xs">
        Click any cell to edit. Press Enter to save, Escape to cancel.
        {headers.length > 10 && (
          <span className="ml-2">
            (Showing first 10 of {headers.length} columns)
          </span>
        )}
      </div>
    </div>
  );
}

// Made with Bob
