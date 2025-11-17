#!/bin/bash

# WASM vs Java Equivalence Test Script
#
# This script runs both Java and WASM implementations against all test cases
# and compares the outputs to ensure equivalence.
#
# Usage:
#   ./test-wasm-equivalence.sh [options]
#
# Options:
#   --build-java    Build Java JAR before testing
#   --build-wasm    Build WASM before testing
#   --build-all     Build both JAR and WASM
#   --test <name>   Run specific test case only
#   --verbose       Show detailed output

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
JAR_PATH="target/vtl-processor.jar"
WASM_PATH="target/graalvm-wasm/vtl-processor.wasm"
TEST_DIR="src/test/resources/vtl-test-cases"
OUTPUT_DIR="target/equivalence-test-results"
BUILD_JAVA=false
BUILD_WASM=false
SPECIFIC_TEST=""
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build-java)
            BUILD_JAVA=true
            shift
            ;;
        --build-wasm)
            BUILD_WASM=true
            shift
            ;;
        --build-all)
            BUILD_JAVA=true
            BUILD_WASM=true
            shift
            ;;
        --test)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}========================================================================${NC}"
echo -e "${CYAN}  WASM vs Java Equivalence Test Suite${NC}"
echo -e "${CYAN}========================================================================${NC}"

# Build if requested
if [ "$BUILD_JAVA" = true ]; then
    echo -e "\n${BLUE}Building Java JAR...${NC}"
    mvn clean package -DskipTests
    echo -e "${GREEN}✓ Java JAR built${NC}"
fi

if [ "$BUILD_WASM" = true ]; then
    echo -e "\n${BLUE}Building WASM...${NC}"
    mvn clean package -Pnative-wasm -DskipTests
    echo -e "${GREEN}✓ WASM built${NC}"
fi

# Check prerequisites
echo -e "\n${BLUE}Checking prerequisites...${NC}"

if [ ! -f "$JAR_PATH" ]; then
    echo -e "${RED}✗ Java JAR not found: $JAR_PATH${NC}"
    echo -e "${YELLOW}  Build with: mvn clean package${NC}"
    JAR_AVAILABLE=false
else
    echo -e "${GREEN}✓ Java JAR found${NC}"
    JAR_AVAILABLE=true
fi

if [ ! -f "$WASM_PATH" ]; then
    echo -e "${RED}✗ WASM not found: $WASM_PATH${NC}"
    echo -e "${YELLOW}  Build with: mvn clean package -Pnative-wasm${NC}"
    WASM_AVAILABLE=false
else
    echo -e "${GREEN}✓ WASM found${NC}"
    WASM_SIZE=$(du -h "$WASM_PATH" | cut -f1)
    echo -e "  Size: ${CYAN}$WASM_SIZE${NC}"
    WASM_AVAILABLE=true
fi

if [ "$JAR_AVAILABLE" = false ] && [ "$WASM_AVAILABLE" = false ]; then
    echo -e "\n${RED}❌ Neither JAR nor WASM available. Cannot run tests.${NC}"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
rm -rf "$OUTPUT_DIR"/*

# Find test cases
echo -e "\n${BLUE}Loading test cases...${NC}"
TEST_CASES=()

if [ -n "$SPECIFIC_TEST" ]; then
    if [ -d "$TEST_DIR/$SPECIFIC_TEST" ]; then
        TEST_CASES=("$SPECIFIC_TEST")
    else
        echo -e "${RED}Test case not found: $SPECIFIC_TEST${NC}"
        exit 1
    fi
else
    while IFS= read -r dir; do
        test_name=$(basename "$dir")
        TEST_CASES+=("$test_name")
    done < <(find "$TEST_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
fi

echo -e "${GREEN}✓ Found ${#TEST_CASES[@]} test cases${NC}"

# Helper function to run Java test
run_java_test() {
    local test_name=$1
    local test_dir="$TEST_DIR/$test_name"
    local output_file="$OUTPUT_DIR/${test_name}.java.out"
    local error_file="$OUTPUT_DIR/${test_name}.java.err"

    if [ ! -f "$test_dir/template.vtl" ]; then
        echo "skip"
        return
    fi

    # Create a temporary Java runner
    local temp_dir=$(mktemp -d)
    cat > "$temp_dir/TestRunner.java" << 'EOF'
import dev.vtlemulator.engine.VTLProcessor;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TestRunner {
    public static void main(String[] args) throws Exception {
        String template = new String(Files.readAllBytes(Paths.get(args[0])));
        String context = new String(Files.readAllBytes(Paths.get(args[1])));
        String input = new String(Files.readAllBytes(Paths.get(args[2])));

        VTLProcessor processor = new VTLProcessor();
        String result = processor.process(template, input, context);
        System.out.print(result);
    }
}
EOF

    # Compile and run
    if javac -cp "$JAR_PATH" "$temp_dir/TestRunner.java" 2>"$error_file"; then
        if java -cp "$JAR_PATH:$temp_dir" TestRunner \
            "$test_dir/template.vtl" \
            "$test_dir/context.json" \
            "$test_dir/input.json" \
            > "$output_file" 2>>"$error_file"; then
            rm -rf "$temp_dir"
            echo "success"
            return
        fi
    fi

    rm -rf "$temp_dir"
    echo "error"
}

# Helper function to run WASM test
run_wasm_test() {
    local test_name=$1
    local output_file="$OUTPUT_DIR/${test_name}.wasm.out"

    # For now, WASM testing requires the Node.js script
    # This is a placeholder
    echo "pending"
}

# Run tests
echo -e "\n${CYAN}========================================================================${NC}"
echo -e "${CYAN}  Running Tests${NC}"
echo -e "${CYAN}========================================================================${NC}"

PASSED=0
FAILED=0
SKIPPED=0
JAVA_ONLY=0

for test_name in "${TEST_CASES[@]}"; do
    echo -e "\n${BLUE}[$test_name]${NC}"

    JAVA_RESULT=""
    WASM_RESULT=""

    # Run Java implementation
    if [ "$JAR_AVAILABLE" = true ]; then
        echo -ne "  Java:  "
        JAVA_RESULT=$(run_java_test "$test_name")

        if [ "$JAVA_RESULT" = "success" ]; then
            echo -e "${GREEN}✓${NC}"
            if [ "$VERBOSE" = true ]; then
                echo -e "${CYAN}$(cat "$OUTPUT_DIR/${test_name}.java.out" | head -5)${NC}"
            fi
        elif [ "$JAVA_RESULT" = "skip" ]; then
            echo -e "${YELLOW}⊘ No template${NC}"
        else
            echo -e "${RED}✗ Error${NC}"
            if [ "$VERBOSE" = true ] && [ -f "$OUTPUT_DIR/${test_name}.java.err" ]; then
                cat "$OUTPUT_DIR/${test_name}.java.err"
            fi
        fi
    fi

    # Run WASM implementation
    if [ "$WASM_AVAILABLE" = true ]; then
        echo -ne "  WASM:  "
        WASM_RESULT=$(run_wasm_test "$test_name")

        if [ "$WASM_RESULT" = "success" ]; then
            echo -e "${GREEN}✓${NC}"
        elif [ "$WASM_RESULT" = "pending" ]; then
            echo -e "${YELLOW}⚠ Interface not implemented${NC}"
        else
            echo -e "${RED}✗ Error${NC}"
        fi
    fi

    # Compare results
    if [ "$JAVA_RESULT" = "success" ] && [ "$WASM_RESULT" = "success" ]; then
        if diff -q "$OUTPUT_DIR/${test_name}.java.out" "$OUTPUT_DIR/${test_name}.wasm.out" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓ Outputs match${NC}"
            ((PASSED++))
        else
            echo -e "  ${RED}✗ Outputs differ${NC}"
            ((FAILED++))

            if [ "$VERBOSE" = true ]; then
                echo -e "${YELLOW}  Differences:${NC}"
                diff "$OUTPUT_DIR/${test_name}.java.out" "$OUTPUT_DIR/${test_name}.wasm.out" | head -20
            fi
        fi
    elif [ "$JAVA_RESULT" = "success" ]; then
        echo -e "  ${YELLOW}⚠ Java only${NC}"
        ((JAVA_ONLY++))
    elif [ "$JAVA_RESULT" = "skip" ]; then
        ((SKIPPED++))
    fi
done

# Summary
echo -e "\n${CYAN}========================================================================${NC}"
echo -e "${CYAN}  Test Summary${NC}"
echo -e "${CYAN}========================================================================${NC}"

TOTAL=${#TEST_CASES[@]}
echo -e "\n  Total Tests:  $TOTAL"
echo -e "  ${GREEN}✓ Passed:     $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "  ${RED}✗ Failed:     $FAILED${NC}"
else
    echo -e "  ✗ Failed:     $FAILED"
fi
if [ $SKIPPED -gt 0 ]; then
    echo -e "  ${YELLOW}⊘ Skipped:    $SKIPPED${NC}"
fi
if [ $JAVA_ONLY -gt 0 ]; then
    echo -e "  ${YELLOW}⚠ Java Only:  $JAVA_ONLY${NC}"
fi

echo -e "\n${CYAN}Output files saved to: $OUTPUT_DIR${NC}"

# Exit code
if [ $FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ Equivalence tests FAILED${NC}"
    exit 1
elif [ $PASSED -gt 0 ]; then
    echo -e "\n${GREEN}✅ All equivalence tests PASSED${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠ No tests could be compared${NC}"
    echo -e "\n${CYAN}Note: To test WASM, use the Node.js script:${NC}"
    echo -e "${CYAN}  node test-wasm-equivalence.js${NC}"
    exit 2
fi
