import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Deployment, DeploymentFilters, LatestDeployments, DynamoDeploymentItem } from "../types/index.js";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;
const TTL_DAYS = 90;

function toItem(d: Deployment): DynamoDeploymentItem {
  return {
    pk: `REPO#${d.repoName}`,
    sk: `ENV#${d.environment}#${d.timestamp}`,
    gsi1pk: "ALL_DEPLOYMENTS",
    gsi1sk: d.timestamp,
    repoName: d.repoName,
    environment: d.environment,
    version: d.version,
    deployer: d.deployer,
    timestamp: d.timestamp,
    commitSha: d.commitSha,
    releaseNotesUrl: d.releaseNotesUrl,
    releaseNotes: d.releaseNotes,
    ttl: Math.floor(Date.now() / 1000) + TTL_DAYS * 24 * 60 * 60,
  };
}

function fromItem(item: Record<string, unknown>): Deployment {
  return {
    repoName: item.repoName as string,
    environment: item.environment as Deployment["environment"],
    version: item.version as string,
    deployer: item.deployer as string,
    timestamp: item.timestamp as string,
    commitSha: item.commitSha as string | undefined,
    releaseNotesUrl: item.releaseNotesUrl as string | undefined,
    releaseNotes: item.releaseNotes as string | undefined,
  };
}

export async function putDeployment(deployment: Deployment): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: toItem(deployment),
    })
  );
}

export async function queryDeployments(filters: DeploymentFilters): Promise<Deployment[]> {
  const limit = filters.limit ?? 50;

  if (filters.repoName) {
    const expressionValues: Record<string, string> = { ":pk": `REPO#${filters.repoName}` };
    let keyCondition = "pk = :pk";

    if (filters.environment) {
      keyCondition = "pk = :pk AND begins_with(sk, :skPrefix)";
      expressionValues[":skPrefix"] = `ENV#${filters.environment}#`;
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
      ScanIndexForward: false,
      Limit: limit,
    }));
    return (result.Items ?? []).map(fromItem);
  }

  // Query GSI for all deployments, optionally filtered by environment
  const expressionValues: Record<string, string> = { ":pk": "ALL_DEPLOYMENTS" };
  let filterExpression: string | undefined;

  if (filters.environment) {
    filterExpression = "environment = :env";
    expressionValues[":env"] = filters.environment;
  }

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "gsi1",
    KeyConditionExpression: "gsi1pk = :pk",
    ExpressionAttributeValues: expressionValues,
    ScanIndexForward: false,
    Limit: limit,
    FilterExpression: filterExpression,
  }));
  return (result.Items ?? []).map(fromItem);
}

export async function getLatestPerRepoEnv(
  repos: string[],
  envs: string[]
): Promise<LatestDeployments> {
  const matrix: LatestDeployments = {};

  const queries = repos.flatMap((repo) =>
    envs.map(async (env) => {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": `REPO#${repo}`,
            ":skPrefix": `ENV#${env}#`,
          },
          ScanIndexForward: false,
          Limit: 1,
        })
      );

      if (result.Items && result.Items.length > 0) {
        if (!matrix[repo]) matrix[repo] = {};
        matrix[repo][env] = fromItem(result.Items[0]);
      }
    })
  );

  await Promise.all(queries);
  return matrix;
}
