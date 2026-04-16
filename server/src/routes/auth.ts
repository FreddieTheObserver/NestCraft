import { Router } from "express";

import { getSession, login, logout, register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validation/authSchemas.js";

const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), register);
authRouter.post("/login", validate({ body: loginSchema }), login);
authRouter.get("/session", getSession);
authRouter.post("/logout", logout);

export default authRouter;
