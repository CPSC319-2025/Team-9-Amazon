import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
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
export const s3UploadFile = async (
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
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
export const s3UploadBase64 = async (
  fileName: string,
  base64String: string
): Promise<void> => {
  try {
    const fileContent = Buffer.from(base64String, "base64");
    //const contentType = await getMimeType(base64String);
    const contentType =
      (await fileTypeFromBuffer(fileContent))?.mime ??
      "application/octet-stream";

    const params = {
      Bucket: bucketName,
      Key: `${resumeDirectory}/${fileName}`,
      Body: fileContent,
      ContentEncoding: "base64",
      ContentType: contentType,
      ConstentDisposition: "attachment",
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

export const s3DownloadPdfBase64 = async (
  fileName: string
): Promise<string> => {
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
export const generateTemporaryUrl = async (
  fileName: string,
  expiresIn: number = 3600
): Promise<{ url: string; fileType: string;}> => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${resumeDirectory}/${fileName}`,
    };

    const urlCommand = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, urlCommand, { expiresIn });

    const getCommand = new GetObjectCommand(params);
    const resumeData = await s3Client.send(getCommand);

    const streamToBuffer = (stream: Readable): Promise<Buffer> =>
      new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
      });

    const bufferData = await streamToBuffer(resumeData.Body as Readable);
    const fileType = detectFileTypeFromBuffer(bufferData);

    return {
      url: signedUrl,
      fileType: fileType,
    };
  } catch (error) {
    console.error(`Error generating temporary URL for ${fileName}:`, error);
    throw new Error("Failed to generate temporary URL.");
  }
};

// Helper to get file type
function detectFileTypeFromBuffer(buffer: Buffer): string {
  // Check for common file signatures (magic numbers)

  // PDF: starts with %PDF
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
    return "application/pdf";
  }

  // DOC: DOC files have specific signatures
  if (
    buffer.length >= 8 &&
    (buffer.toString("hex", 0, 8) === "d0cf11e0a1b11ae1" || // Older DOC format
      buffer.toString("ascii", 0, 5) === "{\\rtf" || // RTF format
      buffer.toString("hex", 0, 4) === "ffd8ffe0")
  ) {
    // Some DOC files
    return "application/msword";
  }

  // DOCX, XLSX, PPTX: they're all ZIP-based formats with specific signatures
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    // These are all ZIP-based, but we'd need to extract and check internal files
    // to know which specific Office format. For now, default to DOCX.
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  // PNG: starts with specific 8-byte signature
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // JPEG: starts with FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  // GIF: starts with "GIF87a" or "GIF89a"
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  // TXT: This is harder to detect reliably, but we can check if it's mostly ASCII
  let isText = true;
  const sampleSize = Math.min(buffer.length, 1000); // Check first 1000 bytes
  for (let i = 0; i < sampleSize; i++) {
    // Non-ASCII and control characters (except tabs, newlines)
    if (
      (buffer[i] < 32 || buffer[i] > 126) &&
      buffer[i] !== 9 &&
      buffer[i] !== 10 &&
      buffer[i] !== 13
    ) {
      if (i > 0 && i < 20) {
        // If we find non-text chars very early, likely binary
        isText = false;
        break;
      }
    }
  }

  if (isText) {
    return "text/plain";
  }

  // Default if no match
  return "application/octet-stream";
}
