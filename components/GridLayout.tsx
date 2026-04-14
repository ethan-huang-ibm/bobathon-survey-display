'use client';

import { useState, useRef, useEffect } from 'react';

interface GridLayoutProps {
  title: string,
  children: React.ReactNode;
}

export function GridLayout({ title: title, children }: GridLayoutProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [items, setItems] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setItems(Array.isArray(children) ? children : [children]);
  }, [children]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setItems(newItems);
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  return (
    <>
      <h3 className="text-xl font-bold text-white mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((child, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              cursor-move transition-all duration-200
              ${isDragging && draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
              ${isDragging && draggedIndex !== index ? 'hover:scale-105' : ''}
            `}
          >
            {child}
          </div>
        ))}
      </div>
    </>
  );
}

// Made with Bob
