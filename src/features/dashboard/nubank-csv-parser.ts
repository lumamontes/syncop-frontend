/**
 * Parser for Nubank CSV bank statement format
 * Format: Data, Valor, Identificador, Descrição
 */

export interface NubankCSVRow {
  data: string; // DD/MM/YYYY format
  valor: number; // Can be positive or negative
  identificador: string; // UUID
  descricao: string;
}

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD format
  amount: number; // Always positive
  transactionType: 'DEBIT' | 'CREDIT';
  description: string;
  identifier: string; // UUID from CSV
  merchantName?: string;
}

/**
 * Parse CSV text content into Nubank format rows
 */
export function parseNubankCSV(csvText: string): NubankCSVRow[] {
  const lines = csvText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  // Find header row (should contain "Data", "Valor", "Identificador", "Descrição")
  let headerIndex = -1;
  const headerKeywords = ['Data', 'Valor', 'Identificador', 'Descrição'];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (headerKeywords.every(keyword => line.includes(keyword.toLowerCase()))) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error(
      'Could not find CSV header row. Expected columns: Data, Valor, Identificador, Descrição',
    );
  }

  // Parse header to find column indices and detect separator
  const headerLine = lines[headerIndex];

  // Detect separator (comma or tab)
  const hasTabs = headerLine.includes('\t');
  const separator = hasTabs ? '\t' : ',';

  const headers = parseCSVLine(headerLine, separator);

  const dataIndex = headers.findIndex(h => h.toLowerCase().includes('data'));
  const valorIndex = headers.findIndex(h => h.toLowerCase().includes('valor'));
  const identificadorIndex = headers.findIndex(h =>
    h.toLowerCase().includes('identificador'),
  );
  const descricaoIndex = headers.findIndex(
    h =>
      h.toLowerCase().includes('descrição') ||
      h.toLowerCase().includes('descricao'),
  );

  if (
    dataIndex === -1 ||
    valorIndex === -1 ||
    identificadorIndex === -1 ||
    descricaoIndex === -1
  ) {
    throw new Error(
      'Missing required columns. Expected: Data, Valor, Identificador, Descrição',
    );
  }

  // Parse data rows
  const rows: NubankCSVRow[] = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line, separator);

      if (
        values.length <
        Math.max(dataIndex, valorIndex, identificadorIndex, descricaoIndex) + 1
      ) {
        continue; // Skip incomplete rows
      }

      const data = values[dataIndex]?.trim();
      const valorStr = values[valorIndex]?.trim();
      const identificador = values[identificadorIndex]?.trim();
      const descricao = values[descricaoIndex]?.trim();

      if (!data || !valorStr || !identificador || !descricao) {
        continue; // Skip rows with missing required fields
      }

      // Parse date (DD/MM/YYYY)
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        console.warn(`Skipping row with invalid date format: ${data}`);
        continue;
      }

      // Parse value (handle both . and , as decimal separator)
      const valor = Number.parseFloat(
        valorStr.replace(',', '.').replace(/[^\d.-]/g, ''),
      );
      if (Number.isNaN(valor)) {
        console.warn(`Skipping row with invalid value: ${valorStr}`);
        continue;
      }

      rows.push({
        data,
        valor,
        identificador,
        descricao,
      });
    } catch (error) {
      console.warn(`Error parsing row ${i + 1}:`, error);
    }
  }

  return rows;
}

/**
 * Parse a CSV line handling quoted fields and different separators
 */
function parseCSVLine(line: string, separator = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Convert Nubank CSV rows to transaction format
 */
export function convertToTransactions(
  rows: NubankCSVRow[],
): ParsedTransaction[] {
  return rows.map(row => {
    // Parse date from DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = row.data.split('/');
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Determine transaction type based on value sign
    const transactionType: 'DEBIT' | 'CREDIT' =
      row.valor < 0 ? 'DEBIT' : 'CREDIT';
    const amount = Math.abs(row.valor);

    // Try to extract merchant name from description
    // Nubank descriptions often have format: "Transferência enviada pelo Pix - MERCHANT NAME - ..."
    let merchantName: string | undefined;
    const descLower = row.descricao.toLowerCase();

    if (descLower.includes('transferência enviada pelo pix')) {
      const parts = row.descricao.split(' - ');
      if (parts.length > 1) {
        merchantName = parts[1].trim();
      }
    } else if (descLower.includes('transferência recebida pelo pix')) {
      const parts = row.descricao.split(' - ');
      if (parts.length > 1) {
        merchantName = parts[1].trim();
      }
    } else {
      // Try to extract first meaningful part before any special characters
      const match = row.descricao.match(/^([^-]+)/);
      if (match) {
        merchantName = match[1].trim();
      }
    }

    return {
      date,
      amount,
      transactionType,
      description: row.descricao,
      identifier: row.identificador,
      merchantName:
        merchantName && merchantName.length > 0 ? merchantName : undefined,
    };
  });
}

/**
 * Parse Nubank CSV file and convert to transactions
 */
export function parseNubankCSVFile(csvText: string): ParsedTransaction[] {
  const rows = parseNubankCSV(csvText);
  return convertToTransactions(rows);
}
