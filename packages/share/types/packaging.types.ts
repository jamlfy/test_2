export enum BoxType {
  BOX_SMALL = 'BOX_SMALL',
  BOX_MEDIUM = 'BOX_MEDIUM',
  BOX_LARGE = 'BOX_LARGE',
}

export interface CalculatedMaterial {
  materialCode: string;
  quantity: number;
}
