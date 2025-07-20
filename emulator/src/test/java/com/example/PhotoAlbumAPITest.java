package com.example;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;

public class PhotoAlbumAPITest {
    private VTLProcessor processor;
    private ObjectMapper objectMapper;

    @Before
    public void setUp() throws Exception {
        processor = new VTLProcessor();
        objectMapper = new ObjectMapper();
    }

    @Test
    public void testPhotoAlbumRequestTransformation() {
        // Test the request transformation template
        String template =
            "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographedBy\": \"$elem.photographer_first_name $elem.photographer_last_name\",\n" +
            "      \"title\": \"$elem.title\",\n" +
            "      \"ispublic\": $elem.ispublic,\n" +
            "      \"isfriend\": $elem.isfriend,\n" +
            "      \"isfamily\": $elem.isfamily\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "#end\n" +
            "  ]\n" +
            "}\n";

        String inputJson =
            "{\n" +
            "  \"photos\": {\n" +
            "    \"page\": 1,\n" +
            "    \"pages\": \"1234\",\n" +
            "    \"perpage\": 100,\n" +
            "    \"total\": \"123398\",\n" +
            "    \"photo\": [\n" +
            "      {\n" +
            "        \"id\": \"12345678901\",\n" +
            "        \"owner\": \"23456789@A12\",\n" +
            "        \"photographer_first_name\": \"Saanvi\",\n" +
            "        \"photographer_last_name\": \"Sarkar\",\n" +
            "        \"secret\": \"abc123d456\",\n" +
            "        \"server\": \"1234\",\n" +
            "        \"farm\": 1,\n" +
            "        \"title\": \"Sample photo 1\",\n" +
            "        \"ispublic\": true,\n" +
            "        \"isfriend\": false,\n" +
            "        \"isfamily\": false\n" +
            "      },\n" +
            "      {\n" +
            "        \"id\": \"23456789012\",\n" +
            "        \"owner\": \"34567890@B23\",\n" +
            "        \"photographer_first_name\": \"Richard\",\n" +
            "        \"photographer_last_name\": \"Roe\",\n" +
            "        \"secret\": \"bcd234e567\",\n" +
            "        \"server\": \"2345\",\n" +
            "        \"farm\": 2,\n" +
            "        \"title\": \"Sample photo 2\",\n" +
            "        \"ispublic\": true,\n" +
            "        \"isfriend\": false,\n" +
            "        \"isfamily\": false\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "}\n";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album request transformation result: '" + result + "'");

        // Verify the transformation worked correctly
        assertTrue(result.contains("\"photos\":[{\"id\":\"12345678901\""));
    }

    @Test
    public void testPhotoAlbumResponseTransformation() {
        // Test the response transformation template
        String template =
            "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographedBy\": \"$elem.photographedBy\",\n" +
            "      \"title\": \"$elem.title\",\n" +
            "      \"ispublic\": $elem.public,\n" +
            "      \"isfriend\": $elem.friend,\n" +
            "      \"isfamily\": $elem.family\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "#end\n" +
            "  ]\n" +
            "}\n";

        String inputJson =
            "{\n" +
            "  \"photos\": [\n" +
            "    {\n" +
            "      \"id\": \"12345678901\",\n" +
            "      \"photographedBy\": \"Saanvi Sarkar\",\n" +
            "      \"title\": \"Sample photo 1\",\n" +
            "      \"description\": \"My sample photo 1\",\n" +
            "      \"public\": true,\n" +
            "      \"friend\": false,\n" +
            "      \"family\": false\n" +
            "    },\n" +
            "    {\n" +
            "      \"id\": \"23456789012\",\n" +
            "      \"photographedBy\": \"Richard Roe\",\n" +
            "      \"title\": \"Sample photo 2\",\n" +
            "      \"description\": \"My sample photo 2\",\n" +
            "      \"public\": true,\n" +
            "      \"friend\": false,\n" +
            "      \"family\": false\n" +
            "    }\n" +
            "  ]\n" +
            "}\n";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album response transformation result: '" + result + "'");

        // Verify the transformation worked correctly
        assertTrue(result.contains("\"photos\":[{\"id\":\"12345678901\""));
    }

    @Test
    public void testPhotoAlbumWithConditionalLogic() {
        // Test conditional logic in photo album transformation
        String template =
            "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographedBy\": \"$elem.photographer_first_name $elem.photographer_last_name\",\n" +
            "      \"title\": \"$elem.title\",\n" +
            "      \"visibility\": \"#if($elem.ispublic)public#elseif($elem.isfriend)friend#elseif($elem.isfamily)family#else private#end\"\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "#end\n" +
            "  ]\n" +
            "}\n";

        String inputJson =
            "{\n" +
            "  \"photos\": {\n" +
            "    \"photo\": [\n" +
            "      {\n" +
            "        \"id\": \"12345678901\",\n" +
            "        \"photographer_first_name\": \"Saanvi\",\n" +
            "        \"photographer_last_name\": \"Sarkar\",\n" +
            "        \"title\": \"Public Photo\",\n" +
            "        \"ispublic\": true,\n" +
            "        \"isfriend\": false,\n" +
            "        \"isfamily\": false\n" +
            "      },\n" +
            "      {\n" +
            "        \"id\": \"23456789012\",\n" +
            "        \"photographer_first_name\": \"Richard\",\n" +
            "        \"photographer_last_name\": \"Roe\",\n" +
            "        \"title\": \"Friend Photo\",\n" +
            "        \"ispublic\": false,\n" +
            "        \"isfriend\": true,\n" +
            "        \"isfamily\": false\n" +
            "      },\n" +
            "      {\n" +
            "        \"id\": \"34567890123\",\n" +
            "        \"photographer_first_name\": \"Jane\",\n" +
            "        \"photographer_last_name\": \"Doe\",\n" +
            "        \"title\": \"Family Photo\",\n" +
            "        \"ispublic\": false,\n" +
            "        \"isfriend\": false,\n" +
            "        \"isfamily\": true\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "}\n";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album conditional logic result: '" + result + "'");

        // Verify conditional logic worked correctly
        assertTrue(result.contains("\"visibility\":\"public\""));
    }

    @Test
    public void testPhotoAlbumWithUtilFunctions() {
        // Test using utility functions in photo album transformation
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographer\": \"$util.escapeJavaScript($elem.photographer_first_name + ' ' + $elem.photographer_last_name)\",\n" +
            "      \"title\": \"$util.escapeJavaScript($elem.title)\",\n" +
            "      \"url\": \"https://farm$elem.farm.staticflickr.com/$elem.server/$elem.id_$elem.secret.jpg\"\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "    \n" +
            "#end\n" +
            "  ],\n" +
            "  \"total_photos\": $inputRoot.photos.photo.size()\n" +
            "}";

        String inputJson = "{\n" +
            "  \"photos\": {\n" +
            "    \"photo\": [\n" +
            "      {\n" +
            "        \"id\": \"12345678901\",\n" +
            "        \"photographer_first_name\": \"Saanvi\",\n" +
            "        \"photographer_last_name\": \"Sarkar\",\n" +
            "        \"title\": \"Sample photo with \\\"quotes\\\"\",\n" +
            "        \"secret\": \"abc123d456\",\n" +
            "        \"server\": \"1234\",\n" +
            "        \"farm\": 1\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "}";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album with util functions result: '" + result + "'");

        // Verify utility functions worked correctly
        assertTrue(result.contains("\"photographer\":\"Saanvi Sarkar\""));
        assertTrue(result.contains("\"title\":\"Sample photo with \\\"quotes\\\"\""));
        assertTrue(result.contains("\"url\":\"https://farm/1234/"));
        assertTrue(result.contains("\"total_photos\":1"));
    }

    @Test
    public void testPhotoAlbumWithContextVariables() {
        // Test using context variables in photo album transformation
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"api_version\": \"$context.apiId\",\n" +
            "  \"request_id\": \"$context.requestId\",\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"photographedBy\": \"$elem.photographer_first_name $elem.photographer_last_name\",\n" +
            "      \"title\": \"$elem.title\",\n" +
            "      \"processed_by\": \"$context.identity.user\"\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "    \n" +
            "#end\n" +
            "  ]\n" +
            "}";

        String inputJson = "{\n" +
            "  \"photos\": {\n" +
            "    \"photo\": [\n" +
            "      {\n" +
            "        \"id\": \"12345678901\",\n" +
            "        \"photographer_first_name\": \"Saanvi\",\n" +
            "        \"photographer_last_name\": \"Sarkar\",\n" +
            "        \"title\": \"Sample photo 1\"\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "}";

        String contextJson = "{\n" +
            "  \"apiId\": \"photo-api-v1\",\n" +
            "  \"requestId\": \"req-12345\",\n" +
            "  \"identity\": {\n" +
            "    \"user\": \"john.doe@example.com\"\n" +
            "  }\n" +
            "}";

        String result = processor.process(template, inputJson, contextJson);
        System.out.println("DEBUG: Photo album with context variables result: '" + result + "'");

        // Verify context variables worked correctly
        assertTrue(result.contains("\"api_version\":\"photo-api-v1\""));
        assertTrue(result.contains("\"request_id\":\"req-12345\""));
        assertTrue(result.contains("\"processed_by\":\"john.doe@example.com\""));
    }

    @Test
    public void testPhotoAlbumWithNestedArrays() {
        // Test handling nested arrays in photo album data
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"albums\": [\n" +
            "#foreach($album in $inputRoot.albums)\n" +
            "    {\n" +
            "      \"album_id\": \"$album.id\",\n" +
            "      \"album_title\": \"$album.title\",\n" +
            "      \"photos\": [\n" +
            "#foreach($photo in $album.photos)\n" +
            "        {\n" +
            "          \"photo_id\": \"$photo.id\",\n" +
            "          \"photo_title\": \"$photo.title\"\n" +
            "        }#if($foreach.hasNext),#end\n" +
            "      \n" +
            "#end\n" +
            "      ]\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "    \n" +
            "#end\n" +
            "  ]\n" +
            "}";

        String inputJson = "{\n" +
            "  \"albums\": [\n" +
            "    {\n" +
            "      \"id\": \"album1\",\n" +
            "      \"title\": \"Vacation Photos\",\n" +
            "      \"photos\": [\n" +
            "        {\"id\": \"photo1\", \"title\": \"Beach Sunset\"},\n" +
            "        {\"id\": \"photo2\", \"title\": \"Mountain View\"}\n" +
            "      ]\n" +
            "    },\n" +
            "    {\n" +
            "      \"id\": \"album2\",\n" +
            "      \"title\": \"Family Photos\",\n" +
            "      \"photos\": [\n" +
            "        {\"id\": \"photo3\", \"title\": \"Birthday Party\"}\n" +
            "      ]\n" +
            "    }\n" +
            "  ]\n" +
            "}";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album with nested arrays result: '" + result + "'");

        // Verify nested arrays worked correctly
        assertTrue(result.contains("\"album_id\":\"album1\""));
    }

    @Test
    public void testPhotoAlbumWithEmptyArrays() {
        // Test handling empty arrays in photo album data
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#if($inputRoot.photos.photo && $inputRoot.photos.photo.size() > 0)\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"title\": \"$elem.title\"\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "    \n" +
            "#end\n" +
            "#else\n" +
            "    {\n" +
            "      \"message\": \"No photos found\"\n" +
            "    }\n" +
            "#end\n" +
            "  ]\n" +
            "}";

        String inputJson = "{\n" +
            "  \"photos\": {\n" +
            "    \"photo\": []\n" +
            "  }\n" +
            "}";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album with empty arrays result: '" + result + "'");

        // Verify empty array handling worked correctly
        assertTrue(result.contains("\"message\":\"No photos found\""));
    }

    @Test
    public void testPhotoAlbumWithNullValues() {
        // Test handling null values in photo album data
        String template = "#set($inputRoot = $input.path('$'))\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\",\n" +
            "      \"title\": \"#if($elem.title)$elem.title#else Untitled#end\",\n" +
            "      \"photographer\": \"#if($elem.photographer_first_name && $elem.photographer_last_name)$elem.photographer_first_name $elem.photographer_last_name#else Unknown#end\"\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "    \n" +
            "#end\n" +
            "  ]\n" +
            "}";

        String inputJson = "{\n" +
            "  \"photos\": {\n" +
            "    \"photo\": [\n" +
            "      {\n" +
            "        \"id\": \"12345678901\",\n" +
            "        \"title\": null,\n" +
            "        \"photographer_first_name\": \"Saanvi\",\n" +
            "        \"photographer_last_name\": \"Sarkar\"\n" +
            "      },\n" +
            "      {\n" +
            "        \"id\": \"23456789012\",\n" +
            "        \"title\": \"Sample photo 2\",\n" +
            "        \"photographer_first_name\": null,\n" +
            "        \"photographer_last_name\": null\n" +
            "      }\n" +
            "    ]\n" +
            "  }\n" +
            "}";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Photo album with null values result: '" + result + "'");

        // Verify null value handling worked correctly
        assertTrue(result.contains("Untitled"));
    }

    @Test
    public void testSimpleForeachDebug() {
        // Simple test to debug foreach loop issues
        String template =
            "#set($inputRoot = $input.json('$'))\n" +
            "DEBUG: inputRoot = $inputRoot\n" +
            "DEBUG: photos = $inputRoot.photos\n" +
            "DEBUG: photo array = $inputRoot.photos.photo\n" +
            "DEBUG: photo array size = $inputRoot.photos.photo.size()\n" +
            "\n" +
            "{\n" +
            "  \"photos\": [\n" +
            "#foreach($elem in $inputRoot.photos.photo)\n" +
            "    {\n" +
            "      \"id\": \"$elem.id\"\n" +
            "    }#if($foreach.hasNext),#end\n" +
            "#end\n" +
            "  ]\n" +
            "}\n";

        String inputJson =
            "{\n" +
            "  \"photos\": {\n" +
            "    \"photo\": [\n" +
            "      {\"id\": \"12345678901\"},\n" +
            "      {\"id\": \"23456789012\"}\n" +
            "    ]\n" +
            "  }\n" +
            "}\n";

        String result = processor.process(template, inputJson, "{}");
        System.out.println("DEBUG: Simple foreach result: '" + result + "'");
        
        // Just check that we get some output
        assertNotNull(result);
        assertTrue(result.length() > 0);
    }
} 