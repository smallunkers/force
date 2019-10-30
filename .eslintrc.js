/**
 * eslint 规则完善与建议
 * http://gitlab.dtwave-inc.com/oner/oner-cli/issues/7
 */

module.exports = {
  extends: ['airbnb', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
  },
  plugins: [
    'react', '@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
    project: './tsconfig.json',
  },
  rules: {
    /**
     * 
     * 基础规则
     */
    // 禁止使用 console
    'no-console': 'off',
    // 强制使用有效的 JSDoc 注释
    'valid-jsdoc': 'error',

    /**
     * 
     * 最佳实践的规则, 比较严格
     */
    // 强制 getter/setter 成对出现在对象中
    'accessor-pairs': 'error',
    /**
     * 强制数组方法的回调函数中有 return 语句
     * Array.from
     * Array.prototype.every
     * Array.prototype.filter
     * Array.prototype.find
     * Array.prototype.findIndex
     * Array.prototype.map
     * Array.prototype.reduce
     * Array.prototype.reduceRight
     * Array.prototype.some
     * Array.prototype.sort
     */
    'array-callback-return': 'error',
    /**
     * 强制类方法使用 this
     * 如果一个类方法不使用 this, 可以安全的做为静态函数出现
     * 正确示例
     * class A {
     *  static sayHi() {
     *    console.log('hi')
     *  }
     * }
     * 
     * class B {
     *  static renderCommon() {
     *    return (
     *      <div>公共的节点结构, 并不需要使用 this</div>
     *    )
     *  }
     * }
     */
    'class-methods-use-this': 'warn',
    /**
     * 与 null 进行比较使用全等比较
     * 错误示例
     * undefined == null
     * 
     * 正确示例
     * undefined === null
     * if (foo === null) {
     *   bar()
     * }
     */
    'no-eq-null': 'error',
    /**
     * 禁止不必要的函数绑定
     * 错误示例
     * const x = function () {
     *  foo()
     * }.bind(bar)
     *
     * 正确示例
     * const x = function () {
     *  foo()
     * }
     */
    'no-extra-bind': 'error',
    /**
     * 禁止 case 语句落空
     * 错误示例
     * switch(foo) {
     *  case 1:
     *    a()
     *  case 2:
     *    b()
     * 
     * 正确示例
     * switch(foo) {
     *  case 1:
     *    a()
     *    break
     *  case 2:
     *    b()
     */
    'no-fallthrough': 'error',
    /**
     * 禁止对函数参数再赋值
     * 错误示例
     * function foo(bar) {
     *  bar = 13
     * }
     */
    'no-param-reassign': 'error',
    /**
     * 禁止在返回语句中赋值
     * 错误示例
     * return foo = bar + 2
     * return foo == bar + 2
     * 
     * 正确示例
     * return (foo = bar + 2)
     */
    'no-return-assign': ['error', 'except-parens'],
    /**
     * 禁用不必要的 call 和 apply
     * 错误示例
     * foo.call(undefined, 1, 2, 3)
     */
    'no-useless-call': 'error',
    // 要求将变量声明放在它们作用域的顶部, 有助于提高可维护性
    'vars-on-top': 'error',

    /**
     * 
     * 与变量声明有关的规则
     */
    // 禁止申明变量后却不使用
    'no-unused-vars': ['warn', {
      vars: 'all', 
      args: 'after-used', 
      ignoreRestSiblings: false, 
      caughtErrors: 'none',
    }],
    // 禁止定义前使用
    'no-use-before-define': 'warn',

    /**
     * 
     * 代码风格相关的规则, 很主观, 可随自我以及项目自身修改
     */
    // 每个缩进级别由 2 个空格组成, 而不是使用 tab
    indent: ['error', 2, {
      // switch 语句缩进 2 个空格
      SwitchCase: 1,
    }],
    // 限制最大长度 200, 指定 tab 字符的宽度为 2
    'max-len': ['error', 200, 2, {
      // 忽略所有拖尾注释和行内注释
      ignoreComments: true,
    }],
    // 一致的 this 别名, 统一用 me
    'consistent-this': ['error', 'me'],
    // 末尾空行
    'eol-last': ['error', 'always'],
    /**
     * 要求函数名与赋值给它们的变量名或属性名相匹配
     * 错误示例
     * const foo = function bar() {}
     * 
     * 正确示例
     * const foo = function foo() {}
     */
    'func-name-matching': 'error',
    /**
     * 限制函数定义中最大参数个数
     * 错误示例
     * function foo (a, b, c, d) {
     *  
     * }
     * 
     * 正确示例
     * function foo ({a, b, c, d}) {
     *  
     * }
     */
    'max-params': ['warn', {
      // 超过三个参数建议通过一个对象传入
      max: 3,
    }],
    /**
     * 要求构造函数首字母大写
     * 正确示例
     * new A()
     */
    'new-cap': ['error', {
      newIsCap: true,
    }],
    /**
     * 链接变量的分配可能导致意外的结果并且难以阅读, 这个使用场景还是很多的
     * 正确示例
     * this.a = this.b = 1
     */
    'no-multi-assign': 'off',
    // 强制在花括号内使用一致的换行
    'object-curly-newline': 'off',
    // 禁止使用分号
    semi: ['error', 'never'],
    // 禁止使用行尾空白(空格, tab, 和其它 unicode 空白字符)
    'no-trailing-spaces': 'off',
    /**
     * 禁止使用拖尾逗号
     * 当最后一个元素或属性与闭括号 `]` 或 `}` 在不同的行时, 要求使用拖尾逗号
     * 当在同一行时, 禁止使用拖尾逗号
     */
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    // 禁止标识符中有悬空下划线
    'no-underscore-dangle': ['error', {
      // 允许在 super 对象的成员变量上使用悬空下划线
      allowAfterSuper: true,
      // 允许在 this 对象的成员变量上使用悬空下划线
      allowAfterThis: true,
    }],
    /**
     * 禁止在花括号中使用空格
     * 正确示例
     * const a = {b: 'c'}
     */
    'object-curly-spacing': ['error', 'never'],
    /**
     * 类成员间需要空行来提高可读性
     * 有时候值的定义并不希望有空行, 比如两个 observable 值之间
     */
    'lines-between-class-members': 'off',

    /**
     * 
     * ES2015
     */
    /**
     * 箭头函数的函数体句法形式
     * 保留原本的结构, 函数体内只有一条语句的时候也可能代表以后会往里面添加新的代码
     * 
     * 正确示例
     * () => {}
     * () => a = 1
     */
    'arrow-body-style': 'off',
    // 要求箭头函数的参数使用圆括号
    'arrow-parens': ['warn', 'as-needed'],
    /**
     * 禁止重复导入
     * 错误示例
     * import {a} from 'module'
     * import {b} from 'module'
     * 
     * 正确示例
     * import {a, b} from 'module'
     */
    'no-duplicate-imports': ['error', {
      /**
       * 错误示例
       * export {a} from 'module'
       * 
       * 正确示例
       * import {a, b} from 'module'
       * export {a, b}
       */
      includeExports: true,
    }],
    /**
     * 回调函数和函数参数使用箭头函数替代
     * d3 中的操作可能会导致拿不到想要的 this
     */
    'prefer-arrow-callback': 'off',
    /**
     * 优先使用数组和对象解构
     * 错误示例
     * const foo = array[0]
     * const bar = a.b
     * 
     * 正确示例
     * const [foo] = array
     * const {bar} = a
     */
    'prefer-destructuring': ['warn', {
      array: true,
      object: true,
    }],

    /**
     * 
     * eslint-plugin-jsx-a11y
     */
    // 禁止给 div, span 这类本身不具有事件的 dom 元素绑定事件, 拿 span 标签做按钮还是挺常见的
    'jsx-a11y/no-static-element-interactions': 'off',
    // 具有点击处理程序的可见非交互元素必须至少有一个键盘
    'jsx-a11y/click-events-have-key-events': 'off',

    /**
     * 
     * eslint-plugin-import
     */
    // 禁止使用无关的包裹
    'import/no-extraneous-dependencies': 'off',
    // 路径支持字符串拼接, 变量引用
    'import/no-dynamic-require': 'off',
    // 导入的模块可以解析为本地文件系统上的模块
    'import/no-unresolved': 'off',
    // 导入语句后没有其他导入后, 需要有 1 个换行
    'import/newline-after-import': 'error',

    /**
     * 
     * eslint-plugin-react
     */
    // 禁止强制执行组件方式的顺序
    'react/sort-comp': 'off',
    // 禁止使用数组索引作为 key
    'react/no-array-index-key': 'warn',
    // 强制执行无状态的 React Components 作为纯函数
    'react/prefer-stateless-function': ['off', {
      // 忽略使用 this.props 或 this.context 从 React.PureComponent 扩展的组件
      ignorePureComponents: true
    }],
    /**
     * prop-types
     * 并不需要, ts 的接口已足够强大
     */
    'react/prop-types': 'off',
    // 检测的文件扩展名
    'react/jsx-filename-extension': ['error', {
      'extensions': ['.js', '.jsx', '.tsx'],
    }],

    /**
     * 
     * @typescript-eslint
     */
    // 空格
    '@typescript-eslint/indent': 'off',
    // 接口定义必须加 I 作为前缀
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    // 接口的各个属性之间需要有特定的分隔符
    '@typescript-eslint/member-delimiter-style': 'off',
    /**
     * 在类属性和方法上需要显式的可访问性修饰符
     * 正确示例
     * public a = 1
     * private b() {}
     * public static c = {}
     */
    '@typescript-eslint/explicit-member-accessibility': 'off',
    /**
     * 要求函数和类方法的显式返回类型
     * 正确示例
     * public render(): JSX.Element {}
     */
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 不允许单独使用 require 语句
    '@typescript-eslint/no-var-requires': 'off',
    // 禁止定义前使用, 与 eslint 的 no-use-before-define 重复, 默认使用 eslint 的规则
    '@typescript-eslint/no-use-before-define': 'off',
    // 禁止申明变量后却不使用, 与 eslint 的 no-unused-vars 重复, 默认使用 eslint 的规则
    '@typescript-eslint/no-unused-vars': 'off'
  },
  globals: {
    document: false,
    window: false,
    __DEV__: false,
    __PRO__: false,
    moment: false,
    lodash: false,
    _: false,
    waves: false,
  }
}
