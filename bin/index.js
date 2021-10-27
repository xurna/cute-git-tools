#!/usr/bin/env node
// 将当前分支提交并合到指定分支中
const PATH = require('path')
const shell = require('shelljs')
const chalk = require('chalk')
const { isTimeout, gitMergeFunc, exec, echoAndExit, getModifyFilesList, finishProgram } = require('../utils/index')
const { addFilesInquirer, commentsInquirer, mergeInquirer, addCustomFilesInquirer } = require('../utils/inquirer')
const { argv } = require('../utils/usage')

const TAG = '[git-auto-commit]'

// 取值顺序：{ ...config配置, ...git-auto-commit命令后的参数}
let mergeConfig = { ...argv } || {}
try {
  const currentConfig = mergeConfig.config ? require(PATH.resolve(process.cwd(), mergeConfig.config)) : {}
  mergeConfig = { ...currentConfig, ...mergeConfig }
} catch (error) {
  echoAndExit(error)
}
console.log(chalk.cyanBright(TAG, `当前执行命令参数：${JSON.stringify(mergeConfig)}`))

// 获取当前分支名
const currentBranch = exec('git symbolic-ref --short HEAD', { silent: true }).stdout.replace('\n', '')
// 提交的commit注释
const commit = mergeConfig.commit || ''
// 将要合并source分支的target分支（目标分支）
const target = mergeConfig.target || ''
// 将要合并target分支的sit分支（目标分支）
const sit = mergeConfig.sit || ''
const sitArr = (sit && sit.split(',')) || []
const add = mergeConfig.add || 'auto'

// 判断系统PATH是否存在git
if (!shell.which('git')) {
  echoAndExit('环境未安装git')
}

console.log(chalk.greenBright(TAG, '自动化提交git脚本即将开始执行'))

exec('git status')

const gitStatusOfModifyFilesOutput = exec('git status -s | cut -c4-', { silent: true }).stdout
const modifyFilesList = getModifyFilesList(gitStatusOfModifyFilesOutput)
try {
  // 提交当前分支
  console.log(chalk.greenBright(TAG, `start -> 提交当前分支 ${currentBranch} 代码`))
  // 有改动
  if (modifyFilesList.length > 0) {
    addFilesInquirer({ currentBranch }).then((answers) => {
      const addFilesType = answers.type
      if (addFilesType === 'all') {
        exec('git add .')
        commentsInquirerHandler()
      } else if (addFilesType === 'none') {
        console.log('no add files')
      } else if (addFilesType === 'custom') {
        addCustomFilesInquirer({ modifyFilesList }).then((answers) => {
          const addFiles = answers.files
          const files = addFiles.join(' ')
          exec('git add ' + files)
          commentsInquirerHandler()
        })
      }
    })
  } else {
    mergeInquirerHandler()
  }
} catch (error) {
  echoAndExit('inquirer err:', error)
}

/**
 * git commit 提交查询回调
 */
function commentsInquirerHandler () {
  commentsInquirer({ commit }).then((answers) => {
    const comments = answers.comments
    if (comments) {
      const commitStatus = exec(`git commit -m "${comments}"`)
      if (commitStatus.stderr.indexOf('problem') > 0 || commitStatus.stderr.indexOf('error') > 0) {
        echoAndExit('eslint 不通过，请修改后提交')
      }
    }

    mergeInquirerHandler()
  })
}

/**
 * git merge 信息确认回调
 */
function mergeInquirerHandler () {
  // 判断远端是否有该分支
  const isTargetExist = exec(`git ls-remote origin ${currentBranch}`)
  if (isTargetExist.code !== 0) {
    echoAndExit('执行超时，请重试')
  } else {
    if (!isTargetExist.stdout) {
      isTimeout(exec(`git push --set-upstream origin ${currentBranch}`))
    } else {
      isTimeout(exec(`git push origin ${currentBranch}`))
    }
  }
  console.log(chalk.greenBright(TAG, `end <- 提交当前分支 ${currentBranch} 代码`))

  mergeInquirer({ currentBranch, target, sit }).then((answers) => {
    const answer = answers.merge
    if (answer !== 'Y') {
      console.log(chalk.cyanBright(TAG, '执行已取消'))
      shell.exit(1)
    }

    exec('git status')

    // 合并到target分支
    gitMergeFunc(currentBranch, target).then((targetResult) => {
      targetResult && console.log(chalk.yellow(TAG, targetResult))
      // 合并到部署分支
      const promiseFunc = []
      if (sitArr.length > 0) {
        for (let i = 0; i < sitArr.length; i++) {
          const sitBranch = sitArr[i]
          promiseFunc.push(gitMergeFunc(target || currentBranch, sitBranch))
        }
        Promise.all(promiseFunc).then((deployResult) => {
          console.log(chalk.yellow(TAG, deployResult)) // ['success','failed']
          finishProgram(currentBranch)
        }).catch((err) => {
          echoAndExit(err.message)
        })
      } else {
        finishProgram(currentBranch)
      }
    }).catch((err) => {
      echoAndExit(err.message)
    })
  })
}
