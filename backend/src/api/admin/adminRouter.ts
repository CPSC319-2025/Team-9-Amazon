// routes/staffRoutes.js
import { Router } from "express";
import accountsRouter from "./accountsRouter";

const adminRouter = Router();
adminRouter.use("/accounts", accountsRouter)

export default adminRouter