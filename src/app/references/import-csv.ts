export type CsvImportError = {
  row: number;
  field: string;
  message: string;
};

export type CsvImportResult = {
  success: boolean;
  created: number;
  skipped: number;
  warnings: string[];
  errors: CsvImportError[];
};

export type ParsedCsvRow = {
  lineNumber: number;
  raw: string[];
  values: Record<string, string>;
};

export type ParsedCsv = {
  headers: string[];
  rows: ParsedCsvRow[];
  errors: CsvImportError[];
};

export const normalizeHeader = (header: string) =>
  header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');

export const normalizeText = (value: string) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function parseCsvContent(content: string): ParsedCsv {
  const normalizedContent = content.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < normalizedContent.length; i += 1) {
    const char = normalizedContent[i];
    const next = normalizedContent[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }

      row.push(current);
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (inQuotes) {
    return {
      headers: [],
      rows: [],
      errors: [{ row: 1, field: 'csv', message: 'Le fichier contient des guillemets non fermés.' }],
    };
  }

  row.push(current);
  if (row.length > 1 || row[0] !== '') {
    rows.push(row);
  }

  if (rows.length === 0) {
    return {
      headers: [],
      rows: [],
      errors: [{ row: 1, field: 'csv', message: 'Le fichier CSV est vide.' }],
    };
  }

  const headers = rows[0].map((header) => normalizeHeader(header));

  if (headers.length === 0 || headers.every((header) => header === '')) {
    return {
      headers: [],
      rows: [],
      errors: [{ row: 1, field: 'csv', message: 'Le fichier CSV ne contient pas d\'en-têtes.' }],
    };
  }

  const dataRows = rows.slice(1).map<ParsedCsvRow>((raw, index) => {
    const values: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      values[header] = (raw[headerIndex] ?? '').trim();
    });

    return {
      lineNumber: index + 2,
      raw,
      values,
    };
  });

  return { headers, rows: dataRows, errors: [] };
}

export function resolveHeader(headers: string[], aliases: string[]) {
  return aliases.find((alias) => headers.includes(normalizeHeader(alias)));
}

export function buildCsvError(row: number, field: string, message: string): CsvImportError {
  return { row, field, message };
}
