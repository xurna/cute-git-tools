# git 工具库

## 环境
- [node](https://nodejs.org/zh-cn/),node > v7.6.0
- [git](https://git-scm.com/downloads)
## 安装
```
npm install -g cute-git-tools
```

## git快速提交合并分支代码
由于日常开发git流程大致为：`本地分支`合并`基础分支`，`基础分支`部署到`测试分支`（可能有多个）。当需要不断进行上述操作的情况下，不论是在gitlab上操作还是在在本地操作，操作流程都十分繁琐且低效。所以该脚本旨在解决开发中不断合并分支部署的问题，提高开发及部署效率，同时较少手动合并的风险。

## 查看帮助
命令行输入：git-auto-commit --help
```
Usage: git-auto-commit [options]

选项：
      --version  显示版本号                                               [布尔]
  -m, --commit   当前提交的注释，如commit中间有空格，需要加双引号，如-m="feature: xxx"
  -t, --target   目标分支，基础分支，支持一个
  -s, --sit      部署分支，支持多个，用英文逗号隔开，如test1,test2
      --help     显示帮助信息                                             [布尔]

示例：
  git-auto-commit --commit="feat: 新增功能"        当前分支合并到target，target分别合并到sit分支
  --target=feature --sit=wx_dev,h5_dev        

  git-auto-commit --commit="feat: 新增功能"        只合到target分支
  --target=feature

  git-auto-commit --commit="feat: 新增功能"        只合到sit分支
  --sit=wx_dev,h5_dev

  git-auto-commit --commit="feat: 新增功能"        只提交代码

  git-auto-commit --commit="feat: 新增功能"        将配置参数放在json文件中
  --config=./git-auto-commit.config.json
```
## 使用
### 使用命令行形式
在命令行中直接手动执行：
```
git-auto-commit -m='feat: 优化' -t=feature -s=wx_dev,h5_dev
```
### 在package.json中的script定义
推荐（多人开发）：在package.json下新建配置文件，使用`--config`定义文件位置，后续只需修改文件中的内容，再执行`npm run merge`即可自动化提交代码
```
// git-auto-commit.config.json
{
    "commit": "feat: 使用config配置",
    "target": "feature",
    "sit": "wx_dev,h5_dev"
}
```
```
// package.json
{
  "scripts": {
    "merge": "git-auto-commit --config=./git-auto-commit.config.json",
  },
}
```
或者：直接把执行参数显式放在命令中，然后执行`npm run merge:cli`即可自动化提交代码
```
// package.json
{
  "scripts": {
    "merge:cli": "git-auto-commit -m='feat: 优化' --target=feature --sit=wx_dev,h5_dev"
  },
}
```
如果定义的命令行中既有--config配置，又有自定义的参数配置，则命令行上的配置会覆盖掉config的配置，如定义：
```
// package.json
{
  "scripts": {
    "merge": "git-auto-commit --config=./git-auto-commit.config.json -m='feat: 优化' --sit=test"
  },
}
```
则上面实际上相当于执行命令
```
git-auto-commit -m='feat: 优化' -t=feature -s=test
```

## 注意
- 命令行脚本只支持英文语言的git，中文语言git版本暂不支持。
- 执行自动化提交代码前，请养成良好的代码review习惯，使用`git diff`或者其他工具确认待提交代码无误。
- 在多人开发中，由于每个迭代开发分支都会有所不同，所以更合理的是使用配置文件的方式在本地维护一个提交配置，并在`.gitignore`中忽略当前配置文件，自己在本地维护，不需提交到远端。

## 执行逻辑
![](https://github.com/xurna/cute-git-tools/blob/master/img/flow20211027.png)

## 执行过程
```js
➜ git-auto-commit -t=feature/cli -s=wx_dev,h5_dev
[git-auto-commit] 当前执行命令参数：{"_":[],"t":"feature/cli","target":"feature/cli","s":"wx_dev,h5_dev","sit":"wx_dev,h5_dev","$0":"git-auto-commit"}
[git-auto-commit] git symbolic-ref --short HEAD
[git-auto-commit] 自动化提交git脚本即将开始执行
[git-auto-commit] git status
On branch dev/cli
Your branch is up to date with 'origin/dev/cli'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   README.md

no changes added to commit (use "git add" and/or "git commit -a")
[git-auto-commit] git status -s
[git-auto-commit] start -> 提交当前分支 dev/cli 代码
? 是否提交当前分支 dev/cli 的所有改动？ all
[git-auto-commit] git add .
? 请输入提交备注comments： feature: readme
[git-auto-commit] git commit -m "feat: readme"
[dev/cli 5bfdf6c] feat: readme
 1 file changed, 2 insertions(+)
[git-auto-commit] git ls-remote origin dev/cli
c957236f89bd84241e8d482aaaf040e5f3736758        refs/heads/dev/cli
[git-auto-commit] git push origin dev/cli
To git.xxx.com:xxx/doc.git
   c957236..5bfdf6c  dev/cli -> dev/cli
[git-auto-commit] end <- 提交当前分支 dev/cli 代码
? 分支流合并信息确认: dev/cli -> feature/cli -> wx_dev,h5_dev [Y/N] ?  Y
[git-auto-commit] git status
On branch dev/cli
Your branch is up to date with 'origin/dev/cli'.

nothing to commit, working tree clean
[git-auto-commit] start -> 合并： dev/cli 到 feature/cli 分支
[git-auto-commit] git ls-remote origin feature/cli
c957236f89bd84241e8d482aaaf040e5f3736758        refs/heads/feature/cli
[git-auto-commit] git checkout feature/cli
Switched to branch 'feature/cli'
Your branch is up to date with 'origin/feature/cli'.
[git-auto-commit] git pull origin feature/cli
From git.xxx.com:xxx/doc.git
 * branch            feature/cli -> FETCH_HEAD
Already up to date.
[git-auto-commit] git merge dev/cli
Updating c957236..5bfdf6c
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
[git-auto-commit] git push origin feature/cli
To git.xxx.com:xxx/doc.git.git
   c957236..5bfdf6c  feature/cli -> feature/cli
[git-auto-commit] end <- 合并： dev/cli 到 feature/cli 分支
[git-auto-commit] feature/cli merge success!
[git-auto-commit] start -> 合并： feature/cli 到 wx_dev 分支
[git-auto-commit] git ls-remote origin wx_dev
c957236f89bd84241e8d482aaaf040e5f3736758        refs/heads/wx_dev
[git-auto-commit] git checkout wx_dev
Switched to branch 'wx_dev'
Your branch is up to date with 'origin/wx_dev'.
[git-auto-commit] git pull origin wx_dev
From git.xxx.com:xxx/doc.git
 * branch            wx_dev     -> FETCH_HEAD
Already up to date.
[git-auto-commit] git merge feature/cli
Updating c957236..5bfdf6c
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
[git-auto-commit] git push origin wx_dev
To git.xxx.com:xxx/doc.git.git
   c957236..5bfdf6c  wx_dev -> wx_dev
[git-auto-commit] end <- 合并： feature/cli 到 wx_dev 分支
[git-auto-commit] start -> 合并： feature/cli 到 h5_dev 分支
[git-auto-commit] git ls-remote origin h5_dev
c957236f89bd84241e8d482aaaf040e5f3736758        refs/heads/h5_dev
[git-auto-commit] git checkout h5_dev
Switched to branch 'h5_dev'
Your branch is up to date with 'origin/h5_dev'.
[git-auto-commit] git pull origin h5_dev
From git.xxx.com:xxx/doc.git
 * branch            h5_dev     -> FETCH_HEAD
Already up to date.
[git-auto-commit] git merge feature/cli
Updating c957236..5bfdf6c
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
[git-auto-commit] git push origin h5_dev
To git.xxx.com:xxx/doc.git.git
   c957236..5bfdf6c  h5_dev -> h5_dev
[git-auto-commit] end <- 合并： feature/cli 到 h5_dev 分支
[git-auto-commit] wx_dev merge success!,h5_dev merge success!
[git-auto-commit] git checkout dev/cli
Switched to branch 'dev/cli'
Your branch is up to date with 'origin/dev/cli'.
[git-auto-commit] 执行结束
```

