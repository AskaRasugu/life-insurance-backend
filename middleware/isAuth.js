import jwt from "jsonwebtoken";

import dotEnv from "dotenv";
dotEnv.config();

const isAuth = (req, res, next) => {
  let authHeader;

  const sessionId = req?.cookies;

  if (!sessionId || !sessionId["sessionId"]) {
    authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }
    const bearerPrefix = "Bearer ";
    if (authHeader.startsWith(bearerPrefix)) {
      authHeader = authHeader.slice(bearerPrefix.length).trim();
    }
  } else {
    authHeader = sessionId["sessionId"];
  }
  if (!authHeader) {
    return res.status(401).json({
      message: "Unauthenticated",
    });
  }
  try {
    const decodedToken = jwt.verify(authHeader, process.env.JWT_KEY);

    req.userId = decodedToken?.userId;
    req.email = decodedToken?.email;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthenticated",
    });
  }
};
export default isAuth;
