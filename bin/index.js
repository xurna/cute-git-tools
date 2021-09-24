#!/usr/bin/env node
// 将当前分支提交并合到指定分支中
const PATH = require('path')
const shell = require('shelljs')
const readline = require('readline')
const { gitMergeFunc, exec, isTimeout, echoAndExit } = require('../utils/index')
const { argv } = require('../utils/usage')

// 取值顺序：{ ...config配置, ...git-auto-commit命令后的参数}
let mergeConfig = { ...argv } || {}
try {
  const currentConfig = mergeConfig.config ? require(PATH.resolve(process.cwd(), mergeConfig.config)) : {}
  mergeConfig = { ...currentConfig, ...mergeConfig }
} catch (error) {
  echoAndExit(error)
}
console.log(`-> 当前执行命令参数：${JSON.stringify(mergeConfig)}`)

const commit = mergeConfig.commit || '' // 提交的commit注释
const target = mergeConfig.target || '' // 将要合并source分支的target分支（目标分支）
const sit = mergeConfig.sit || '' // 将要合并target分支的sit分支（目标分支）
const sitArr = (sit && sit.split(',')) || []
const add = mergeConfig.add || 'auto'
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 判断系统PATH是否存在git
if (!shell.which('git')) {
  echoAndExit('环境未安装git')
}

console.log('================= 自动化提交git脚本即将开始执行 =================')

// 获取当前分支名
const currentBranch = exec('git symbolic-ref --short HEAD').stdout.replace('\n', '')

shell.echo('-> ')
let question = `-> 信息确认: ${currentBranch} 提交代码 [Y/N] ? `
if (target) {
  question = `-> 分支流合并信息确认: ${currentBranch} -> ${target} [Y/N] ? `
  if (sit) {
    question = `-> 分支流合并信息确认: ${currentBranch} -> ${target} -> ${sit} [Y/N] ? `
  }
} else if (sit) {
  question = `-> 分支流合并信息确认: ${currentBranch} -> ${sit} [Y/N] ? `
}

// 信息确认
rl.question(question, (answer) => {
  if (answer !== 'Y') {
    rl.close()
    shell.exit(1)
  }

  // 提交当前分支
  console.log('================= start提交当前分支代码 =================')
  const currentStatus = exec('git status')
  if (currentStatus.stdout.indexOf('nothing to commit') === -1 && !commit) {
    echoAndExit('当前分支未提交，commit内容未指定，请用 --commit或-m 参数指定')
  }
  if (add !== 'manual') {
    exec('git add .')
  }
  const commitStatus = exec(`git commit -m "${commit}"`)
  console.log('---commitStatus---', commitStatus)
  if (commitStatus.code !== 0) {
    echoAndExit('eslint 不通过，请修改后提交')
  }
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
  console.log('================= end提交当前分支代码 =================')

  // 合并到target分支
  gitMergeFunc(currentBranch, target).then((targetResult) => {
    targetResult && console.log(targetResult)
    // 合并到部署分支
    const promiseFunc = []
    if (sitArr.length > 0) {
      for (let i = 0; i < sitArr.length; i++) {
        const sitBranch = sitArr[i]
        promiseFunc.push(gitMergeFunc(target || currentBranch, sitBranch))
      }
      Promise.all(promiseFunc).then((deployResult) => {
        console.log(deployResult) // ['success','failed']
        exec(`git checkout ${currentBranch}`)
        shell.exit(1)
      }).catch((err) => {
        rl.close()
        echoAndExit(err.message)
      })
    } else {
      exec(`git checkout ${currentBranch}`)
      rl.close()
      shell.exit(1)
    }
  }).catch((err) => {
    rl.close()
    echoAndExit(err.message)
  })
})
