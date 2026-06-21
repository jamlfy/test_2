import { faker } from '@faker-js/faker';

const API_URL = 'http://localhost:3000/api/webhooks/order';
const TOTAL_REQUESTS = 1000;
const CONCURRENT_LIMIT = 10;

const stores = Array.from(
  { length: faker.number.int({ min: 5, max: 10 }) },
  () =>
    `${faker.company
      .name()
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()}.myshopify.com`,
);

function generateLineItem() {
  return {
    id: faker.number.int({ min: 100000, max: 999999 }),
    product_id: faker.number.int({ min: 7000000000, max: 8000000000 }),
    sku: `SKU-${faker.string.alphanumeric(6).toUpperCase()}`,
    name: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 3 }),
    properties: faker.datatype.boolean(0.3) ? [{ name: 'fragile', value: 'true' }] : undefined,
  };
}

function generateOrder() {
  const numItems = faker.number.int({ min: 1, max: 5 });
  const lineItems = Array.from({ length: numItems }, generateLineItem);

  return {
    id: faker.number.int({ min: 4000000000000, max: 6000000000000 }),
    email: faker.internet.email(),
    contact_email: faker.internet.email(),
    customer: {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
    },
    line_items: lineItems,
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    name: faker.helpers.arrayElement(stores),
    note: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
  };
}

async function run() {
  console.log(`Enviando ${TOTAL_REQUESTS} requests a ${API_URL}...\n`);

  const orders = Array.from({ length: TOTAL_REQUESTS }, generateOrder);
  let success = 0;
  let failed = 0;

  for (let i = 0; i < orders.length; i += CONCURRENT_LIMIT) {
    const batch = orders.slice(i, i + CONCURRENT_LIMIT);

    await Promise.all(
      batch.map(async (order, idx) => {
        const id = i + idx + 1;
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          success++;

          console.log(`  Ok [${id}/${TOTAL_REQUESTS}] ${order.name} | order #${order.id}`);
        } catch (err: any) {
          failed++;
          console.error(`Fail [${id}/${TOTAL_REQUESTS}] Error: ${err.message}`);
        }
      }),
    );
  }

  console.log('\n---');
  console.log(`Total:     ${TOTAL_REQUESTS}`);
  console.log(`Exitosas:  ${success}`);
  console.log(`Fallidas:  ${failed}`);
}

run();
