// MIT © 2018 azu
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const fixturesDir = path.join(__dirname, "fixtures");
const AsciiDocParser = require("../lib/asciidoc-parser");
const LineReader = require('../lib/line-reader');
const parseFixture = (fixture) => new AsciiDocParser(new LineReader(fixture).readLines()).parse();

describe("Snapshot testing", () => {
    fs.readdirSync(fixturesDir)
        .filter(fileName => {
            return path.extname(fileName) === ".adoc";
        })
        .map(caseName => {
            const normalizedTestName = caseName.replace(/-/g, " ");
            it(`Test ${normalizedTestName}`, function() {
                const fixtureDir = path.join(fixturesDir, caseName);
                const actualContent = fs.readFileSync(fixtureDir, "utf-8");
                const actual = parseFixture(actualContent);
                const expectedFilePath = fixtureDir + ".json";
                // UPDATE_SNAPSHOT=1 npm test
                if (process.env.UPDATE_SNAPSHOT) {
                    fs.writeFileSync(expectedFilePath, JSON.stringify(actual, null, 4));
                    this.skip();
                    return;
                }
                // Assert: actual vs. expected
                const expected = JSON.parse(fs.readFileSync(expectedFilePath, "utf-8"));
                assert.deepEqual(
                    actual,
                    expected,
                    `
${fixtureDir}
${JSON.stringify(actual)}
`
                );
            });
        });
});
