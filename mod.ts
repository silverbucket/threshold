type processErrors = string[];

const DEFAULT_BRANCH_THRESHOLD = "85.0";
const DEFAULT_LINE_THRESHOLD = "85.0";


export default class Threshold {
    readonly branch: string;
    readonly line: string;

    constructor(branch: string = DEFAULT_BRANCH_THRESHOLD, line: string = DEFAULT_LINE_THRESHOLD) {
        this.branch = branch;
        this.line = line;
    }

    processInput(text: string): processErrors | undefined {
        const errors: processErrors = [];

        const regexp = new RegExp(/^\s*All files\s*\|\s*(?<branch>\d+\.\d)\s*\|\s*(?<line>\d+\.\d)/, "gm");
        const match = regexp.exec(text);

        if (!match?.groups) {
            errors.push("Unable to parse input");
        } else {
            for (const [name, threshold] of [
                ["branch", this.branch],
                ["line", this.line]
            ]) {
                const err = Threshold.compare(
                    name,
                    threshold,
                    match.groups[name]
                );
                if (err) {
                    errors.push(err);
                }
            }
        }

        return errors.length > 0 ? errors : undefined;
    }

    private static compare(name: string, threshold: string, actual: string): string | undefined {
        if (!actual) {
            return `Unable to find '${name}' coverage totals.`;
        }

        if (parseFloat(actual) < parseFloat(threshold)) {
            return `Threshold of ${threshold}% for '${name}' not met. Actual: ${actual}%`;
        }

        return undefined;
    }
}

(async function run() {
    const threshold = new Threshold(
        Deno.args[0] || DEFAULT_BRANCH_THRESHOLD,
        Deno.args[1] || Deno.args[0] || DEFAULT_LINE_THRESHOLD
    );
    console.log(`Checking coverage threshold. (branch: ${threshold.branch}% line: ${threshold.line}%)`);

    const decoder = new TextDecoder();

    for await (const chunk of Deno.stdin.readable) {
        let text = decoder.decode(chunk);
        console.log(text);
        // check input and strip out ansi codes
        // deno-lint-ignore no-control-regex
        text = text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        const errors = threshold.processInput(text);
        if (errors) {
            for (const err of errors) {
                console.error(err);
            }
            Deno.exit(1);
        }
    }
}());
