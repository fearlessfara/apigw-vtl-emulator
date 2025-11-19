package dev.vtlemulator.engine;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class JSONPathTest {
    
    private VTLProcessor processor;
    
    @Before
    public void setUp() {
        processor = new VTLProcessor();
    }
    
    @Test
    public void testBasicPropertyAccess() {
        String template = "Name: $input.json('$.user.name')\nEmail: $input.json('$.user.email')";
        String input = "{\"user\": {\"name\": \"John Doe\", \"email\": \"john@example.com\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: \"John Doe\""));
        assertTrue(result.contains("Email: \"john@example.com\""));
    }
    
    @Test
    public void testNumericValues() {
        String template = "Age: $input.json('$.user.age')\nScore: $input.json('$.user.score')";
        String input = "{\"user\": {\"age\": 30, \"score\": 95.5}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Age: 30"));
        assertTrue(result.contains("Score: 95.5"));
    }
    
    @Test
    public void testBooleanValues() {
        String template = "Active: $input.json('$.user.active')\nVerified: $input.json('$.user.verified')";
        String input = "{\"user\": {\"active\": true, \"verified\": false}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Active: true"));
        assertTrue(result.contains("Verified: false"));
    }
    
    @Test
    public void testArrayAccess() {
        String template = "First: $input.json('$.items[0].name')\nSecond: $input.json('$.items[1].name')";
        String input = "{\"items\": [{\"name\": \"Item 1\"}, {\"name\": \"Item 2\"}]}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("First: \"Item 1\""));
        assertTrue(result.contains("Second: \"Item 2\""));
    }
    
    @Test
    public void testNestedObjectAccess() {
        String template = "Street: $input.json('$.user.address.street')\nCity: $input.json('$.user.address.city')";
        String input = "{\"user\": {\"address\": {\"street\": \"123 Main St\", \"city\": \"New York\"}}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Street: \"123 Main St\""));
        assertTrue(result.contains("City: \"New York\""));
    }
    
    @Test
    public void testRootObjectAccess() {
        String template = "Full data: $input.json('$')";
        String input = "{\"user\": {\"name\": \"John\"}, \"timestamp\": \"2024-01-01\"}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Full data:"));
        assertTrue(result.contains("user"));
        assertTrue(result.contains("timestamp"));
    }
    
    @Test
    public void testArrayIterationWithPath() {
        String template = "Items:\n#foreach($item in $input.path('$.items'))\n- $item.name#end";
        String input = "{\"items\": [{\"name\": \"Apple\"}, {\"name\": \"Banana\"}, {\"name\": \"Orange\"}]}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("- Apple"));
        assertTrue(result.contains("- Banana"));
        assertTrue(result.contains("- Orange"));
    }
    
    @Test
    public void testNestedArrayAccess() {
        String template = "First hobby: $input.json('$.user.hobbies[0]')\nSecond hobby: $input.json('$.user.hobbies[1]')";
        String input = "{\"user\": {\"hobbies\": [\"reading\", \"swimming\", \"coding\"]}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("First hobby: \"reading\""));
        assertTrue(result.contains("Second hobby: \"swimming\""));
    }
    
    @Test
    public void testComplexNestedStructure() {
        String template = "Name: $input.json('$.user.profile.personal.name')\nAge: $input.json('$.user.profile.personal.age')\nAddress: $input.json('$.user.profile.address.street')";
        String input = "{\"user\": {\"profile\": {\"personal\": {\"name\": \"John Doe\", \"age\": 30}, \"address\": {\"street\": \"123 Main St\"}}}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: \"John Doe\""));
        assertTrue(result.contains("Age: 30"));
        assertTrue(result.contains("Address: \"123 Main St\""));
    }
    
    @Test
    public void testMissingProperties() {
        String template = "Name: $input.json('$.user.name')\nEmail: $input.json('$.user.email')\nPhone: $input.json('$.user.phone')";
        String input = "{\"user\": {\"name\": \"John Doe\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: \"John Doe\""));
        assertTrue(result.contains("Email: null"));
        assertTrue(result.contains("Phone: null"));
    }
    
    @Test
    public void testNullValues() {
        String template = "Name: $input.json('$.user.name')\nEmail: $input.json('$.user.email')";
        String input = "{\"user\": {\"name\": null, \"email\": \"john@example.com\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: null"));
        assertTrue(result.contains("Email: \"john@example.com\""));
    }
    
    @Test
    public void testEmptyArray() {
        String template = "Items count: $input.path('$.items').size()\nFirst item: $input.json('$.items[0]')";
        String input = "{\"items\": []}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Items count: 0"));
        assertTrue(result.contains("First item: null"));
    }
    
    @Test
    public void testArrayOutOfBounds() {
        String template = "First: $input.json('$.items[0]')\nTenth: $input.json('$.items[9]')";
        String input = "{\"items\": [\"item1\", \"item2\"]}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("First: \"item1\""));
        assertTrue(result.contains("Tenth: null"));
    }
    
    @Test
    public void testMixedDataTypes() {
        String template = "String: $input.json('$.data.string')\nNumber: $input.json('$.data.number')\nBoolean: $input.json('$.data.boolean')\nNull: $input.json('$.data.nullValue')";
        String input = "{\"data\": {\"string\": \"hello\", \"number\": 42, \"boolean\": true, \"nullValue\": null}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("String: \"hello\""));
        assertTrue(result.contains("Number: 42"));
        assertTrue(result.contains("Boolean: true"));
        assertTrue(result.contains("Null: null"));
    }
    
    @Test
    public void testArrayOfObjects() {
        String template = "Users:\n#foreach($user in $input.path('$.users'))\n- $user.name ($user.age years old)#end";
        String input = "{\"users\": [{\"name\": \"Alice\", \"age\": 25}, {\"name\": \"Bob\", \"age\": 30}]}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("- Alice (25 years old)"));
        assertTrue(result.contains("- Bob (30 years old)"));
    }
    
    @Test
    public void testConditionalWithJSONPath() {
        String template = "#if($input.path('$.user.age') > 18)\nAdult: $input.json('$.user.name')\n#else\nMinor: $input.json('$.user.name')\n#end";
        String input = "{\"user\": {\"name\": \"John Doe\", \"age\": 25}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Adult: \"John Doe\""));
        assertFalse(result.contains("Minor:"));
    }
    
    @Test
    public void testJSONPathWithSpecialCharacters() {
        String template = "Name: $input.json('$.user.name')\nEmail: $input.json('$.user.email')";
        String input = "{\"user\": {\"name\": \"John O'Connor\", \"email\": \"john.o'connor@example.com\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: \"John O'Connor\""));
        assertTrue(result.contains("Email: \"john.o'connor@example.com\""));
    }
    
    @Test
    public void testJSONPathWithNumbersInKeys() {
        String template = "Value1: $input.json('$.data.key1')\nValue2: $input.json('$.data.key2')";
        String input = "{\"data\": {\"key1\": \"value1\", \"key2\": \"value2\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Value1: \"value1\""));
        assertTrue(result.contains("Value2: \"value2\""));
    }
    
    @Test
    public void testJSONPathWithUnderscores() {
        String template = "User ID: $input.json('$.user.user_id')\nFirst Name: $input.json('$.user.first_name')";
        String input = "{\"user\": {\"user_id\": 12345, \"first_name\": \"John\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("User ID: 12345"));
        assertTrue(result.contains("First Name: \"John\""));
    }
    
    @Test
    public void testJSONPathWithHyphens() {
        String template = "User ID: $input.json('$.user.user-id')\nFirst Name: $input.json('$.user.first-name')";
        String input = "{\"user\": {\"user-id\": 12345, \"first-name\": \"John\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("User ID: 12345"));
        assertTrue(result.contains("First Name: \"John\""));
    }
    
    @Test
    public void testJSONPathWithDollarSign() {
        String template = "Price: $input.json('$.product.price')";
        String input = "{\"product\": {\"price\": 29.99}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Price: 29.99"));
    }
    
    @Test
    public void testJSONPathWithEmptyString() {
        String template = "Name: $input.json('$.user.name')\nEmpty: $input.json('$.user.empty')";
        String input = "{\"user\": {\"name\": \"John\", \"empty\": \"\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: \"John\""));
        assertTrue(result.contains("Empty: \"\""));
    }
    
    @Test
    public void testJSONPathWithWhitespace() {
        String template = "Name: $input.json('$.user.name')\nDescription: $input.json('$.user.description')";
        String input = "{\"user\": {\"name\": \"John Doe\", \"description\": \"  Leading and trailing spaces  \"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Name: \"John Doe\""));
        assertTrue(result.contains("Description: \"  Leading and trailing spaces  \""));
    }
    
    @Test
    public void testStringInterpolationInTemplate() {
        String template = "Hello $input.json('$.name.surname')!";
        String input = "{\"name\": {\"surname\": \"fa\"}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        // Now $input.json() returns JSON strings, so this will output "Hello \"fa\"!"
        assertTrue(result.contains("Hello \"fa\"!"));
    }
    
    @Test
    public void testPathForNativeVTLManipulation() {
        String template = "Array size: $input.path('$.pets').size()\nFirst pet: $input.path('$.pets[0].type')";
        String input = "{\"pets\": [{\"id\": 1, \"type\": \"dog\", \"price\": 249.99}, {\"id\": 2, \"type\": \"cat\", \"price\": 124.99}]}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Array size: 2"));
        assertTrue(result.contains("First pet: dog"));
    }
    
    @Test
    public void testPathForIteration() {
        String template = "Pets:\n#foreach($pet in $input.path('$.pets'))\n- $pet.type ($${pet.price})#end";
        String input = "{\"pets\": [{\"id\": 1, \"type\": \"dog\", \"price\": 249.99}, {\"id\": 2, \"type\": \"cat\", \"price\": 124.99}]}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        System.out.println("DEBUG: " + result);
        assertTrue(result.contains("- dog ($249.99)"));
        assertTrue(result.contains("- cat ($124.99)"));
    }
    
    @Test
    public void testBodyFunction() {
        String template = "Raw body: $input.body";
        String input = "{\"user\": {\"name\": \"John\", \"age\": 30}}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Raw body: {\"user\": {\"name\": \"John\", \"age\": 30}}"));
    }
    
    @Test
    public void testBodyWithFloatingPoint() {
        String template = "Price: $input.body";
        String input = "{\"price\": 10.00}";
        String context = "{}";
        
        String result = processor.process(template, input, context);
        
        assertTrue(result.contains("Price: {\"price\": 10.00}"));
    }
} 