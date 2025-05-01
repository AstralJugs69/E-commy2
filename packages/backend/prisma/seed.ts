import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  
  // Define constants
  const allCategoryName = 'All';
  
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
    console.log(`Created "${allCategoryName}" system category.`);
  } else if (!existingAllCategory.isSystemCategory) {
    // Update the existing category if the system flag is not set
    await prisma.category.update({
      where: { name: allCategoryName },
      data: { isSystemCategory: true },
    });
    console.log(`Updated existing "${allCategoryName}" category to be a system category.`);
  } else {
    // Log if the category already exists with the correct flag
    console.log(`"${allCategoryName}" system category already exists.`);
  }
  
  // --------------------------------------------------------------------------
  // Additional seed operations for other essential data can be added here
  // For example:
  // - Default user roles
  // - Admin user(s)
  // - Default product categories
  // - Sample products for development
  // --------------------------------------------------------------------------
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }); 