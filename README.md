# ChatHub

## 介绍

迫于说话离不开ChatGPT但是又不想让ChatGPT自动回复，提供了一个Web版的解决方案。通过本项目，您可以将微信聊天托管至自己的服务器，并通过PWA网页小程序结合 GPT 进行交流。本项目支持 GPT 自动生成回复建议、微信多账号同时在线、以及超时自动回复等功能。

## 功能说明

## 安装

在安装 ChatHub 前，请确保您的系统已安装 Docker。执行以下命令以部署 ChatHub：

```bash
echo "DATABASE_USER=your_username\nDATABASE_PASS=your_password\nDATABASE_NAME=your_dbname" > .env
curl -O https://raw.githubusercontent.com/lonelam/chathub/main/docker-compose.yml
docker-compose up -d
```

请替换 `your_username`、`your_password` 和 `your_dbname` 为您的数据库用户名、密码和数据库名，部署在公网的话请注意网络安全。

## 使用方法

部署完成后，访问您的服务器上的 ChatHub前端，地址默认是http://localhost，在。初次使用时，添加用于微信登录和openai接口的token，然后回到主页，扫码登录微信。
创建聊天记录后，admin页（点击扳手进入）可以修改system message从而给自己增加角色设定。

## 贡献

一个好用的前端项目离不开用户反馈，您可以在Issue/Discussion中提出您的宝贵意见，或者直接提交PR。欢迎贡献您的智慧和代码！

## 致谢

特别感谢 Wechaty 团队，为我们提供了稳定有效的微信接入方式。
