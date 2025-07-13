import { Sequelize } from "sequelize";
import dotEnv from "dotenv";

dotEnv.config();

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}`,
  {
    logging: false,
  }
);

export default sequelize;
