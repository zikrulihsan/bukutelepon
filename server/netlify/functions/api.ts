import serverless from "serverless-http";
import app from "../../src/app";

// The /api/* rewrite in netlify.toml forwards every API request here. Express
// keeps ownership of all routes, so existing browser requests need no changes.
export const handler = serverless(app);
