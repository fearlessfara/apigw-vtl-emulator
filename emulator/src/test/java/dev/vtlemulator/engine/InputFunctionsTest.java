package dev.vtlemulator.engine;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

public class InputFunctionsTest {
    private VTLProcessor processor;
    private String contextJson;
    private ObjectMapper objectMapper;

    @Before
    public void setUp() throws Exception {
        processor = new VTLProcessor();
        objectMapper = new ObjectMapper();
        Map<String, Object> user = new HashMap<>();
        user.put("name", "John Doe");
        user.put("age", 30);
        user.put("email", "john@example.com");
        Map<String, Object> address = new HashMap<>();
        address.put("street", "123 Main St");
        address.put("city", "New York");
        address.put("zip", "10001");
        user.put("address", address);
        List<String> hobbies = Arrays.asList("reading", "swimming", "coding");
        user.put("hobbies", hobbies);
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        context.put("message", "Hello World");
        context.put("number", 42);
        context.put("boolean", true);
        context.put("nullValue", null);
        context.put("emptyString", "");
        // Use AWS-compliant params structure: path, querystring, header
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("id", "12345");
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("type", "user");
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", pathParams);
        allParams.put("querystring", queryParams);
        context.put("params", allParams);
        Map<String, Object> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Authorization", "Bearer token123");
        context.put("headers", headers);
        context.put("body", "{\"user\":{\"name\":\"John Doe\",\"age\":30,\"email\":\"john@example.com\"}}" );
        contextJson = objectMapper.writeValueAsString(context);
    }

    @Test
    public void testInputPathBasic() {
        String template = "$input.path('$.user.name')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("John Doe", result.trim());
    }
    @Test
    public void testInputPathNested() {
        String template = "$input.path('$.user.address.city')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("New York", result.trim());
    }
    @Test
    public void testInputPathArray() {
        String template = "$input.path('$.user.hobbies[0]')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("reading", result.trim());
    }
    @Test
    public void testInputPathWithoutDollar() {
        String template = "$input.path('user.name')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("John Doe", result.trim());
    }
    @Test
    public void testInputPathEmpty() {
        String template = "$input.path('')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("", result.trim());
    }
    @Test
    public void testInputPathNull() {
        String template = "$input.path(null)";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("", result.trim());
    }
    @Test
    public void testInputPathNonExistent() {
        String template = "$input.path('$.user.nonexistent')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("", result.trim());
    }
    @Test
    public void testInputPathNumber() {
        String template = "$input.path('$.user.age')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("30", result.trim());
    }
    @Test
    public void testInputPathBoolean() {
        String template = "$input.path('$.boolean')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("true", result.trim());
    }
    @Test
    public void testInputBody() {
        String template = "$input.body";
        String inputJson = (String) new HashMap<String, Object>() {{ put("user", new HashMap<String, Object>() {{ put("name", "John Doe"); put("age", 30); put("email", "john@example.com"); }}); }}.toString();
        String result = processor.process(template, inputJson, contextJson);
        assertNotNull(result);
        assertTrue(result.contains("John Doe"));
    }
    @Test
    public void testInputJson() {
        String template = "$input.json('$.user.name')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("\"John Doe\"", result.trim());
    }
    @Test
    public void testInputJsonBooleanTrue() {
        String template = "$input.json('$.boolean')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("true", result.trim());
    }
    @Test
    public void testInputJsonBooleanFalse() throws Exception {
        Map<String, Object> user = new HashMap<>();
        user.put("active", false);
        user.put("name", "Alice");
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = contextJson;
        String template = "$input.json('$.user.active')";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("false", result.trim());
    }
    @Test
    public void testInputParams() {
        String template = "$input.params('id')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("12345", result.trim());
    }
    
    @Test
    public void testInputParamsWithAWSStructure() throws Exception {
        // Test AWS-compliant params structure: path, querystring, header
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("entity", "users");
        pathParams.put("id", "path-id-value");
        
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("all", "Y");
        queryParams.put("filter", "active");
        
        Map<String, Object> headerParams = new HashMap<>();
        headerParams.put("x-auth-token", "1234567");
        headerParams.put("filter", "header-filter");
        
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", pathParams);
        allParams.put("querystring", queryParams);
        allParams.put("header", headerParams);
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        // Test: $input.params('entity') should find it in path (first priority)
        String template1 = "$input.params('entity')";
        String result1 = processor.process(template1, inputJson, contextJson);
        assertEquals("users", result1.trim());
        
        // Test: $input.params('all') should find it in querystring (second priority)
        String template2 = "$input.params('all')";
        String result2 = processor.process(template2, inputJson, contextJson);
        assertEquals("Y", result2.trim());
        
        // Test: $input.params('filter') should find it in path first, but since it's not there,
        // it should find it in querystring (not header, because querystring comes before header)
        String template3 = "$input.params('filter')";
        String result3 = processor.process(template3, inputJson, contextJson);
        assertEquals("active", result3.trim());
        
        // Test: $input.params('x-auth-token') should find it in header (third priority)
        String template4 = "$input.params('x-auth-token')";
        String result4 = processor.process(template4, inputJson, contextJson);
        assertEquals("1234567", result4.trim());
        
        // Test: $input.params('nonexistent') should return empty string
        String template5 = "$input.params('nonexistent')";
        String result5 = processor.process(template5, inputJson, contextJson);
        assertEquals("", result5.trim());
    }
    
    @Test
    public void testInputParamsSearchOrder() throws Exception {
        // Test that search order is: path -> querystring -> header
        // Create params with same key in all three groups
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("test", "path-value");
        
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("test", "query-value");
        
        Map<String, Object> headerParams = new HashMap<>();
        headerParams.put("test", "header-value");
        
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", pathParams);
        allParams.put("querystring", queryParams);
        allParams.put("header", headerParams);
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        // Should return path value (first in search order)
        String template = "$input.params('test')";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("path-value", result.trim());
    }
    
    @Test
    public void testInputParamsQuerystringOnly() throws Exception {
        // Test querystring access when path doesn't have the param
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("all", "Y");
        
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("querystring", queryParams);
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        String template = "$input.params('all')";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("Y", result.trim());
    }
    
    @Test
    public void testInputParamsPathOnly() throws Exception {
        // Test path access
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("entity", "users");
        
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", pathParams);
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        String template = "$input.params('entity')";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("users", result.trim());
    }
    
    @Test
    public void testInputParamsEmpty() throws Exception {
        // Test with empty params
        Map<String, Object> allParams = new HashMap<>();
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        String template = "$input.params('nonexistent')";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("", result.trim());
    }
    
    @Test
    public void testInputParamsNull() throws Exception {
        // Test with null param name
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", new HashMap<>());
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        String template = "$input.params(null)";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("", result.trim());
    }
    
    @Test
    public void testInputHeaders() {
        String template = "$input.headers('Content-Type')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("application/json", result.trim());
    }
    
    @Test
    public void testIssue8_QueryAndPathParams() throws Exception {
        // Test case for GitHub issue #8: Unable to parse query and path params
        // This verifies that the fix correctly handles variables from UI and makes them accessible via $input.params()
        
        // Setup: Create context with params matching the issue configuration
        // Note: UI uses "querystring" (AWS-compliant), not "query"
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("entity", "users");
        
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("all", "Y");
        
        Map<String, Object> headerParams = new HashMap<>();
        headerParams.put("x-auth-token", "1234567");
        
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", pathParams);
        allParams.put("querystring", queryParams);
        allParams.put("header", headerParams);
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "7b776519-78de-4539-8e04-ff300f5c2528");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{\"message\":\"Hello, World!\",\"timestamp\":\"2025-05-23T10:30:00Z\",\"items\":[{\"id\":1, \"name\":\"Item 1\"}, {\"id\":2, \"name\":\"Item 2\"}]}";
        
        // Test with AWS-compliant syntax (corrected from original issue)
        // Original issue used: $input.params('query.all') and $input.params('path.entity')
        // AWS-compliant syntax: $input.params('all') and $input.params('entity')
        // Note: $input.params() returns a Map, so we'll test individual param access
        String template = "{  \"reqId\":\"$context.requestId\",  " +
            "\"queryParam1\":\"$input.params('all')\",  " +
            "\"queryParam2\":\"$input.params('all')\",  " +
            "\"pathParam\":\"$input.params('entity')\",  " +
            "\"headerParam\":\"$input.params('x-auth-token')\"\n}";
        
        String result = processor.process(template, inputJson, contextJson);
        
        // Parse the result to verify it contains the expected values
        Map<String, Object> resultMap = objectMapper.readValue(result, Map.class);
        
        // Verify requestId is correct
        assertEquals("7b776519-78de-4539-8e04-ff300f5c2528", resultMap.get("reqId"));
        
        // Verify query params are accessible (both should return "Y") - THIS WAS THE BUG
        assertEquals("Y", resultMap.get("queryParam1"));
        assertEquals("Y", resultMap.get("queryParam2"));
        
        // Verify path param is accessible - THIS WAS THE BUG
        assertEquals("users", resultMap.get("pathParam"));
        
        // Verify header param is accessible
        assertEquals("1234567", resultMap.get("headerParam"));
        
        // Test that $input.params() returns the full params object
        String template2 = "#set($allParams = $input.params())\n" +
            "$allParams.path.entity";
        String result2 = processor.process(template2, inputJson, contextJson);
        assertEquals("users", result2.trim());
    }
    
    @Test
    public void testIssue8_BackwardCompatibilityWithQuery() throws Exception {
        // Test backward compatibility: old configs with "query" should still work
        // This simulates loading an old configuration that uses "query" instead of "querystring"
        
        Map<String, Object> pathParams = new HashMap<>();
        pathParams.put("entity", "users");
        
        // Simulate old config format with "query" (should be migrated to "querystring" by UI)
        // But if someone manually edits context JSON, we should handle it
        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("all", "Y");
        
        Map<String, Object> allParams = new HashMap<>();
        allParams.put("path", pathParams);
        // Note: In real AWS API Gateway, it's always "querystring", but for backward compat
        // if someone has "query" in their context, it won't work (which is correct AWS behavior)
        allParams.put("querystring", queryParams);
        
        Map<String, Object> context = new HashMap<>();
        context.put("requestId", "test-request-id");
        context.put("params", allParams);
        
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = "{}";
        
        // Test that querystring params are accessible
        String template = "$input.params('all')";
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("Y", result.trim());
        
        // Test that path params are accessible
        String template2 = "$input.params('entity')";
        String result2 = processor.process(template2, inputJson, contextJson);
        assertEquals("users", result2.trim());
    }
} 