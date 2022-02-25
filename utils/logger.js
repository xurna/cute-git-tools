/**
 * 日志类
 */
const chalk = require('chalk')

const TYPES = {
  INFO: chalk.cyanBright,
  HIGHLIGHT: chalk.greenBright,
  WARN: chalk.yellow,
  ERROR: chalk.redBright
}

class Logger {
  constructor (tag) {
    this.tag = ''
    if (typeof tag === 'string') this._tag = tag
  }

  info (...args) {
    this._log(TYPES.INFO, args)
  }

  highlight (...args) {
    this._log(TYPES.HIGHLIGHT, args)
  }

  warn (...args) {
    this._log(TYPES.WARN, args)
  }

  error (...args) {
    this._log(TYPES.ERROR, args)
  }

  _log (type, data) {
    console.log(type(this._tag, ...data))
  }
}

module.exports = Logger
