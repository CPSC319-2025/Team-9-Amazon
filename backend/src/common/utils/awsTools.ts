import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import { env } from "./envConfig";

const bucketName = "recruit-store";
const resumeDirectory = `resumes`;

const s3Client = new S3Client({
  region: "ca-central-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const s3UploadPdfBase64 = async (fileName: string, base64String: string): Promise<void> => {
  const fileContent = Buffer.from(base64String, "base64");
  const params = {
    Bucket: bucketName,
    Key: `${resumeDirectory}/${fileName}`,
    Body: fileContent,
    ContentEncoding: "base64",
    ContentType: "application/pdf",
  };

  const upload = new Upload({
    client: s3Client,
    params,
  });

  await upload.done();
};

export const s3DownloadPdfBase64 = async (fileName: string): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: `${resumeDirectory}/${fileName}`,
  };

  const command = new GetObjectCommand(params);
  const data = await s3Client.send(command);

  if (!data.Body) {
    throw new Error("No data body returned from S3");
  }

  const streamToString = (stream: Readable): Promise<string> =>
    new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    });

  return streamToString(data.Body as Readable);
};