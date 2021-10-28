const inquirer = require('inquirer')

/**
 * git add 命令确认选项
 */
function addFilesInquirer (data) {
  const { currentBranch } = data
  return inquirer.prompt([{
    type: 'list',
    message: `是否提交当前分支 ${currentBranch} 的所有改动？`,
    name: 'type',
    default: 'all',
    choices: [
      {
        name: 'all',
        value: 'all',
        checked: true
      },
      {
        name: 'none',
        value: 'none'
      },
      {
        name: 'custom',
        value: 'custom'
      }
    ]
  }])
}

/**
 * git add 自定义选择文件确认选项
 */
function addCustomFilesInquirer (data) {
  const { modifyFilesList } = data
  return inquirer.prompt([{
    type: 'checkbox',
    message: '请选择将要提交的改动文件',
    name: 'files',
    validate (value) {
      if (value.length > 0) return true
      return 'Please select at least one option.'
    },
    choices: [
      ...modifyFilesList
    ]
  }])
}

/**
   * git commit备注输入
   */
function commentsInquirer (data) {
  const { commit } = data
  const promptObj = {
    type: 'input',
    message: '请输入提交备注comments：',
    name: 'comments',
    validate (value) {
      if (value.length > 0) return true
      return 'Please input commit comments.'
    }
  }
  commit && (promptObj.default = commit)
  return inquirer
    .prompt([promptObj])
}

/**
   * 合并确认
   */
function mergeInquirer (data) {
  const { currentBranch, target, sit } = data
  let question = `信息确认: ${currentBranch} 提交代码 [Y/N] ? `
  if (target) {
    question = `分支流合并信息确认: ${currentBranch} -> ${target} [Y/N] ? `
    if (sit) {
      question = `分支流合并信息确认: ${currentBranch} -> ${target} -> ${sit} [Y/N] ? `
    }
  } else if (sit) {
    question = `分支流合并信息确认: ${currentBranch} -> ${sit} [Y/N] ? `
  }

  return inquirer
    .prompt([{
      type: 'input',
      message: question,
      name: 'merge'
    }])
}

module.exports = {
  addFilesInquirer,
  commentsInquirer,
  mergeInquirer,
  addCustomFilesInquirer
}
