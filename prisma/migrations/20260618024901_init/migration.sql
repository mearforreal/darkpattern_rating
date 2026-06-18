-- CreateTable
CREATE TABLE "Rater" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionStartedAt" TIMESTAMP(3),
    "sessionCompletedAt" TIMESTAMP(3),

    CONSTRAINT "Rater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "category" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "raterId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "isDarkPattern" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "comment" TEXT,
    "responseStartedAt" TIMESTAMP(3),
    "responseCompletedAt" TIMESTAMP(3),
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rater_email_key" ON "Rater"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Image_filename_key" ON "Image"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "Image_order_key" ON "Image"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_raterId_imageId_key" ON "Rating"("raterId", "imageId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "Rater"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
