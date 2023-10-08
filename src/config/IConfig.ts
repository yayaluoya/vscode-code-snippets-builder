/**
 * 配置文件
 */
export interface IConfig {
  /** 模板路径列表 */
  list: {
    /** 触发词 */
    prefix?: ArraifyT<string>;
    /** 路径 */
    path: string;
  }[];
  /** 是否监听 */
  watch?: boolean;
  /** 通过文件后缀获取文件作用域 */
  suffixToScope?: (suffix: string) => string;
}

/**
 * 获取默认配置信息
 * @returns
 */
export function getDefConfigInfo(): IConfig {
  return {
    list: [],
  };
}
