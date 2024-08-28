# @silverbucket/threshold

A simple Deno tool which parses the output of `deno coverage` to check for a minimum coverage threshold

# About

This is intended as a dead-simple check for a basic minimum threshold of test code coverage. It's a stop-gap until deno
implements some for of defining thresholds natively during a `deno coverage` run.

It parses the output of `deno coverage`, and only checks the `All files` line, for `branch` and `line` coverage, 
ensuring they meet a minimum threshold.

# Usage

## CLI

First, you should run tests and generate a coverage report. Then you can run the `deno coverage` command and pipe the
output to this script, with optional values for `branch` and `threshold` (defaults to 85 for both).

```bash
deno test --coverage
deno coverage | deno run jsr:@silverbucket/threshold 90 92
```

In this case the threshold for `branch` is `90%` and the threshold for `line` is `91%`

## Module

You can optionally import the `Threshold` class in your program.

```ts
import Threshold from "jsr:@silverbucket/threshold";

const thres = new Threshold(90, 92);
// get deno converage output
const errors = thres.processInput(deno_coverage);
if (errors.length) {
    // report errors
}
```

# Author

Nick Jennings <nick@silverbucket.net>

# License

MIT
