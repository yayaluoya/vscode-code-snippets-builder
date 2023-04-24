import { IOp as IOp_, getCmdOp } from "yayaluoya-tool/dist/node/getCmdOp";

/** 
 * 命令行选项
 */
export interface IOp extends IOp_ {
    /** 帮助 */
    help: boolean;
    /** 初始化 */
    init: boolean;
    /** 按照指定配置文件运行 */
    config: string;
}

/**
 * 获取命令行选项
 */
export function getOp() {
    return getCmdOp<IOp>((program) => {
        program.option('-h --help')
            .option('-i --init')
            .option('-c --config <path>')
    });
}