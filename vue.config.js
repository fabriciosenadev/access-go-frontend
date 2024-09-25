const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    https: true,
  },
  pluginOptions: {
    vuetify: {

      chainWebpack: config => {
        config.module
          .rule('vue')
          .rule('ts-loader')
          .use('vue-loader')
          .loader('vue-loader')
          .tap(options => {
            return options;
          });
      },
    }
  }
})
