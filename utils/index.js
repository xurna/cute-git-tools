const shell = require('shelljs')
const chalk = require('chalk')
const TAG = '[git-auto-commit]'
const Logger = require('../utils/logger')
const logger = new Logger(TAG)
const CODE = {
  SUCCESS_CODE: 0
}
/**
 * 合并分支
 * @param {String} currentBranch 源分支
 * @param {String} targetBranch 需要源分支合并过去的目标分支
 */
function gitMergeFunc (currentBranch, targetBranch) {
  return new Promise((resolve, reject) => {
    if (!targetBranch) return resolve()
    // 合并的分支是同一个
    if (currentBranch === targetBranch) {
      logger.warn(`Branch "${currentBranch}" no need to merge "${targetBranch}" because of the same branch`)
      return resolve()
    }

    logger.highlight(`start -> 合并： ${currentBranch} 到 ${targetBranch} 分支`)

    // 是否存在目标分支
    exec(`git ls-remote origin ${targetBranch}`)
    exec(`git checkout ${targetBranch}`)
    exec(`git pull origin ${targetBranch}`)
    exec(`git merge ${currentBranch}`)
    exec(`git push origin ${targetBranch}`)

    logger.highlight(`end <- 合并： ${currentBranch} 到 ${targetBranch} 分支`)
    return resolve(`${targetBranch} merge success!`)
  })
}

/**
 * 模拟执行输出
 * @param {String} command 执行命令
 * @param {Object} options 选项
 * @returns
 */
function exec (command, options) {
  shell.echo(chalk.cyanBright(TAG, `${command}`))
  // return new Promise((resolve, reject) => {
  const execResult = shell.exec(command, options)
  const execInfo = {
    code: execResult.code,
    message: execResult.stderr,
    output: execResult.stdout
  }
  if (execResult.code !== CODE.SUCCESS_CODE) {
    throw execInfo
  }
  return execInfo
  // })
}

/**
 * 判断是否执行错误：code!==0
 * @param {String} commandResult 执行命令
 */
function isTimeout (commandResult) {
  if (commandResult.code !== 0) {
    echoAndExit('执行超时，请重试')
  } else {
    return commandResult
  }
}

/**
 * 输出错误log并结束进程
 * @param {String} word log
 */
function echoAndExit (word) {
  shell.echo(chalk.redBright(TAG, `${word}`))
  shell.exit(1)
}

/**
 * 获取git改动文件清单
 * @param {String} modifyStr
 * @returns Array<{name<String>,value<String>}>  文件列表
 */
function getModifyFilesList (modifyStr) {
  const filesList = modifyStr.split('\n')
  const filesFormat = []
  filesList.map(item => {
    const file = item.slice(3)
    item && filesFormat.push({ name: file, value: file })
    return item
  })
  return filesFormat
}

/**
 * 程序结束
 * @param {*} currentBranch 提交前分支
 */
function finishProgram (currentBranch) {
  exec(`git checkout ${currentBranch}`)
  logger.info('执行结束') // ['success','failed']
  shell.exit(0)
}

module.exports = {
  gitMergeFunc,
  exec,
  isTimeout,
  echoAndExit,
  getModifyFilesList,
  finishProgram
}
