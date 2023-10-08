import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { getDefConfigInfo, IConfig } from './IConfig';
import { packageJSON } from '../packageJSON';

/**
 * 默认配置文件名
 */
export const defConfigName = 'vcsb.config.js';

/**
 * 默认配置文件地址
 * TODO 当前执行路径下
 */
export const defConfigUrl = path.join(process.cwd(), defConfigName);

/**
 * 配置文件模板
 */
export const configTemUrl = path.join(__dirname, '../../config_tem.js');
/**
 * 配置文件模板字符串
 */
export const configTemStr = fs.readFileSync(configTemUrl).toString().replace('$name', packageJSON.name);

/**
 * 获取默认配置文件
 * @returns
 */
export function getDefConfig() {
  return getConfig(defConfigUrl, '获取默认配置文件错误!');
}

/**
 * 根据路径获取自定义的配置文件
 * @param _url
 * @param a 提示信息
 */
export function getConfig(_url: string, a?: string): Promise<IConfig> {
  let config = getDefConfigInfo();
  try {
    config = require(_url);
  } catch (e) {
    if (a) {
      console.log(chalk.red(a));
      console.log(e);
    }
  }
  return Promise.resolve(config);
}
