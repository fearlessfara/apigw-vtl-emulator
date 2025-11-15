package dev.vtlemulator.engine;

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
        
        // Add params to the context using AWS-compliant structure
        // 'name' is a query parameter, 'type' is also a query parameter
        String contextJson = "{\"params\":{\"querystring\":{\"name\":\"Bella\",\"type\":\"dog\"}}}";
        
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
        
        // Use AWS-compliant params structure
        String contextJson = "{\"params\":{\"querystring\":{\"name\":\"Bella\"}}}";
        
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
        
        // Use AWS-compliant params structure
        String contextJson = "{\"params\":{\"querystring\":{\"name\":\"Bella\",\"type\":\"dog\"}}}";
        
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
        
        // Use AWS-compliant params structure
        String contextJson = "{\"params\":{\"querystring\":{\"name\":\"Bella\"}}}";
        
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
        
        // Use AWS-compliant params structure - 'id' is a path parameter
        String contextJson = "{\"params\":{\"path\":{\"id\":\"123\"}}}";
        
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
        
        // Use AWS-compliant params structure - 'id' is a path parameter
        String contextJson = "{\"params\":{\"path\":{\"id\":\"123\"}}}";
        
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
    
    @Test
    public void testPhotoAlbumAPI_RequestTransformation() {
        // Photo Album API example from AWS docs - Request transformation
        // This example transforms the payload to match the format required by the integration endpoint
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
            "\n" +
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
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: Photo Album result: '" + result + "'");
        
        // Verify the transformation worked correctly
        assertTrue(result.contains("\"photos\":["));
        assertTrue(result.contains("\"id\":\"12345678901\""));
        assertTrue(result.contains("\"id\":\"23456789012\""));
        assertTrue(result.contains("\"photographedBy\":\"Saanvi Sarkar\""));
        assertTrue(result.contains("\"photographedBy\":\"Richard Roe\""));
        assertTrue(result.contains("\"title\":\"Sample photo 1\""));
        assertTrue(result.contains("\"title\":\"Sample photo 2\""));
        assertTrue(result.contains("\"ispublic\":true"));
        assertTrue(result.contains("\"isfriend\":false"));
        assertTrue(result.contains("\"isfamily\":false"));
        // Should not include original fields like owner, secret, server, farm
        assertFalse(result.contains("\"owner\""));
        assertFalse(result.contains("\"secret\""));
        assertFalse(result.contains("\"server\""));
        assertFalse(result.contains("\"farm\""));
    }
    
    @Test
    public void testPhotoAlbumAPI_ResponseTransformation() {
        // Photo Album API example from AWS docs - Response transformation
        // This transforms integration response data into the format expected by the method response
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographedBy\": \"$elem.photographedBy\",\n" +
            "      \"title\": \"$elem.title\",\n" +
            "      \"ispublic\": $elem.public,\n" +
            "      \"isfriend\": $elem.friend,\n" +
            "      \"isfamily\": $elem.family\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "\n" +
            "#end\n" +
            "  ]\n" +
            "}";
        
        // Integration response format (different field names)
        String input = "{\n" +
            "  \"photos\": [\n" +
            "    {\n" +
            "      \"id\": \"12345678901\",\n" +
            "      \"photographedBy\": \"Saanvi Sarkar\",\n" +
            "      \"title\": \"Sample photo 1\",\n" +
            "      \"description\": \"My sample photo 1\",\n" +
            "      \"public\": true,\n" +
            "      \"friend\": false,\n" +
            "      \"family\": false\n" +
            "    },\n" +
            "    {\n" +
            "      \"id\": \"23456789012\",\n" +
            "      \"photographedBy\": \"Richard Roe\",\n" +
            "      \"title\": \"Sample photo 2\",\n" +
            "      \"description\": \"My sample photo 1\",\n" +
            "      \"public\": true,\n" +
            "      \"friend\": false,\n" +
            "      \"family\": false\n" +
            "    }\n" +
            "  ]\n" +
            "}";
        
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: Photo Album Response result: '" + result + "'");
        
        // Verify the transformation worked correctly
        assertTrue(result.contains("\"photos\":["));
        assertTrue(result.contains("\"id\":\"12345678901\""));
        assertTrue(result.contains("\"id\":\"23456789012\""));
        assertTrue(result.contains("\"photographedBy\":\"Saanvi Sarkar\""));
        assertTrue(result.contains("\"photographedBy\":\"Richard Roe\""));
        assertTrue(result.contains("\"title\":\"Sample photo 1\""));
        assertTrue(result.contains("\"title\":\"Sample photo 2\""));
        // Verify field name transformation: public -> ispublic, friend -> isfriend, family -> isfamily
        assertTrue(result.contains("\"ispublic\":true"));
        assertTrue(result.contains("\"isfriend\":false"));
        assertTrue(result.contains("\"isfamily\":false"));
        // Should not include description field
        assertFalse(result.contains("\"description\""));
    }
    
    @Test
    public void testRequestTemplatesExample_JSON() {
        // Example from requestTemplates documentation - JSON mapping
        String template = "#set ($root=$input.path('$')) { \"stage\": \"$root.name\", \"user-id\": \"$root.key\" }";
        
        String input = "{\n" +
            "  \"name\": \"prod\",\n" +
            "  \"key\": \"user123\"\n" +
            "}";
        
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: RequestTemplates JSON result: '" + result + "'");
        
        // Verify the transformation
        assertTrue(result.contains("\"stage\":\"prod\""));
        assertTrue(result.contains("\"user-id\":\"user123\""));
    }
    
    @Test
    public void testRequestTemplatesExample_XML() {
        // Example from requestTemplates documentation - XML mapping (simplified to test VTL)
        // Note: We're testing the VTL part, not XML generation
        String template = "#set ($root=$input.path('$')) <stage>$root.name</stage>";
        
        String input = "{\n" +
            "  \"name\": \"prod\"\n" +
            "}";
        
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: RequestTemplates XML result: '" + result + "'");
        
        // Verify the transformation
        assertTrue(result.contains("<stage>"));
        assertTrue(result.contains("prod"));
        assertTrue(result.contains("</stage>"));
    }
    
    @Test
    public void testUtilParseJsonExample() {
        // Test $util.parseJson() as shown in AWS documentation
        // Example: Parse nested JSON from errorMessage
        String template = "#set ($errorMessageObj = $util.parseJson($input.path('$.errorMessage'))) {\n" +
            "  \"errorMessageObjKey2ArrVal\": $errorMessageObj.key2.arr[0]\n" +
            "}";
        
        String input = "{\n" +
            "  \"errorMessage\": \"{\\\"key1\\\":\\\"var1\\\",\\\"key2\\\":{\\\"arr\\\":[1,2,3]}}\"\n" +
            "}";
        
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: ParseJson result: '" + result + "'");
        
        // Verify the parsed JSON was accessed correctly
        assertTrue(result.contains("\"errorMessageObjKey2ArrVal\":1"));
    }
    
    @Test
    public void testUtilBase64EncodeDecode() {
        // Test base64 encoding and decoding
        String template = "{\n" +
            "  \"original\": \"$input.body\",\n" +
            "  \"encoded\": \"$util.base64Encode($input.body)\",\n" +
            "  \"decoded\": \"$util.base64Decode($util.base64Encode($input.body))\"\n" +
            "}";
        
        String input = "Hello World";
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: Base64 result: '" + result + "'");
        
        // Verify encoding/decoding works
        assertTrue(result.contains("\"original\":\"Hello World\""));
        assertTrue(result.contains("\"encoded\":\"SGVsbG8gV29ybGQ=\""));
        assertTrue(result.contains("\"decoded\":\"Hello World\""));
    }
    
    @Test
    public void testUtilUrlEncodeDecode() {
        // Test URL encoding and decoding
        String template = "{\n" +
            "  \"original\": \"$input.body\",\n" +
            "  \"encoded\": \"$util.urlEncode($input.body)\",\n" +
            "  \"decoded\": \"$util.urlDecode($util.urlEncode($input.body))\"\n" +
            "}";
        
        String input = "Hello World & More";
        String contextJson = "{}";
        String result = processor.process(template, input, contextJson);
        
        System.out.println("DEBUG: URL Encode result: '" + result + "'");
        
        // Verify encoding/decoding works
        assertTrue(result.contains("\"original\":\"Hello World & More\""));
        assertTrue(result.contains("\"encoded\":\"Hello+World+%26+More\""));
        assertTrue(result.contains("\"decoded\":\"Hello World & More\""));
    }
} 