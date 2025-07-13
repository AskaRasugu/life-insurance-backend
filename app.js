import express from "express";
import bodyParser from "body-parser";
import dotEnv from "dotenv";
import sequelize from "./helpers/dbConnection.js";
import userRouter from "./FetchApi/routes/userRoute.js";
import recommendationRouter from "./FetchApi/routes/recommendationRoute.js";

dotEnv.config();

const app = express();
const port = "4000";
app.use(bodyParser.json());

app.use(userRouter);
app.use(recommendationRouter);

async function migrate() {
  try {
    await sequelize.sync();
    console.log("Database tables created successfully");
  } catch (err) {
    console.log("Error creating database tables: ", err);
  }
}

migrate();

app.listen("4000", () => {
  console.log(`Application running on port ${port}`);
});
