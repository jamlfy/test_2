import { Injectable } from '@nestjs/common';
import { BoxType, CalculatedMaterial, PackagingItem } from '../domain/packaging.types';

@Injectable()
export class PackagingService {
  calcularBoxType(totalProducts: number): BoxType {
    if (totalProducts <= 2) return BoxType.BOX_SMALL;
    if (totalProducts <= 5) return BoxType.BOX_MEDIUM;
    return BoxType.BOX_LARGE;
  }

  calcularMateriales(items: PackagingItem[]): CalculatedMaterial[] {
    const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasFragile = items.some((item) => item.isFragile);

    const materiales: CalculatedMaterial[] = [];

    const boxType = this.calcularBoxType(totalProducts);
    materiales.push({ materialCode: boxType, quantity: 1 });
    materiales.push({ materialCode: 'LABEL', quantity: 1 });
    materiales.push({ materialCode: 'TAPE', quantity: 1 });

    if (hasFragile) {
      materiales.push({ materialCode: 'FILLER', quantity: 1 });
    }

    return materiales;
  }
}
