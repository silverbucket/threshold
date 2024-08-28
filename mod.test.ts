import Threshold from "./mod.ts";
import { testData } from "./test_data.ts";

import { assertEquals } from "jsr:@std/assert@1";

testData.forEach(([params, input, expected], i) => {
    Deno.test(`testing input ${i} should ${expected ? 'false' : 'pass'}`, () => {
        const threshold = new Threshold(...params as string[]);
        const errors = threshold.processInput(input as string);
        assertEquals(errors, expected);
    });
})
