import type { APIGatewayProxyResult } from "aws-lambda";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,x-api-key",
};

export function success(body: unknown, statusCode = 200): APIGatewayProxyResult {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export function error(message: string, statusCode = 400): APIGatewayProxyResult {
  return { statusCode, headers, body: JSON.stringify({ error: message }) };
}
