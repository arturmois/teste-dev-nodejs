import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import prisma from "../db/prisma";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username: string, password: string, done: any) => {
      try {
        const user = await prisma.user.findUnique({
          where: { username },
        });
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid credentials" });
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { is_online: true, last_seen: new Date() },
        });
        return done(null, {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        });
      } catch (error) {
        console.error(`Passport: Authentication error for ${username}:`, error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        is_online: true,
        last_seen: true,
      },
    });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    console.error(`Passport: Deserialization error for ${id}:`, error);
    done(error);
  }
});

export default passport;
