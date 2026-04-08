import type { Deployment } from "../types/index.js";

const VALID_ENVIRONMENTS = ["DEV", "STAGING", "PROD"];

export function validateDeployment(body: unknown): Deployment {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }

  const obj = body as Record<string, unknown>;

  const required = ["repoName", "environment", "version", "deployer", "timestamp"] as const;
  for (const field of required) {
    if (!obj[field] || typeof obj[field] !== "string") {
      throw new Error(`Missing or invalid required field: ${field}`);
    }
  }

  const env = (obj.environment as string).toUpperCase();
  if (!VALID_ENVIRONMENTS.includes(env)) {
    throw new Error(`environment must be one of: ${VALID_ENVIRONMENTS.join(", ")}`);
  }

  const ts = new Date(obj.timestamp as string);
  if (isNaN(ts.getTime())) {
    throw new Error("timestamp must be a valid ISO 8601 date string");
  }

  return {
    repoName: obj.repoName as string,
    environment: env as Deployment["environment"],
    version: obj.version as string,
    deployer: obj.deployer as string,
    timestamp: ts.toISOString(),
    commitSha: typeof obj.commitSha === "string" ? obj.commitSha : undefined,
    releaseNotesUrl: typeof obj.releaseNotesUrl === "string" ? obj.releaseNotesUrl : undefined,
    releaseNotes: typeof obj.releaseNotes === "string" ? obj.releaseNotes : undefined,
  };
}
