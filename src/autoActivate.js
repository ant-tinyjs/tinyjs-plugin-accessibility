/**
 *
 * 自动激活可访问性
 *
 * @example
 *
 * var app = new Tiny.Application({..});
 * Tiny.accessibility.autoActivate(app, {
 *   eventType: 'touchstart',
 * });
 *
 * @function autoActivate
 * @memberof Tiny.accessibility
 * @param {Tiny.Application} app - 初始化的 app
 * @param {object} opts - 可访问性激活参数
 * @param {boolean} opts.debug - 是否调试模式
 * @param {string|string[]} opts.eventType - 双击时触发的事件类型，默认值是：pointerdown，可接受多个事件类型，以数组形式传入，如：['touchstart', 'tap']
 * @param {HTMLElement} opts.cell - 创建的可访问性 DOM 的容器，默认是添加到 canvas 元素后面，你可以通过这个参数自定义容器
 * @param {object} extra - 额外参数
 * @param {boolean} extra.acReader - 你可以从外部判断是否已开启无障碍模式，再通过这个参数传进来，如果不传默认会使用支付宝端的检测判断
 * @param {string} extra.tip - 安卓设备下，如果无法自动检测是否开启无障碍模式，会自动添加一个 button 到 &lt;canvas&gt; 里，用户可以通过这个按钮主动触发开启无障碍模式，这个 tip 就是按钮提示内容。默认是：请点按两次开启无障碍模式
 * @param {function} extra.onActivate - 安卓设备下，用户主动开启无障碍模式后的回调
 * @param {boolean} extra.forceActivate - 对于无法检测的 iOS 设备，可以通过此参数强制开启无障碍模式。注意：兜底方案，需要关注设置后的占比
 */
export default function(app, opts, extra = {}) {
  // 通过 acReader 明确开启可访问性
  if (extra.acReader) {
    return app.renderer.plugins.accessibility.activate(opts);
  }

  // 自动检测开启可访问性
  if (void 0 === extra.acReader) {
    if (Tiny.isMobile.android.device) {
      const button = document.createElement('button');
      button.setAttribute('aria-live', 'assertive');
      button.setAttribute('role', 'alert');
      button.innerText = extra.tip || '请点按两次开启无障碍模式';
      app.view.appendChild(button);
      button.focus();
      button.addEventListener('click', function() {
        // 开启
        app.renderer.plugins.accessibility.activate(opts);
        if (Tiny.isFunction(extra.onActivate)) {
          extra.onActivate(button);
        }
      });
    } else {
      if (extra.forceActivate) {
        app.renderer.plugins.accessibility.activate(opts);
      }
    }
  }
}
