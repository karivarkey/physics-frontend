// src/components/tableUtils.ts
import { v4 as uuidv4 } from 'uuid';
import type { TableHeader } from './types';

// Recursively ensures every header node has a unique ID.
export const ensureHeaderIds = (headers: TableHeader[]): TableHeader[] => {
  return headers.map(header => {
    const newHeader = { ...header, id: header.id || uuidv4() };
    if (newHeader.children) {
      newHeader.children = ensureHeaderIds(newHeader.children);
    }
    return newHeader;
  });
};

// You can add other complex helper functions here later.