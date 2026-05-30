# EdgeOne iirose 图片反代

基于腾讯云 EdgeOne Pages 的边缘函数，实现 `r.iirose.com` 图片资源的透明反向代理。

## 项目结构

```
├── index.html                          # 首页（域名自动适配）
├── iirose-replace.js                   # 浏览器替换脚本
├── edge-functions/
│   └── [[path]].js                     # 边缘函数（透明反代）
└── README.md
```

## 功能特性

- 透明反向代理 `r.iirose.com` 的所有图片资源
- 支持 CORS 跨域，可用于 `<img>` 或 `fetch` 请求
- 智能缓存策略：图片缓存 1 年，其他静态资源 1 天
- 支持 Range 断点续传
- 请求头过滤与响应头清洗
- 自动适配访问域名（首页显示当前域名）

## 部署方式

### EdgeOne Pages（推荐）

1. 在 [EdgeOne Pages 控制台](https://console.tencentcloud.com/edgeone/pages) 创建项目
2. 选择"直接上传"，将项目文件夹拖拽上传
3. 部署完成后即可通过生成的 `*.edgeone.site` 域名访问
4. 可绑定自定义域名

## 浏览器替换脚本

`iirose-replace.js` 可将页面中所有 `r.iirose.com` 的图片链接替换为反代域名。

**使用方式：**

1. 编辑脚本开头的 `PROXY_HOST` 变量为你的反代域名
2. 在浏览器控制台执行，或通过书签脚本加载

```javascript
var s = document.createElement('script');
s.src = 'https://你的域名/iirose-replace.js';
document.body.appendChild(s);
```

## 图片路径格式

iirose 图床的路径规则为：

```
/i/{年}/{月}/{日}/{时}/{混淆文件名}.{后缀}
```

例如：`/i/26/5/18/4/5228-2X.jpg`

## License

MIT
