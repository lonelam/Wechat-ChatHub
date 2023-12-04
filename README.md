# ChatHub 🌐

## 介绍 🎙️

迫于说话离不开ChatGPT但是又不想让ChatGPT自动回复，提供了一个Web版的解决方案。通过本项目，您可以将微信聊天托管至自己的服务器，并通过PWA网页小程序结合 GPT 进行交流。本项目支持 GPT 自动生成回复建议、微信多账号同时在线、以及超时自动回复等功能。

## 功能说明 ✨

核心功能就是聊天，并用ChatGPT自动生成根据自己人设可以回复的内容，并允许反馈修改。

<img src="https://github.com/lonelam/chathub/assets/16681599/cffbe25c-a114-4312-b008-a746203c8f01" width="45%" /> <img src="https://github.com/lonelam/chathub/assets/16681599/d42e8a74-e19b-4c3d-9342-30d06161c98b" width="45%" />

## 安装 🛠️

在安装 ChatHub 前，请确保您的系统已安装 Docker。执行以下命令以部署 ChatHub：

```bash
echo "DATABASE_USER=your_username\nDATABASE_PASS=your_password\nDATABASE_NAME=your_dbname" > .env
curl -O https://raw.githubusercontent.com/lonelam/chathub/main/docker-compose.yml
docker-compose up -d
```

请替换 `your_username`、`your_password` 和 `your_dbname` 为您的数据库用户名、密码和数据库名，部署在公网的话请注意网络安全。

## 版本更新 🆙

升级到最新版本

```bash
docker compose pull
docker compose up -d
docker image prune -f # 清理无用镜像
```

## 使用方法 📖

部署完成后，访问您的服务器上的 ChatHub前端，地址默认是 `http://localhost` ，在docker-compose.yml文件中自行更改。初次使用时，添加用于微信登录和openai接口的token，然后回到主页，扫码登录微信。创建聊天记录后，admin页（点击扳手进入）可以修改system message从而给自己增加角色设定。

![ChatHub UI](https://github.com/lonelam/chathub/assets/16681599/b8178619-b13e-4216-a4ef-dcb53398caa1)

## 贡献 💡

一个好用的前端项目离不开用户反馈，您可以在Issue/Discussion中提出您的宝贵意见，或者直接提交PR。欢迎贡献您的智慧和代码！

![GitHub issues](https://img.shields.io/github/issues/lonelam/chathub)
![GitHub PRs](https://img.shields.io/github/issues-pr/lonelam/chathub)
![Docker Pulls](https://img.shields.io/docker/pulls/lonelam/chathub)

## RoadMap

- [x] 支持uos方案实现免费部署

- [ ] 支持插件

- [ ] 支持群聊

## 致谢 🙌

特别感谢 Wechaty 团队，为我们提供了稳定有效的微信接入方式。

## Star history

欢迎Star/Fork
[![Star History Chart](https://api.star-history.com/svg?repos=lonelam/chathub&type=Date)](https://star-history.com/#lonelam/chathub&Date)
