# MDWOCAO.js Integration Guide

**MDWOCAO.js** is an ultra-lightweight, single-file Markdown parser.<br>
MD, WOCAO! This thing is really convenient to use!<br>
It supports **GitHub-style Alerts**, **KaTeX math formulas**, **Emoji**, **Code Highlighting**, **Task Lists**, and **Custom Attributes**. No complex build processes required—just include and use.

## 1. Quick Start (Vanilla JS)

This is the most basic usage method, suitable for any static HTML page or traditional project.

### Step 1: Prepare Files
Save the generated `mdwocao.js` file to your project directory (e.g., `js/mdwocao.js`).

### Step 2: Include Dependencies
Include KaTeX (for math formula rendering) and the MDWOCAO core library in the `<head>` or at the bottom of the `<body>` section of your HTML.

```html
<!-- 1. Include KaTeX (required for math formula rendering) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

<!-- 2. Include MDWOCAO.js -->
<script src="path/to/mdwocao.js"></script>
```

### Step 3: Call the Parser
MDWOCAO will expose an object globally. Use `MDWOCAO.parse(markdownText)` to convert Markdown to HTML.

```html
<div id="content"></div>

<script>
    const markdownText = "# Hello World :smile:\nHere is some math: $E=mc^2$";
    
    // Parse and render
    document.getElementById('content').innerHTML = MDWOCAO.parse(markdownText);
</script>
```

---

## 2. Using in Modern Frameworks

Although MDWOCAO is a UMD module, it's easy to integrate into frameworks like React and Vue.

### Vue 3 Example

```vue
<script setup>
import { ref, computed } from 'vue';
// Assuming you placed mdwocao.js in the public or src/utils directory, or directly in index.html
// If directly including script tag, MDWOCAO will be mounted on window

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

### React Example

```jsx
import React, { useState, useEffect } from 'react';

// Ensure KaTeX and mdwocao.js are included in index.html
// Or modify mdwocao.js to export default module

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

## 3. Syntax Quick Reference

MDWOCAO.js supports the following extended syntax:

| Feature | Syntax Example | Result |
| :--- | :--- | :--- |
| **Math Formula (Inline)** | `$E=mc^2$` | KaTeX rendering |
| **Math Formula (Block)** | `$$ \sum_{i=0}^n i^2 $$` | KaTeX rendering |
| **Alerts** | `> [!NOTE] Content` | GitHub-style alerts |
| **Emoji** | `:smile:`, `:rocket:` | 😄, 🚀 |
| **Keyboard Keys** | `<kbd>Ctrl</kbd>` | Keyboard styling |
| **Custom Attributes** | `Title {.red-text}` | `<h1 class="red-text">` |
| **Code Highlighting** | \`\`\`js ... \`\`\` | Auto language detection |
| **Task Lists** | `- [x] Completed` | Checkboxes |

---

## 4. Frequently Asked Questions (FAQ)

**Q: Why don't math formulas display?**
A: Please check if `katex.min.css` and `katex.min.js` are correctly included. If `window.katex` doesn't exist, the parser will fallback to displaying the original code.

**Q: Alerts don't have colors?**
A: MDWOCAO.js automatically injects CSS styles (`<style id="mdwocao-css">`). If styles are overridden by your global CSS, please check CSS priority or manually adjust `.md-alert` related styles.

**Q: How to modify default styles?**
A: The generated HTML is wrapped in a `.md-content` class. You can override it by writing CSS, for example:
```css
.md-content h1 { color: #333; }
.md-content p { font-size: 16px; }
```
