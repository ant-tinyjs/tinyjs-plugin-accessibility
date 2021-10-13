/**
 * 显示对象的可访问性（accessible）属性的默认值，在 {@link Tiny.accessibility.AccessibilityManager} 里使用
 *
 * @mixin accessibleTarget
 * @memberof Tiny.accessibility
 */
export default {
  /**
   * 可访问性默认信息，会在显示对象添加属性 `accessible` 时浅拷贝过去
   *
   * @example
   *
   * // label 类型，仅读内容，不提示点击
   * var sprite = Tiny.Sprite.fromImage('https://gw.alipayobjects.com/as/g/tiny/resources/1.0.0/images/ants/ant.png');
   * sprite.accessible = {
   *  hint: '这是一只小蚂蚁',
   * };
   *
   * // button 类型，提示点击
   * sprite.interactive = true;
   * sprite.accessible = {
   *  hint: '这是一只小蚂蚁，双击有惊喜',
   * };
   *
   * // button 类型，附加属性
   * sprite.accessible = {
   *  attr: {
   *    'title': '这是一只小蚂蚁，双击有惊喜',
   *    'aria-live': 'assertive',
   *  }
   * };
   *
   * @memberof Tiny.accessibility.accessibleTarget
   * @property {string} type - 显示对象的交互类型，比如：button/label（按钮/文本），默认值是：label，如果显示对象设置了 `interactive=true`，那就会认为是 button
   * @property {string} hint - 提示文字，即读屏软件要读出来的内容，即设置 DOM 标签的 `aria-label` 值
   * @property {boolean} renderOnce - 显示对象是否只渲染一次，避免持续播放动画的显示对象对应的 DOM 频繁重绘
   * @property {number} renderIndex - 显示对象 DOM 标签的渲染顺序，数值越小 DOM 标签越靠前，用户在无障碍模式下使用滑动手势可以优先聚焦
   * @property {object} attr - 添加到 DOM 标签上的属性值，你可以添加任何属性，包括 `aria-label`、`aria-live` 等等
   * @property {string} attr.title - 附加的读屏内容，如果没有设置 `hint`，则使用这个，如果同时设置，则优先使用 `hint`
   */
  accessible: {
    type: 'label',
    hint: null,
    renderOnce: false,
    renderIndex: 0,
    attr: {},
  },

  /**
   * 用于存储一些临时信息
   *
   * @private
   */
  _accessible: {
    active: false,
    div: null,
    hitArea: null,
    rendered: false,
  },
};
