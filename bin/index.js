#!/usr/bin/env node
// 将当前分支提交并合到指定分支中
const PATH = require('path')
const shell = require('shelljs')
const { gitMergeFunc, exec, echoAndExit, getModifyFilesList, finishProgram } = require('../utils/index')
const { addFilesInquirer, commentsInquirer, mergeInquirer, addCustomFilesInquirer } = require('../utils/inquirer')
const Logger = require('../utils/logger')
const { argv } = require('../utils/usage')
const TAG = '[git-auto-commit]'
const logger = new Logger(TAG)

// 取值顺序：{ ...config配置, ...git-auto-commit命令后的参数}
let mergeConfig = { ...argv } || {}
try {
  const currentConfig = mergeConfig.config ? require(PATH.resolve(process.cwd(), mergeConfig.config)) : {}
  mergeConfig = { ...currentConfig, ...mergeConfig }
} catch (error) {
  echoAndExit(error)
}
logger.info(`当前执行命令参数：${JSON.stringify(mergeConfig)}`)

// 获取当前分支名
let currentBranch = ''
// 提交的commit注释
const commit = mergeConfig.commit || ''
// 将要合并source分支的target分支（目标分支）
const target = mergeConfig.target || ''
// 将要合并target分支的sit分支（目标分支）
const sit = mergeConfig.sit || ''
const sitArr = (sit && sit.split(',')) || []
// const add = mergeConfig.add || 'auto'

// 判断系统PATH是否存在git
if (!shell.which('git')) {
  echoAndExit('环境未安装git')
}

logger.highlight('自动化提交git脚本即将开始执行')

// 主程序
try {
  exec('git status')
  currentBranch = exec('git symbolic-ref --short HEAD', { silent: true }).output.replace('\n', '')
  let modifyFilesList = []
  const modifyFilesListResult = exec('git status -s', { silent: true }).output
  modifyFilesList = getModifyFilesList(modifyFilesListResult)
  // 有改动
  if (modifyFilesList.length > 0) {
    // 提交当前分支
    logger.highlight(`start -> 提交当前分支 ${currentBranch} 代码`)
    addFilesInquirer({ currentBranch }).then((answers) => {
      const addFilesType = answers.type
      if (addFilesType === 'all') {
        exec('git add .')
        commentsInquirerHandler()
      } else if (addFilesType === 'none') {
        logger.warn('no add files')
        mergeInquirerHandler()
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
  echoAndExit('exec err:', error.message)
}

/**
 * git commit 提交查询回调
 */
function commentsInquirerHandler () {
  commentsInquirer({ commit }).then((answers) => {
    const comments = answers.comments
    if (comments) {
      exec(`git commit -m "${comments}"`)
    }

    mergeInquirerHandler()
  })
}

/**
 * git merge 信息确认回调
 */
function mergeInquirerHandler () {
  mergeInquirer({ currentBranch, target, sit }).then((answers) => {
    const answer = answers.merge
    if (answer !== 'Y') {
      logger.info('执行已取消')
      shell.exit(0)
    }
    // 判断远端是否有该分支
    const isBranchExist = exec(`git ls-remote origin ${currentBranch}`).output
    if (!isBranchExist) {
      exec(`git push --set-upstream origin ${currentBranch}`)
    } else {
      exec(`git push origin ${currentBranch}`)
    }

    logger.highlight(`end <- 提交当前分支 ${currentBranch} 代码`)

    exec('git status')

    // 合并到target分支
    gitMergeFunc(currentBranch, target).then(() => {
      // 合并到部署分支
      const promiseFunc = []
      if (sitArr.length > 0) {
        for (let i = 0; i < sitArr.length; i++) {
          const sitBranch = sitArr[i]
          promiseFunc.push(gitMergeFunc(target || currentBranch, sitBranch))
        }
        Promise.all(promiseFunc).then((deployResult) => {
          logger.warn(deployResult) // ['success','failed']
          finishProgram(currentBranch)
        }).catch((err) => {
          echoAndExit(`${err.message} \r ${err.output}`)
        })
      } else {
        finishProgram(currentBranch)
      }
    }).catch((err) => {
      echoAndExit(`${err.message} \r ${err.output}`)
    })
  })
}
