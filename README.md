# vscode-code-snippets-builder

vscode 的代码片段生成器，非常方便的管理项目中常用的代码片段。

#### 安装

npm i vscode-code-snippets-builder -g

全局命令
vscode-code-snippets-builder
||
vcsb

vcsb -h 查看帮助信息，内容如下

```
vscode-code-snippets-builder的所有命令😀:
   -v --version 查看当前工具版本
   -h --help 查看所有的命令和帮助信息
   -i --init 在当前执行目录下生成默认配置文件
   -c --config <path> 用指定配置文件来运行
----
快捷命令@ vcsb
```

#### 使用方法

先执行 vcsb -i 在当前项目下生成默认的配置文件
然后导出一个默认对象，该对象类型为

```ts
{
    /** 模板路径列表 */
    list: {
        /** 触发词 */
        prefix?: ArraifyT<string>,
        /** 路径 */
        path: string,
    }[],
    /** 是否监听 */
    watch?: boolean,
    /**
     * 通过文件后缀获取文件作用域，由于本工具只实现了前端文件的后缀映射，其它需求见下面文档
     * https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers
     */
    suffixToScope?: (suffix: string) => string;
}
```

然后建一个目录，把模板文件都放里面，比如以下目录

- list
  - js
    - console.js
  - ts
    - console.ts
  - vue
    - index.vue

在当前项目目录下执行 vcsb 命令打包
打包完成后就会生成 vscode 的代码片段文件，当你输入 list-js-console 时就会在你要输入的地方智能键入 list/js/console.js 模板的内容了

模板文件格式

命名格式：

```
a.b.c.d，后面的后缀表示要支持的文件类型，可以为多个。
```

内容格式：

```
< 模板内容，可以为多行 >
----
[<模板描述，只能是单行>]
[< json 字符串，多行，生成 vcsode 模板文件时用来替换相应字段 ，一般用不到，这里只是为扩展或者特殊需求用>]
```
