// s3-client.ts

import { S3Client } from "@aws-sdk/client-s3";

const REGION = "us-east-1";

const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const AWS_SESSION_TOKEN = import.meta.env.VITE_AWS_SESSION_TOKEN;

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN,
  },
});
