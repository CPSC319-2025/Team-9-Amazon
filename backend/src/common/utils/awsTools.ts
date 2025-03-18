import { GetObjectCommand, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import { extname } from "path";
import { env } from "./envConfig";

const bucketName = "recruit-store";
const resumeDirectory = `resumes`;

if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are missing.");
}

const s3Client = new S3Client({
  region: "ca-central-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});


// Function to upload binary file (decoded from Base64) to S3
export const s3UploadFile = async (fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${resumeDirectory}/${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    await s3Client.send(new PutObjectCommand(params));

    console.log(`Successfully uploaded ${fileName} to S3.`);
    
    return `https://${bucketName}.s3.amazonaws.com/${resumeDirectory}/${fileName}`;
  } catch (error) {
    console.error(`Error uploading ${fileName} to S3:`, error);
    throw new Error("Failed to upload file.");
  }
};


const getMimeType = (fileName: string): string => {
  const ext = extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

export const s3UploadBase64 = async (fileName: string, base64String: string): Promise<void> => {
  try {
  const fileContent = Buffer.from(base64String, "base64");
  const contentType = getMimeType(fileName);
  const params = {
    Bucket: bucketName,
    Key: `${resumeDirectory}/${fileName}`,
    Body: fileContent,
    ContentEncoding: "base64",
    ContentType: contentType,
  };

  const upload = new Upload({
    client: s3Client,
    params,
  });

  await upload.done();
  console.log(`Successfully uploaded ${fileName} to S3.`);
} catch (error) {
  console.error(`Error uploading ${fileName} to S3:`, error);
  throw new Error("Failed to upload file.");
}
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