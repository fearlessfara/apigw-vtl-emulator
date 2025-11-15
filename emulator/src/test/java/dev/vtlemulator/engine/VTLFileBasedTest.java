package dev.vtlemulator.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

/**
 * File-based VTL test suite.
 * 
 * Each test case is defined in a folder under src/test/resources/vtl-test-cases/
 * with the following structure:
 * - template.vtl: The VTL template to test
 * - input.json: The request body/input
 * - context.json: The context variables
 * - README.md: (optional) Description of the test case
 * 
 * To add a new test case, simply create a new folder with these files.
 */
public class VTLFileBasedTest {
    
    private VTLProcessor processor;
    private ObjectMapper objectMapper;
    private static final String TEST_CASES_DIR = "src/test/resources/vtl-test-cases";
    
    @Before
    public void setUp() {
        processor = new VTLProcessor();
        objectMapper = new ObjectMapper();
    }
    
    @Test
    public void testAllFileBasedCases() throws Exception {
        Path testCasesPath = Paths.get(TEST_CASES_DIR);
        if (!Files.exists(testCasesPath)) {
            System.out.println("Test cases directory not found: " + testCasesPath.toAbsolutePath());
            return;
        }
        
        try (Stream<Path> paths = Files.list(testCasesPath)) {
            paths.filter(Files::isDirectory)
                 .forEach(testCaseDir -> {
                     try {
                         testCase(testCaseDir);
                     } catch (Exception e) {
                         throw new RuntimeException("Test case failed: " + testCaseDir.getFileName(), e);
                     }
                 });
        }
    }
    
    private void testCase(Path testCaseDir) throws Exception {
        String testCaseName = testCaseDir.getFileName().toString();
        System.out.println("\n=== Testing: " + testCaseName + " ===");
        
        // Read template
        Path templatePath = testCaseDir.resolve("template.vtl");
        if (!Files.exists(templatePath)) {
            System.out.println("  ⚠️  Skipping - template.vtl not found");
            return;
        }
        String template = Files.readString(templatePath);
        
        // Read input
        Path inputPath = testCaseDir.resolve("input.json");
        String input = "{}";
        if (Files.exists(inputPath)) {
            input = Files.readString(inputPath).trim();
        }
        
        // Read context
        Path contextPath = testCaseDir.resolve("context.json");
        String contextJson = "{}";
        if (Files.exists(contextPath)) {
            contextJson = Files.readString(contextPath).trim();
        }
        
        // Process template
        String result = processor.process(template, input, contextJson);
        
        // Try to parse as JSON to validate
        try {
            Object parsed = objectMapper.readValue(result, Object.class);
            String normalized = objectMapper.writeValueAsString(parsed);
            System.out.println("  ✅ Valid JSON output");
            System.out.println("  Result: " + normalized.substring(0, Math.min(100, normalized.length())) + "...");
        } catch (Exception e) {
            System.out.println("  ⚠️  Output is not valid JSON: " + result.substring(0, Math.min(100, result.length())));
        }
    }
    
    @Test
    public void testContextVariables() throws Exception {
        runTestCase("context-variables");
    }
    
    @Test
    public void testAllParams() throws Exception {
        runTestCase("all-params");
    }
    
    @Test
    public void testSubsection() throws Exception {
        runTestCase("subsection");
    }
    
    @Test
    public void testJsonPath() throws Exception {
        runTestCase("jsonpath");
    }
    
    @Test
    public void testJsonPathSize() throws Exception {
        runTestCase("jsonpath-size");
    }
    
    @Test
    public void testPhotoAlbum() throws Exception {
        runTestCase("photo-album");
    }
    
    @Test
    public void testUtilFunctions() throws Exception {
        runTestCase("util-functions");
    }
    
    private void runTestCase(String testCaseName) throws Exception {
        Path testCaseDir = Paths.get(TEST_CASES_DIR, testCaseName);
        
        if (!Files.exists(testCaseDir)) {
            System.out.println("Test case directory not found: " + testCaseDir.toAbsolutePath());
            return;
        }
        
        // Read files
        String template = Files.readString(testCaseDir.resolve("template.vtl"));
        String input = Files.exists(testCaseDir.resolve("input.json")) 
            ? Files.readString(testCaseDir.resolve("input.json")).trim() 
            : "{}";
        String contextJson = Files.exists(testCaseDir.resolve("context.json"))
            ? Files.readString(testCaseDir.resolve("context.json")).trim()
            : "{}";
        
        // Process
        String result = processor.process(template, input, contextJson);
        
        // Validate JSON
        try {
            Object parsed = objectMapper.readValue(result, Object.class);
            String normalized = objectMapper.writeValueAsString(parsed);
            System.out.println("Test case: " + testCaseName);
            System.out.println("Result: " + normalized);
            assertNotNull("Result should not be null", result);
            assertFalse("Result should not be empty", result.trim().isEmpty());
        } catch (Exception e) {
            fail("Result is not valid JSON: " + result + " - " + e.getMessage());
        }
    }
}

