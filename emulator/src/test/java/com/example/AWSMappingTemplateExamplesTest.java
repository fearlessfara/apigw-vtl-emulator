package com.example;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;

public class AWSMappingTemplateExamplesTest {
    
    private VTLProcessor processor;
    
    @Before
    public void setUp() {
        processor = new VTLProcessor();
    }
    
    @Test
    public void testExample1_ContextVariablesMapping() {
        // Example 1: Map $context variables to backend variables
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
        
        Map<String, Object> context = new HashMap<>();
        context.put("stage", "prod");
        context.put("requestId", "abcdefg-000-000-0000-abcdefg");
        context.put("apiId", "abcd1234");
        context.put("resourcePath", "/");
        context.put("resourceId", "efg567");
        context.put("httpMethod", "GET");
        
        Map<String, Object> identity = new HashMap<>();
        identity.put("sourceIp", "192.0.2.1");
        identity.put("userAgent", "curl/7.84.0");
        identity.put("accountId", "111122223333");
        identity.put("apiKey", "MyTestKey");
        identity.put("caller", "ABCD-0000-12345");
        identity.put("user", "ABCD-0000-12345");
        identity.put("userArn", "arn:aws:sts::111122223333:assumed-role/Admin/carlos-salazar");
        context.put("identity", identity);
        
        String contextJson = "{\"stage\":\"prod\",\"requestId\":\"abcdefg-000-000-0000-abcdefg\",\"apiId\":\"abcd1234\",\"resourcePath\":\"/\",\"resourceId\":\"efg567\",\"httpMethod\":\"GET\",\"identity\":{\"sourceIp\":\"192.0.2.1\",\"userAgent\":\"curl/7.84.0\",\"accountId\":\"111122223333\",\"apiKey\":\"MyTestKey\",\"caller\":\"ABCD-0000-12345\",\"user\":\"ABCD-0000-12345\",\"userArn\":\"arn:aws:sts::111122223333:assumed-role/Admin/carlos-salazar\"}}";
        
        String result = processor.process(template, "{}", contextJson);
        
        System.out.println("DEBUG: Template result: '" + result + "'");
        
        // Verify the result contains all expected mappings
        assertTrue(result.contains("\"stage\":\"prod\""));
        assertTrue(result.contains("\"request_id\":\"abcdefg-000-000-0000-abcdefg\""));
        assertTrue(result.contains("\"api_id\":\"abcd1234\""));
        assertTrue(result.contains("\"resource_path\":\"/\""));
        assertTrue(result.contains("\"resource_id\":\"efg567\""));
        assertTrue(result.contains("\"http_method\":\"GET\""));
        assertTrue(result.contains("\"source_ip\":\"192.0.2.1\""));
        assertTrue(result.contains("\"user-agent\":\"curl/7.84.0\""));
        assertTrue(result.contains("\"account_id\":\"111122223333\""));
        assertTrue(result.contains("\"api_key\":\"MyTestKey\""));
        assertTrue(result.contains("\"caller\":\"ABCD-0000-12345\""));
        assertTrue(result.contains("\"user\":\"ABCD-0000-12345\""));
        assertTrue(result.contains("\"user_arn\":\"arn:aws:sts::111122223333:assumed-role/Admin/carlos-salazar\""));
    }
    
    @Test
    public void testExample2_AllRequestParameters() {
        // Example 2: Pass all request parameters via JSON payload
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
        
        // Create context with params structure
        String contextJson = "{\n" +
            "    \"params\": {\n" +
            "        \"path\": {\"myparam\": \"myparamm\"},\n" +
            "        \"querystring\": {\"querystring1\": \"value1,value2\"},\n" +
            "        \"header\": {\"header1\": \"value1\"}\n" +
            "    }\n" +
            "}";
        
        String result = processor.process(template, "{}", contextJson);
        
        // Expected output: {"params":{"path":{"example2":"myparamm"},"querystring":{"querystring1":"value1,value2"},"header":{"header1":"value1"}}}
        assertTrue(result.contains("\"params\""));
        assertTrue(result.contains("\"path\""));
        assertTrue(result.contains("\"myparam\""));
        assertTrue(result.contains("\"myparamm\""));
        assertTrue(result.contains("\"querystring\""));
        assertTrue(result.contains("\"querystring1\""));
        assertTrue(result.contains("\"value1,value2\""));
        assertTrue(result.contains("\"header\""));
        assertTrue(result.contains("\"header1\""));
        assertTrue(result.contains("\"value1\""));
    }
    
    @Test
    public void testExample3_SubsectionOfMethodRequest() {
        // Example 3: Pass subsection of method request
        String template = "{\n" +
            "    \"name\" : \"$input.params('name')\",\n" +
            "    \"body\" : $input.json('$') \n" +
            "}";
        
        String input = "{\n" +
            "    \"Price\" : \"249.99\",\n" +
            "    \"Age\": \"6\"\n" +
            "}";
        
        // Add params to the context
        String contextJson = "{\"params\":{\"name\":\"Bella\",\"type\":\"dog\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        // Accept both Java Map.toString() and JSON string formats, with quoted or unquoted keys
        assertTrue(result.contains("\"name\":\"Bella\""));
        assertTrue(result.contains("\"body\":{\"Price\":\"249.99\",\"Age\":\"6\"}"));
        assertFalse(result.contains("type")); // Should not include type parameter
    }
    
    @Test
    public void testExample3_WithEscapeJavaScript() {
        // Example 3 with escapeJavaScript
        String template = "{\n" +
            "    \"name\" : \"$input.params('name')\",\n" +
            "    \"body\" : \"$util.escapeJavaScript($input.json('$'))\"\n" +
            "}";
        
        String input = "{\n" +
            "    \"Price\" : \"249.99\",\n" +
            "    \"Age\": \"6\"\n" +
            "}";
        
        Map<String, Object> context = new HashMap<>();
        Map<String, Object> params = new HashMap<>();
        params.put("name", "Bella");
        context.put("params", params);
        
        String contextJson = "{\"params\":{\"name\":\"Bella\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        // Expected: {"name":"Bella","body":"{\\"Price\\":\\"249.99\\",\\"Age\\":\\"6\\"}"}
        assertTrue(result.contains("\"name\":\"Bella\""));
        assertTrue(result.contains("\"body\":\"{\\\"Price\\\":\\\"249.99\\\",\\\"Age\\\":\\\"6\\\"}\""));
    }
    
    @Test
    public void testExample4_JSONPathExpression() {
        // Example 4: Use JSONPath expression
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
        params.put("name", "Bella");
        params.put("type", "dog");
        context.put("params", params);
        
        String contextJson = "{\"params\":{\"name\":\"Bella\",\"type\":\"dog\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        // Expected: {"name":"Bella","body":"6"}
        assertTrue(result.contains("\"name\":\"Bella\""));
        assertTrue(result.contains("\"body\":6"));
        assertFalse(result.contains("Price")); // Should not include Price
        assertFalse(result.contains("type")); // Should not include type parameter
    }
    
    @Test
    public void testExample4_WithEscapeJavaScript() {
        // Example 4 with escapeJavaScript
        String template = "{\n" +
            "    \"name\" : \"$input.params('name')\",\n" +
            "    \"body\" : \"$util.escapeJavaScript($input.json('$.Age'))\" \n" +
            "}";
        
        String input = "{\n" +
            "    \"Price\" : \"249.99\",\n" +
            "    \"Age\": \"6\"\n" +
            "}";
        
        Map<String, Object> context = new HashMap<>();
        Map<String, Object> params = new HashMap<>();
        params.put("name", "Bella");
        context.put("params", params);
        
        String contextJson = "{\"params\":{\"name\":\"Bella\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        // Expected: {"name":"Bella","body":"\"6\""}
        assertTrue(result.contains("\"name\":\"Bella\""));
        assertTrue(result.contains("\"body\":\"\\\"6\\\"\"")); // Double escaped quotes
    }
    
    @Test
    public void testExample5_JSONPathWithSize() {
        // Example 5: Use JSONPath with size() method
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
        
        String contextJson = "{\"params\":{\"id\":\"123\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        // Accept both Java Map.toString() and JSON string formats, with quoted or unquoted keys
        assertTrue(result.contains("\"id\":\"123\""));
        assertTrue(result.contains("\"count\":3"));
        assertTrue(result.contains("\"things\":{\"1\":{},\"2\":{},\"3\":{}}"));
    }
    
    @Test
    public void testExample5_WithEscapeJavaScript() {
        // Example 5 with escapeJavaScript
        String template = "{\n" +
            "     \"id\" : \"$input.params('id')\",\n" +
            "     \"count\" : \"$input.path('$.things').size()\",\n" +
            "     \"things\" : \"$util.escapeJavaScript($input.json('$.things'))\"\n" +
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
        params.put("id", "123");
        context.put("params", params);
        
        String contextJson = "{\"params\":{\"id\":\"123\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: Template result: '" + result + "'");
        
        // Expected: {"id":"123","count":"3","things":"{\\"1\\":{},\\"2\\":{},\\"3\\":{}}"}
        assertTrue(result.contains("\"id\":\"123\""));
        assertTrue(result.contains("\"count\":\"3\""));
        assertTrue(result.contains("\"things\":\"{\\\"1\\\":{},\\\"2\\\":{},\\\"3\\\":{}}\""));
    }
    
    @Test
    public void testComplexNestedJSONPath() {
        // Test complex nested JSONPath expressions
        String template = "{\n" +
            "    \"user_name\": $input.json('$.user.name'),\n" +
            "    \"user_age\": $input.path('$.user.age'),\n" +
            "    \"user_active\": $input.path('$.user.active'),\n" +
            "    \"first_item\": $input.json('$.items[0].name'),\n" +
            "    \"item_count\": \"$input.path('$.items').size()\"\n" +
            "}";
        
        String input = "{\n" +
            "    \"user\": {\n" +
            "        \"name\": \"John Doe\",\n" +
            "        \"age\": 30,\n" +
            "        \"active\": true\n" +
            "    },\n" +
            "    \"items\": [\n" +
            "        {\"name\": \"Item 1\", \"price\": 10.99},\n" +
            "        {\"name\": \"Item 2\", \"price\": 20.50}\n" +
            "    ]\n" +
            "}";
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: Template result: '" + result + "'");
        
        assertTrue(result.contains("\"user_name\":\"John Doe\""));
        assertTrue(result.contains("\"user_age\":30"));
        assertTrue(result.contains("\"user_active\":true")); // Boolean should not be quoted
        assertTrue(result.contains("\"first_item\":\"Item 1\""));
        assertTrue(result.contains("\"item_count\":\"2\""));
    }
    
    @Test
    public void testConditionalLogicWithContext() {
        // Test conditional logic using context variables
        String template = "#if($context.stage == \"prod\")\n" +
            "{\n" +
            "    \"environment\": \"production\",\n" +
            "    \"debug\": false,\n" +
            "    \"api_version\": \"$context.apiId\"\n" +
            "}\n" +
            "#else\n" +
            "{\n" +
            "    \"environment\": \"development\",\n" +
            "    \"debug\": true,\n" +
            "    \"api_version\": \"$context.apiId\"\n" +
            "}\n" +
            "#end";
        
        Map<String, Object> context = new HashMap<>();
        context.put("stage", "prod");
        context.put("apiId", "prod-api-123");
        
        String contextJson = "{\"stage\":\"prod\",\"apiId\":\"prod-api-123\"}";
        
        String result = processor.process(template, "{}", contextJson);
        
        assertTrue(result.contains("\"environment\":\"production\""));
        assertTrue(result.contains("\"debug\":false"));
        assertTrue(result.contains("\"api_version\":\"prod-api-123\""));
        assertFalse(result.contains("development"));
    }
} 