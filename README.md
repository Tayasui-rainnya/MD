# MDWOCAO.js 使用指南

**MDWOCAO.js** 是一个轻量级、高性能、单文件的 Markdown 解析库。它专为现代 Web 开发设计，支持 ES5 环境，且内置了基于 Web Worker 的异步解析能力，确保在处理大段文本时不会阻塞 UI 线程。

## 🌟 核心特性

*   **⚡ 高性能**：支持异步多线程解析（自动降级兼容）。
*   **📦 单文件**：无复杂的构建流程，引入一个 JS 即可。
*   **🎨 样式丰富**：自带 GitHub 风格的亮色/深色主题。
*   **🧮 数学公式**：集成 KaTeX 支持 LaTeX 公式。
*   **🧩 扩展语法**：支持任务列表、目录(TOC)、脚注、GitHub 提示块 (Alerts) 等。

---

## 1. 快速开始

### 第一步：引入文件

在你的 HTML 文件中引入样式和脚本。如果需要数学公式支持，请同时引入 KaTeX。

```html
<head>
    <!-- 1. (可选) 引入 KaTeX 用于数学公式 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

    <!-- 2. 引入核心样式 -->
    <link rel="stylesheet" href="mdwocao.css">
    <!-- 3. (可选) 引入深色模式适配 -->
    <link rel="stylesheet" href="mdwocao-dark.css">

    <!-- 4. 引入 MDWOCAO.js 核心库 -->
    <script src="mdwocao.js"></script>
</head>
```

### 第二步：基本使用 (同步解析)

适用于文本较短或对实时性要求极高的场景。

```javascript
// 1. 初始化解析器
var parser = new MDWOCAO();

// 2. 准备 Markdown 文本
var markdownText = "# Hello MDWOCAO!\n这是一个**测试**。";

// 3. 解析为 HTML
var html = parser.parse(markdownText);

// 4. 渲染到页面
document.getElementById('preview').innerHTML = html;
```

### 第三步：进阶使用 (异步解析 - 推荐 🚀)

V37 版本内置了 Web Worker 支持。对于长文档，使用异步解析可以避免页面卡顿。即使在没有 HTTPS 的 HTTP 环境下也能完美运行。

```javascript
var parser = new MDWOCAO();
var markdownText = "这里有一篇几万字的长文...";

// 使用 parseAsync，传入回调函数
parser.parseAsync(markdownText, { openLinksInNewTab: true }, function(html) {
    // 解析完成后的回调
    document.getElementById('preview').innerHTML = html;
});
```

---

## 2. 配置选项

在调用 `parse` 或 `parseAsync` 时，第二个参数是配置对象：

```javascript
var options = {
    // 是否在新标签页打开链接 (默认: true)
    openLinksInNewTab: true,
    
    // 是否默认为所有代码块显示行号 (默认: false)
    defaultLinenos: false 
};

parser.parse(text, options);
```

---

## 3. 语法支持详解

MDWOCAO.js 支持标准 Markdown 及多种扩展语法。

### 💻 代码块 (高亮与行号)

支持在代码块声明中开启行号或高亮特定行。

````markdown
```javascript {linenos=true, hl_lines=[1, 3]}
function sayHello() {
    console.log("Line 1 (Highlighted)");
    console.log("Line 2");
    console.log("Line 3 (Highlighted)");
}
```
````

### ⚠️ 提示块 (GitHub Alerts)

支持五种级别的提示块：

```markdown
> [!NOTE]
> 这是一个普通的备注信息。

> [!TIP]
> 这是一个小技巧。

> [!WARNING]
> 这是一个警告！

> [!IMPORTANT]
> 这很重要。

> [!CAUTION]
> 这是一个危险操作。
```

### 🧮 数学公式

需确保页面已引入 KaTeX。

*   **行内公式**：使用 `$ ... $` (注意：不支持换行)
    *   例如：`$E=mc^2$`
*   **块级公式**：使用 `$$ ... $$`
    *   例如：
        ```markdown
        $$
        \sum_{i=1}^n a_i = 0
        $$
        ```

### 📑 目录 (TOC)

在文章任意位置（通常是开头）写入 `[TOC]`，解析器会自动生成基于标题的目录。

```markdown
[TOC]

# 第一章
## 第一节
```

### 🦶 脚注

```markdown
这是一个脚注引用的例子[^1]。

[^1]: 这是脚注的具体内容解释。
```

---

## 4. 深色模式 (Dark Mode)

引入 `mdwocao-dark.css` 后，MDWOCAO 会自动适配。

**自动适配**：
如果用户的操作系统设置为深色模式，页面会自动变黑。

**手动切换**：
你可以通过给 HTML 或 BODY 标签添加类名来强制切换：

```javascript
// 强制开启深色模式
document.body.classList.add('dark-mode');

// 或者使用 data 属性
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## 5. API 参考

### `new MDWOCAO()`
创建一个解析器实例。

### `parser.parse(markdown, [options])` -> `String`
*   **描述**：同步解析 Markdown。
*   **返回**：HTML 字符串。

### `parser.parseAsync(markdown, [options], callback)` -> `void`
*   **描述**：尝试在 Web Worker 中异步解析。如果浏览器不支持 Worker 或位于特殊环境（如 file:// 且限制严格），会自动降级为同步解析，**保证代码不报错**。
*   **callback**：`function(html) {}`，接收解析后的 HTML 字符串。

### `parser.terminate()` -> `void`
*   **描述**：销毁后台的 Web Worker 实例以释放内存。通常在组件卸载或不再需要解析时调用。

---

## 6. 完整示例 (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MDWOCAO Editor</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <link rel="stylesheet" href="mdwocao.css">
    <link rel="stylesheet" href="mdwocao-dark.css">
    <script src="mdwocao.js"></script>
    <style>
        body { display: flex; height: 100vh; margin: 0; }
        textarea { width: 50%; padding: 20px; font-family: monospace; resize: none; border: none; border-right: 1px solid #ccc; outline: none; }
        #preview { width: 50%; padding: 20px; overflow-y: auto; }
    </style>
</head>
<body>

<textarea id="editor">
# 欢迎使用 MDWOCAO.js

尝试输入一些 Markdown...

- [x] 支持任务列表
- [ ] 支持异步解析

$$
f(x) = \int_{-\infty}^\infty \hat f(\xi)\,e^{2\pi i \xi x} \,d\xi
$$
</textarea>

<div id="preview" class="md-content"></div>

<script>
    var parser = new MDWOCAO();
    var editor = document.getElementById('editor');
    var preview = document.getElementById('preview');

    // 防抖函数，避免频繁触发
    var debounce = MDWOCAO.debounce(function() {
        // 使用异步解析
        parser.parseAsync(editor.value, null, function(html) {
            preview.innerHTML = html;
        });
    }, 150);

    editor.addEventListener('input', debounce);
    
    // 初始化渲染
    debounce();
</script>

</body>
</html>
```
