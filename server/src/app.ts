import express from "express";
import session from "express-session";
import routes from "./routes";
import cors from "cors";
import helmet from "helmet";
import envs from "./config/envs";
import passport from "./config/passport";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: [envs.CLIENT_URL, "http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  })
);
app.use(helmet());

export const sessionMiddleware = session({
  secret: envs.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  name: "connect.sid",
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "lax",
  },
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

export default app;
