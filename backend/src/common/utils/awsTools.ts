import AWS from "aws-sdk";
import fs from "fs";
import { env } from "./envConfig";
import { ManagedUpload } from "aws-sdk/clients/s3";

const bucketName = "recruit-store";
const resumeBucketName = bucketName + "/resumes";

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: "ca-central-1",
});
const s3 = new AWS.S3();

export const s3UploadPdfBase64 = async (fileName: string, base64String: string): Promise<AWS.S3.ManagedUpload> => {
  const fileContent = Buffer.from(base64String, "base64");
  const params: AWS.S3.PutObjectRequest = {
    Bucket: resumeBucketName,
    Key: fileName,
    Body: fileContent,
    ContentEncoding: "base64",
    ContentType: "application/pdf",
  };
  return s3.upload(params);
};

export const s3DownloadPdfBase64 = (fileName: string): Promise<string> => {
  const params = {
    Bucket: resumeBucketName,
    Key: fileName,
  };
  
  return new Promise((resolve, reject) => {
    s3.getObject(params, (err: AWS.AWSError, data: AWS.S3.GetObjectOutput) => {
      if (err) {
        return reject(err);
      }
      if (!data.Body) {
        return reject(new Error("No data body returned from S3"));
      }
      resolve(data.Body.toString('base64'));
    });
  });
};
