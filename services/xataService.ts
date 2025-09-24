// Generated with CLI
import { buildClient } from "@xata.io/client";

const tables = [
  {
    name: "users",
    columns: [
      { name: "name", type: "string" },
      { name: "email", type: "email", unique: true },
      { name: "plan", type: "string" },
      { name: "credits", type: "int" },
      { name: "key", type: "string" },
      { name: "password", type: "string" },
      { name: "resetToken", type: "string" },
      { name: "resetTokenExpires", type: "datetime" },
      { name: "planExpiryDate", type: "datetime" },
      { name: "subscriptionStatus", type: "string", defaultValue: "free_trial" },
    ],
  },
  {
    name: "generated_images",
    columns: [
      { name: "user", type: "link", link: { table: "users" } },
      { name: "imageUrl", type: "string" },
      { name: "prompt", type: "text" },
    ],
  },
  {
    name: "used_activation_keys",
    columns: [],
  },
  {
    name: "processed_orders",
    columns: [],
  }
];

const XataClient = buildClient({ tables });

// This defines the type for an instance of our generated client
type XataClientInstance = InstanceType<typeof XataClient>;

let instance: XataClientInstance | undefined = undefined;

export const getXataClient = (): XataClientInstance => {
  if (instance) return instance;

  instance = new XataClient({
    databaseURL: process.env.XATA_DATABASE_URL,
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH || "main",
    fetch,
  });
  return instance;
};