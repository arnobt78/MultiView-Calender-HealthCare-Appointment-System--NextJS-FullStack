// eslint-config-next 16 exports a flat config array (native format)
import nextConfig from "eslint-config-next";

const nextConfigArray = Array.isArray(nextConfig)
  ? nextConfig
  : Object.values(nextConfig);

const config = [
  ...nextConfigArray,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
