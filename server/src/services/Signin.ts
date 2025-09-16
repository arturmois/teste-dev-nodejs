import jwt from "jsonwebtoken";
import prisma from "../db/prisma";
import bcrypt from "bcrypt";
import envs from "../config/envs";

class Signin {
  async execute(data: Input) {
    const { username, password } = data;
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new Error("Invalid password");
    }
    const token = jwt.sign({ userId: user.id }, envs.JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      token: token,
    };
  }
}

type Input = {
  username: string;
  password: string;
};

export default new Signin();
