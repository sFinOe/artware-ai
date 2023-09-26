-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "payment_intent" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_payment_intent_key" ON "Transaction"("payment_intent");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_client_secret_key" ON "Transaction"("client_secret");
