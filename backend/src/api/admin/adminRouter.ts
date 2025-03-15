// routes/staffRoutes.js
import { handleZodError } from "@/common/middleware/errorHandler";
import { s3DownloadPdfBase64, s3UploadPdfBase64 } from "@/common/utils/awsTools";
import { Router } from "express";
import { z } from "zod";
import accountsRouter from "./accountsRouter";

const adminRouter = Router();
adminRouter.use("/accounts", accountsRouter)



// I am testing
// const testReq = z.object({
//   name: z.string().min(1),
//   pdf: z.string().min(1),
// });
// adminRouter.post("/test", async (req, res) => {
//   try {
//     const { name, pdf } = testReq.parse(req.body);
//     await s3UploadPdfBase64(name, pdf);
//     const temp = await s3DownloadPdfBase64(name);
//     res.status(200).json({ message: temp });
//   } catch (error) {
//     handleZodError(error, res, "Failed to test");
//   }
// });

export default adminRouter