package com.example;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

public class UtilFunctionsTest {
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
    public void testUtilEscapeJavaScript() {
        String template = "$util.escapeJavaScript('Hello \"World\"')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("Hello \\\"World\\\"", result.trim());
    }
    @Test
    public void testUtilBase64Encode() {
        String template = "$util.base64Encode('Hello World')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("SGVsbG8gV29ybGQ=", result.trim());
    }
    @Test
    public void testUtilBase64Decode() {
        String template = "$util.base64Decode('SGVsbG8gV29ybGQ=')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("Hello World", result.trim());
    }
    @Test
    public void testUtilParseJson() {
        String template = "$util.parseJson(\"Hello World\")";
        String result = processor.process(template, "{}", contextJson);
        System.out.println("DEBUG: parseJson result: '" + result + "'");
        assertEquals("Hello World", result.trim());
    }
    @Test
    public void testUtilParseJsonNumber() {
        String template = "$util.parseJson('42')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("42", result.trim());
    }
    @Test
    public void testUtilParseJsonBoolean() {
        String template = "$util.parseJson('true')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("true", result.trim());
    }
    @Test
    public void testUtilUrlEncode() {
        String template = "$util.urlEncode('Hello World')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("Hello+World", result.trim());
    }
    @Test
    public void testUtilUrlDecode() {
        String template = "$util.urlDecode('Hello+World')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("Hello World", result.trim());
    }
} 