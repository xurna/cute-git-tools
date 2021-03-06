const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
  .usage('Usage: git-auto-commit [options]')
  .example([
    ['$0 --commit="feat: 新增功能" --target=feature --sit=wx_dev,h5_dev', '当前分支合并到target，target分别合并到sit分支'],
    ['$0 --commit="feat: 新增功能" --target=feature', '只合到target分支'],
    ['$0 --commit="feat: 新增功能" --sit=wx_dev,h5_dev', '只合到sit分支'],
    ['$0 --commit="feat: 新增功能"', '只提交代码'],
    ['$0 --commit="feat: 新增功能" --config=./git-auto-commit.config.json', '将配置参数放在json文件中']
  ])
  .option('commit', {
    alias: 'm',
    describe: '当前提交的注释，如commit有空格，需要加双引号，如-m="feature: xxx"'
  })
  .option('target', {
    alias: 't',
    describe: '目标分支，基础分支，支持一个'
  })
  .option('sit', {
    alias: 's',
    describe: '部署分支，支持多个，用英文逗号隔开，如test1,test2',
    demandOption: false
  })
  .help()
  .argv

module.exports = {
  argv
}
