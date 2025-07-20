package com.example;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class VTLConditionalTest {
    private VTLProcessor processor;
    private ObjectMapper objectMapper;

    @Before
    public void setUp() throws Exception {
        processor = new VTLProcessor();
        objectMapper = new ObjectMapper();
    }

    @Test
    public void testConditionalWithBooleanTrue() throws Exception {
        Map<String, Object> user = new HashMap<>();
        user.put("active", true);
        user.put("name", "Alice");
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = contextJson;
        String template = "$input.json('$.user.active')";
        String result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=true, $input.json('$.user.active')='" + result + "'");
        template = "#if($input.path('$.user.active'))\n  Welcome back, $input.json('$.user.name')!\n#else\n  User is not active\n#end";
        result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=true, result='" + result + "'");
        assertTrue(result.contains("Welcome back, \"Alice\"!"));
    }
    @Test
    public void testConditionalWithBooleanFalse() throws Exception {
        Map<String, Object> user = new HashMap<>();
        user.put("active", false);
        user.put("name", "Alice");
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = contextJson;
        String template = "$input.json('$.user.active')";
        String result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=false, $input.json('$.user.active')='" + result + "'");
        template = "#if($input.path('$.user.active'))\n  Welcome back, $input.json('$.user.name')!\n#else\n  User is not active\n#end";
        result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=false, result='" + result + "'");
        assertTrue(result.contains("User is not active"));
        assertFalse(result.contains("Welcome back, Alice!"));
    }
    @Test
    public void testConditionalWithStringTrue() throws Exception {
        Map<String, Object> user = new HashMap<>();
        user.put("active", "true");
        user.put("name", "Alice");
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = contextJson;
        String template = "$input.json('$.user.active')";
        String result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=\"true\", $input.json('$.user.active')='" + result + "'");
        template = "#if($input.path('$.user.active'))\n  Welcome back, $input.json('$.user.name')!\n#else\n  User is not active\n#end";
        result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=\"true\", result='" + result + "'");
        assertTrue(result.contains("Welcome back, \"Alice\"!"));
    }
    @Test
    public void testConditionalWithStringFalse() throws Exception {
        Map<String, Object> user = new HashMap<>();
        user.put("active", "false");
        user.put("name", "Alice");
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        String contextJson = objectMapper.writeValueAsString(context);
        String inputJson = contextJson;
        String template = "$input.json('$.user.active')";
        String result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=\"false\", $input.json('$.user.active')='" + result + "'");
        template = "#if($input.path('$.user.active') == 'true')\n  Welcome back, $input.json('$.user.name')!\n#else\n  User is not active\n#end";
        result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: active=\"false\", result='" + result + "'");
        assertTrue(result.contains("User is not active"));
        assertFalse(result.contains("Welcome back, Alice!"));
    }
    @Test
    public void testOriginalIssueCase() throws Exception {
        String contextJson = "{\"user\": {\"name\": \"Alice\", \"active\": false}}";
        String template = "#if($input.path('$.user.active'))\n  Welcome back, $input.json('$.user.name')!\n#else\n  User is not active\n#end";
        String result = processor.process(template, "{}", contextJson);
        assertTrue(result.contains("User is not active"));
        assertFalse(result.contains("Welcome back, Alice!"));
    }
} 