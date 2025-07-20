package com.example;

import org.junit.Test;

public class DebugTest {
    
    @Test
    public void debugContextVariables() {
        VTLProcessor processor = new VTLProcessor();
        
        String template = "{\n" +
            "    \"stage\" : \"$context.stage\",\n" +
            "    \"request_id\" : \"$context.requestId\"\n" +
            "}";
        
        String contextJson = "{\"stage\":\"prod\",\"requestId\":\"abcdefg-000-000-0000-abcdefg\"}";
        
        String result = processor.process(template, contextJson);
        
        System.out.println("Template: " + template);
        System.out.println("Context: " + contextJson);
        System.out.println("Result: " + result);
        System.out.println("Result contains 'stage': " + result.contains("stage"));
        System.out.println("Result contains 'prod': " + result.contains("prod"));
    }
    
    @Test
    public void debugExample1() {
        VTLProcessor processor = new VTLProcessor();
        
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
        
        String contextJson = "{\"stage\":\"prod\",\"requestId\":\"abcdefg-000-000-0000-abcdefg\",\"apiId\":\"abcd1234\",\"resourcePath\":\"/\",\"resourceId\":\"efg567\",\"httpMethod\":\"GET\",\"identity\":{\"sourceIp\":\"192.0.2.1\",\"userAgent\":\"curl/7.84.0\",\"accountId\":\"111122223333\",\"apiKey\":\"MyTestKey\",\"caller\":\"ABCD-0000-12345\",\"user\":\"ABCD-0000-12345\",\"userArn\":\"arn:aws:sts::111122223333:assumed-role/Admin/carlos-salazar\"}}";
        
        String result = processor.process(template, contextJson);
        
        System.out.println("=== Example 1 Debug ===");
        System.out.println("Template: " + template);
        System.out.println("Context: " + contextJson);
        System.out.println("Result: " + result);
        System.out.println("Contains 'stage': " + result.contains("stage"));
        System.out.println("Contains 'prod': " + result.contains("prod"));
        System.out.println("Contains 'request_id': " + result.contains("request_id"));
        System.out.println("Contains 'abcdefg-000-000-0000-abcdefg': " + result.contains("abcdefg-000-000-0000-abcdefg"));
    }
    
    @Test
    public void debugExample3() {
        VTLProcessor processor = new VTLProcessor();
        
        String template = "{\n" +
            "    \"name\" : \"$input.params('name')\",\n" +
            "    \"body\" : $input.json('$') \n" +
            "}";
        
        String input = "{\n" +
            "    \"Price\" : \"249.99\",\n" +
            "    \"Age\": \"6\"\n" +
            "}";
        
        String contextJson = "{\"params\":{\"name\":\"Bella\",\"type\":\"dog\"}}";
        
        String result = processor.process(template, input, contextJson);
        
        System.out.println("=== Example 3 Debug ===");
        System.out.println("Template: " + template);
        System.out.println("Input: " + input);
        System.out.println("Context: " + contextJson);
        System.out.println("Result: " + result);
        System.out.println("Contains 'name': " + result.contains("name"));
        System.out.println("Contains 'Bella': " + result.contains("Bella"));
        System.out.println("Contains 'body': " + result.contains("body"));
    }
} 