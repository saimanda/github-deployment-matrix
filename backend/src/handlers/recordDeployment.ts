import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateDeployment } from "../lib/validation.js";
import { putDeployment } from "../lib/dynamo.js";
import { success, error } from "../lib/response.js";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const deployment = validateDeployment(body);
    await putDeployment(deployment);
    return success(deployment, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.startsWith("Missing") || message.startsWith("environment") || message.startsWith("timestamp") || message.startsWith("Request body")) {
      return error(message, 400);
    }
    console.error("Error recording deployment:", err);
    return error("Internal server error", 500);
  }
}
