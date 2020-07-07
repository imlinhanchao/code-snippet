# Vue Parcel Template
基于 Parcel 打包前端，包含 iView 框架。无缝衔接 Node Express 后端框架的前后端一体代码模板。

## 目录说明
1. bin - 服务启动入口  
2. interface - 业务接口实现   
3. frontend - 前端代码  
    1. assets - 前端资源  
    2. components - 前端组件
    3. store - vue store
    4. theme - 全局样式
    5. views - 界面 vue 文件
4. lib - 公共类库  
5. pubilc - 静态资源  
6. routes - 服务路由  
7. view - 视图  
8. script - 脚本 

## 配置说明
1. 新建数据库`db`(根据需要，第二步配置时填入)；
2. 执行`npm run init`，并根据提示填写信息（仅第一次）；
3. 若需要重新配置数据库，则运行`npm run initdb`。
4. 若需要重置某个表，如：重置`account`表，则执行`npm run initdb -- account`。

## 调试说明
1. 执行`npm install`;
2. 前端执行`npm run dev`，后端使用 Visual Studio Code 运行调试（直接按下`F5`即可）。

## 部署说明
服务器需安装`nodejs`和`npm`。部署执行如下脚本：
```bash
npm install
```

编译前端代码：  
```bash
npm run build
```

启动服务：
```bash
npm start
```

以守护进程方式，启动服务：
```bash
forever start ./bin/www
```
or
```bash
pm2 start ./bin/www
```

## 端口号
- 6789 （可在`config.json`或`npm run init`配置）
