import prisma from "../db/prisma";
import bcrypt from "bcrypt";

class Signup {
  async execute(data: Input) {
    const { name, username, password } = data;
    const userExists = await prisma.user.findUnique({
      where: { username: username },
    });
    if (userExists) {
      throw new Error("Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      select: {
        id: true,
        name: true,
        username: true,
      },
      data: { name, username, password: hashedPassword },
    });
    return {
      id: user.id,
      name: user.name,
      username: user.username,
    };
  }
}

type Input = {
  name: string;
  username: string;
  password: string;
};

export default new Signup();
