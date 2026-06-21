import { faker } from "@faker-js/faker";

const API_URL = "http://localhost:3000/api/orders";
const TOTAL_REQUESTS = 1000;
const CONCURRENT_LIMIT = 10;

const FINANCIAL_STATUSES = [
    "pending",
    "authorized",
    "partially_paid",
    "paid",
    "partially_refunded",
    "refunded",
    "voided",
] as const;

const FULFILLMENT_STATUSES = [
    "unfulfilled",
    "partially_fulfilled",
    "fulfilled",
    "on_hold",
    "shipped",
    "delivered",
    "returned",
] as const;

type FinancialStatus = (typeof FINANCIAL_STATUSES)[number];
type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

function pickValidStatuses(): [FinancialStatus, FulfillmentStatus | null] {
    const financial = faker.helpers.arrayElement(
        FINANCIAL_STATUSES,
    ) as FinancialStatus;

    let fulfillment: FulfillmentStatus | null = null;

    if (financial === "refunded" || financial === "voided") {
        fulfillment = faker.helpers.arrayElement(["returned", "unfulfilled"]);
    } else if (financial === "paid" || financial === "partially_paid") {
        fulfillment = faker.helpers.arrayElement([
            "unfulfilled",
            "partially_fulfilled",
            "fulfilled",
            "shipped",
            "delivered",
        ]);
    } else {
        fulfillment = faker.helpers.arrayElement(["unfulfilled", "on_hold"]);
    }

    return [financial, fulfillment];
}

function generateOrder() {
    const [financialStatus, fulfillmentStatus] = pickValidStatuses();

    const numItems = faker.number.int({ min: 1, max: 5 });
    const items = Array.from({ length: numItems }, () => ({
        productId: faker.string.uuid(),
        sku: `SKU-${faker.string.alphanumeric(6).toUpperCase()}`,
        name: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 3 }),
        price: parseFloat(faker.commerce.price({ min: 5, max: 200 })),
    }));

    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return {
        shopifyOrderId: faker.number
            .int({
                min: 4000000000000,
                max: 6000000000000,
            })
            .toString(),
        orderNumber: faker.number.int({ min: 1000, max: 99999 }),
        storeName: `${faker.company
            .name()
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase()}.myshopify.com`,
        customer: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
        },
        shippingAddress: {
            address1: faker.location.streetAddress(),
            city: faker.location.city(),
            province: faker.location.state(),
            zip: faker.location.zipCode(),
            country: faker.location.country(),
        },
        financialStatus,
        fulfillmentStatus,
        currency: "USD",
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        lineItems: items,
        note: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        tags: faker.helpers
            .arrayElements(
                ["wholesale", "priority", "international", "gift", "express"],
                faker.number.int({ min: 0, max: 3 }),
            )
            .join(", "),
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
        updatedAt: faker.date.recent({ days: 7 }).toISOString(),
        errorMessage:
            financialStatus === "voided"
                ? faker.helpers.arrayElement([
                      "Payment authorization failed",
                      "Fraud detected",
                      "Customer requested cancellation",
                  ])
                : financialStatus === "refunded"
                  ? faker.helpers.arrayElement([
                        "Customer returned items",
                        "Partial refund issued",
                    ])
                  : null,
    };
}

async function run() {
    console.log(`Enviando ${TOTAL_REQUESTS} requests a ${API_URL}...\n`);

    const orders = Array.from({ length: TOTAL_REQUESTS }, generateOrder);
    let success = 0;
    let failed = 0;
    const statusCounts: Record<string, number> = {};

    for (let i = 0; i < orders.length; i += CONCURRENT_LIMIT) {
        const batch = orders.slice(i, i + CONCURRENT_LIMIT);

        await Promise.all(
            batch.map(async (order, idx) => {
                const id = i + idx + 1;
                try {
                    const res = await fetch(API_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(order),
                    });

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    success++;
                    const key = `${order.financialStatus}/${order.fulfillmentStatus}`;
                    statusCounts[key] = (statusCounts[key] || 0) + 1;

                    console.log(
                        `  Ok [${id}/${TOTAL_REQUESTS}] ${order.storeName} | ${order.financialStatus}/${order.fulfillmentStatus}`,
                    );
                } catch (err: any) {
                    failed++;
                    console.error(
                        `Fail [${id}/${TOTAL_REQUESTS}] Error: ${err.message}`,
                    );
                }
            }),
        );
    }

    console.log("\n---");
    console.log(`Total:     ${TOTAL_REQUESTS}`);
    console.log(`Exitosas:  ${success}`);
    console.log(`Fallidas:  ${failed}`);
    console.log("\n--- Distribución de estados ---");
    for (const [key, count] of Object.entries(statusCounts).sort()) {
        console.log(`  ${key}: ${count}`);
    }
}

run();
