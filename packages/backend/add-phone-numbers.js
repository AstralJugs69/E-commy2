// This script adds sample phone numbers to the database for order verification
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting phone number creation...');

  // Sample phone numbers
  const phoneNumbers = [
    '+44 20 7123 4567',
    '+44 20 7123 4568',
    '+44 20 7123 4569',
    '+44 20 7123 4570',
    '+44 20 7123 4571'
  ];

  // Create phone numbers
  const createdNumbers = [];
  for (const numberString of phoneNumbers) {
    try {
      // Check if number already exists
      const existing = await prisma.phoneNumber.findUnique({
        where: { numberString }
      });

      if (existing) {
        console.log(`Phone number ${numberString} already exists. Skipping.`);
        createdNumbers.push(existing);
        continue;
      }

      // Create the phone number
      const phoneNumber = await prisma.phoneNumber.create({
        data: {
          numberString,
          status: 'Available'
        }
      });
      console.log(`Created phone number: ${phoneNumber.numberString} (ID: ${phoneNumber.id})`);
      createdNumbers.push(phoneNumber);
    } catch (error) {
      console.error(`Error creating phone number ${numberString}:`, error);
    }
  }

  console.log(`Created ${createdNumbers.length} phone numbers.`);
  return createdNumbers;
}

main()
  .then(async (numbers) => {
    console.log('Phone numbers created successfully:', numbers.length);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error creating phone numbers:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 