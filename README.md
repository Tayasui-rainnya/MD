# MDWOCAO.js 集成指南

**MDWOCAO.js** 是一个超轻量级、单文件的 Markdown 解析器。
MD，WOCAO！这玩意用起来真方便！
它支持 **GitHub 风格 Alert**、**KaTeX 数学公式**、**Emoji**、**代码高亮**、**任务列表** 以及 **自定义属性**。无需复杂的构建流程，引入即用。

## 1. 快速开始 (Vanilla JS)

这是最基础的使用方式，适用于任何静态 HTML 页面或传统项目。

### 第一步：准备文件
将生成的 `mdwocao.js` 文件保存到你的项目目录中（例如 `js/mdwocao.js`）。

### 第二步：引入依赖
在 HTML 的 `<head>` 或 `<body>` 底部引入 KaTeX（用于数学公式渲染）和 MDWOCAO 核心库。

```html
<!-- 1. 引入 KaTeX (渲染数学公式必须) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

<!-- 2. 引入 MDWOCAO.js -->
<script src="path/to/mdwocao.js"></script>
```

### 第三步：调用解析器
MDWOCAO 会在全局暴露一个对象。使用 `MDWOCAO.parse(markdownText)` 即可将 Markdown 转换为 HTML。

```html
<div id="content"></div>

<script>
    const markdownText = "# Hello World :smile:\nHere is some math: $E=mc^2$";
    
    // 解析并渲染
    document.getElementById('content').innerHTML = MDWOCAO.parse(markdownText);
</script>
```

---

## 2. 在现代框架中使用

虽然 MDWOCAO 是 UMD 模块，但它很容易集成到 React、Vue 等框架中。

### Vue 3 示例

```vue
<script setup>
import { ref, computed } from 'vue';
// 假设你将 mdwocao.js 放在了 public 或 src/utils 目录下，或者直接在 index.html 引入
// 如果是直接引入 script 标签，MDWOCAO 会挂载在 window 上

const input = ref('# Hello Vue :rocket:');

const compiledMarkdown = computed(() => {
  if (window.MDWOCAO) {
    return window.MDWOCAO.parse(input.value);
  }
  return '';
});
</script>

<template>
  <textarea v-model="input"></textarea>
  <div class="markdown-body" v-html="compiledMarkdown"></div>
</template>
```

### React 示例

```jsx
import React, { useState, useEffect } from 'react';

// 确保在 index.html 中引入了 KaTeX 和 mdwocao.js
// 或者将 mdwocao.js 改造为 export default 模块

const MarkdownEditor = () => {
  const [text, setText] = useState('# Hello React :heart:');

  const createMarkup = () => {
    if (window.MDWOCAO) {
      return { __html: window.MDWOCAO.parse(text) };
    }
    return { __html: '' };
  };

  return (
    <div style={{ display: 'flex' }}>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
      />
      <div dangerouslySetInnerHTML={createMarkup()} />
    </div>
  );
};

export default MarkdownEditor;
```

---

## 3. 语法速查表

MDWOCAO.js 支持以下扩展语法：

| 功能 | 语法示例 | 效果 |
| :--- | :--- | :--- |
| **数学公式 (行内)** | `$E=mc^2$` | KaTeX 渲染 |
| **数学公式 (块级)** | `$$ \sum_{i=0}^n i^2 $$` | KaTeX 渲染 |
| **提示框 (Alerts)** | `> [!NOTE] 内容` | GitHub 风格提示框 |
| **Emoji** | `:smile:`, `:rocket:` | 😄, 🚀 |
| **键盘按键** | `<kbd>Ctrl</kbd>` | 键盘样式 |
| **自定义属性** | `标题 {.red-text}` | `<h1 class="red-text">` |
| **代码高亮** | \`\`\`js ... \`\`\` | 自动检测语言 |
| **任务列表** | `- [x] 完成` | 复选框 |

---

## 4. 常见问题 (FAQ)

**Q: 为什么数学公式不显示？**
A: 请检查是否正确引入了 `katex.min.css` 和 `katex.min.js`。如果 `window.katex` 不存在，解析器会回退显示原始代码。

**Q: 提示框（Alerts）没有颜色？**
A: MDWOCAO.js 会自动注入 CSS 样式（`<style id="mdwocao-css">`）。如果样式被你的全局 CSS 覆盖，请检查 CSS 优先级或手动调整 `.md-alert` 相关样式。

**Q: 如何修改默认样式？**
A: 生成的 HTML 包裹在 `.md-content` 类中。你可以通过编写 CSS 覆盖它，例如：
```css
.md-content h1 { color: #333; }
.md-content p { font-size: 16px; }
```
