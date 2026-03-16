import { Router } from 'express';

import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validation/authSchemas.js';

import { register, login } from '../controllers/authController.js';


const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);

export default authRouter;