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
      `INSERT INTO materials (code, name, stock, "updatedAt") VALUES ($1, $2, $3, NOW())
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, stock = EXCLUDED.stock, "updatedAt" = NOW()`,
      material.code,
      material.name,
      material.stock,
    );
  }

  console.log('Materials seeded successfully.');
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
