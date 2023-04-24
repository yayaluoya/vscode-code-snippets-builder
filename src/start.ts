import { IConfig } from "./config/IConfig";

/**
 * 开始
 * @param config 
 */
export function start(config: IConfig) {
    console.log('开始');
    console.dir(config, {
        depth: null,
    });
    setTimeout(() => {

    }, 3000);
}