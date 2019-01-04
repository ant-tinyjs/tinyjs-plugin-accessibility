import accessibleTarget from './accessibleTarget';

const DIV_TOUCH_SIZE = 100;
const DIV_TOUCH_POS_X = 0;
const DIV_TOUCH_POS_Y = 0;
const DIV_TOUCH_ZINDEX = 2;

/**
 * The Accessibility manager recreates the ability to tab and have content read by screen readers. This is very important as it can possibly help people with disabilities access content.
 *
 * Much like interaction any DisplayObject can be made accessible. This manager will map the events as if the mouse was being used, minimizing the effort required to implement.
 *
 * An instance of this class is automatically created by default, and can be found at renderer.plugins.accessibility
 *
 * @class
 * @memberof Tiny.accessibility
 */
class AccessibilityManager {
  /**
   * @param {Tiny.CanvasRenderer|Tiny.WebGLRenderer} renderer - A reference to the current renderer
   */
  constructor(renderer) {
    // first we create a div that will sit over the TinyJS element. This is where the div overlays will go.
    const div = document.createElement('div');

    div.style.width = `${DIV_TOUCH_SIZE}px`;
    div.style.height = `${DIV_TOUCH_SIZE}px`;
    div.style.position = 'absolute';
    div.style.top = `${DIV_TOUCH_POS_X}px`;
    div.style.left = `${DIV_TOUCH_POS_Y}px`;
    div.style.zIndex = DIV_TOUCH_ZINDEX;
    div.style.pointerEvents = 'none';

    /**
     * This is the dom element that will sit over the TinyJS element. This is where the div overlays will go.
     *
     * @member {HTMLElement}
     * @private
     */
    this.div = div;

    /**
     * @member {number}
     * @private
     */
    this.dpi = renderer.resolution;

    /**
     * A simple pool for storing divs.
     *
     * @member {HTMLElement[]}
     * @private
     */
    this.pool = [];

    /**
     * This is a tick used to check if an object is no longer being rendered.
     *
     * @member {number}
     * @private
     */
    this.renderId = 0;

    /**
     * Setting this to true will visually show the divs.
     *
     * @member {boolean}
     * @default false
     */
    this.debug = false;

    /**
     * 双击时触发的事件类型，默认值是：pointerdown，可以数组形式接受多个事件类型，如：['touchstart', 'tap']
     *
     * @member {string|string[]}
     * @default "pointerdown"
     */
    this.eventType = 'pointerdown';

    /**
     * The renderer this accessibility manager works for.
     *
     * @member {Tiny.SystemRenderer}
     */
    this.renderer = renderer;

    /**
     * The array of currently active accessible items.
     *
     * @member {Tiny.DisplayObject[]}
     * @private
     */
    this.children = [];

    /**
     * stores the state of the manager. If there are no accessible objects or the mouse is moving, this will be false.
     *
     * @member {boolean}
     * @private
     */
    this.isActive = false;

    /**
     * @private
     */
    this._sx = 0;

    /**
     * @private
     */
    this._sy = 0;
  }

  /**
   * Activating will cause the Accessibility layer to be shown. This is called by autoActivate function or manually.
   *
   * @example
   * var app = new Tiny.Application({..});
   * // 全部开启无障碍（容器环境下或生产环境下请最好根据无障碍模式开启状态来判断是否激活）
   * app.renderer.plugins.accessibility.activate({
   *   debug: true,
   *   eventType: 'touchstart',
   * });
   *
   * @param {object} opts - 可访问性激活参数
   * @param {boolean} opts.debug - 是否调试模式
   * @param {string|string[]} opts.eventType - 双击时触发的事件类型，默认值是：pointerdown，可接受多个事件类型，以数组形式传入，如：['touchstart', 'tap']
   * @param {HTMLElement} opts.cell - 创建的可访问性 DOM 的容器，默认是添加到 canvas 元素后面，你可以通过这个参数自定义容器
   */
  activate(opts = {}) {
    const { debug = false, cell = null, eventType } = opts;

    this.debug = debug;
    cell && (this.div = cell);
    eventType && (this.eventType = eventType);

    if (this.isActive) {
      return;
    }

    this.isActive = true;

    this.updateDiv();

    this.renderer.on('postrender', this.update, this);

    if (this.renderer.view.parentNode) {
      this.renderer.view.parentNode.appendChild(this.div);
    }
  }

  /**
   * Deactivating will cause the Accessibility layer to be hidden. This is called when a user moves the mouse.
   */
  deactivate() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    this.renderer.off('postrender', this.update);

    if (this.div.parentNode) {
      this.div.parentNode.removeChild(this.div);
    }
  }

  /**
   * This recursive function will run through the scene graph and add any new accessible objects to the DOM layer.
   *
   * @param {Tiny.Container} displayObject - The DisplayObject to check.
   * @private
   */
  updateAccessibleObjects(displayObject) {
    if (!displayObject.visible || !displayObject.renderable) {
      return;
    }

    if (displayObject.accessible) {
      if (!(displayObject._accessible && displayObject._accessible.active)) {
        this.addChild(displayObject);
      }

      displayObject.renderId = this.renderId;
    }

    const children = displayObject.children;

    for (let i = 0; i < children.length; i++) {
      this.updateAccessibleObjects(children[i]);
    }
  }

  /**
   * @private
   */
  updateDiv() {
    const { view, width: renderWidth, height: renderHeight } = this.renderer;
    const { width, height, left, top } = view.getBoundingClientRect();
    const dpi = this.dpi;
    let div = this.div;

    this._sx = width / renderWidth;
    this._sy = height / renderHeight;

    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.width = `${renderWidth / dpi}px`;
    div.style.height = `${renderHeight / dpi}px`;
  }

  /**
   * Before each render this function will ensure that all divs are mapped correctly to their DisplayObjects.
   *
   * @private
   */
  update() {
    const {
      renderingToScreen,
      _lastObjectRendered,
    } = this.renderer;

    if (!renderingToScreen) {
      return;
    }

    // update children...
    this.updateAccessibleObjects(_lastObjectRendered);

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (child.renderId !== this.renderId) {
        child._accessible.active = false;

        Tiny.removeItems(this.children, i, 1);
        this.div.removeChild(child._accessible.div);
        this.pool.push(child._accessible.div);
        child._accessible.div = null;

        i--;

        if (this.children.length === 0) {
          this.deactivate();
        }
      } else {
        // map div to display..
        let { _accessible, hitArea, worldTransform: wt } = child;
        const { div } = _accessible;
        const sx = this._sx;
        const sy = this._sy;
        const dpi = this.dpi;

        if (hitArea) {
          if (child._accessible.hitArea !== hitArea) {
            div.style.left = `${(wt.tx + (hitArea.x * wt.a)) * sx}px`;
            div.style.top = `${(wt.ty + (hitArea.y * wt.d)) * sy}px`;
            div.style.width = `${hitArea.width * wt.a * sx}px`;
            div.style.height = `${hitArea.height * wt.d * sy}px`;
            child._accessible.hitArea = hitArea;
          }
        } else {
          hitArea = child.getBounds();

          this.capHitArea(hitArea);

          div.style.left = `${hitArea.x * sx * dpi}px`;
          div.style.top = `${hitArea.y * sy * dpi}px`;
          div.style.width = `${hitArea.width * sx * dpi}px`;
          div.style.height = `${hitArea.height * sy * dpi}px`;
          child._accessible.hitArea = hitArea;
        }

        // update div/button attrs and hints if they exist and they've changed
        const { attr, hint } = child.accessible;

        if (attr) {
          const attrs = div.attributes;

          for (let i = attrs.length - 1; i >= 0; i--) {
            let { name, value } = attrs[i];
            const attrName = attr[name];

            if (name !== 'style' && attrName && value !== attrName + '') {
              console.log(name, value);
              div.setAttribute(name, attrName);
            }
          }
        }
        if (hint) {
          if (div.getAttribute('aria-label') !== hint) {
            console.log(hint);
            div.setAttribute('aria-label', hint);
          }
        }
      }
    }

    // increment the render id..
    this.renderId++;
  }

  /**
   * TODO: docs.
   *
   * @param {Rectangle} hitArea - TODO docs
   * @private
   */
  capHitArea(hitArea) {
    if (hitArea.x < 0) {
      hitArea.width += hitArea.x;
      hitArea.x = 0;
    }

    if (hitArea.y < 0) {
      hitArea.height += hitArea.y;
      hitArea.y = 0;
    }

    if (hitArea.x + hitArea.width > this.renderer.width) {
      hitArea.width = this.renderer.width - hitArea.x;
    }

    if (hitArea.y + hitArea.height > this.renderer.height) {
      hitArea.height = this.renderer.height - hitArea.y;
    }
  }

  /**
   * Adds a DisplayObject to the accessibility manager
   *
   * @private
   * @param {DisplayObject} displayObject - The child to make accessible.
   */
  addChild(displayObject) {
    displayObject.accessible = Object.assign({}, accessibleTarget.accessible, displayObject.accessible || {});
    if (displayObject.interactive) {
      displayObject.accessible.type = 'button';
    }

    let { type, hint, attr } = displayObject.accessible;
    let div = this.pool.pop();

    if (!div) {
      switch (type) {
        case 'label':
          div = document.createElement('div');
          div.setAttribute('role', 'text');
          break;
        default:
          div = document.createElement('button');
          div.style.borderStyle = 'none';
      }

      div.style.width = `${DIV_TOUCH_SIZE}px`;
      div.style.height = `${DIV_TOUCH_SIZE}px`;
      div.style.backgroundColor = this.debug ? 'rgba(255,0,0,0.5)' : 'transparent';
      div.style.position = 'absolute';
      div.style.zIndex = DIV_TOUCH_ZINDEX;
      div.style.pointerEvents = 'auto';

      div.addEventListener('click', this._onClick.bind(this));
    }

    let { title } = attr;

    if (hint) {
      title = hint;
    }
    title && div.setAttribute('aria-label', title);

    // 设置其他属性
    for (const key in attr) {
      if (attr.hasOwnProperty(key)) {
        div.setAttribute(key, attr[key]);
      }
    }

    displayObject._accessible = {
      active: true,
      div,
    };
    div.displayObject = displayObject;

    this.children.push(displayObject);
    this.div.appendChild(div);
  }

  /**
   * Maps the div button press to InteractionManager (click)
   *
   * @private
   * @param {MouseEvent} e - The click event.
   */
  _onClick(e) {
    const interactionManager = this.renderer.plugins.interaction;
    let eventTypes = this.eventType;

    if (!Tiny.isArray(eventTypes)) {
      eventTypes = [eventTypes];
    }
    eventTypes.forEach(function(eventType) {
      interactionManager.dispatchEvent(e.target.displayObject, eventType, interactionManager.eventData);
    });
  }

  /**
   * Destroys the accessibility manager
   */
  destroy() {
    this.div = null;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].div = null;
    }

    this.pool = null;
    this.children = null;
    this.renderer = null;
  }
}

Tiny.WebGLRenderer.registerPlugin('accessibility', AccessibilityManager);
Tiny.CanvasRenderer.registerPlugin('accessibility', AccessibilityManager);

export default AccessibilityManager;
