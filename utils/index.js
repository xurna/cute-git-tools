const shell = require('shelljs')
const chalk = require('chalk')
const TAG = '[git-auto-commit]'

/**
 * 合并分支
 * @param {String} currentBranch 源分支
 * @param {String} targetBranch 需要源分支合并过去的目标分支
 */
function gitMergeFunc (currentBranch, targetBranch) {
  return new Promise((resolve, reject) => {
    if (!targetBranch) return resolve()
    console.log(chalk.greenBright(TAG, `start -> 合并： ${currentBranch} 到 ${targetBranch} 分支`))
    // 是否存在目标分支
    const isTargetExist = exec(`git ls-remote origin ${targetBranch}`).stdout
    if (!isTargetExist) {
      console.log(chalk.greenBright(TAG, `end <- 合并： ${currentBranch} 到 ${targetBranch} 分支`))
      return reject(new Error(`${targetBranch} 目标分支不存在，请检查`))
    }

    // 合并的分支是同一个
    if (currentBranch === targetBranch) return resolve('No need to merge because of the same branch')

    const checkoutExec = exec(`git checkout ${targetBranch}`)
    const checkoutOutput = checkoutExec.stdout
    const checkoutError = checkoutExec.stderr
    console.log('checkout exec:', checkoutOutput, checkoutError)
    if ((checkoutOutput.indexOf('overwritten by checkout') > -1 && checkoutOutput.indexOf('error') > -1) || checkoutError.indexOf('error') > -1) {
      return reject(new Error('当前提示error，请检查'))
    }

    exec(`git pull origin ${targetBranch}`)
    const mergeTarget = exec(`git merge ${currentBranch}`)
    // 合并有冲突
    if (mergeTarget.stdout.indexOf('CONFLICT') > -1) {
      console.log(chalk.greenBright(TAG, `end <- 合并： ${currentBranch} 到 ${targetBranch} 分支`))
      return reject(new Error(`合并有冲突，请手动解决！${targetBranch} merge failed! `))
    }

    if (mergeTarget.stdout.indexOf('error') > -1 || mergeTarget.stderr.indexOf('error') > -1) {
      console.log(chalk.greenBright(TAG, `end <- 合并： ${currentBranch} 到 ${targetBranch} 分支`))
      return reject(new Error('当前提示error，请检查'))
    }

    isTimeout(exec(`git push origin ${targetBranch}`))
    console.log(chalk.greenBright(TAG, `end <- 合并： ${currentBranch} 到 ${targetBranch} 分支`))
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
  return shell.exec(command, options)
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
  console.log(chalk.cyanBright(TAG, '执行结束')) // ['success','failed']
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
