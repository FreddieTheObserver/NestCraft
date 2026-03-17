CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Order"
ALTER COLUMN "status" TYPE "OrderStatus"
USING ("status"::"OrderStatus");

ALTER TABLE "Order"
ALTER COLUMN "status" SET DEFAULT 'pending';
