import express from "express";
import routes from "./routes";
import cors from "cors";
import helmet from "helmet";
import envs from "./config/envs";
import passport from "./config/passport";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [envs.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(helmet());

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api", routes);

export default app;
