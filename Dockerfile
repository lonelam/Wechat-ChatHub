# Stage 1: Building the app
FROM node:21 as builder

WORKDIR /home/app

# Copy package files
COPY package.json yarn.lock ./

# Set custom Yarn registry and install dependencies
RUN yarn config set registry https://registry.npm.taobao.org \
    && yarn config set disturl https://npm.taobao.org/dist \
    && yarn config set puppeteer_download_host https://npm.taobao.org/mirrors \
    && yarn install 
# && pnpm puppet-install

# Copy the rest of your application
COPY . .

# Build the application
RUN yarn build

# Stage 2: Setup the runtime environment
FROM node:21

# Set timezone
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set environment variables
ENV WECHATY_PUPPET=wechaty-puppet-padlocal \
    APT_SOURCE_HOST=mirrors.aliyun.com \
    NODE_ENV=production

WORKDIR /home/app

# Copy built assets from builder stage
COPY --from=builder /home/app .

# Start the app
CMD ["yarn", "run", "start:prod"]
