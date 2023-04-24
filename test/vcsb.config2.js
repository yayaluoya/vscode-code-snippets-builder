/**
 * 配置文件
 * 详细配置项见说明，或者直接看类型声明
 */
let getConfig;
try {
    getConfig = require("vscode-code-snippets-builder").getConfig;
} catch {
    getConfig = (_) => _();
}

module.exports = getConfig(async () => {
    /**
     * 返回配置信息
     */
    return {
        list: [],
    }
})