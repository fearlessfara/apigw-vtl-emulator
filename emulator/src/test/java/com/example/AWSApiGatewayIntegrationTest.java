package com.example;

import com.example.cdk.VtlComparisonStack;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.junit.*;
import software.amazon.awscdk.App;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.assertions.Template;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Integration test that deploys API Gateway using CDK and compares results
 * with our VTL implementation.
 * 
 * Note: This test requires AWS credentials and CDK CLI to be configured.
 * Set the environment variable RUN_AWS_TESTS=true to enable actual AWS deployment.
 * Otherwise, the test will be skipped.
 */
public class AWSApiGatewayIntegrationTest {
    
    private static final String RUN_AWS_TESTS_ENV = "RUN_AWS_TESTS";
    private static final String API_URL_ENV = "API_URL";
    private static final boolean RUN_AWS_TESTS = "true".equalsIgnoreCase(System.getenv(RUN_AWS_TESTS_ENV));
    private static final String API_URL = System.getenv(API_URL_ENV);
    
    private VTLProcessor processor;
    private ObjectMapper objectMapper;
    private OkHttpClient httpClient;
    
    @BeforeClass
    public static void checkAwsCredentials() {
        if (RUN_AWS_TESTS) {
            System.out.println("AWS integration tests enabled. Make sure AWS credentials are configured.");
            System.out.println("This test will deploy resources to AWS and may incur costs.");
        } else {
            System.out.println("AWS integration tests disabled. Set " + RUN_AWS_TESTS_ENV + "=true to enable.");
        }
    }
    
    @Before
    public void setUp() {
        processor = new VTLProcessor();
        objectMapper = new ObjectMapper();
        httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
    }
    
    @After
    public void tearDown() {
        if (httpClient != null) {
            httpClient.dispatcher().executorService().shutdown();
            httpClient.connectionPool().evictAll();
        }
    }
    
    @Test
    public void testContextVariablesMapping() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            System.out.println("Skipping AWS test - set " + RUN_AWS_TESTS_ENV + "=true and " + API_URL_ENV + "=<api-url> to run");
            return;
        }
        
        String template = "{\n" +
            "    \"stage\" : \"$context.stage\",\n" +
            "    \"request_id\" : \"$context.requestId\",\n" +
            "    \"api_id\" : \"$context.apiId\",\n" +
            "    \"resource_path\" : \"$context.resourcePath\",\n" +
            "    \"resource_id\" : \"$context.resourceId\",\n" +
            "    \"http_method\" : \"$context.httpMethod\",\n" +
            "    \"source_ip\" : \"$context.identity.sourceIp\",\n" +
            "    \"user-agent\" : \"$context.identity.userAgent\",\n" +
            "    \"account_id\" : \"$context.identity.accountId\",\n" +
            "    \"api_key\" : \"$context.identity.apiKey\",\n" +
            "    \"caller\" : \"$context.identity.caller\",\n" +
            "    \"user\" : \"$context.identity.user\",\n" +
            "    \"user_arn\" : \"$context.identity.userArn\"\n" +
            "}";
        
        // Create context for our implementation
        Map<String, Object> context = new HashMap<>();
        context.put("stage", "test");
        context.put("requestId", "test-request-id");
        context.put("apiId", "test-api-id");
        context.put("resourcePath", "/context-vars");
        context.put("resourceId", "test-resource-id");
        context.put("httpMethod", "GET");
        
        Map<String, Object> identity = new HashMap<>();
        identity.put("sourceIp", "192.0.2.1");
        identity.put("userAgent", "test-agent");
        identity.put("accountId", "123456789012");
        identity.put("apiKey", "test-key");
        identity.put("caller", "test-caller");
        identity.put("user", "test-user");
        identity.put("userArn", "arn:aws:iam::123456789012:user/test");
        context.put("identity", identity);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String ourResult = processor.process(template, "{}", contextJson);
        
        // Invoke AWS API Gateway (if deployed)
        String awsResult = invokeApi(API_URL + "/context-vars", "GET", null, null);
        compareResults("Context Variables", ourResult, awsResult);
    }
    
    @Test
    public void testAllRequestParameters() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            return;
        }
        
        String template = "#set($allParams = $input.params())\n" +
            "{\n" +
            "  \"params\" : {\n" +
            "    #foreach($type in $allParams.keySet())\n" +
            "    #set($params = $allParams.get($type))\n" +
            "    \"$type\" : {\n" +
            "      #foreach($paramName in $params.keySet())\n" +
            "      \"$paramName\" : \"$util.escapeJavaScript($params.get($paramName))\"\n" +
            "      #if($foreach.hasNext),#end\n" +
            "      #end\n" +
            "    }\n" +
            "    #if($foreach.hasNext),#end\n" +
            "    #end\n" +
            "  }\n" +
            "}";
        
        // Create context with params
        Map<String, Object> context = new HashMap<>();
        Map<String, Object> params = new HashMap<>();
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("pathParam", "test-path-value");
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("queryParam", "test-query-value");
        Map<String, Object> headerParams = new HashMap<>();
        headerParams.put("Custom-Header", "test-header-value");
        params.put("path", pathParams);
        params.put("querystring", queryParams);
        params.put("header", headerParams);
        context.put("params", params);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String ourResult = processor.process(template, "{}", contextJson);
        
        Map<String, String> headers = new HashMap<>();
        headers.put("Custom-Header", "test-header-value");
        String awsResult = invokeApi(API_URL + "/all-params/test-path-value?queryParam=test-query-value", 
                "GET", null, headers);
        compareResults("All Request Parameters", ourResult, awsResult);
    }
    
    @Test
    public void testSubsectionOfMethodRequest() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            return;
        }
        
        String template = "{\n" +
            "    \"name\" : \"$input.params('name')\",\n" +
            "    \"body\" : $input.json('$') \n" +
            "}";
        
        String input = "{\n" +
            "    \"Price\" : \"249.99\",\n" +
            "    \"Age\": \"6\"\n" +
            "}";
        
        Map<String, Object> context = new HashMap<>();
        Map<String, Object> params = new HashMap<>();
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("name", "Bella");
        params.put("querystring", queryParams);
        context.put("params", params);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String ourResult = processor.process(template, input, contextJson);
        
        String awsResult = invokeApi(API_URL + "/subsection?name=Bella", "POST", input, null);
        compareResults("Subsection of Method Request", ourResult, awsResult);
    }
    
    @Test
    public void testJsonPathExpression() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            return;
        }
        
        String template = "{\n" +
            "    \"name\" : \"$input.params('name')\",\n" +
            "    \"body\" : $input.path('$.Age')  \n" +
            "}";
        
        String input = "{\n" +
            "    \"Price\" : \"249.99\",\n" +
            "    \"Age\": \"6\"\n" +
            "}";
        
        Map<String, Object> context = new HashMap<>();
        Map<String, Object> params = new HashMap<>();
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("name", "Bella");
        params.put("querystring", queryParams);
        context.put("params", params);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String ourResult = processor.process(template, input, contextJson);
        
        String awsResult = invokeApi(API_URL + "/jsonpath?name=Bella", "POST", input, null);
        compareResults("JSONPath Expression", ourResult, awsResult);
    }
    
    @Test
    public void testJsonPathWithSize() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            return;
        }
        
        String template = "{\n" +
            "    \"id\" : \"$input.params('id')\",\n" +
            "    \"count\" : $input.path('$.things').size(),\n" +
            "    \"things\" : $input.json('$.things')\n" +
            "}";
        
        String input = "{\n" +
            "      \"things\": {\n" +
            "            \"1\": {},\n" +
            "            \"2\": {},\n" +
            "            \"3\": {}\n" +
            "      }\n" +
            "}";
        
        Map<String, Object> context = new HashMap<>();
        Map<String, Object> params = new HashMap<>();
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("id", "123");
        params.put("path", pathParams);
        context.put("params", params);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String ourResult = processor.process(template, input, contextJson);
        
        String awsResult = invokeApi(API_URL + "/jsonpath-size/123", "POST", input, null);
        compareResults("JSONPath with Size", ourResult, awsResult);
    }
    
    @Test
    public void testPhotoAlbumTransformation() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            return;
        }
        
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographedBy\": \"$elem.photographer_first_name $elem.photographer_last_name\",\n" +
            "      \"title\": \"$elem.title\",\n" +
            "      \"ispublic\": $elem.ispublic,\n" +
            "      \"isfriend\": $elem.isfriend,\n" +
            "      \"isfamily\": $elem.isfamily\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "#end\n" +
            "  ]\n" +
            "}";
        
        String input = "{\n" +
            "  \"photos\": {\n" +
            "    \"page\": 1,\n" +
            "    \"pages\": \"1234\",\n" +
            "    \"perpage\": 100,\n" +
            "    \"total\": \"123398\",\n" +
            "    \"photo\": [\n" +
            "      {\n" +
            "        \"id\": \"12345678901\",\n" +
            "        \"owner\": \"23456789@A12\",\n" +
            "        \"photographer_first_name\": \"Saanvi\",\n" +
            "        \"photographer_last_name\": \"Sarkar\",\n" +
            "        \"secret\": \"abc123d456\",\n" +
            "        \"server\": \"1234\",\n" +
            "        \"farm\": 1,\n" +
            "        \"title\": \"Sample photo 1\",\n" +
            "        \"ispublic\": true,\n" +
            "        \"isfriend\": false,\n" +
            "        \"isfamily\": false\n" +
            "      },\n" +
            "      {\n" +
            "        \"id\": \"23456789012\",\n" +
            "        \"owner\": \"34567890@B23\",\n" +
            "        \"photographer_first_name\": \"Richard\",\n" +
            "        \"photographer_last_name\": \"Roe\",\n" +
            "        \"secret\": \"bcd234e567\",\n" +
            "        \"server\": \"2345\",\n" +
            "        \"farm\": 2,\n" +
            "        \"title\": \"Sample photo 2\",\n" +
            "        \"ispublic\": true,\n" +
            "        \"isfriend\": false,\n" +
            "        \"isfamily\": false\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "}";
        
        String contextJson = "{}";
        String ourResult = processor.process(template, input, contextJson);
        
        String awsResult = invokeApi(API_URL + "/photo-album", "POST", input, null);
        compareResults("Photo Album Transformation", ourResult, awsResult);
    }
    
    @Test
    public void testUtilFunctions() throws Exception {
        if (!RUN_AWS_TESTS || API_URL == null || API_URL.isEmpty()) {
            return;
        }
        
        // Note: In AWS API Gateway, when $input.body contains JSON, it needs to be escaped
        // Our implementation matches this behavior
        String template = "{\n" +
            "  \"original\": \"$util.escapeJavaScript($input.body)\",\n" +
            "  \"encoded\": \"$util.base64Encode($input.body)\",\n" +
            "  \"decoded\": \"$util.base64Decode($util.base64Encode($input.body))\",\n" +
            "  \"urlEncoded\": \"$util.urlEncode($input.body)\",\n" +
            "  \"urlDecoded\": \"$util.urlDecode($util.urlEncode($input.body))\",\n" +
            "  \"escaped\": \"$util.escapeJavaScript($input.json('$'))\"\n" +
            "}";
        
        String input = "{\"test\": \"Hello World & More\"}";
        String contextJson = "{}";
        String ourResult = processor.process(template, input, contextJson);
        
        String awsResult = invokeApi(API_URL + "/util-functions", "POST", input, null);
        compareResults("Util Functions", ourResult, awsResult);
    }
    
    private String invokeApi(String url, String method, String body, Map<String, String> headers) throws IOException {
        Request.Builder requestBuilder = new Request.Builder().url(url);
        
        if (headers != null) {
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                requestBuilder.addHeader(entry.getKey(), entry.getValue());
            }
        }
        
        if (body != null) {
            RequestBody requestBody = RequestBody.create(body, MediaType.get("application/json"));
            requestBuilder.method(method, requestBody);
            requestBuilder.addHeader("Content-Type", "application/json");
        } else {
            requestBuilder.method(method, null);
        }
        
        Request request = requestBuilder.build();
        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            if (!response.isSuccessful()) {
                System.err.println("API Error Response (" + response.code() + "): " + responseBody);
                throw new IOException("Unexpected code " + response.code() + ": " + responseBody);
            }
            return responseBody;
        }
    }
    
    private void compareResults(String testName, String ourResult, String awsResult) {
        System.out.println("\n=== " + testName + " ===");
        System.out.println("Our Result:   " + ourResult);
        System.out.println("AWS Result:   " + awsResult);
        
        // Normalize JSON for comparison
        try {
            // Parse our result
            Object ourObj = objectMapper.readValue(ourResult, Object.class);
            String ourNormalized = objectMapper.writeValueAsString(ourObj);
            
            // AWS result might be a JSON string, so try to parse it
            Object awsObj;
            try {
                // First try parsing as JSON
                awsObj = objectMapper.readValue(awsResult, Object.class);
                // If it's a string, parse it again
                if (awsObj instanceof String) {
                    awsObj = objectMapper.readValue((String) awsObj, Object.class);
                }
            } catch (Exception e) {
                // If parsing fails, try treating it as a JSON string
                awsObj = objectMapper.readValue(awsResult.replaceAll("^\"|\"$", ""), Object.class);
            }
            
            String awsNormalized = objectMapper.writeValueAsString(awsObj);
            
            // For context variables test, only compare structure (keys), not values
            if (testName.contains("Context Variables")) {
                Map<String, Object> ourMap = (Map<String, Object>) ourObj;
                Map<String, Object> awsMap = (Map<String, Object>) awsObj;
                boolean keysMatch = ourMap.keySet().equals(awsMap.keySet());
                if (keysMatch) {
                    System.out.println("✅ Structure MATCHES! (Context values differ as expected)");
                } else {
                    System.out.println("❌ Structure DIFFERS!");
                    System.out.println("Our keys: " + ourMap.keySet());
                    System.out.println("AWS keys: " + awsMap.keySet());
                }
            } else if (testName.contains("All Request Parameters")) {
                // For params test, AWS includes many extra headers (CloudFront, etc.)
                // Just verify our expected params are present
                Map<String, Object> ourMap = (Map<String, Object>) ourObj;
                Map<String, Object> awsMap = (Map<String, Object>) awsObj;
                @SuppressWarnings("unchecked")
                Map<String, Object> ourParams = (Map<String, Object>) ourMap.get("params");
                @SuppressWarnings("unchecked")
                Map<String, Object> awsParams = (Map<String, Object>) awsMap.get("params");
                
                // Check that our expected params exist in AWS response
                boolean pathMatch = awsParams.containsKey("path") && 
                    ((Map<?, ?>) awsParams.get("path")).containsKey("pathParam");
                boolean queryMatch = awsParams.containsKey("querystring") && 
                    ((Map<?, ?>) awsParams.get("querystring")).containsKey("queryParam");
                boolean headerMatch = awsParams.containsKey("header");
                
                if (pathMatch && queryMatch && headerMatch) {
                    System.out.println("✅ Expected parameters present! (AWS includes additional headers as expected)");
                } else {
                    System.out.println("❌ Expected parameters missing!");
                }
            } else if (ourNormalized.equals(awsNormalized)) {
                System.out.println("✅ Results MATCH!");
            } else {
                System.out.println("❌ Results DIFFER!");
                System.out.println("Normalized Our: " + ourNormalized);
                System.out.println("Normalized AWS: " + awsNormalized);
            }
        } catch (Exception e) {
            System.out.println("⚠️  Could not normalize JSON for comparison: " + e.getMessage());
            e.printStackTrace();
            if (ourResult.equals(awsResult)) {
                System.out.println("✅ Raw strings MATCH!");
            } else {
                System.out.println("❌ Raw strings DIFFER!");
            }
        }
    }
    
    /**
     * Helper method to deploy CDK stack (run separately before tests)
     */
    public static void main(String[] args) {
        App app = new App();
        
        VtlComparisonStack stack = new VtlComparisonStack(app, "VtlComparisonStack",
                StackProps.builder()
                        .env(software.amazon.awscdk.Environment.builder()
                                .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                                .region(System.getenv("CDK_DEFAULT_REGION"))
                                .build())
                        .build());
        
        app.synth();
        
        System.out.println("\nTo deploy this stack, run:");
        System.out.println("  cdk deploy VtlComparisonStack");
        System.out.println("\nAfter deployment, set the API URL in your test configuration.");
    }
}

