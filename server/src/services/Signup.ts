import prisma from "../db/prisma";
import bcrypt from "bcrypt";

class Signup {
  async execute(data: Input) {
    const { name, username, password } = data;
    const userExists = await prisma.user.findUnique({
      where: { username },
    });
    if (userExists) {
      throw new Error("Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, username, password: hashedPassword },
    });
  }
}

type Input = {
  name: string;
  username: string;
  password: string;
};

export default new Signup();
