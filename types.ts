export interface Finding {
  id: string;
  columnId: string; // A-J
  columnName: string;
  rowId: number; // 1-7
  rowName: string;
  comment: string;
  images: string[]; // Base64 strings
  timestamp: number;
}

export interface MatrixConfig {
  columns: { id: string; label: string }[];
  rows: { id: number; label: string }[];
  activeCells: string[]; // Format "ROW-COL", e.g., "1-A"
}

// Configuration based on the user's request and image
export const MATRIX_CONFIG: MatrixConfig = {
  columns: [
    { id: 'A', label: 'Pracovné stanice' },
    { id: 'B', label: 'Koridory / Únikové cesty' },
    { id: 'C', label: 'OOPP a Tech. Bezpečnosť' },
    { id: 'D', label: 'Elektrické zariadenia' },
    { id: 'E', label: 'Regály / Úložiská' },
    { id: 'F', label: 'Ostatné EQ' },
    { id: 'G', label: 'Materiál' },
    { id: 'H', label: 'Chemikálie' },
    { id: 'I', label: 'Odpadová zóna' },
    { id: 'J', label: 'SOP / Dokumentácia' },
  ],
  rows: [
    { id: 1, label: 'ČISTOTA' },
    { id: 2, label: 'PRIECHODNOSŤ' },
    { id: 3, label: 'OZNAČENIE' },
    { id: 4, label: 'SPRÁVNE UMIESTNENIE' },
    { id: 5, label: 'STAV A FUNKCIA' },
    { id: 6, label: 'ODDELENIE OD RIZÍK' },
    { id: 7, label: 'DOSTUPNOSŤ' },
  ],
  // Mapping the yellow cells from the image
  activeCells: [
    '1-A', '1-B', '1-I',
    '2-B',
    '3-A', '3-D', '3-E', '3-G', '3-H', '3-I',
    '4-F', '4-G', '4-H',
    '5-C', '5-D', '5-E', '5-F', '5-H', '5-J',
    '6-D', '6-H',
    '7-C', '7-J'
  ]
};

export const INSPECTOR_NAME = "Matej Masarik";
export const LOCATION_NAME = "AUO SK - Trenčín";