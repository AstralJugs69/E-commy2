// Simple script to check if the "All" category exists and is properly configured
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllCategory() {
  try {
    console.log('Checking "All" category status...');
    
    const allCategory = await prisma.category.findUnique({
      where: { name: 'All' }
    });
    
    if (!allCategory) {
      console.log('❌ "All" category does not exist!');
    } else if (!allCategory.isSystemCategory) {
      console.log('⚠️ "All" category exists but isSystemCategory is NOT set to true!');
      console.log('Category details:', allCategory);
    } else {
      console.log('✅ "All" category exists and isSystemCategory is correctly set to true.');
      console.log('Category details:', allCategory);
    }
  } catch (error) {
    console.error('Error checking category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllCategory(); 