#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
console.log(hideBin(process.argv))
console.log(argv)
console.log('hello', argv.name)
console.log(yargs().argv)
