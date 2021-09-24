const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
  .usage('Usage: git-auto-commit [options]')
  .example([
    ['$0 --add=manual', '脚本不自动执行"git add ."，执行节本前可根据情况自己手动执行git add命令'],
    ['$0 --commit="feat: 新增功能" --target=feature --sit=wxzy_dev,h5zy_dev', '当前分支合并到target，target分别合并到sit分支'],
    ['$0 --commit="feat: 新增功能" --target=feature', '只合到target分支'],
    ['$0 --commit="feat: 新增功能" --sit=wxzy_dev,h5zy_dev', '只合到sit分支'],
    ['$0 --commit="feat: 新增功能"', '只提交代码'],
    ['$0 --commit="feat: 新增功能" --config=./git-auto-commit.config.json', '将配置参数放在json文件中']
  ])
  .option('add', {
    describe: '是否手动执行git add命令，默认--add=auto，执行本脚本自动执行“git add .”；若--add=manual，执行该脚本前需手动执行git add命令'
  })
  .option('commit', {
    alias: 'm',
    describe: '当前提交的注释，如commit有空格，需要加双引号，如-m="feature: xxx"'
  })
  .option('target', {
    alias: 't',
    describe: '目标分支，基础分支，支持一个'
  })
  .option('sit', {
    describe: '部署分支，支持多个，用英文逗号隔开，如test1,test2',
    demandOption: false
  })
  .help()
  .argv

module.exports = {
  argv
}
