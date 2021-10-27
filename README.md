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
- 命令行脚本只支持英文语言的git，中文语言git版本暂不支持。
- 执行自动化提交代码前，请养成良好的代码review习惯，使用`git diff`或者其他工具确认待提交代码无误。
- 在多人开发中，由于每个迭代开发分支都会有所不同，所以更合理的是使用配置文件的方式在本地维护一个提交配置，并在`.gitignore`中忽略当前配置文件，自己在本地维护，不需提交到远端。

## 执行逻辑
![](https://github.com/xurna/cute-git-tools/blob/master/img/flow.png)

## 执行过程
```js
➜ git-auto-commit -m="feat: 优化" -t=feature/1019 -s=wx_dev,h5_dev
[git-auto-commit] 当前执行命令参数：{"_":[],"m":"feat: 优化","commit":"feat: 优化","t":"feature/1019","target":"feature/1019","s":"wx_dev,h5_dev","sit":"wx_dev,h5_dev","$0":"git-auto-commit"}
[git-auto-commit] 自动化提交git脚本即将开始执行
[git-auto-commit] git symbolic-ref --short HEAD
dev/1019
[git-auto-commit] 分支流合并信息确认: dev/1019 -> feature/1019 -> wx_dev,h5_dev [Y/N] ? Y
[git-auto-commit] start -> 提交当前分支 dev/1019 代码
[git-auto-commit] git status
On branch dev/1019
Your branch is up to date with 'origin/dev/1019'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/pages/web/index.vue

no changes added to commit (use "git add" and/or "git commit -a")
[git-auto-commit] git add .
[git-auto-commit] git commit -m "feat: 优化"
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
[dev/1019 6edd78b28] feat: 优化
 1 file changed, 1 insertion(+), 1 deletion(-)
[git-auto-commit] git ls-remote origin dev/1019
e14688e1f95ada3e397bebc9732d201ae8bdbba5        refs/heads/dev/1019
[git-auto-commit] git push origin dev/1019
To git.xxx.com:xxx/xxxx.git
   e14688e1f..6edd78b28  dev/1019 -> dev/1019
[git-auto-commit] end <- 提交当前分支 dev/1019 代码
[git-auto-commit] start -> 合并： dev/1019 到 feature/1019 分支
[git-auto-commit] git ls-remote origin feature/1019
e14688e1f95ada3e397bebc9732d201ae8bdbba5        refs/heads/feature/1019
[git-auto-commit] git checkout feature/1019
Switched to branch 'feature/1019'
Your branch is up to date with 'origin/feature/1019'.
[git-auto-commit] git pull origin feature/1019
From git.xxx.com:xxx/xxxx
 * branch                feature/1019 -> FETCH_HEAD
Already up to date.
[git-auto-commit] git merge dev/1019
Updating e14688e1f..6edd78b28
Fast-forward
 src/pages/web/index.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
[git-auto-commit] git push origin feature/1019
To git.xxx.com:xxx/xxxx.git
   e14688e1f..6edd78b28  feature/1019 -> feature/1019
[git-auto-commit] end <- 合并： dev/1019 到 feature/1019 分支
[git-auto-commit] feature/1019 merge success!
[git-auto-commit] start -> 合并： feature/1019 到 wx_dev 分支
[git-auto-commit] git ls-remote origin wx_dev
8325c49fab8d563b2d2a716a70fe4aee4d4ffa4e        refs/heads/wx_dev
[git-auto-commit] git checkout wx_dev
Switched to branch 'wx_dev'
Your branch is up to date with 'origin/wx_dev'.
[git-auto-commit] git pull origin wx_dev
From git.xxx.com:xxx/xxxx
 * branch                wx_dev   -> FETCH_HEAD
   8336294e8..8325c49fa  wx_dev   -> origin/wx_dev
Updating 8336294e8..8325c49fa
Fast-forward
 src/constants/buttons.js                        |  67 +++
 1 files changed, 67 insertions(+), 60 deletions(-)
[git-auto-commit] git merge feature/1019
husky > commit-msg (node v14.5.0)
Merge made by the 'recursive' strategy.
 src/pages/web/index.vue | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
[git-auto-commit] git push origin wx_dev
To git.xxx.com:xxx/xxxx.git
   8325c49fa..fb39f4eeb  wx_dev -> wx_dev
[git-auto-commit] end <- 合并： feature/1019 到 wx_dev 分支
[git-auto-commit] start -> 合并： feature/1019 到 h5_dev 分支
[git-auto-commit] git ls-remote origin h5_dev
9fe90a202ff348dcfab5f6b34fec24ce0491d480        refs/heads/h5_dev
[git-auto-commit] git checkout h5_dev
Switched to branch 'h5_dev'
Your branch is up to date with 'origin/h5_dev'.
[git-auto-commit] git pull origin h5_dev
From git.xxx.com:xxx/xxxx
 * branch                h5_dev   -> FETCH_HEAD
   fe6717d23..9fe90a202  h5_dev   -> origin/h5_dev
Updating fe6717d23..9fe90a202
Fast-forward
 src/constants/buttons.js                        |  7 +++
 1 files changed, 7 insertions(+), 57 deletions(-)
 create mode 100644 src/pages/web/index.vue
[git-auto-commit] git merge feature/1019
husky > commit-msg (node v14.5.0)
Merge made by the 'recursive' strategy.
 src/pages/web/index.vue            | 173 +++++++++++++++++----
 1 files changed, 258 insertions(+), 27 deletions(-)
[git-auto-commit] git push origin h5_dev
To git.xxx.com:xxx/xxxx.git
   9fe90a202..da7953125  h5_dev -> h5_dev
[git-auto-commit] end <- 合并： feature/1019 到 h5_dev 分支
[git-auto-commit] wx_dev merge success!,h5_dev merge success!
[git-auto-commit] git checkout dev/1019
Switched to branch 'dev/1019'
Your branch is up to date with 'origin/dev/1019'.
[git-auto-commit] 执行结束
```

