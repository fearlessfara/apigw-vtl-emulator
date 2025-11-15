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
        context.put("awsEndpointRequestId", "test-aws-endpoint-request-id-xyz");
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
        
        // Add identity context
        Map<String, Object> identity = new HashMap<>();
        identity.put("sourceIp", "192.0.2.1");
        identity.put("userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        identity.put("accountId", "111122223333");
        identity.put("apiKey", "MyTestKey");
        identity.put("apiKeyId", "api-key-id-123");
        identity.put("caller", "ABCD-0000-12345");
        identity.put("user", "ABCD-0000-12345");
        identity.put("userArn", "arn:aws:iam::111122223333:user/example-user");
        context.put("identity", identity);
        
        // Add authorizer context
        Map<String, Object> authorizer = new HashMap<>();
        authorizer.put("principalId", "user123");
        authorizer.put("key", "value");
        authorizer.put("numKey", 1);
        authorizer.put("boolKey", true);
        authorizer.put("user_id", "12345");
        authorizer.put("scope", "read write");
        context.put("authorizer", authorizer);
        
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
    
    @Test
    public void testContextAwsEndpointRequestId() {
        String template = "$context.awsEndpointRequestId";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().startsWith("test-aws-endpoint-request-id-"));
    }
    
    // Identity context tests
    @Test
    public void testContextIdentitySourceIp() {
        String template = "$context.identity.sourceIp";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("192.0.2.1", result.trim());
    }
    
    @Test
    public void testContextIdentityUserAgent() {
        String template = "$context.identity.userAgent";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", result.trim());
    }
    
    @Test
    public void testContextIdentityAccountId() {
        String template = "$context.identity.accountId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("111122223333", result.trim());
    }
    
    @Test
    public void testContextIdentityApiKey() {
        String template = "$context.identity.apiKey";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("MyTestKey", result.trim());
    }
    
    @Test
    public void testContextIdentityApiKeyId() {
        String template = "$context.identity.apiKeyId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("api-key-id-123", result.trim());
    }
    
    @Test
    public void testContextIdentityCaller() {
        String template = "$context.identity.caller";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("ABCD-0000-12345", result.trim());
    }
    
    @Test
    public void testContextIdentityUser() {
        String template = "$context.identity.user";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("ABCD-0000-12345", result.trim());
    }
    
    @Test
    public void testContextIdentityUserArn() {
        String template = "$context.identity.userArn";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("arn:aws:iam::111122223333:user/example-user", result.trim());
    }
    
    @Test
    public void testContextIdentityCognitoAuthenticationProvider() {
        String template = "$context.identity.cognitoAuthenticationProvider";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("cognito-idp"));
    }
    
    @Test
    public void testContextIdentityCognitoAuthenticationType() {
        String template = "$context.identity.cognitoAuthenticationType";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("authenticated", result.trim());
    }
    
    @Test
    public void testContextIdentityCognitoIdentityId() {
        String template = "$context.identity.cognitoIdentityId";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().startsWith("us-east-1:"));
    }
    
    @Test
    public void testContextIdentityCognitoIdentityPoolId() {
        String template = "$context.identity.cognitoIdentityPoolId";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().startsWith("us-east-1:"));
    }
    
    @Test
    public void testContextIdentityPrincipalOrgId() {
        String template = "$context.identity.principalOrgId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("o-1234567890", result.trim());
    }
    
    @Test
    public void testContextIdentityVpcId() {
        String template = "$context.identity.vpcId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("vpc-12345678", result.trim());
    }
    
    @Test
    public void testContextIdentityVpceId() {
        String template = "$context.identity.vpceId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("vpce-12345678", result.trim());
    }
    
    // Client certificate context tests
    @Test
    public void testContextIdentityClientCertClientCertPem() {
        String template = "$context.identity.clientCert.clientCertPem";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("BEGIN CERTIFICATE"));
    }
    
    @Test
    public void testContextIdentityClientCertSubjectDN() {
        String template = "$context.identity.clientCert.subjectDN";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("CN=example.com"));
    }
    
    @Test
    public void testContextIdentityClientCertIssuerDN() {
        String template = "$context.identity.clientCert.issuerDN";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("CN=Example CA"));
    }
    
    @Test
    public void testContextIdentityClientCertSerialNumber() {
        String template = "$context.identity.clientCert.serialNumber";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().length() > 10);
    }
    
    @Test
    public void testContextIdentityClientCertValidityNotBefore() {
        String template = "$context.identity.clientCert.validity.notBefore";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("Jan 01"));
    }
    
    @Test
    public void testContextIdentityClientCertValidityNotAfter() {
        String template = "$context.identity.clientCert.validity.notAfter";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("Jan 01"));
    }
    
    // Authorizer context tests
    @Test
    public void testContextAuthorizerPrincipalId() {
        String template = "$context.authorizer.principalId";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("user123", result.trim());
    }
    
    @Test
    public void testContextAuthorizerClaims() {
        String template = "$context.authorizer.claims";
        String result = processor.process(template, "{}", contextJson);
        // According to AWS docs, calling $context.authorizer.claims returns null
        // VTL may return empty string for null, so check for either
        assertTrue(result.trim().equals("null") || result.trim().isEmpty());
    }
    
    @Test
    public void testContextAuthorizerDynamicProperty() {
        String template = "$context.authorizer.key";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("value", result.trim());
    }
    
    @Test
    public void testContextAuthorizerDynamicPropertyNumeric() {
        String template = "$context.authorizer.numKey";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("1", result.trim());
    }
    
    @Test
    public void testContextAuthorizerDynamicPropertyBoolean() {
        String template = "$context.authorizer.boolKey";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("true", result.trim());
    }
    
    @Test
    public void testContextAuthorizerDynamicPropertyWithUnderscore() {
        String template = "$context.authorizer.user_id";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("12345", result.trim());
    }
    
    // Error context tests
    @Test
    public void testContextErrorMessage() {
        String template = "$context.error.message";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("Internal server error"));
    }
    
    @Test
    public void testContextErrorMessageString() {
        String template = "$context.error.messageString";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("\"Internal server error\""));
    }
    
    @Test
    public void testContextErrorResponseType() {
        String template = "$context.error.responseType";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("DEFAULT_5XX", result.trim());
    }
    
    @Test
    public void testContextErrorValidationErrorString() {
        String template = "$context.error.validationErrorString";
        String result = processor.process(template, "{}", contextJson);
        assertNotNull(result.trim());
        assertTrue(result.trim().contains("Validation error"));
    }
    
    // Request override context tests
    @Test
    public void testContextRequestOverrideHeader() {
        // Use bracket notation for header names with dashes
        String template = "$context.requestOverride.header.get('Content-Type')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("application/json", result.trim());
    }
    
    @Test
    public void testContextRequestOverridePath() {
        String template = "$context.requestOverride.path.id";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("override-id", result.trim());
    }
    
    @Test
    public void testContextRequestOverrideQuerystring() {
        String template = "$context.requestOverride.querystring.filter";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("override-filter", result.trim());
    }
    
    // Response override context tests
    @Test
    public void testContextResponseOverrideStatus() {
        String template = "$context.responseOverride.status";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("200", result.trim());
    }
    
    @Test
    public void testContextResponseOverrideHeader() {
        // Use bracket notation for header names with dashes
        String template = "$context.responseOverride.header.get('Cache-Control')";
        String result = processor.process(template, "{}", contextJson);
        assertEquals("no-cache", result.trim());
    }
} 