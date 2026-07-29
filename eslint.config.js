import pobConfig from "@pob/root/eslint-config";

export default [...pobConfig.configs.node, ...pobConfig.configs.checkPackages];
