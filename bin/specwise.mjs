#!/usr/bin/env node
import { run } from "../src/cli/run.mjs";

const exitCode = await run(process.argv.slice(2));
process.exit(exitCode);

