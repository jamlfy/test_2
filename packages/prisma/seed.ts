import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding materials...');

  const materials = [
    { code: 'BOX_SMALL', name: 'Caja pequeña', stock: 100 },
    { code: 'BOX_MEDIUM', name: 'Caja mediana', stock: 80 },
    { code: 'BOX_LARGE', name: 'Caja grande', stock: 50 },
    { code: 'LABEL', name: 'Etiqueta', stock: 500 },
    { code: 'TAPE', name: 'Cinta', stock: 200 },
    { code: 'FILLER', name: 'Material de protección', stock: 120 },
  ];

  for (const material of materials) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO materials (code, name, stock) VALUES ($1, $2, $3)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, stock = EXCLUDED.stock`,
      material.code,
      material.name,
      material.stock,
    );
  }

  console.log('Materials seeded successfully.');

  console.log('Seeding 100 simulated orders...');

  const productNames = [
    'Widget A', 'Gadget B', 'Component C', 'Accessory D',
    'Glass Vase', 'Ceramic Mug', 'Plastic Container', 'Metal Frame',
    'Wooden Shelf', 'Glass Bowl',
  ];

  const fragileProducts = new Set([4, 9]);

  for (let i = 1; i <= 100; i++) {
    const numItems = Math.floor(Math.random() * 5) + 1;
    const items = [];

    for (let j = 0; j < numItems; j++) {
      const productIndex = Math.floor(Math.random() * productNames.length);
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({
        productId: `prod_${productIndex}`,
        sku: `SKU-${String(productIndex).padStart(3, '0')}`,
        name: productNames[productIndex],
        quantity,
        isFragile: fragileProducts.has(productIndex),
      });
    }

    const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasFragile = items.some((item) => item.isFragile);

    const orderStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'PENDING'];
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

    const orderResult = await prisma.$executeRawUnsafe(
      `INSERT INTO orders ("shopifyOrderId", "storeName", status, "customerName", "customerEmail", "totalProducts", "hasFragile")
       VALUES ($1, $2, $3::"OrderStatus", $4, $5, $6, $7)`,
      1000000 + i,
      'test-store',
      status,
      `Customer ${i}`,
      `customer${i}@example.com`,
      totalProducts,
      hasFragile,
    );

    const orderRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      'SELECT id FROM orders WHERE "shopifyOrderId" = $1',
      1000000 + i,
    );
    const orderId = orderRows[0].id;

    for (const item of items) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO order_items ("orderId", "productId", sku, name, quantity, "isFragile")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        orderId,
        item.productId,
        item.sku,
        item.name,
        item.quantity,
        item.isFragile,
      );
    }

    if (status === 'COMPLETED') {
      const boxType = totalProducts <= 2 ? 'BOX_SMALL' : totalProducts <= 5 ? 'BOX_MEDIUM' : 'BOX_LARGE';
      await prisma.$executeRawUnsafe(
        `INSERT INTO order_materials (id, "orderId", "materialCode", quantity) VALUES (gen_random_uuid(), $1, $2, 1)`,
        orderId,
        boxType,
      );
      await prisma.$executeRawUnsafe(
        `INSERT INTO order_materials (id, "orderId", "materialCode", quantity) VALUES (gen_random_uuid(), $1, 'LABEL', 1)`,
        orderId,
      );
      await prisma.$executeRawUnsafe(
        `INSERT INTO order_materials (id, "orderId", "materialCode", quantity) VALUES (gen_random_uuid(), $1, 'TAPE', 1)`,
        orderId,
      );
      if (hasFragile) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO order_materials (id, "orderId", "materialCode", quantity) VALUES (gen_random_uuid(), $1, 'FILLER', 1)`,
          orderId,
        );
      }
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO order_events (id, "orderId", type, payload) VALUES (gen_random_uuid(), $1, 'RECEIVED', $2::jsonb)`,
      orderId,
      JSON.stringify({ shopifyOrderId: 1000000 + i, storeName: 'test-store' }),
    );

    if (status === 'COMPLETED') {
      await prisma.$executeRawUnsafe(
        `INSERT INTO order_events (id, "orderId", type, payload) VALUES (gen_random_uuid(), $1, 'COMPLETED', $2::jsonb)`,
        orderId,
        JSON.stringify({}),
      );
    }

    console.log(`Order ${i}/100 created: ${orderId}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
