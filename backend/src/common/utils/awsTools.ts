import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // Import for generating signed URLs
import { Upload } from "@aws-sdk/lib-storage";
import { fileTypeFromBuffer } from "file-type";
import { Readable } from "stream";
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

// Allowed MIME types for resume uploads
const allowedMimeTypes = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

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

// helper to get file type
export const getMimeType = async (base64String: string): Promise<string> => {
  try {
    //extract base64 data w/o metadata
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid Base64 format");
    }

    const base64Data = matches[2];
    const fileBuffer = Buffer.from(base64Data, "base64");

    const fileType = await fileTypeFromBuffer(fileBuffer);

    console.log("fileType:", fileType);

    if (fileType && allowedMimeTypes.includes(fileType.mime)) {
      return fileType.mime;
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    console.error("Error detecting MIME type:", error);
    throw new Error("Failed to determine file type.");
  }
};

// constraint 1 : base64String cannot contain metadata, otherwise use helper getMimeType
// constraint 2 : even w/ helper to get mime type, if base64String not exclude metadata, upload is success but file cant open
export const s3UploadBase64 = async (fileName: string, base64String: string): Promise<void> => {
  try {
    const fileContent = Buffer.from(base64String, "base64");
    //const contentType = await getMimeType(base64String);
    const contentType = (await fileTypeFromBuffer(fileContent))?.mime ?? "application/octet-stream";

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

// Function to generate a temporary URL for a given file
export const generateTemporaryUrl = async (fileName: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${resumeDirectory}/${fileName}`,
    };

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error(`Error generating temporary URL for ${fileName}:`, error);
    throw new Error("Failed to generate temporary URL.");
  }
};
