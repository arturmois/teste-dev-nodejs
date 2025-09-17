import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: "John Doe",
      username: "john.doe",
      password: "password123",
      avatar: "https://github.com/shadcn.png",
    },
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
