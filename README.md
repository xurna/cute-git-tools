# git 工具库

## 环境
- [node](https://nodejs.org/zh-cn/)
- [git](https://git-scm.com/downloads)
## 安装
```
npm install --save-dev cute-git-tools
or
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
      --add      是否手动执行git add命令，默认--add=auto，执行本脚本自动执行“git
                 add .”；若--add=manual，执行该脚本前需手动执行git add命令
  -m, --commit   当前提交的注释，如commit中间有空格，需要加双引号，如-m="feature: xxx"
  -t, --target   目标分支，基础分支，支持一个
  -s, --sit      部署分支，支持多个，用英文逗号隔开，如test1,test2
      --help     显示帮助信息                                             [布尔]

示例：
  git-auto-commit --add=manual                    脚本不自动执行"git add ."，执行脚本前可根据情况自己手动执行git add命令

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
- 执行自动化提交代码前，请养成良好的代码review习惯，使用`git diff`或者其他工具确认待提交代码无误。
- 在多人开发中，由于每个迭代开发分支都会有所不同，所以更合理的是使用配置文件的方式在本地维护一个提交配置，并在`.gitignore`中忽略当前配置文件，自己在本地维护，不需提交到远端。

## 执行逻辑
![](https://github.com/xurna/cute-git-tools/blob/master/img/flow.png)

## 执行过程
```js
➜ git-auto-commit -m="feat: 新增功能" -t=feature/0715 --sit=wx_dev,h5_dev
================= 自动化提交git脚本即将开始执行 =================
-> git symbolic-ref --short HEAD
dev/0715
-> 
-> 信息确认: dev/0715 -> feature/0715 -> wx_dev,h5_dev [Y/N] ? Y
================= start提交当前分支代码 =================
-> git status
On branch dev/0715
Your branch is up to date with 'origin/dev/0715'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/pages/web/index.vue

no changes added to commit (use "git add" and/or "git commit -a")
-> git add .
-> git commit -m "feat: 新增功能"
husky > pre-commit (node v14.5.0)
[STARTED] Preparing...
[SUCCESS] Preparing...
[STARTED] Running tasks...
[STARTED] Running tasks for *{.js,ts,vue}
[STARTED] Running tasks for *{.scss}
[SKIPPED] No staged files match *{.scss}
[STARTED] eslint . --fix --max-warnings 0
[SUCCESS] eslint . --fix --max-warnings 0
[STARTED] stylelint --fix
[SUCCESS] stylelint --fix
[SUCCESS] Running tasks for *{.js,ts,vue}
[SUCCESS] Running tasks...
[STARTED] Applying modifications...
[SUCCESS] Applying modifications...
[STARTED] Cleaning up...
[SUCCESS] Cleaning up...
husky > commit-msg (node v14.5.0)
[dev/0715 b6549a563] feat: 新增功能
 1 file changed, 1 insertion(+), 1 deletion(-)
-> git ls-remote origin dev/0715
45b13da39da829c3036eeaf0e331118e1c39393f        refs/heads/dev/0715
-> git push origin dev/0715
To git.xxxx.com:health/xxxx.git
   45b13da39..b6549a563  dev/0715 -> dev/0715
================= end提交当前分支代码 =================
================= start合并： dev/0715 到 feature/0715 分支 =================
-> git ls-remote origin feature/0715
b5a2baf9efc77f26e981a3fa711b39c9c5facc5a        refs/heads/feature/0715
-> git checkout feature/0715
Switched to branch 'feature/0715'
Your branch is up to date with 'origin/feature/0715'.
-> git pull origin feature/0715
From git.xxxx.com:health/xxxx
 * branch                feature/0715 -> FETCH_HEAD
   45b13da39..b5a2baf9e  feature/0715 -> origin/feature/0715
Updating 45b13da39..b5a2baf9e
Fast-forward
 src/pages/web/index.vue | 2 ++
 src/pages/web/xx/info.vue  | 6 +++---
 2 files changed, 5 insertions(+), 3 deletions(-)
-> git merge dev/0715
husky > commit-msg (node v14.5.0)
Merge made by the 'recursive' strategy.
 src/pages/web/index.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
-> git push origin feature/0715
To git.xxxx.com:health/xxxx.git
   b5a2baf9e..adf03d2e7  feature/0715 -> feature/0715
================= end合并： dev/0715 到 feature/0715 分支 =================
~~~~~~~~~~~~~~~ feature/0715 merge success! ~~~~~~~~~~~~~~~
================= start合并： feature/0715 到 wx_dev 分支 =================
-> git ls-remote origin wx_dev
7f51663bf5551c321e4ed759fef05aba4c079d62        refs/heads/wx_dev
-> git checkout wx_dev
Switched to branch 'wx_dev'
Your branch is behind 'origin/wx_dev' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
-> git pull origin wx_dev
From git.xxxx.com:health/xxxx
 * branch                wx_dev   -> FETCH_HEAD
   69f2e6474..7f51663bf  wx_dev   -> origin/wx_dev
Updating ad5a2c8d6..7f51663bf
Fast-forward
 src/components/Agreement.vue                       |   1 -
 1 files changed, 113 insertions(+), 104 deletions(-)
-> git merge feature/0715
husky > commit-msg (node v14.5.0)
Merge made by the 'recursive' strategy.
 src/pages/web/eduFund/moudles/insuranceForm.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
-> git push origin wx_dev
To git.xxxx.com:health/xxxx.git
   7f51663bf..d878f626e  wx_dev -> wx_dev
================= end合并： feature/0715 到 wx_dev 分支 =================
================= start合并： feature/0715 到 h5_dev 分支 =================
-> git ls-remote origin h5_dev
739171302f2fd18c3beddc9e3a2bcdc0dc9b38a6        refs/heads/h5_dev
-> git checkout h5_dev
Switched to branch 'h5_dev'
Your branch is up to date with 'origin/h5_dev'.
-> git pull origin h5_dev
From git.xxxx.com:health/xxxx
 * branch                h5_dev   -> FETCH_HEAD
   8e901ff23..739171302  h5_dev   -> origin/h5_dev
Updating 8e901ff23..739171302
Fast-forward
 src/components/Agreement.vue                       |   1 -
 1 files changed, 111 insertions(+), 101 deletions(-)
-> git merge feature/0715
husky > commit-msg (node v14.5.0)
Merge made by the 'recursive' strategy.
 src/pages/web/eduFund/moudles/insuranceForm.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
-> git push origin h5_dev
To git.xxxx.com:health/xxxx.git
   739171302..3bb601284  h5_dev -> h5_dev
================= end合并： feature/0715 到 h5_dev 分支 =================
[
  '~~~~~~~~~~~~~~~ wx_dev merge success! ~~~~~~~~~~~~~~~',
  '~~~~~~~~~~~~~~~ h5_dev merge success! ~~~~~~~~~~~~~~~'
]
```

