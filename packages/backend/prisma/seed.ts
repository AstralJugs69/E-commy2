import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log(`[SEED] Starting seeding process...`);
    
    // Define constants
    const allCategoryName = 'All';
    
    console.log(`[SEED] Checking for "${allCategoryName}" system category...`);
    
    // Check if the "All" category already exists
    const existingAllCategory = await prisma.category.findUnique({
      where: { name: allCategoryName },
    });
    
    // Handle creation, update, or verification of the "All" category
    if (!existingAllCategory) {
      // Create the category if it doesn't exist
      await prisma.category.create({
        data: {
          name: allCategoryName,
          isSystemCategory: true,
          description: 'All available products'
        },
      });
      console.log(`[SEED] Created "${allCategoryName}" system category.`);
    } else if (!existingAllCategory.isSystemCategory) {
      // Update the existing category if the system flag is not set
      await prisma.category.update({
        where: { name: allCategoryName },
        data: { isSystemCategory: true },
      });
      console.log(`[SEED] Updated existing "${allCategoryName}" category to be a system category.`);
    } else {
      // Log if the category already exists with the correct flag
      console.log(`[SEED] "${allCategoryName}" system category already exists.`);
    }
    
    // --------------------------------------------------------------------------
    // Additional seed operations for other essential data can be added here
    // For example:
    // - Default user roles
    // - Admin user(s)
    // - Default product categories
    // - Sample products for development
    // --------------------------------------------------------------------------
    
    console.log(`[SEED] Seeding finished successfully.`);
    return true;
  } catch (error) {
    console.error(`[SEED] Seeding failed with error:`, error);
    return false;
  }
}

// Running in both development and production
if (require.main === module) {
  main()
    .catch((e) => {
      console.error("[SEED] Fatal error during seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      try {
        await prisma.$disconnect();
        console.log('[SEED] Prisma client disconnected.');
      } catch (e) {
        console.error('[SEED] Failed to disconnect Prisma client:', e);
        process.exit(1);
      }
    });
}

// Export for testing or direct import
export default main; 