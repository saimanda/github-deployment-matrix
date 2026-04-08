import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Construct } from "constructs";
import * as path from "path";

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, "DeploymentEvents", {
      tableName: "DeploymentEvents",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: "ttl",
    });

    table.addGlobalSecondaryIndex({
      indexName: "gsi1",
      partitionKey: { name: "gsi1pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "gsi1sk", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Shared Lambda props
    const commonLambdaProps: Partial<lambda.FunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: table.tableName,
      },
    };

    // Lambda Functions
    const recordDeploymentFn = new lambda.Function(this, "RecordDeployment", {
      ...commonLambdaProps,
      handler: "recordDeployment.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../backend/dist/handlers")),
      functionName: "DeployDashboard-RecordDeployment",
    } as lambda.FunctionProps);

    const getDeploymentsFn = new lambda.Function(this, "GetDeployments", {
      ...commonLambdaProps,
      handler: "getDeployments.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../backend/dist/handlers")),
      functionName: "DeployDashboard-GetDeployments",
    } as lambda.FunctionProps);

    const getLatestFn = new lambda.Function(this, "GetLatestDeployments", {
      ...commonLambdaProps,
      handler: "getLatestDeployments.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../../backend/dist/handlers")),
      functionName: "DeployDashboard-GetLatest",
    } as lambda.FunctionProps);

    // Grant DynamoDB permissions
    table.grantReadWriteData(recordDeploymentFn);
    table.grantReadData(getDeploymentsFn);
    table.grantReadData(getLatestFn);

    // HTTP API Gateway
    const httpApi = new apigateway.HttpApi(this, "DeployDashboardApi", {
      apiName: "DeploymentDashboardApi",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigateway.CorsHttpMethod.GET, apigateway.CorsHttpMethod.POST, apigateway.CorsHttpMethod.OPTIONS],
        allowHeaders: ["Content-Type", "x-api-key"],
      },
    });

    httpApi.addRoutes({
      path: "/deployments",
      methods: [apigateway.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("RecordIntegration", recordDeploymentFn),
    });

    httpApi.addRoutes({
      path: "/deployments",
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetIntegration", getDeploymentsFn),
    });

    httpApi.addRoutes({
      path: "/deployments/latest",
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration("GetLatestIntegration", getLatestFn),
    });

    this.apiUrl = httpApi.apiEndpoint;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
      description: "Deployment Dashboard API URL",
      exportName: "DeployDashboardApiUrl",
    });
  }
}
