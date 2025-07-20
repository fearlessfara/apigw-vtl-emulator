package com.example;

import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

public class InputFunctions {
    private final Map<String, Object> context;
    private final Map<String, Object> input;
    private final String inputString;
    private final ObjectMapper objectMapper;
    
    public InputFunctions(Map<String, Object> context) {
        this(context, context, "");
    }
    
    public InputFunctions(Map<String, Object> context, Map<String, Object> input) {
        this(context, input, "");
    }
    
    public InputFunctions(Map<String, Object> context, Map<String, Object> input, String inputString) {
        this.context = context;
        this.input = input;
        this.inputString = inputString;
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * $input.path(x) - Returns a JSON object representation that allows native VTL manipulation
     * This allows you to access and manipulate elements of the payload natively in VTL
     */
    public Object path(String jsonPath) {
        if (jsonPath == null || jsonPath.isEmpty()) {
            return null;
        }
        
        // Remove leading $ if present
        if (jsonPath.startsWith("$")) {
            jsonPath = jsonPath.substring(1);
        }
        
        // Simple path navigation
        String[] parts = jsonPath.split("\\.");
        Object current = input;  // Use input instead of context
        
        for (String part : parts) {
            // Skip empty parts
            if (part.isEmpty()) {
                continue;
            }
            
            // Array access: part may be like 'hobbies[0]' or just '0'
            int bracketIdx = part.indexOf('[');
            if (bracketIdx != -1 && part.endsWith("]")) {
                String key = part.substring(0, bracketIdx);
                int idx = Integer.parseInt(part.substring(bracketIdx + 1, part.length() - 1));
                if (!key.isEmpty()) {
                    if (current instanceof Map) {
                        current = ((Map<?, ?>) current).get(key);
                    } else {
                        return null;
                    }
                }
                if (current instanceof java.util.List) {
                    java.util.List<?> list = (java.util.List<?>) current;
                    if (idx < 0 || idx >= list.size()) return null;
                    current = list.get(idx);
                } else {
                    return null;
                }
            } else if (current instanceof Map) {
                current = ((Map<?, ?>) current).get(part);
            } else if (current instanceof java.util.List) {
                // Support .0 .1 notation for lists
                try {
                    int idx = Integer.parseInt(part);
                    java.util.List<?> list = (java.util.List<?>) current;
                    if (idx < 0 || idx >= list.size()) return null;
                    current = list.get(idx);
                } catch (NumberFormatException e) {
                    return null;
                }
            } else {
                return null;
            }
            
            // If we get null, return null
            if (current == null) {
                return null;
            }
        }
        
        // Return the object directly for native VTL manipulation
        return current;
    }
    
    /**
     * $input.json(x) - Evaluates a JSONPath expression and returns the results as a JSON string
     * For example, $input.json('$.pets') returns a JSON string representing the pets structure
     */
    public String json(String jsonPath) {
        if (jsonPath == null || jsonPath.isEmpty()) {
            return null;
        }
        
        // Remove leading $ if present
        if (jsonPath.startsWith("$")) {
            jsonPath = jsonPath.substring(1);
        }
        
        // If jsonPath is just "", return the entire input as JSON string
        if (jsonPath.equals("")) {
            try {
                return objectMapper.writeValueAsString(input);
            } catch (Exception e) {
                return "null";
            }
        }
        
        // Simple path navigation on input
        String[] parts = jsonPath.split("\\.");
        Object current = input;
        
        for (String part : parts) {
            if (part.isEmpty()) continue;
            
            int bracketIdx = part.indexOf('[');
            if (bracketIdx != -1 && part.endsWith("]")) {
                String key = part.substring(0, bracketIdx);
                int idx = Integer.parseInt(part.substring(bracketIdx + 1, part.length() - 1));
                if (!key.isEmpty()) {
                    if (current instanceof Map) {
                        current = ((Map<?, ?>) current).get(key);
                    } else {
                        return "null";
                    }
                }
                if (current instanceof java.util.List) {
                    java.util.List<?> list = (java.util.List<?>) current;
                    if (idx < 0 || idx >= list.size()) return "null";
                    current = list.get(idx);
                } else {
                    return "null";
                }
            } else if (current instanceof Map) {
                current = ((Map<?, ?>) current).get(part);
            } else if (current instanceof java.util.List) {
                try {
                    int idx = Integer.parseInt(part);
                    java.util.List<?> list = (java.util.List<?>) current;
                    if (idx < 0 || idx >= list.size()) return "null";
                    current = list.get(idx);
                } catch (NumberFormatException e) {
                    return "null";
                }
            } else {
                return "null";
            }
            if (current == null) return "null";
        }
        
        // Return as JSON string
        try {
            return objectMapper.writeValueAsString(current);
        } catch (Exception e) {
            return "null";
        }
    }
    
    /**
     * $input.body - Returns the raw request payload as a string
     * You can use $input.body to preserve entire floating point numbers, such as 10.00
     */
    public String body() {
        return inputString;
    }

    public String getBody() {
        return body();
    }

    public Map<String, Object> params() {
        Object params = context.get("params");
        if (params instanceof Map) {
            return (Map<String, Object>) params;
        }
        return new java.util.HashMap<>();
    }

    public String params(String paramName) {
        Map<String, Object> allParams = params();
        Object value = allParams.get(paramName);
        return value != null ? value.toString() : null;
    }

    public String headers(String headerName) {
        Map<String, Object> headers = (Map<String, Object>) context.get("headers");
        if (headers != null) {
            Object value = headers.get(headerName);
            return value != null ? value.toString() : null;
        }
        return null;
    }

    public int size() {
        if (input instanceof java.util.List) {
            return ((java.util.List<?>) input).size();
        } else if (input instanceof Map) {
            return ((Map<?, ?>) input).size();
        }
        return 0;
    }
} 