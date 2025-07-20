package com.example;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ContextFunctionsTest {
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
        Map<String, Object> context = new HashMap<>();
        context.put("user", user);
        context.put("message", "Hello World");
        context.put("number", 42);
        context.put("boolean", true);
        context.put("nullValue", null);
        context.put("emptyString", "");
        context.put("accountId", "123456789012");
        context.put("apiId", "abc123def4");
        context.put("requestId", "test-request-id-xyz");
        context.put("extendedRequestId", "test-extended-request-id-xyz");
        context.put("httpMethod", "GET");
        context.put("stage", "test");
        context.put("deploymentId", "deployment-123");
        context.put("domainName", "abc123def4.execute-api.us-east-1.amazonaws.com");
        context.put("domainPrefix", "abc123def4");
        context.put("path", "/test/resource");
        context.put("protocol", "HTTP/1.1");
        context.put("resourceId", "resource-123");
        context.put("resourcePath", "/resource");
        context.put("requestTime", "15/Jul/2025:02:00:00 +0000");
        context.put("requestTimeEpoch", 1657843200000L);
        context.put("isCanaryRequest", false);
        context.put("wafResponseCode", "WAF_ALLOW");
        context.put("webaclArn", "arn:aws:wafv2:us-east-1:123456789012:regional/webacl/test-webacl/123456");
        contextJson = objectMapper.writeValueAsString(context);
    }

    @Test
    public void testContextAccountId() {
        String template = "$context.accountId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("123456789012", result.trim());
    }
    @Test
    public void testContextApiId() {
        String template = "$context.apiId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("abc123def4", result.trim());
    }
    @Test
    public void testContextRequestId() {
        String template = "$context.requestId";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().startsWith("test-request-id-"));
    }
    @Test
    public void testContextExtendedRequestId() {
        String template = "$context.extendedRequestId";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().startsWith("test-extended-request-id-"));
    }
    @Test
    public void testContextHttpMethod() {
        String template = "$context.httpMethod";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("GET", result.trim());
    }
    @Test
    public void testContextStage() {
        String template = "$context.stage";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("test", result.trim());
    }
    @Test
    public void testContextDeploymentId() {
        String template = "$context.deploymentId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("deployment-123", result.trim());
    }
    @Test
    public void testContextDomainName() {
        String template = "$context.domainName";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("abc123def4.execute-api.us-east-1.amazonaws.com", result.trim());
    }
    @Test
    public void testContextDomainPrefix() {
        String template = "$context.domainPrefix";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("abc123def4", result.trim());
    }
    @Test
    public void testContextPath() {
        String template = "$context.path";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("/test/resource", result.trim());
    }
    @Test
    public void testContextProtocol() {
        String template = "$context.protocol";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("HTTP/1.1", result.trim());
    }
    @Test
    public void testContextResourceId() {
        String template = "$context.resourceId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("resource-123", result.trim());
    }
    @Test
    public void testContextResourcePath() {
        String template = "$context.resourcePath";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("/resource", result.trim());
    }
    @Test
    public void testContextRequestTime() {
        String template = "$context.requestTime";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        // Check for date format: dd/MMM/yyyy:HH:mm:ss Z
        assertTrue(result.trim().matches("\\d{2}/[A-Za-z]{3}/\\d{4}:\\d{2}:\\d{2}:\\d{2} [+-]\\d{4}"));
    }
    @Test
    public void testContextRequestTimeEpoch() {
        String template = "$context.requestTimeEpoch";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(Long.parseLong(result.trim()) > 0);
    }
    @Test
    public void testContextIsCanaryRequest() {
        String template = "$context.isCanaryRequest";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("false", result.trim());
    }
    @Test
    public void testContextWafResponseCode() {
        String template = "$context.wafResponseCode";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("WAF_ALLOW", result.trim());
    }
    @Test
    public void testContextWebaclArn() {
        String template = "$context.webaclArn";
        String result = processor.process(template, "{}", contextJson);
        assertTrue(result.trim().startsWith("arn:aws:wafv2:us-east-1:123456789012:regional/webacl/test-webacl/"));
    }
} 