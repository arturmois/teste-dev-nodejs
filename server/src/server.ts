import "dotenv/config";
import app from "./app";
import envs from "./config/envs";

app.listen(envs.PORT, () => {
  console.log(`Server is running on port ${envs.PORT}`);
});
