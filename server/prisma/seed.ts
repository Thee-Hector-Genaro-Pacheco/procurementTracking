import "dotenv/config";
import { PrismaClient, VendorType, VendorQualificationStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding demo users...');
  
  const users = [
    { name: 'Jordan Reyes', email: 'jordan.reyes@example.com', role: UserRole.ADMIN, department: 'Operations' },
    { name: 'Morgan Blake', email: 'morgan.blake@example.com', role: UserRole.APPROVER, department: 'Procurement' },
    { name: 'Taylor Chen', email: 'taylor.chen@example.com', role: UserRole.BUYER, department: 'Purchasing' },
    { name: 'Riley Brooks', email: 'riley.brooks@example.com', role: UserRole.RECEIVER, department: 'Warehouse' },
    { name: 'Casey Morgan', email: 'casey.morgan@example.com', role: UserRole.REQUESTER, department: 'Maintenance' },
  ];

  const passwordHash = await bcrypt.hash('DemoPass123!', 10);

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash },
      create: { ...u, passwordHash },
    });
    console.log(`Upserted user: ${user.name} (${user.role})`);
  }

  console.log('Seeding demo vendors...');

  const vendors = [
    {
      name: 'Mirion Technologies',
      vendorType: VendorType.MANUFACTURER,
      industries: ['Nuclear', 'Radiation Protection', 'Instrumentation'],
      specialties: ['Radiation monitoring', 'dosimetry', 'reactor instrumentation', 'contamination monitoring'],
      qualificationStatus: VendorQualificationStatus.PREFERRED,
      isPreferred: true,
    },
    {
      name: 'Thermo Fisher Scientific',
      vendorType: VendorType.MANUFACTURER,
      industries: ['Industrial', 'Radiation Protection', 'Laboratory', 'Instrumentation'],
      specialties: ['Radiation detection', 'radiation measurement', 'survey meters', 'monitoring instruments'],
      qualificationStatus: VendorQualificationStatus.APPROVED,
      isPreferred: false,
    },
    {
      name: 'Ludlum Measurements',
      vendorType: VendorType.MANUFACTURER,
      industries: ['Radiation Protection', 'Emergency Response', 'Instrumentation'],
      specialties: ['Survey meters', 'radiation detectors', 'contamination monitoring', 'portable instruments'],
      qualificationStatus: VendorQualificationStatus.APPROVED,
      isPreferred: false,
    },
    {
      name: 'Berthold Technologies',
      vendorType: VendorType.MANUFACTURER,
      industries: ['Radiation Protection', 'Process Control', 'Nuclear'],
      specialties: ['Dose rate monitoring', 'airborne activity monitoring', 'contamination monitoring'],
      qualificationStatus: VendorQualificationStatus.APPROVED,
      isPreferred: false,
    },
    {
      name: 'Grainger',
      vendorType: VendorType.DISTRIBUTOR,
      industries: ['Maintenance', 'Electrical', 'Mechanical', 'General Industrial'],
      specialties: ['MRO supplies', 'tools', 'safety equipment', 'electrical parts'],
      qualificationStatus: VendorQualificationStatus.APPROVED,
      isPreferred: false,
    },
    {
      name: 'McMaster-Carr',
      vendorType: VendorType.DISTRIBUTOR,
      industries: ['Maintenance', 'Mechanical', 'Electrical', 'General Industrial'],
      specialties: ['hardware', 'fittings', 'tools', 'raw materials', 'fasteners'],
      qualificationStatus: VendorQualificationStatus.APPROVED,
      isPreferred: false,
    }
  ];

  for (const v of vendors) {
    const vendor = await prisma.vendor.upsert({
      where: { name: v.name },
      update: {},
      create: v,
    });
    console.log(`Upserted vendor: ${vendor.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
