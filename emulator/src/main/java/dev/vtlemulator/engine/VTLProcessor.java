package dev.vtlemulator.engine;

import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.app.event.ReferenceInsertionEventHandler;
import org.apache.velocity.context.Context;
import java.io.StringWriter;
import java.util.Map;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

public class VTLProcessor {
    private final VelocityEngine velocityEngine;
    private final ObjectMapper objectMapper;

    public VTLProcessor() {
        objectMapper = new ObjectMapper();
        // Set ObjectMapper in handler before Velocity initialization
        // Velocity will create its own instance, so we use a static setter
        JsonSerializationEventHandler.setObjectMapper(objectMapper);
        
        velocityEngine = new VelocityEngine();
        velocityEngine.setProperty("eventhandler.referenceinsertion.class", JsonSerializationEventHandler.class.getName());
        // Use string resource loader for WASM (no file system access)
        velocityEngine.setProperty("resource.loader", "string");
        velocityEngine.setProperty("string.resource.loader.class", "org.apache.velocity.runtime.resource.loader.StringResourceLoader");
        velocityEngine.init();
    }

    public String process(String template, String contextJson) {
        return process(template, "", contextJson);
    }
    
    public String process(String template, String inputString, String contextJson) {
        try {
            Map<String, Object> context = objectMapper.readValue(contextJson, Map.class);
            
            // Parse input as JSON if possible, otherwise treat as empty object
            Map<String, Object> input;
            try {
                // Try to parse as JSON object first
                input = objectMapper.readValue(inputString, Map.class);
            } catch (Exception e) {
                // If parsing fails, treat as empty object
                input = objectMapper.readValue("{}", Map.class);
            }
            
            // Store the original input string for body() function
            context.put("body", inputString);
            context.put("input", input);
            
            VelocityContext velocityContext = new VelocityContext(context);
            
            // Add API Gateway custom functions as objects
            addApiGatewayFunctions(velocityContext, context, input, inputString);
            
            StringWriter writer = new StringWriter();
            velocityEngine.evaluate(velocityContext, writer, "VTLProcessor", template);
            String output = writer.toString();
            // Try to minify if output is valid JSON
            try {
                Object json = objectMapper.readValue(output, Object.class);
                return objectMapper.writeValueAsString(json);
            } catch (Exception e) {
                // Not valid JSON, return as is
                return output;
            }
        } catch (Exception e) {
            return "Error processing template: " + e.getMessage();
        }
    }
    
    private void addApiGatewayFunctions(VelocityContext velocityContext, Map<String, Object> context, Map<String, Object> input, String inputString) {
        velocityContext.put("input", new InputFunctions(context, input, inputString));
        velocityContext.put("util", new UtilFunctions());
        velocityContext.put("context", new ContextFunctions(context));
    }

    /**
     * Main method for GraalVM WASM compilation.
     * This method is called when the WASM module is executed, but the class
     * is primarily used by instantiating it and calling the process() method.
     */
    public static void main(String[] args) {
        // Test VTLProcessor functionality when compiled to WASM
        try {
            System.out.println("VTLProcessor WASM Test Starting...");
            
            VTLProcessor processor = new VTLProcessor();
            System.out.println("✓ VTLProcessor instantiated successfully");
            
            // Simple test template
            String template = "Hello, $context.name!";
            String contextJson = "{\"name\": \"World\"}";
            
            String result = processor.process(template, contextJson);
            System.out.println("✓ Template processed successfully");
            System.out.println("  Template: " + template);
            System.out.println("  Context: " + contextJson);
            System.out.println("  Result: " + result);
            
            // Verify result
            if (result.contains("Hello") && result.contains("World")) {
                System.out.println("✅ VTLProcessor test PASSED!");
            } else {
                System.out.println("⚠ VTLProcessor test completed but result unexpected");
            }
        } catch (Exception e) {
            System.err.println("✗ VTLProcessor test FAILED: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Event handler that:
     * 1. Converts null values to empty strings (AWS API Gateway behavior)
     * 2. Automatically serializes Map/List objects to JSON (AWS API Gateway behavior)
     * 
     * This matches AWS API Gateway's behavior where Map/List objects are automatically
     * serialized to JSON when output in templates, rather than using Java's toString().
     */
    public static class JsonSerializationEventHandler implements ReferenceInsertionEventHandler {
        private static ObjectMapper objectMapper;
        
        public static void setObjectMapper(ObjectMapper mapper) {
            objectMapper = mapper;
        }
        
        @Override
        public Object referenceInsert(Context context, String reference, Object value) {
            // Handle null values - return empty string (AWS API Gateway behavior)
            if (value == null) {
                return "";
            }
            
            // Automatically serialize Map/List objects to JSON (AWS API Gateway behavior)
            // This ensures that when you output $data or $list in a template,
            // they are serialized as valid JSON rather than using Java's toString()
            if (value instanceof Map || value instanceof List) {
                if (objectMapper != null) {
                    try {
                        return objectMapper.writeValueAsString(value);
                    } catch (Exception e) {
                        // If serialization fails, fall back to toString()
                        // This shouldn't happen with valid Map/List objects, but handle gracefully
                        return value.toString();
                    }
                } else {
                    // ObjectMapper not set yet, fall back to toString()
                    return value.toString();
                }
            }
            
            // For other types, return as-is (Velocity will handle conversion to string)
            return value;
        }
    }
}

