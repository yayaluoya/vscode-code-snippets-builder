import { IConfig } from "./config/IConfig";
import fs from "fs";
import path from "path";
import { ArrayUtils } from "yayaluoya-tool/dist/ArrayUtils";
import { getComPath } from "./utils/getComPath";
import { glob } from 'glob'
import { getAbsolute } from "./utils/getAbsolute";
import { packageJSON } from "./packageJSON";
import { JSONPar } from "yayaluoya-tool/dist/JSONPar";
import chokidar from "chokidar";
import chalk from "chalk";
import { createThrottleFun } from "yayaluoya-tool/dist/throttleAntiShake";

/**
 * 开始
 * @param config 
 */
export function start(config: IConfig) {
    // console.log('开始');
    // console.dir(config, {
    //     depth: null,
    // });
    let f = createThrottleFun(() => {
        build(config.list);
        console.log(chalk.green(`打包完成`), new Date().toLocaleString());
    }, 500);
    if (config.watch) {
        console.log(chalk.yellow('开始监听:'));
        chokidar.watch(config.list.map(_ => _.path)).on('all', async (event, _) => {
            console.log(chalk.gray(`文件@${_}`), chalk.yellow(event), new Date().toLocaleString().split(' ')[1]);
            f();
        });
    } else {
        f();
    }
}

/**
 * 项目
 */
interface Item {
    /** 代码段名称 */
    name: string;
    /** 作用域 */
    scope: string[];
    /** 
     * 在智能感知中显示代码段的触发词
     * 格式为a-b-c 
     * 子字符串匹配是在前缀上执行的，因此在这种情况下，“fc”可以匹配“for-const”。
     * */
    prefix: string;
    /** 代码内容 */
    body: string[];
    /** 智能感知显示的代码段的可选说明 */
    description: string;
    /** 文件模板代码段 */
    isFileTemplate: boolean;
}

/**
 * 打包
 * @param list 打包列表
 */
function build(list: IConfig['list']) {
    let itemList: Item[] = [];
    for (let { prefix, path: filePath } of list) {
        filePath = getComPath(getAbsolute(filePath));
        let pathStat = fs.statSync(filePath, {
            throwIfNoEntry: false,
        })
        if (!pathStat) { break; }
        if (pathStat.isFile()) {
            itemList.push(byStrToItem(
                fs.readFileSync(filePath).toString(),
                path.basename(filePath),
                prefix)
            );
        }
        else if (pathStat.isDirectory()) {
            let paths = glob.sync(`${filePath.replace(/\/+$/, '')}/**`, {
                cwd: filePath,
                absolute: false,
                nodir: true,
            });
            itemList.push(...paths.map(_ => {
                return byStrToItem(
                    fs.readFileSync(path.join(filePath, _)).toString(),
                    _,
                    prefix)
            }));
        }
    }
    //创建目录
    let path1 = path.join(process.cwd(), './.vscode/');
    try {
        fs.mkdirSync(path1);
    } catch {
        //
    }
    //写入文件
    let path2 = path.join(path1, `./${packageJSON.name}.code-snippets`);
    fs.writeFileSync(path2, JSON.stringify(itemList.reduce((a, b) => {
        a[b.name] = {
            ...b,
            name: undefined,
        };
        return a;
    }, {}), undefined, 4));
}

/**
 * 根据字符串生成item
 * @param str 文件内容
 * @param filePath 文件路径，注意相对的，不是绝对的
 * @param prefix 触发词
 * @returns 
 */
function byStrToItem(str: string, filePath: string, prefix: ArraifyT<string> = []): Item {
    let strReg = str.match(/^([\s\S]*?)(?:[\n\r]+----[\n\r]+([\s\S]*))?$/);
    let prefixs = ArrayUtils.arraify(prefix);
    let filePaths = getComPath(filePath).split('/').filter(Boolean);
    let filePrefixs = filePaths.splice(0, filePaths.length - 1);
    let fileName = filePaths[filePaths.length - 1];
    let fileNameReg = fileName.match(/^([^.]+)((?:\.\w+)+)$/);
    let otherReg = (strReg?.[2] || '').match(/^(?:[\n\r]*)([^\n\r]+)(?:[\n\r]+([\s\S]*))?$/);
    return {
        name: [...prefixs, ...filePrefixs, fileNameReg[1]].join('-'),
        scope: fileNameReg[2].split('.').filter(Boolean),
        prefix: [...prefixs, ...filePrefixs, fileNameReg[1]].join('-'),
        body: (strReg?.[1] || '').split(/\n\r|\r\n|\n|\r/g),
        description: otherReg?.[1] || '',
        isFileTemplate: false,
        ...JSONPar(otherReg?.[2] || '', {}),
    };
}