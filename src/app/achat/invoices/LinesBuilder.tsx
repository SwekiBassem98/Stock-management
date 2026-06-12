'use client';

import { useState } from 'react';

type Variant = { id: number; label: string };

export default function LinesBuilder({ variants }: { variants: Variant[] }) {
  const [lines, setLines] = useState<{ variantId: number; quantity: number; unitPurchasePrice: number }[]>([]);

  const add = () => setLines([...lines, { variantId: variants[0]?.id ?? 0, quantity: 1, unitPurchasePrice: 0 }]);
  const remove = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: number) => {
    const copy = [...lines];
    // @ts-ignore
    copy[i][field] = value;
    setLines(copy);
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Lines</h4>
        <button type="button" onClick={add} className="px-2 py-1 bg-gray-100 rounded">Add line</button>
      </div>
      {lines.length === 0 && <div className="text-sm text-gray-500">No lines yet.</div>}
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 items-center">
          <select value={l.variantId} onChange={(e) => update(i, 'variantId', Number(e.target.value))}>
            {variants.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
          <input type="number" step="0.0001" min="0.0001" value={l.quantity} onChange={(e) => update(i, 'quantity', Number(e.target.value))} />
          <div className="flex gap-2">
            <input type="number" step="0.0001" min="0" value={l.unitPurchasePrice} onChange={(e) => update(i, 'unitPurchasePrice', Number(e.target.value))} />
            <button type="button" onClick={() => remove(i)} className="px-2 py-1 bg-red-600 text-white rounded">X</button>
          </div>
        </div>
      ))}
    </div>
  );
}