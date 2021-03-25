# tinyjs-plugin-accessibility

> 提供给特殊人群的可访问性渲染插件
>
> Renderer plugin for interaction accessibility for end-users with physical impairments which require screen-renders

## 查看demo

http://tinyjs.net/plugins/tinyjs-plugin-accessibility.html#demo

## 引用方法

- 推荐作为依赖使用

  - `npm install tinyjs-plugin-accessibility --save`

- 也可以直接引用线上cdn地址，注意要使用最新的版本号，例如：

  - https://gw.alipayobjects.com/as/g/tiny-plugins/tinyjs-plugin-accessibility/0.0.2/index.js
  - https://gw.alipayobjects.com/as/g/tiny-plugins/tinyjs-plugin-accessibility/0.0.2/index.debug.js

## 起步
首先当然是要引入，推荐`NPM`方式，当然你也可以使用`CDN`或下载独立版本，先从几个例子入手吧！

##### 1、最简单的例子

引用 Tiny.js 源码
``` html
<script src="https://gw.alipayobjects.com/os/lib/tinyjs/tiny/1.5.1/tiny.js"></script>
```
``` js
require('tinyjs-plugin-accessibility');
// 或者
// import 'tinyjs-plugin-accessibility';

var app = new Tiny.Application({..});
// 全部开启无障碍
app.renderer.plugins.accessibility.activate({
  debug: true,
  eventType: 'touchstart',
});
```

``` js
var app = new Tiny.Application({..});
var acReader = function() {
  return .. // 通过接口或 userAgent 自行判断是否已开启无障碍模式
};
// 自动激活可访问性
Tiny.accessibility.autoActivate(app, {
  eventType: 'touchstart',
}, {
  acReader,
});
```

## 依赖
- `Tiny.js`: [Link](http://tinyjs.net/api)

## API文档

http://tinyjs.net/plugins/tinyjs-plugin-accessibility.html#docs
