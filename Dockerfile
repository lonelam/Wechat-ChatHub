FROM node:21
# RUN npm install -g yarn
WORKDIR /home/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn config set registry https://registry.npm.taobao.org \
    && yarn config set disturl https://npm.taobao.org/dist \
    && yarn config set puppeteer_download_host https://npm.taobao.org/mirrors
RUN yarn install 
# && pnpm puppet-install

FROM node:21
# RUN npm install -g pnpm
ENV APT_SOURCE_HOST="mirrors.aliyun.com"
## 清华镜像源（备选）
# ENV APT_SOURCE_HOST=mirrors.tuna.tsinghua.edu.cn
## 中科大源（备选）
# ENV APT_SOURCE_HOST=mirrors.ustc.edu.cn
# RUN echo "0. 设置 apt 使用镜像源，然后 update" \
#     && sed -i "s@\(deb\|security\).debian.org@${APT_SOURCE_HOST}@g" /etc/apt/sources.list \
#     && cat /etc/apt/sources.list \
#     && apt-get update --fix-missing \
#     # 安装 https 协议需要的依赖
#     && apt-get install -y --no-install-recommends \
#     ca-certificates apt-transport-https \
#     && sed -i "s@http://@https://@g" /etc/apt/sources.list \
#     && echo "1. 安装需要的依赖" 
RUN export WECHATY_PUPPET=wechaty-puppet-padlocal
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone

WORKDIR /home/app
COPY --from=0 /home/app .
COPY . .
CMD [ "yarn", "run", "start:prod" ]