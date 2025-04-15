-- This is an empty migration.

-- AddReviewModelAndRelations

-- Add averageRating and reviewCount to Product model if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Product' AND column_name='averageRating') THEN
        ALTER TABLE "Product" ADD COLUMN "averageRating" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='Product' AND column_name='reviewCount') THEN
        ALTER TABLE "Product" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create the Review table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Review_userId_productId_key') THEN
        CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name='Review_productId_fkey') THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name='Review_userId_fkey') THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;