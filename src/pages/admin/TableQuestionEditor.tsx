import React, { useEffect, useMemo ,useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import type { TableHeader, TableQuestion, TableRow } from "./types";
import { ensureHeaderIds } from "./tableUtils";

// --- Main Editor Component ---
export const TableQuestionEditor: React.FC<{
  question: TableQuestion;
  onChange: (question: TableQuestion) => void;
}> = ({ question, onChange }) => {
  
  // Local state for column selection only
  const [selectedHeaderIds, setSelectedHeaderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // On first load, ensure all headers have unique IDs
    onChange({ ...question, headers: ensureHeaderIds(question.headers) });
  }, []); // Note: Empty dependency array is correct here for one-time ID generation.

  // --- Recursive Helper Functions ---
  const getLeafCount = (header: TableHeader): number => {
    if (!header.children || header.children.length === 0) return 1;
    return header.children.reduce((acc, child) => acc + getLeafCount(child), 0);
  };
  
  const getMaxDepth = (headers: TableHeader[]): number => {
    if (!headers || headers.length === 0) return 0;
    let maxChildDepth = 0;
    for (const header of headers) {
        if (header.children) {
            maxChildDepth = Math.max(maxChildDepth, getMaxDepth(header.children));
        }
    }
    return 1 + maxChildDepth;
  };
  
  // --- `useMemo` hooks to calculate rendering structure ---
  const headerRows = useMemo(() => {
    const maxDepth = getMaxDepth(question.headers);
    if (maxDepth === 0) return [];
    
    const rows: TableHeader[][] = Array.from({ length: maxDepth }, () => []);
    const buildRows = (headers: TableHeader[], currentDepth: number) => {
      headers.forEach(header => {
        const colSpan = getLeafCount(header);
        const hasChildren = header.children && header.children.length > 0;
        const rowSpan = hasChildren ? 1 : maxDepth - currentDepth;
        
        rows[currentDepth].push({ ...header, colSpan, rowSpan });
        
        if (hasChildren) {
          buildRows(header.children!, currentDepth + 1);
        }
      });
    };
    buildRows(question.headers, 0);
    return rows.filter(row => row.length > 0);
  }, [question.headers]);

  const orderedColumnKeys = useMemo(() => {
    const keys: string[] = [];
    const findKeys = (headers: TableHeader[]) => {
        headers.forEach(h => {
            if (h.children && h.children.length > 0) findKeys(h.children);
            else if (h.key) keys.push(h.key);
        });
    };
    findKeys(question.headers);
    return keys;
  }, [question.headers]);

  // --- Handlers for Table Structure Manipulation ---

  const toggleHeaderSelection = (headerId: string) => {
    const newSelection = new Set(selectedHeaderIds);
    if (newSelection.has(headerId)) newSelection.delete(headerId);
    else newSelection.add(headerId);
    setSelectedHeaderIds(newSelection);
  };
  
  const handleGroupSelected = () => {
    const groupName = prompt("Enter a name for the new group:", "New Group");
    if (!groupName || selectedHeaderIds.size === 0) return;

    const extractedHeaders: TableHeader[] = [];
    
    const findHeadersToGroup = (headers: TableHeader[]) => {
      headers.forEach(h => {
        if (selectedHeaderIds.has(h.id)) extractedHeaders.push(h);
        else if (h.children) findHeadersToGroup(h.children);
      });
    };
    findHeadersToGroup(question.headers);

    const newGroup: TableHeader = { id: uuidv4(), label: groupName, colSpan: 1, children: extractedHeaders };

    let replacementDone = false;
    
    const buildNewTree = (headers: TableHeader[]): TableHeader[] => {
      const result: TableHeader[] = [];
      for (const header of headers) {
        if (selectedHeaderIds.has(header.id)) {
          if (!replacementDone) {
            result.push(newGroup);
            replacementDone = true;
          }
        } else {
          if (header.children) {
            const newChildren = buildNewTree(header.children);
            if (newChildren.length > 0) result.push({ ...header, children: newChildren });
          } else {
            result.push(header);
          }
        }
      }
      return result;
    };
    
    const finalHeaders = buildNewTree(question.headers);

    onChange({ ...question, headers: finalHeaders });
    setSelectedHeaderIds(new Set());
  };

  const handleDeleteColumn = (headerId: string) => {
    if (!confirm("Are you sure you want to delete this column/group? This cannot be undone.")) return;
    const keysToDelete = new Set<string>();
    const findKeysToDelete = (header: TableHeader) => {
      if (header.children) header.children.forEach(findKeysToDelete);
      else if (header.key) keysToDelete.add(header.key);
    };

    const removeHeaderRecursive = (headers: TableHeader[], idToRemove: string): TableHeader[] => {
      const headerToRemove = headers.find(h => h.id === idToRemove);
      if (headerToRemove) {
        findKeysToDelete(headerToRemove);
        return headers.filter(h => h.id !== idToRemove);
      }
      return headers.map(h => {
        if (h.children) return { ...h, children: removeHeaderRecursive(h.children, idToRemove) };
        return h;
      }).filter(h => h.children ? h.children.length > 0 : true);
    };

    const newHeaders = removeHeaderRecursive(question.headers, headerId);
    
    const newRows = question.rows.map(row => {
      const newValues = { ...row.values };
      keysToDelete.forEach(key => { delete newValues[key]; });
      return { ...row, values: newValues };
    });

    onChange({ ...question, headers: newHeaders, rows: newRows });
  };
  
  const handleHeaderLabelChange = (headerId: string, newLabel: string) => {
    const updateRecursive = (headers: TableHeader[]): TableHeader[] => {
      return headers.map(h => {
        if (h.id === headerId) return { ...h, label: newLabel };
        if (h.children) return { ...h, children: updateRecursive(h.children) };
        return h;
      });
    };
    onChange({ ...question, headers: updateRecursive(question.headers) });
  };

  const handleCellChange = (rowId: string, columnKey: string, value: string) => {
    const updatedRows = question.rows.map(row => {
      if (row.id === rowId) return { ...row, values: { ...row.values, [columnKey]: value } };
      return row;
    });
    onChange({ ...question, rows: updatedRows });
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: uuidv4(),
      values: orderedColumnKeys.reduce((acc, key) => ({...acc, [key]: ''}), {})
    };
    onChange({ ...question, rows: [...question.rows, newRow]});
  };

  const handleDeleteRow = (rowId: string) => {
    onChange({ ...question, rows: question.rows.filter(row => row.id !== rowId) });
  };

  const handleAddColumn = () => {
    const newKey = `col_${uuidv4().slice(0, 4)}`;
    const newHeader: TableHeader = { id: uuidv4(), key: newKey, label: "New Column", colSpan: 1 };
    const newRows = question.rows.map(row => ({
      ...row, values: { ...row.values, [newKey]: '' }
    }));
    onChange({ ...question, headers: [...question.headers, newHeader], rows: newRows });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          <button onClick={handleAddColumn} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
            + Add Column
          </button>
          {selectedHeaderIds.size > 0 && (
            <button onClick={handleGroupSelected} className="text-sm bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded">
              Group Selected ({selectedHeaderIds.size})
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
            <input 
                id="lock-rows-toggle" 
                type="checkbox" 
                // Read the lock state directly from the question prop
                checked={question.rowsLocked ?? false} 
                // Update the question object when toggled
                onChange={(e) => onChange({ ...question, rowsLocked: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="lock-rows-toggle" className="text-sm font-medium text-gray-700">Lock Rows</label>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            {headerRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map(header => (
                  <th key={header.id} colSpan={header.colSpan} rowSpan={header.rowSpan} className="border-b border-r p-1 align-top">
                    <div className="flex items-start justify-between gap-1">
                      <input type="checkbox" title="Select for grouping" checked={selectedHeaderIds.has(header.id)} onChange={() => toggleHeaderSelection(header.id)} className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                      <input type="text" value={header.label} onChange={(e) => handleHeaderLabelChange(header.id, e.target.value)} className="w-full bg-transparent font-semibold text-center p-1 focus:ring-1 focus:ring-blue-400 rounded"/>
                      <button onClick={() => handleDeleteColumn(header.id)} className="text-red-400 hover:text-red-700 font-bold px-1" title="Delete Column/Group">&times;</button>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {question.rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {orderedColumnKeys.map((key) => (
                  <td key={`${key}-${row.id}`} className="border-b border-r p-0">
                    <input type="text" value={row.values[key] ?? ""} onChange={(e) => handleCellChange(row.id, key, e.target.value)} className="w-full p-2 border-0 focus:ring-1 focus:ring-blue-400"/>
                  </td>
                ))}
                <td className="border-b border-r text-center p-0">
                   <button onClick={() => handleDeleteRow(row.id)} 
                     // Disable based on the question prop
                     disabled={question.rowsLocked} 
                     className="text-red-500 px-2 py-2 hover:bg-red-100 rounded-full disabled:text-gray-300 disabled:hover:bg-transparent" title="Delete Row">&ndash;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <button 
          onClick={handleAddRow} 
          // Disable based on the question prop
          disabled={question.rowsLocked} 
          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:bg-gray-100 disabled:text-gray-400">
            + Add Row
        </button>
      </div>
    </div>
  );
};