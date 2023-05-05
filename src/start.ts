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
import moment from "moment";

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
        build(config.list, config);
        console.log(chalk.green(`打包完成`), moment().format('YYYY-MM-DD HH:mm:ss'));
    }, 500);
    if (config.watch) {
        console.log(chalk.hex('#e11d74')('开始:'));
        chokidar.watch(config.list.map(_ => _.path)).on('all', async (event, _) => {
            console.log(chalk.yellow(event), chalk.gray(_), moment().format('HH:mm:ss'));
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
    /** 作用域 */
    scope: string;
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
    isFileTemplate?: boolean;
}

/**
 * 打包
 * @param list 打包列表
 */
function build(list: IConfig['list'], config?: IConfig) {
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
                prefix,
                config
            )
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
                    prefix,
                    config
                )
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
        a[b.description.replace(/^\s*|\s*$/, '') || b.prefix] = {
            ...b,
        };
        return a;
    }, {}), undefined, 4));
}

/**
 * 根据字符串生成item
 * @param str 模板内容
 * @param filePath 文件路径，注意相对的，不是绝对的
 * @param prefix 触发词
 * @returns 
 */
function byStrToItem(str: string, filePath: string, prefix: ArraifyT<string> = [], config?: IConfig): Item {
    /** 模板内容分组 */
    let strReg = str.match(/^([\s\S]*?)(?:[\n\r]+----[\n\r]+([\s\S]*))?$/);
    let otherReg = (strReg?.[2] || '').match(/^(?:[\n\r]*)([^\n\r]+)(?:[\n\r]+([\s\S]*))?$/);
    let prefixs = ArrayUtils.arraify(prefix);
    /** 文件路径节点 */
    let filePaths = getComPath(filePath).split('/').filter(Boolean);
    /** 文件路径触发词列表 */
    let filePathPrefixs = filePaths.splice(0, filePaths.length - 1);
    /** 文件名分组 */
    let fileNameReg = filePaths[filePaths.length - 1].match(/^([^.]+)((?:\.\w+)+)?$/);
    return {
        scope: (fileNameReg?.[2] || '').split('.').filter(Boolean).map((s) => suffixToScope(s, config.suffixToScope)).join(','),
        prefix: [...prefixs, ...filePathPrefixs, fileNameReg?.[1]].filter(Boolean).join('-'),
        body: (strReg?.[1] || '').split(/\n\r|\r\n|\n|\r/g),
        description: otherReg?.[1] || '',
        ...JSONPar(otherReg?.[2] || '', {}),
    };
}

/**
 * 文件作用域配置
 */
const scopeConfig: {
    /** 语言 */
    language: string;
    /** 标识符 */
    identifiers: string;
    /** 后缀列表 */
    suffix: string[];
}[] = [
        {
            language: 'CSS',
            identifiers: 'css',
            suffix: ['css'],
        },
        {
            language: 'HTML',
            identifiers: 'html',
            suffix: ['html'],
        },
        {
            language: 'JavaScript',
            identifiers: 'javascript',
            suffix: ['js'],
        },
        {
            language: 'JavaScript JSX',
            identifiers: 'javascriptreact',
            suffix: ['jsx'],
        },
        {
            language: 'JSON',
            identifiers: 'json',
            suffix: ['json'],
        },
        {
            language: 'Less',
            identifiers: 'less',
            suffix: ['less'],
        },
        {
            language: 'SCSS',
            identifiers: 'scss',
            suffix: ['scss'],
        },
        {
            language: 'TypeScript',
            identifiers: 'typescript',
            suffix: ['ts'],
        },
        {
            language: 'TypeScript JSX',
            identifiers: 'typescriptreact',
            suffix: ['tsx'],
        },
        {
            language: 'Vue',
            identifiers: 'vue',
            suffix: ['vue'],
        },
        {
            language: 'XML',
            identifiers: 'xml',
            suffix: ['xml'],
        },
    ];

/**
 * 文件后缀到作用域
 * @param str 
 * @returns 
 */
function suffixToScope(suffix: string, f?: (s: string) => string) {
    return scopeConfig.find(_ => _.suffix.includes(suffix))?.identifiers ?? (f ? f(suffix) ?? suffix : suffix);
}