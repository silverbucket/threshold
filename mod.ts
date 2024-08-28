interface ThresholdLookup {
    branch: string,
    line: string
}

const threshold: ThresholdLookup = {
    branch: Deno.args[0] || "85.0",
    line: Deno.args[1] || Deno.args[0] || "85.0"
}

console.log(`Checking coverage threshold. (branch: ${threshold.branch}% line: ${threshold.line}%)`);

function compare(name: keyof ThresholdLookup, match: RegExpExecArray | null) {
    if (!match?.groups) {
        return false;
    }

    if (!match.groups[name]) {
        console.error(`Unable to find '${name}' coverage totals.`);
        return false;
    }

    if (parseFloat(match.groups[name]) < parseFloat(threshold[name])) {
        console.error(`Threshold of ${threshold[name]}% for '${name}' not met. Actual: ${match.groups[name]}%`);
        return false;
    }
    return true;
}

const decoder = new TextDecoder();

for await (const chunk of Deno.stdin.readable) {
    let text = decoder.decode(chunk);
    console.log(text);
    // check input and strip out ansi codes
    // deno-lint-ignore no-control-regex
    text = text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    let status = true;
    const regexp = new RegExp(/^\s*All files\s*\|\s*(?<branch>\d+\.\d)\s*\|\s*(?<line>\d+\.\d)/, "gm");
    const match = regexp.exec(text);

    for (const name of Object.keys(threshold)) {
        const res = compare(name as keyof ThresholdLookup, match);
        status = !status ? false : res;
    }

    if (!status) {
        Deno.exit(1);
    }
}
