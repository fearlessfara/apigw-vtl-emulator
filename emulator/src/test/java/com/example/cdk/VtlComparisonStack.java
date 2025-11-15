package com.example.cdk;

import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.Duration;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.apigateway.*;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;
import software.constructs.Construct;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

/**
 * CDK Stack that creates an API Gateway with various mapping templates
 * for testing VTL compatibility.
 */
public class VtlComparisonStack extends Stack {
    
    public VtlComparisonStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public VtlComparisonStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        // Create a simple Python Lambda function that echoes back the input
        // This allows us to test request mapping templates
        // The Lambda receives the transformed request from API Gateway and returns it as-is
        Function echoFunction = Function.Builder.create(this, "EchoFunction")
                .runtime(Runtime.PYTHON_3_11)
                .handler("index.handler")
                .code(Code.fromInline("""
                    import json
                    def handler(event, context):
                        # For non-proxy Lambda integrations, return the event wrapped in the expected format
                        # The event contains the transformed request from API Gateway
                        return {
                            'statusCode': 200,
                            'body': json.dumps(event),
                            'headers': {'Content-Type': 'application/json'}
                        }
                    """))
                .timeout(Duration.seconds(30))
                .memorySize(256)
                .build();

        // Create REST API
        RestApi api = RestApi.Builder.create(this, "VtlTestApi")
                .restApiName("VTL Comparison Test API")
                .description("API Gateway for testing VTL template compatibility")
                .build();

        // Load test cases from file system and create endpoints dynamically
        createEndpointsFromTestCases(api, echoFunction);

        // Output the API URL
        CfnOutput.Builder.create(this, "ApiUrl")
                .value(api.getUrl())
                .description("API Gateway endpoint URL")
                .build();
    }
    
    /**
     * Dynamically create API Gateway endpoints from test case configuration files.
     * Reads setup.json and template.vtl from each test case folder.
     */
    private void createEndpointsFromTestCases(RestApi api, Function echoFunction) {
        String testCasesDir = "src/test/resources/vtl-test-cases";
        Path testCasesPath = Paths.get(testCasesDir);
        
        if (!Files.exists(testCasesPath)) {
            System.out.println("Warning: Test cases directory not found: " + testCasesPath.toAbsolutePath());
            return;
        }
        
        ObjectMapper objectMapper = new ObjectMapper();
        
        try (Stream<Path> paths = Files.list(testCasesPath)) {
            paths.filter(Files::isDirectory)
                 .forEach(testCaseDir -> {
                     try {
                         Path setupPath = testCaseDir.resolve("setup.json");
                         Path templatePath = testCaseDir.resolve("template.vtl");
                         
                         if (!Files.exists(setupPath) || !Files.exists(templatePath)) {
                             System.out.println("Skipping " + testCaseDir.getFileName() + " - missing setup.json or template.vtl");
                             return;
                         }
                         
                         // Read setup.json
                         String setupJson = Files.readString(setupPath).trim();
                         @SuppressWarnings("unchecked")
                         Map<String, Object> setup = (Map<String, Object>) objectMapper.readValue(setupJson, Map.class);
                         
                         // Read template.vtl
                         String template = Files.readString(templatePath);
                         
                         // Create endpoint
                         createEndpointFromConfig(api, echoFunction, testCaseDir.getFileName().toString(), setup, template);
                         
                     } catch (Exception e) {
                         System.err.println("Error processing test case: " + testCaseDir.getFileName() + " - " + e.getMessage());
                         e.printStackTrace();
                     }
                 });
        } catch (Exception e) {
            System.err.println("Error reading test cases directory: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Create an API Gateway endpoint from configuration.
     */
    private void createEndpointFromConfig(RestApi api, Function echoFunction, String testCaseName, 
                                         Map<String, Object> setup, String template) {
        String endpoint = (String) setup.get("endpoint");
        String method = (String) setup.get("method");
        
        // Parse endpoint path and create resources
        // Example: "/all-params/{pathParam}" -> ["", "all-params", "{pathParam}"]
        String[] pathParts = endpoint.split("/");
        IResource currentResource = api.getRoot();
        
        // Build resource path
        for (String part : pathParts) {
            if (part.isEmpty()) continue;
            
            if (part.startsWith("{") && part.endsWith("}")) {
                // Path parameter - in CDK, path params are created with braces in the resource name
                // Example: addResource("{pathParam}") creates a path parameter resource
                currentResource = currentResource.addResource(part);
            } else {
                // Regular resource
                currentResource = currentResource.addResource(part);
            }
        }
        
        // Create Lambda integration
        LambdaIntegration integration = LambdaIntegration.Builder.create(echoFunction)
                .proxy(false)
                .requestTemplates(java.util.Map.of(
                    "application/json", template
                ))
                .integrationResponses(java.util.List.of(
                    IntegrationResponse.builder()
                        .statusCode("200")
                        .responseTemplates(java.util.Map.of(
                            "application/json", "$input.json('$.body')"
                        ))
                        .build()
                ))
                .build();
        
        // Build method options
        MethodOptions.Builder methodOptionsBuilder = MethodOptions.builder()
                .methodResponses(java.util.List.of(
                    MethodResponse.builder()
                        .statusCode("200")
                        .build()
                ));
        
        // Collect all request parameters (path, query, headers)
        Map<String, Boolean> requestParams = new HashMap<>();
        
        // Add path params
        @SuppressWarnings("unchecked")
        Map<String, Object> pathParams = (Map<String, Object>) setup.getOrDefault("pathParams", new HashMap<>());
        if (!pathParams.isEmpty()) {
            for (String paramName : pathParams.keySet()) {
                requestParams.put("method.request.path." + paramName, true);
            }
        }
        
        // Add query params
        @SuppressWarnings("unchecked")
        Map<String, Object> queryParams = (Map<String, Object>) setup.getOrDefault("queryParams", new HashMap<>());
        if (!queryParams.isEmpty()) {
            for (String paramName : queryParams.keySet()) {
                requestParams.put("method.request.querystring." + paramName, false);
            }
        }
        
        // Add headers
        @SuppressWarnings("unchecked")
        Map<String, Object> headers = (Map<String, Object>) setup.getOrDefault("headers", new HashMap<>());
        if (!headers.isEmpty()) {
            for (String headerName : headers.keySet()) {
                requestParams.put("method.request.header." + headerName, false);
            }
        }
        
        if (!requestParams.isEmpty()) {
            methodOptionsBuilder.requestParameters(requestParams);
        }
        
        // Add method to resource
        currentResource.addMethod(method, integration, methodOptionsBuilder.build());
        
        System.out.println("Created endpoint: " + method + " " + endpoint + " (from " + testCaseName + ")");
    }
}
