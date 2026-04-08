import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getLatestPerRepoEnv } from "../lib/dynamo.js";
import { success, error } from "../lib/response.js";

// These can be extended as new services are added
const REPOS = [
  "identity-service",
  "paywall-gateway",
  "user-profile-api",
  "auth-sync-worker",
];

const ENVIRONMENTS = ["DEV", "STAGING", "PROD"];

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const matrix = await getLatestPerRepoEnv(REPOS, ENVIRONMENTS);
    return success({ matrix, repos: REPOS, environments: ENVIRONMENTS });
  } catch (err) {
    console.error("Error fetching latest deployments:", err);
    return error("Internal server error", 500);
  }
}
