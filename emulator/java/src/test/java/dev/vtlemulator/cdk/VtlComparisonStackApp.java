package dev.vtlemulator.cdk;

import software.amazon.awscdk.App;
import software.amazon.awscdk.StackProps;

public class VtlComparisonStackApp {
    public static void main(final String[] args) {
        App app = new App();
        new VtlComparisonStack(app, "VtlComparisonStack", StackProps.builder().build());
        app.synth();
    }
}

