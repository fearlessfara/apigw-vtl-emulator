package com.example;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class ContextFunctions {
    private final Map<String, Object> context;
    
    public ContextFunctions(Map<String, Object> context) {
        this.context = context;
    }
    
    // Basic context properties
    public String getAccountId() {
        return context.containsKey("accountId") ? context.get("accountId").toString() : "123456789012";
    }
    
    public String getApiId() {
        return context.containsKey("apiId") ? context.get("apiId").toString() : "abc123def4";
    }
    
    public String getRequestId() {
        return context.containsKey("requestId") ? context.get("requestId").toString() : "test-request-id-" + System.currentTimeMillis();
    }
    
    public String getExtendedRequestId() {
        return context.containsKey("extendedRequestId") ? context.get("extendedRequestId").toString() : "test-extended-request-id-" + System.currentTimeMillis();
    }
    
    public String getAwsEndpointRequestId() {
        return context.containsKey("awsEndpointRequestId") ? context.get("awsEndpointRequestId").toString() : context.containsKey("extendedRequestId") ? context.get("extendedRequestId").toString() : "test-aws-endpoint-request-id-" + System.currentTimeMillis();
    }
    
    public String getHttpMethod() {
        return context.containsKey("httpMethod") ? context.get("httpMethod").toString() : "GET";
    }
    
    public String getStage() {
        return context.containsKey("stage") ? context.get("stage").toString() : "test";
    }
    
    public String getDeploymentId() {
        return context.containsKey("deploymentId") ? context.get("deploymentId").toString() : "deployment-123";
    }
    
    public String getDomainName() {
        return context.containsKey("domainName") ? context.get("domainName").toString() : "abc123def4.execute-api.us-east-1.amazonaws.com";
    }
    
    public String getDomainPrefix() {
        return context.containsKey("domainPrefix") ? context.get("domainPrefix").toString() : "abc123def4";
    }
    
    public String getPath() {
        return context.containsKey("path") ? context.get("path").toString() : "/test/resource";
    }
    
    public String getProtocol() {
        return context.containsKey("protocol") ? context.get("protocol").toString() : "HTTP/1.1";
    }
    
    public String getResourceId() {
        return context.containsKey("resourceId") ? context.get("resourceId").toString() : "resource-123";
    }
    
    public String getResourcePath() {
        return context.containsKey("resourcePath") ? context.get("resourcePath").toString() : "/resource";
    }
    
    public String getRequestTime() {
        Instant now = Instant.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MMM/yyyy:HH:mm:ss Z")
                .withZone(ZoneId.of("UTC"));
        return formatter.format(now);
    }
    
    public long getRequestTimeEpoch() {
        return System.currentTimeMillis();
    }
    
    public boolean getIsCanaryRequest() {
        return false;
    }
    
    public String getWafResponseCode() {
        return context.containsKey("wafResponseCode") ? context.get("wafResponseCode").toString() : "WAF_ALLOW";
    }
    
    public String getWebaclArn() {
        return context.containsKey("webaclArn") ? context.get("webaclArn").toString() : "arn:aws:wafv2:us-east-1:123456789012:regional/webacl/test-webacl/12345678-1234-1234-1234-123456789012";
    }
    
    // Identity context
    public IdentityContext getIdentity() {
        return new IdentityContext(context);
    }
    
    // Authorizer context
    public AuthorizerContext getAuthorizer() {
        return new AuthorizerContext(context);
    }
    
    // Error context
    public ErrorContext getError() {
        return new ErrorContext();
    }
    
    // Request/Response override context
    public RequestOverrideContext getRequestOverride() {
        return new RequestOverrideContext();
    }
    
    public ResponseOverrideContext getResponseOverride() {
        return new ResponseOverrideContext();
    }
    
    // Inner classes for nested context objects
    public static class IdentityContext {
        private final Map<String, Object> context;
        
        public IdentityContext(Map<String, Object> context) {
            this.context = context;
        }
        
        private Map<String, Object> getIdentityMap() {
            if (context.containsKey("identity") && context.get("identity") instanceof Map) {
                return (Map<String, Object>) context.get("identity");
            }
            return Map.of();
        }
        
        public String getAccountId() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("accountId") ? identity.get("accountId").toString() : "123456789012";
        }
        
        public String getApiKey() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("apiKey") ? identity.get("apiKey").toString() : null;
        }
        
        public String getApiKeyId() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("apiKeyId") ? identity.get("apiKeyId").toString() : null;
        }
        
        public String getCaller() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("caller") ? identity.get("caller").toString() : "AIDACKCEVSQ6C2EXAMPLE";
        }
        
        public String getCognitoAuthenticationProvider() {
            return "cognito-idp.us-east-1.amazonaws.com/us-east-1_example,cognito-idp.us-east-1.amazonaws.com/us-east-1_example:CognitoSignIn:user123";
        }
        
        public String getCognitoAuthenticationType() {
            return "authenticated";
        }
        
        public String getCognitoIdentityId() {
            return "us-east-1:12345678-1234-1234-1234-123456789012";
        }
        
        public String getCognitoIdentityPoolId() {
            return "us-east-1:12345678-1234-1234-1234-123456789012";
        }
        
        public String getPrincipalOrgId() {
            return "o-1234567890";
        }
        
        public String getSourceIp() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("sourceIp") ? identity.get("sourceIp").toString() : "192.0.2.1";
        }
        
        public String getUser() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("user") ? identity.get("user").toString() : "AIDACKCEVSQ6C2EXAMPLE";
        }
        
        public String getUserAgent() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("userAgent") ? identity.get("userAgent").toString() : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
        }
        
        public String getUserArn() {
            Map<String, Object> identity = getIdentityMap();
            return identity.containsKey("userArn") ? identity.get("userArn").toString() : "arn:aws:iam::123456789012:user/example-user";
        }
        
        public String getVpcId() {
            return "vpc-12345678";
        }
        
        public String getVpceId() {
            return "vpce-12345678";
        }
        
        // Client certificate context
        public ClientCertContext getClientCert() {
            return new ClientCertContext();
        }
        
        public static class ClientCertContext {
            public String getClientCertPem() {
                return "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKoK/OvK5tYzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV\n-----END CERTIFICATE-----";
            }
            
            public String getSubjectDN() {
                return "CN=example.com, O=Example Corp, C=US";
            }
            
            public String getIssuerDN() {
                return "CN=Example CA, O=Example Corp, C=US";
            }
            
            public String getSerialNumber() {
                return "1234567890123456789012345678901234567890";
            }
            
            public ValidityContext getValidity() {
                return new ValidityContext();
            }
            
            public static class ValidityContext {
                public String getNotBefore() {
                    return "Jan 01 00:00:00 2023 GMT";
                }
                
                public String getNotAfter() {
                    return "Jan 01 00:00:00 2024 GMT";
                }
            }
        }
    }
    
    public static class AuthorizerContext {
        private final Map<String, Object> context;
        public AuthorizerContext(Map<String, Object> context) {
            this.context = context;
        }
        public String getPrincipalId() {
            return context.containsKey("principalId") ? context.get("principalId").toString() : "user123";
        }
        
        public String getClaims() {
            return null; // Returns null as per documentation
        }
        
        // Dynamic property access for authorizer context
        public String get(String property) {
            if (context.containsKey(property)) {
                return context.get(property).toString();
            }
            // Simulate authorizer context map
            Map<String, Object> authorizerContext = Map.of(
                "key", "value",
                "numKey", 1,
                "boolKey", true,
                "user_id", "12345",
                "scope", "read write"
            );
            
            Object value = authorizerContext.get(property);
            return value != null ? value.toString() : null;
        }
    }
    
    public static class ErrorContext {
        public String getMessage() {
            return "Internal server error";
        }
        
        public String getMessageString() {
            return "\"Internal server error\"";
        }
        
        public String getResponseType() {
            return "DEFAULT_5XX";
        }
        
        public String getValidationErrorString() {
            return "Validation error: Invalid parameter value";
        }
    }
    
    public static class RequestOverrideContext {
        public HeaderContext getHeader() {
            return new HeaderContext();
        }
        
        public PathContext getPath() {
            return new PathContext();
        }
        
        public QuerystringContext getQuerystring() {
            return new QuerystringContext();
        }
        
        public static class HeaderContext {
            public String get(String headerName) {
                // Simulate header overrides
                Map<String, String> headers = Map.of(
                    "Content-Type", "application/json",
                    "Authorization", "Bearer override-token"
                );
                return headers.get(headerName);
            }
        }
        
        public static class PathContext {
            public String get(String pathName) {
                // Simulate path overrides
                Map<String, String> paths = Map.of(
                    "id", "override-id",
                    "version", "v2"
                );
                return paths.get(pathName);
            }
        }
        
        public static class QuerystringContext {
            public String get(String querystringName) {
                // Simulate querystring overrides
                Map<String, String> querystrings = Map.of(
                    "filter", "override-filter",
                    "sort", "desc"
                );
                return querystrings.get(querystringName);
            }
        }
    }
    
    public static class ResponseOverrideContext {
        public String getStatus() {
            return "200";
        }
        
        public HeaderContext getHeader() {
            return new HeaderContext();
        }
        
        public static class HeaderContext {
            public String get(String headerName) {
                // Simulate response header overrides
                Map<String, String> headers = Map.of(
                    "Cache-Control", "no-cache",
                    "X-Custom-Header", "override-value"
                );
                return headers.get(headerName);
            }
        }
    }
} 