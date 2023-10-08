#!/usr/bin/env node
import fs from 'fs';
import chalk from 'chalk';
import { ObjectUtils } from '../../yayaluoya-tool/obj/ObjectUtils';
import { getOp } from './getOp';
import { configTemStr, defConfigUrl, getConfig, getDefConfig } from '../config/getConfig';
import { packageJSON } from '../packageJSON';
import { cmdSecondCom } from '../../yayaluoya-tool/node/cmdSecondCom';
import { getAbsolute } from '../utils/getAbsolute';
import { getDefConfigInfo } from '../config/IConfig';
import { start } from '../start';

(async () => {
  /** 命令行选项 */
  const opts = getOp();
  /** 处理命令行的各个配置 */
  switch (true) {
    case Boolean(opts.version):
      console.log(chalk.green(`当前${packageJSON.name}的版本@ `) + chalk.yellow(packageJSON.version));
      break;
    case Boolean(opts.help):
      console.log(chalk.hex('#d2e603')(`${packageJSON.name}的所有命令😀:`));
      console.log(chalk.green('   -v --version ') + chalk.gray('查看当前工具版本'));
      console.log(chalk.green('   -h --help ') + chalk.gray('查看所有的命令和帮助信息'));
      console.log(chalk.green('   -i --init ') + chalk.gray('在当前执行目录下生成默认配置文件'));
      console.log(chalk.green('   -c --config <path> ') + chalk.gray('用指定配置文件来运行'));
      console.log(chalk.green('   -w --watch ') + chalk.gray('监听'));
      console.log('----');
      console.log(
        chalk.gray(
          `快捷命令@ ${packageJSON.name
            .split('-')
            .map((_) => _[0])
            .join('')}`,
        ),
      );
      break;
    case Boolean(opts.init):
      let p = Promise.resolve();
      if (
        fs
          .statSync(defConfigUrl, {
            throwIfNoEntry: false,
          })
          ?.isFile()
      ) {
        p = cmdSecondCom(`已经存在配置文件了${defConfigUrl}，是否覆盖 是:y/Y 输入其他字符取消: `).then((input) => {
          if (!/^y$/i.test(input)) {
            throw '';
          }
        });
      }
      p.then(() => {
        fs.writeFileSync(defConfigUrl, configTemStr);
        console.log(chalk.green(`配置文件创建成功 ${defConfigUrl}`));
      }).catch(() => {
        console.log('已取消');
      });
      break;
    //开始
    default:
      const config = getDefConfigInfo();
      //合并配置文件中的配置
      if (Boolean(opts.config)) {
        ObjectUtils.merge(config, await getConfig(getAbsolute(opts.config), '指定配置文件导入错误，将以默认配置运行!'));
      } else {
        ObjectUtils.merge(config, await getDefConfig());
      }
      // 合并命令行参数
      if (typeof opts.watch != 'undefined') {
        config.watch = opts.watch;
      }
      //开始
      start(config);
  }
})();
