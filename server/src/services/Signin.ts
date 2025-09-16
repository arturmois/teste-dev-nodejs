import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import envs from "../config/envs";

class Signin {
  async execute(data: Input) {
    const { username, password } = data;
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { is_online: true, last_seen: new Date() },
    });
    const token = jwt.sign({ userId: user.id }, envs.JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      token,
    };
  }
}

type Input = {
  username: string;
  password: string;
};

export default new Signin();
