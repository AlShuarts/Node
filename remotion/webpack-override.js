
/**
 * @type {import('@remotion/cli').WebpackOverrideFn}
 */
module.exports = (config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
      },
    },
  };
};
