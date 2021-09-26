# node编写命令行工具
为了脚本的可复用性，可以把平时用到的一些便捷的脚本做成命令行的方式，使用时只需要安装对应的npm包就可以了。

## 环境
- 系统：macOS系统
- 依赖：[node](https://nodejs.org/zh-cn/)

## 过程
### 新建js可执行文件
```js
// index.js
#!/usr/bin/env node
console.log('hello world');
```
`#!/usr/bin/env node`：让系统自动去环境设置寻找node目录，再调用对应路径下的解释器程序，该行必不可少。

命令行直接执行：
```js
➜ node index.js
```
上面执行命令前面还需指定node，`#!/usr/bin/env node`的优势没利用起来，利用自动找node执行程序需要修改文件权限。默认文件权限是644(-rw-r--r--)，修改文件的权限为744(-rwxr--r--)。
```js
➜ chmod 744 index.js
```
现在，可以直接用对应路径的文件名就可以执行了。
```js
➜ ./index.js
hello world
```
这样如果文件路径很长的时候执行脚本也简洁，还是没有直接使用命令行这么方便，进一步使用`npm link`
- 首先，命令行执行`npm init`，创建一个`package.json`文件。

设置bin：将bin下的命令作为全局命令安装到node_modules中，此时可以直接运行git-auto-commit命令，不需要使用`node 文件名`或者`对应路径文件名`的方式执行。
```js
// package.json
{
  "name": "cute-git-tools"
  "bin": {
    "git-auto-commit": "./index.js"
  },
}
```
- 执行[npm link](https://docs.npmjs.com/cli/v7/commands/npm-link)：本地开发npm模块时，将npm模块链接到对应的运行项目中去，方便地对模块进行调试和测试。
    - 具体用法：
        1. 项目和模块在同一个目录下，可以使用相对路径，这样它映射的是目录名称：`npm link ../module`
        2. 项目和模块不在同一个目录下[示例](https://www.jianshu.com/p/aaa7db89a5b2)
        - 先cd到模块目录，npm link，会取package-name进行映射，创建全局link
        - 然后cd到项目目录（引用模块的地方），npm link 模块名(package.json中的name包名和package.json中bin中命令都会隐射)
          ```js
          cd ~/projects/node-redis    # go into the package directory
          npm link                    # creates global link
          cd ~/projects/node-bloggy   # go into some other package directory.
          npm link redis              # link-install the package
          ```
        3. 解除link
        - 解除项目和模块link，项目目录下，npm uninstall 模块名
        - 解除模块全局link，模块目录下，npm uninstall -g 模块名

在项目根目录下执行：`npm link`，可以看到本地bin下的`git-auto-commit`命令映射到`lib/node_modules/cute-git-tools/bin/index.js`中，而`lib/node_modules/cute-git-tools`隐射到开发目录，这样，只要开发目录修改，执行命令行时就同步执行修改过的代码了，不用手动安装新的npm包，方便本地调试。
```js
audited 39 packages in 1.375s

5 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

/usr/local/bin/git-auto-commit -> /usr/local/lib/node_modules/cute-git-tools/bin/index.js
/usr/local/lib/node_modules/cute-git-tools -> /Users/xxx/project/git-auto-commit
```
- 执行后`npm link`后，建立映射关系连接，就可以直接用bin下的模块名直接执行命令了。
```js
git-auto-commit
```

## 编写命令行脚本
编写命令行脚本有几个接口说明一下：
### process.argv
`process.argv`返回一个数组，数组前两位是固定的，分别是node程序的路径和脚本存放的位置，从第三位开始才是额外输入的内容。
```js
// index.js
#!/usr/bin/env node
console.log(process.argv);
```
执行：
```
./index.js --name=hello
```
输出：
```js
[
  '/usr/local/bin/node',
  '/Users/xxxx/project/git-auto-commit/index.js',
  '--name=hello'
]
```
### yargs 模块
`yargs`通过解析参数和生成优雅的用户界面来构建交互式命令行工具。
安装：
```
npm install --save yargs
```
修改脚本：
```js
#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
console.log(hideBin(process.argv))
console.log(argv)
console.log('hello', argv.name)
```
执行：
```
./index.js --name=world A
```
输出：
```js
[ '--name=world', 'A' ]
{ _: [ 'A' ], name: 'world', '$0': 'index.js' }
hello world
```
`hideBin`相当于`process.argv.slice(2)`，`yargs`模块的作用就是美化得到的命令行参数，获取参数为一个对象，方便取值。`argv` 对象有一个下划线（_）属性，可以获取非连词线开头的参数。
### child_process
脚本可以通过 `child_process` 模块新建子进程，从而执行 Unix 系统命令。
```js
#!/usr/bin/env node
const name = process.argv[2];
const exec = require('child_process').exec;
const child = exec('echo hello ' + name, function(err, stdout, stderr) {
  if (err) throw err;
  console.log(stdout);
});
```
执行：
```
./index.js world
```

输出：
```
hello world
```

### shelljs 模块
[`shelljs`](http://documentup.com/shelljs/shelljs#installing)是可以使用`Unix shell`命令在(Windows/Linux/macOS)系统上执行的兼容库。
安装：
```
npm install --save shelljs
```
shelljs 模块重新包装了`Unix shell`命令，使其在都可在Windows/Linux/macOS系统使用。
```js
#!/usr/bin/env node
const name = process.argv[2];
const shell = require("shelljs");
shell.exec("echo hello " + name);
```
执行：
```
./index.js world
```

输出：
```
hello world
```
`shell.exec`返回Object类型
```
[String: '* feature/nodecli\n  master\n'] {
  stdout: '* feature/nodecli\n  master\n',
  stderr: '',
  code: 0,
  cat: [Function: bound ],
  exec: [Function: bound ],
  grep: [Function: bound ],
  head: [Function: bound ],
  sed: [Function: bound ],
  sort: [Function: bound ],
  tail: [Function: bound ],
  to: [Function: bound ],
  toEnd: [Function: bound ],
  uniq: [Function: bound ]
}
```
### readline 模块
[`readline`](http://nodejs.cn/api/readline.html)模块提供了用于从可读流（例如 process.stdin）每次一行地读取数据的接口。
安装：
```
npm install --save readline
```
示例：可以用来读取用户输入
```js
#!/usr/bin/env node
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What do you think of Node.js? ', (answer) => {
  console.log(`Thank you for your valuable feedback: ${answer}`);
  rl.close();
});
```
执行：
```
./index.js
```
输出：
```
What do you think of Node.js? Nice
Thank you for your valuable feedback: Nice
```

## 发布npm包
1. 登录npm账号，如果没有账号，则去[npm网站注册](https://www.npmjs.com/signup)一个，或者使用`npm adduser`命令，提示输入账号，密码和邮箱，然后将提示创建成功，如果已有账号，则用以下命令登录。查看是否登录：`npm whoami`。
```
npm login
// 如果npm login或者npm adduser时报如下错误：npm ERR! 404 Registry returned 404 for PUT on undefined
// 则更换npm源
npm set registry https://registry.npmjs.org/
// 或者更新npm至最新版本
npm install -g npm
```

2. 修改npm源，发布前，如果自己之前用的是淘宝镜像源，则需要改成npm源
```
npm set registry https://registry.npmjs.org/
```
3. 发布
```
npm publish
```
4.有需要则恢复淘宝镜像源
```
npm config set registry https://registry.npm.taobao.org
```

## 参考文档：
- [Node.js 命令行程序开发教程](http://www.ruanyifeng.com/blog/2015/05/command-line-with-node.html)
- [shelljs](http://documentup.com/shelljs/shelljs#command-line-use)
- [Building a simple command line tool with npm](https://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm)
