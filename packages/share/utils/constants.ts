export const QUEUE_NAMES = {
  ORDERS: 'orders',
} as const;

export const INVENTORY_THRESHOLD = 10;

export const MATERIAL_NAMES: Record<string, string> = {
  BOX_SMALL: 'Caja pequeña',
  BOX_MEDIUM: 'Caja mediana',
  BOX_LARGE: 'Caja grande',
  LABEL: 'Etiqueta',
  TAPE: 'Cinta',
  FILLER: 'Material de protección',
};
