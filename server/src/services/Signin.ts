import jwt from "jsonwebtoken";
import envs from "../config/envs";

class Signin {
  async execute(user: any) {
    const { id, name, username, avatar } = user;
    const token = jwt.sign({ userId: id }, envs.JWT_SECRET, {
      expiresIn: "24h",
    });
    return {
      token,
      user: {
        id,
        name,
        username,
        avatar,
      },
    };
  }
}

export default new Signin();
