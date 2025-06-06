import { PrismaClient } from "../src/generated/prisma";
import { Role, EnrollmentStatus } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: "admin123",
      role: Role.ADMIN,
    },
  });

  const users = await Promise.all(
    [...Array(5)].map((_, i) =>
      prisma.user.upsert({
        where: { email: `user${i + 1}@example.com` },
        update: {},
        create: {
          email: `user${i + 1}@example.com`,
          password: `user${i + 1}pass`,
          role: Role.USER,
        },
      })
    )
  );

  const events = await Promise.all(
    ["Hackathon 2025", "Webinar UI/UX", "Coding bootcamp"].map((title, i) =>
      prisma.event.upsert({
        where: { title },
        update: {},
        create: {
          title,
          description: `Deskripsi untuk ${title}`,
          imageUrl: `https://source.unsplash.com/random/800x400?sig=${i}`,
          startDate: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + (i * 7 + 1) * 24 * 60 * 60 * 1000),
        },
      })
    )
  );

  await Promise.all(
    users.slice(0, 3).map((user, i) =>
      prisma.enrollment.create({
        data: {
          userId: user.id,
          eventId: events[0].id,
          status:
            i === 0
              ? EnrollmentStatus.PENDING
              : i === 1
              ? EnrollmentStatus.ACCEPTED
              : EnrollmentStatus.REJECTED,
        },
      })
    )
  );

  await Promise.all(
    users.slice(3).map((user) =>
      prisma.enrollment.create({
        data: {
          userId: user.id,
          eventId: events[1].id,
          status: EnrollmentStatus.PENDING,
        },
      })
    )
  );

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.log("Seed Failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
