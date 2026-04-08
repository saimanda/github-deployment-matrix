import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { queryDeployments } from "../lib/dynamo.js";
import { success, error } from "../lib/response.js";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const params = event.queryStringParameters ?? {};
    const deployments = await queryDeployments({
      environment: params.environment || undefined,
      repoName: params.repoName || undefined,
      limit: params.limit ? parseInt(params.limit, 10) : undefined,
    });
    return success({ deployments });
  } catch (err) {
    console.error("Error fetching deployments:", err);
    return error("Internal server error", 500);
  }
}
