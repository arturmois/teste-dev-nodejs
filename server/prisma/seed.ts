import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      username: "john.doe",
      password: "Password@123",
      avatar: "https://github.com/shadcn.png",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      name: "Jane Doe",
      username: "jane.doe",
      password: "Password@123",
      avatar: "https://github.com/shadcn.png",
    },
  });

  await prisma.message.create({
    data: {
      content: "Hello, how are you?",
      sender_id: user.id,
      receiver_id: user2.id,
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
