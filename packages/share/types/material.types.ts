export interface MaterialDto {
  code: string;
  name: string;
  stock: number;
}

export interface LowStockMaterialDto {
  material: string;
  stock: number;
}

export interface ConsumeMaterialDto {
  materialCode: string;
  quantity: number;
}
