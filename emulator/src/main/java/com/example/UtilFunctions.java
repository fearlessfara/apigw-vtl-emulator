package com.example;

import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.net.URLDecoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.List;

public class UtilFunctions {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public String escapeJavaScript(Object input) {
        if (input == null) return "";
        String str;
        try {
            if (input instanceof Map || input instanceof java.util.List) {
                str = objectMapper.writeValueAsString(input);
            } else {
                str = input.toString();
            }
        } catch (Exception e) {
            str = input.toString();
        }
        return str.replace("\\", "\\\\")
                  .replace("'", "\\'")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }



    public String base64Encode(String input) {
        if (input == null) return "";
        return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }

    public String base64Decode(String input) {
        if (input == null) return "";
        try {
            byte[] decoded = Base64.getDecoder().decode(input);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return input;
        }
    }

    public Object parseJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return null;
        }
        try {
            // Use Jackson to parse the JSON string
            return objectMapper.readValue(jsonString, Object.class);
        } catch (Exception e) {
            // If parsing fails, return the original string
            return jsonString;
        }
    }

    public String urlEncode(String input) {
        if (input == null) return "";
        try {
            return URLEncoder.encode(input, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            return input;
        }
    }

    public String urlDecode(String input) {
        if (input == null) return "";
        try {
            return URLDecoder.decode(input, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            return input;
        }
    }
} 