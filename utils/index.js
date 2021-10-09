const shell = require('shelljs')
const chalk = require('chalk')
const TAG = '[git-auto-commit]'

/**
 *
 * @param {String} currentBranch 源分支
 * @param {String} targetBranch 需要源分支合并过去的目标分支
 */
function gitMergeFunc (currentBranch, targetBranch) {
  return new Promise((resolve, reject) => {
    if (!targetBranch) return resolve()
    console.log(chalk.greenBright(TAG, `start合并： ${currentBranch} 到 ${targetBranch} 分支`))
    // 是否存在目标分支
    const isTargetExist = exec(`git ls-remote origin ${targetBranch}`).stdout
    if (!isTargetExist) {
      console.log(chalk.greenBright(TAG, `end合并： ${currentBranch} 到 ${targetBranch} 分支`))
      return reject(new Error(`${targetBranch} 目标分支不存在，请检查`))
    }
    exec(`git checkout ${targetBranch}`)
    exec(`git pull origin ${targetBranch}`)
    const mergeTarget = exec(`git merge ${currentBranch}`)
    // 合并有冲突
    if (mergeTarget.stdout.indexOf('CONFLICT') > 0) {
      console.log(chalk.greenBright(TAG, `end合并： ${currentBranch} 到 ${targetBranch} 分支`))
      return reject(new Error(`有冲突，请手动解决！${targetBranch} merge failed `))
    } else {
      isTimeout(exec(`git push origin ${targetBranch}`))
      console.log(chalk.greenBright(TAG, `end合并： ${currentBranch} 到 ${targetBranch} 分支`))
      return resolve(`~~~~~~~~~~~~~~~ ${targetBranch} merge success! ~~~~~~~~~~~~~~~`)
    }
  })
}

/**
 * 模拟执行输出
 * @param {String} command 执行命令
 * @returns
 */
function exec (command) {
  shell.echo(chalk.cyanBright(TAG, `${command}`))
  return shell.exec(command)
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

module.exports = {
  gitMergeFunc,
  exec,
  isTimeout,
  echoAndExit
}
