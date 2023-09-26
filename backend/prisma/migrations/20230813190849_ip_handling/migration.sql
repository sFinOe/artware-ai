-- CreateTable
CREATE TABLE "ip" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "ip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_ip_key" ON "ip"("ip");
