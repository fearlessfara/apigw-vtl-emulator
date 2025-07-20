package com.example;

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
        Map<String, Object> params = new HashMap<>();
        params.put("id", "12345");
        params.put("type", "user");
        context.put("params", params);
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
    public void testInputHeaders() {
        String template = "$input.headers('Content-Type')";
        String inputJson = contextJson;
        String result = processor.process(template, inputJson, contextJson);
        assertEquals("application/json", result.trim());
    }
} 