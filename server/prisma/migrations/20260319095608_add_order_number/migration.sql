ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

UPDATE "Order"
SET "orderNumber" = 'NC-' || LPAD(CAST("id" AS TEXT), 6, '0')
WHERE "orderNumber" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "orderNumber" SET NOT NULL;

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");