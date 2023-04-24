import { IConfig } from "../config/IConfig";
import { start as start_ } from "../start";

/**
 * 获取配置
 * 主要是为node使用提供ts的能力
 * @param c 
 * @returns 
 */
export function getConfig(f: () => IConfig | Promise<IConfig>) {
    return f();
}

/**
 * 开始运行
 * @param config 
 */
export function start(...arg: Parameters<typeof start_>) {
    start_(...arg);
}