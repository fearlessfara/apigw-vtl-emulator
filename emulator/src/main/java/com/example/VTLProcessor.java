package com.example;

import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.app.event.ReferenceInsertionEventHandler;
import org.apache.velocity.context.Context;
import java.io.StringWriter;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class VTLProcessor {
    private final VelocityEngine velocityEngine;
    private final ObjectMapper objectMapper;

    public VTLProcessor() {
        velocityEngine = new VelocityEngine();
        velocityEngine.setProperty("eventhandler.referenceinsertion.class", NullToEmptyEventHandler.class.getName());
        velocityEngine.init();
        objectMapper = new ObjectMapper();
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

    public static class NullToEmptyEventHandler implements ReferenceInsertionEventHandler {
        @Override
        public Object referenceInsert(Context context, String reference, Object value) {
            return value == null ? "" : value;
        }
    }
} 