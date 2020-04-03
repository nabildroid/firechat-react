const htmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"]
      }
    ]
  },
  plugins: [
    new htmlWebpackPlugin({
      meta: { viewport: "width=device-width, initial-scale=1" },
      template: "./src/template.html"
    }),
    new MiniCssExtractPlugin()
  ]
};
