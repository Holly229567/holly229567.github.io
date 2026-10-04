# LeLiz 个人网站

网站地址：https://holly229567.github.io

个人经历、开源项目、论文与博客。使用 GitHub Pages 托管，提交后通过 GitHub Actions 自动发布。

## 写博客

在网站底部点击「写文章」。填写标题、文章地址、分类、摘要与正文，切到预览检查排版，然后点击「在 GitHub 发布」。在 GitHub 编辑器中确认内容并提交，网站将自动更新。

文章保存在 `content/posts`，文件名决定文章地址。正文使用 Markdown；公式在网站中由 KaTeX 排版。GitHub 的文件编辑器能修改原始文章，完整排版以网站预览为准。

写作页面的「保存到此浏览器」仅保存本机草稿。要跨设备保存，请下载文章并提交到仓库。将文章头部的 `draft` 设置为 `true` 可以暂停在网站展示；公开仓库里的文件仍公开可读，因此私人草稿应保留在本机。

## 维护主页

修改 `site.json`：姓名、简介、经历、项目与论文。经历和论文当前为空，页面会如实显示。添加经历可使用 `period`、`title`、`description` 字段；论文可使用 `title`、`authors`、`venue`、`year`、`url` 字段。

柳志敏主题图片位于 `public/images`，由站点所有者提供。

## 本地预览

安装 Node.js 22 或以上，执行 `npm ci`、`npm run build`、`npm run dev`，浏览器打开终端提示的本地地址。

每次提交到 `main` 会触发发布。可在仓库 Actions 页面查看进度。
