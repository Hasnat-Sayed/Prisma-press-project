import { Router } from "express";

import { userController } from "./user.controller";

const router = Router();

router.post("/register", userController.registserUser);


export const userRoutes = router;