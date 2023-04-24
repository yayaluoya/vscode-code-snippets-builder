/**
 * 配置文件
 */
export interface IConfig {
    /** 打包路径 */
    list: {
        /** 触发词 */
        prefix?: ArraifyT<string>,
        /** 路径 */
        path: string,
    }[],
    /** 监听相关 */
    watch: {},
}

/**
 * 获取默认配置信息
 * @returns 
 */
export function getDefConfigInfo(): IConfig {
    return {
        list: [],
        watch: {},
    };
}