import jwt, { type SignOptions } from "jsonwebtoken";
import envs from "../config/envs";

class Signin {
  private EXPIRES_IN: SignOptions["expiresIn"] = "24h";

  async execute(user: any) {
    const { id } = user;
    const token = jwt.sign({ userId: id }, envs.JWT_SECRET, {
      expiresIn: this.EXPIRES_IN,
    });
    return {
      token,
    };
  }
}

export default new Signin();
