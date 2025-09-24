// FIX: Replaced the manual XataClient implementation with the recommended `buildClient`
// factory. The previous approach of extending BaseClient did not create the `.db`
// accessor, causing widespread type errors. This new implementation correctly
// generates a typed client, resolving the "Property 'db' does not exist" errors.
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
    columns: [
      // The 'id' column is implicitly created and will store the key string.
      // No other columns are needed for this lookup table.
    ],
  }
];

// This creates a properly typed client class based on the schema defined above.
// The buildClient function returns a class that we can instantiate.
const XataClient = buildClient({ tables });

let instance: XataClient | undefined = undefined;

// We use a singleton pattern to ensure we only have one Xata client instance.
export const getXataClient = () => {
    if (instance) return instance;

    instance = new XataClient({
        databaseURL: process.env.XATA_DATABASE_URL,
        apiKey: process.env.XATA_API_KEY,
        branch: process.env.XATA_BRANCH || "main",
        fetch,
    });
    return instance;
};
