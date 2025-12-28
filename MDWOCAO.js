/**
 * MDWOCAO.js V23
 * MD！WOCAO！这玩意用起来真方便！
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MDWOCAO = factory();
    }
}(this, function () {
    'use strict';

    // 1. Emoji Map (Common GitHub/Slack style)
    var EMOJI_MAP = {
        "smile": "😄", "smiley": "😃", "grinning": "😀", "blush": "😊", "wink": "😉", "heart_eyes": "😍",
        "kissing_heart": "😘", "stuck_out_tongue": "😛", "sleeping": "😴", "worried": "😟", "sweat_smile": "😅",
        "joy": "😂", "sob": "😭", "scream": "😱", "angry": "😠", "sunglasses": "😎", "thinking": "🤔",
        "heart": "❤️", "blue_heart": "💙", "green_heart": "💚", "yellow_heart": "💛", "purple_heart": "💜",
        "broken_heart": "💔", "sparkles": "✨", "star": "⭐", "fire": "🔥", "rocket": "🚀", "tada": "🎉",
        "thumbsup": "👍", "+1": "👍", "thumbsdown": "👎", "-1": "👎", "ok_hand": "👌", "clap": "👏",
        "muscle": "💪", "pray": "🙏", "wave": "👋", "eyes": "👀", "check": "✅", "x": "❌", "warning": "⚠️",
        "100": "💯", "question": "❓", "exclamation": "❗"
    };

    // Holy Shit Styles?!!
    var styles = 
        ".md-content{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#24292f}" +
        ".md-content h1,.md-content h2,.md-content h3,.md-content h4,.md-content h5,.md-content h6{border-bottom:1px solid #eaecef;padding-bottom:.3em;margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25}" +
        ".md-content p{margin-top:0;margin-bottom:16px}" +
        ".katex-display{overflow-x:auto;overflow-y:hidden;padding:.5em 0;margin:1em 0;text-align:center}.katex{font-size:1.1em}" +
        ".md-content kbd{display:inline-block;padding:3px 5px;font:11px SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;line-height:10px;color:#444d56;vertical-align:middle;background-color:#fcfcfc;border:1px solid #c5c5c5;border-bottom-color:#b8b8b8;border-radius:3px;box-shadow:inset 0 -1px 0 #959da5}" +
        ".md-alert{padding:8px 16px;margin-bottom:16px;border-left:.25em solid;border-radius:0 6px 6px 0;color:#24292f}" +
        ".md-alert-title{font-weight:600;margin-bottom:4px;display:block;font-size:14px;display:flex;align-items:center}" +
        ".md-alert-note{border-left-color:#0969da;background-color:#ddf4ff}.md-alert-note .md-alert-title{color:#0969da}" +
        ".md-alert-tip{border-left-color:#1a7f37;background-color:#dafbe1}.md-alert-tip .md-alert-title{color:#1a7f37}" +
        ".md-alert-warning{border-left-color:#9a6700;background-color:#fff8c5}.md-alert-warning .md-alert-title{color:#9a6700}" +
        ".md-alert-important{border-left-color:#8250df;background-color:#f6f8fa}.md-alert-important .md-alert-title{color:#8250df}" +
        ".md-alert-caution{border-left-color:#cf222e;background-color:#ffebe9}.md-alert-caution .md-alert-title{color:#cf222e}" +
        ".md-content blockquote{border-left:.25em solid #dfe2e5;color:#6a737d;padding:0 1em;margin:0 0 16px 0}" +
        ".md-content blockquote>:last-child{margin-bottom:0}.md-content blockquote blockquote{margin-top:1em}" +
        ".md-content pre,.md-code-block-wrapper{position:relative}" +
        ".md-content pre[data-lang]::before,.md-code-block-wrapper[data-lang]::before{content:attr(data-lang);position:absolute;top:2px;right:8px;font-size:12px;font-family:sans-serif;color:#8b949e;pointer-events:none;font-weight:600;text-transform:uppercase;z-index:5}" +
        ".md-content pre{background-color:#f6f8fa;padding:16px;overflow:auto;border-radius:6px;margin-bottom:16px}" +
        ".md-content code{font-family:'SFMono-Regular',Consolas,monospace;background-color:rgba(175,184,193,.2);padding:.2em .4em;border-radius:6px;font-size:85%}" +
        ".md-content pre code{background:0 0;padding:0;font-size:100%;white-space:pre}" +
        ".md-code-block-wrapper{margin-bottom:16px;background-color:#f6f8fa;border-radius:6px;overflow:hidden;border:1px solid #e1e4e8}" +
        ".md-code-table{border-collapse:collapse;width:100%;font-family:'SFMono-Regular',Consolas,monospace;font-size:13.6px;line-height:1.45;border:none;margin:0;display:table}" +
        ".md-code-table td{padding:0;border:none!important;vertical-align:top;background:0 0}" +
        ".md-code-number-col{width:1%;min-width:2.5em;user-select:none;text-align:right;padding:0 8px!important;background-color:#f1f8ff!important;color:#6e7781;border-right:1px solid #e1e4e8!important;white-space:pre;vertical-align:top}" +
        ".md-code-content-col{padding:0!important;overflow-x:auto;color:#24292f;vertical-align:top}" +
        ".md-code-row{display:block;padding:0 10px;min-height:1.45em;white-space:pre}" +
        ".md-code-hl{background-color:rgba(255,235,59,.3)}.md-code-hl .md-code-number-col{background-color:rgba(210,190,30,.3)!important;border-right-color:rgba(210,190,30,.5)!important;color:#4c4a42}" +
        ".md-content table:not(.md-code-table){border-collapse:collapse;width:100%;margin-bottom:16px;display:block;overflow:auto}" +
        ".md-content table:not(.md-code-table) td,.md-content table:not(.md-code-table) th{border:1px solid #dfe2e5;padding:6px 13px}" +
        ".md-content table:not(.md-code-table) tr:nth-child(2n){background-color:#f6f8fa}" +
        ".md-content table:not(.md-code-table) th{font-weight:600;background-color:#f6f8fa}" +
        ".md-content sub,.md-content sup{font-size:smaller;line-height:0}.md-content sup{vertical-align:super}.md-content sub{vertical-align:sub}" +
        ".md-toc{background-color:#f8f9fa;border:1px solid #e1e4e8;border-radius:6px;padding:12px 16px;margin-bottom:16px;display:inline-block;min-width:200px}" +
        ".md-toc-title{font-weight:600;margin-bottom:8px;font-size:1.1em;color:#24292f}" +
        ".md-toc ul{padding-left:20px;margin:0;list-style-type:disc}.md-toc li{margin-bottom:4px}.md-toc a{color:#0969da;text-decoration:none}" +
        ".md-content ol,.md-content ul:not(.md-toc-list){padding-left:2em;margin-bottom:16px}" +
        ".md-content li.task-list-item{list-style-type:none;margin-left:-1.2em}" +
        ".md-content li.task-list-item input[type=checkbox]{margin-right:.5em;vertical-align:middle}" +
        ".md-content img{max-width:100%;box-sizing:content-box;background-color:#fff}" +
        ".md-content hr{height:.25em;padding:0;margin:24px 0;background-color:#e1e4e8;border:0}" +
        ".md-content a{color:#0969da;text-decoration:none}" +
        ".md-content dl{margin-bottom:16px}.md-content dt{font-weight:600;margin-top:12px;font-style:normal}" +
        ".md-content dd{margin-left:0;margin-bottom:12px;padding:0 16px;color:#57606a;border-left:2px solid #eaecef}" +
        ".md-footnotes{border-top:1px solid #eaecef;margin-top:24px;padding-top:16px;font-size:14px;color:#57606a}" +
        ".md-footnotes ol{padding-left:20px}.md-footnote-backref{color:#0969da;text-decoration:none;margin-left:4px;font-family:monospace}" +
        ":target{background-color:#fff8c5;outline:1px solid #d4a72c}";

    function injectStyles() {
        if (typeof document === 'undefined') return;
        var styleId = 'mdwocao-css';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.type = 'text/css';
            if (style.styleSheet) { style.styleSheet.cssText = styles; } 
            else { style.appendChild(document.createTextNode(styles)); }
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }

    function MDWOCAO() {
        injectStyles();
        this.escapeStore = [];
        this.mathStore = []; 
        this.codeGuardStore = [];
        this.footnotes = {};
        this.footnoteOrder = [];
        this.tocData = [];
        this.slugs = {};
        
        this.rules =  {
            codeBlockStart: /^(`{3,})(\S+)?(?:\s*\{([^}]+)\})?\s*$/, 
            tableRow: /^\|(.+)\|$/, 
            tableSeparator: /^\|(\s*:?-+:?\s*\|)+$/,
            list: /^(\s*)([\*\-\+]|\d+\.)\s+(.*)/,
            task: /^\[([ xX])\]\s+(.*)/,
            callout: /^\[!(NOTE|WARNING|TIP|IMPORTANT|CAUTION)\](?:\s+(.*))?$/i,
            footnoteDef: /^\[\^([^\]]+)\]:\s*(.*)/,
            def: /^:\s+(.*)/,
            toc: /^\[TOC\]\s*$/i
        };
    }

    function escapeHtml(text) {
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
    
    function parseAttributes(text) {
        var match = text.match(/^(.*)\s*\{((?:#[^\s}]+|\.[^\s}]+|[\w-]+=['"][^'"]+['"]|\s+)+)\}\s*$/);
        if (!match) { return { text: text, attrStr: '', id: null }; }
        var content = match[1];
        var attrBlock = match[2];
        var id = null;
        var classes = [];
        var otherAttrs = [];
        attrBlock = attrBlock.replace(/#([a-zA-Z0-9_-]+)/g, function(m, v) { id = v; return ''; });
        attrBlock = attrBlock.replace(/\.([a-zA-Z0-9_-]+)/g, function(m, v) { classes.push(v); return ''; });
        attrBlock.replace(/([a-zA-Z0-9_-]+)=(['"])((?:(?!\2).)*)\2/g, function(m, key, quote, val) { otherAttrs.push(key + '="' + val + '"'); return ''; });
        var finalParts = [];
        if (id) finalParts.push('id="' + id + '"');
        if (classes.length) finalParts.push('class="' + classes.join(' ') + '"');
        if (otherAttrs.length) finalParts.push(otherAttrs.join(' '));
        return { text: content, attrStr: finalParts.length ? ' ' + finalParts.join(' ') : '', id: id };
    }

    MDWOCAO.prototype.generateId = function(text) {
        var plain = text.replace(/<[^>]+>/g, '').trim();
        var slug = encodeURIComponent(plain).replace(/%/g, '-');
        if (Object.prototype.hasOwnProperty.call(this.slugs, slug)) {
            var count = this.slugs[slug] + 1;
            this.slugs[slug] = count;
            return slug + '-' + (count - 1);
        } else {
            this.slugs[slug] = 1;
            return slug;
        }
    };

    MDWOCAO.prototype.guardCode = function(text) {
        var self = this;
        self.codeGuardStore = [];
        text = text.replace(/(^|\n)(`{3,})(?:[^\n]*)\n([\s\S]*?)\n\2\s*(?=$|\n)/g, function(match) {
             var index = self.codeGuardStore.push(match) - 1;
             return '@@@CODE_GUARD:' + index + '@@@';
        });
        text = text.replace(/(`+)(?:(?!\1).)*\1/g, function(match) {
             var index = self.codeGuardStore.push(match) - 1;
             return '@@@CODE_GUARD:' + index + '@@@';
        });
        return text;
    };

    MDWOCAO.prototype.unguardCode = function(text) {
        var self = this;
        return text.replace(/@@@CODE_GUARD:(\d+)@@@/g, function(match, index) {
            return self.codeGuardStore[index];
        });
    };

    MDWOCAO.prototype.maskMath = function(text) {
        var self = this;
        self.mathStore = [];
        text = text.replace(/\$\$([\s\S]+?)\$\$/g, function(match, content) {
            var index = self.mathStore.push({ text: content, display: true }) - 1;
            return '@@@MATH:' + index + '@@@';
        });
        text = text.replace(/(\\*)\$((?:[^\\$]|\\.)+)\$/g, function(match, backslashes, content) {
            if (backslashes.length % 2 === 1) { return match; }
            var index = self.mathStore.push({ text: content, display: false }) - 1;
            return backslashes + '@@@MATH:' + index + '@@@';
        });
        return text;
    };

    MDWOCAO.prototype.renderMath = function(text) {
        var self = this;
        return text.replace(/@@@MATH:(\d+)@@@/g, function(match, idx) {
            var index = parseInt(idx, 10);
            var item = self.mathStore[index];
            if (!item) return match;
            if (typeof window !== 'undefined' && window.katex) {
                try {
                    return window.katex.renderToString(item.text, { displayMode: item.display, throwOnError: false });
                } catch (e) { return '<span style="color:red">Math Error</span>'; }
            } else {
                var delim = item.display ? '$$' : '$';
                return delim + escapeHtml(item.text) + delim;
            }
        });
    };

    MDWOCAO.prototype.maskEscapes = function(text) {
        var self = this;
        self.escapeStore = [];
        return text.replace(/\\([\\`*{}\[\]()#+\-.!_>|~=^$])/g, function(match, char) {
            var index = self.escapeStore.push(char) - 1;
            return '@@@ESC:' + index + '@@@';
        });
    };

    MDWOCAO.prototype.unmaskEscapes = function(text) {
        var self = this;
        return text.replace(/@@@ESC:(\d+)@@@/g, function(match, index) {
            return escapeHtml(self.escapeStore[index]);
        });
    };

    function parseInline(text) {
        if (!text) return '';
        
        // Emoji Replacement (V23)
        text = text.replace(/:([a-z0-9_\-\+]+):/g, function(match, name) {
            return EMOJI_MAP[name] || match;
        });

        text = text.replace(/<kbd>(.*?)<\/kbd>/gi, function(match, content) { return '<kbd>' + escapeHtml(content) + '</kbd>'; });
        text = text.replace(/==(.*?)==/g, '<mark>$1</mark>');
        text = text.replace(/\[\^([^\]]+)\]/g, function(match, id) { var sid = encodeURIComponent(id).replace(/%/g, '-'); return '<sup id="fnref-' + sid + '"><a href="#fn-' + sid + '" class="md-footnote-ref">' + escapeHtml(id) + '</a></sup>'; });
        text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        text = text.replace(/`([^`]+)`/g, function(match, code) { return '<code>' + escapeHtml(code) + '</code>'; });
        text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
        text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
        text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
        text = text.replace(/\^([^\^]+)\^/g, '<sup>$1</sup>');
        text = text.replace(/~([^~]+)~/g, '<sub>$1</sub>');
        return text;
    }

    function splitTableLine(line) { 
        var cells = line.split('|');
        if (cells.length > 0 && cells[0].trim() === '') cells.shift();
        if (cells.length > 0 && cells[cells.length-1].trim() === '') cells.pop();
        return cells;
    }

    function parseTableAlign(line) {
        var cells = splitTableLine(line);
        return cells.map(function(cell) {
            var c = cell.trim();
            var left = c.charAt(0) === ':';
            var right = c.charAt(c.length - 1) === ':';
            if (left && right) return 'center';
            if (right) return 'right';
            if (left) return 'left';
            return ''; 
        });
    }

    MDWOCAO.prototype.parse = function (markdown) {
        if (!markdown) return '';

        this.footnotes = {};
        this.footnoteOrder = [];
        this.tocData = [];
        this.slugs = {};

        markdown = this.guardCode(markdown);
        markdown = this.maskMath(markdown);
        markdown = this.unguardCode(markdown);
        markdown = this.maskEscapes(markdown);

        var lines = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
        var output = ['<div class="md-content">'];
        var state = { inCodeBlock: false, codeLang: '', codeParams: {}, codeBuffer: [], codeFenceLen: 0, inParagraph: false, inTable: false, tableAlign: [], inDefList: false, listStack: [], quoteStack: [] };

        function closeParagraph() { if (state.inParagraph) { output.push('</p>'); state.inParagraph = false; } }
        function closeQuotes(targetLevel) {
            if (typeof targetLevel === 'undefined') targetLevel = 0;
            while (state.quoteStack.length > targetLevel) {
                var type = state.quoteStack.pop();
                output.push(type === 'div' ? '</div>' : '</blockquote>');
            }
        }
        function closeList(targetIndent) {
            if (typeof targetIndent === 'undefined') targetIndent = -1;
            while (state.listStack.length > 0) {
                var last = state.listStack[state.listStack.length - 1];
                if (last.indent > targetIndent) { output.push(last.type === 'ul' ? '</ul>' : '</ol>'); state.listStack.pop(); } else { break; }
            }
        }
        function closeTable() { if (state.inTable) { output.push('</tbody></table>'); state.inTable = false; state.tableAlign = []; } }
        function closeDefList() { if (state.inDefList) { output.push('</dl>'); state.inDefList = false; } }
        function closeAllBlock() { closeParagraph(); closeList(); closeQuotes(0); closeTable(); closeDefList(); }

        var self = this;
        function closeCodeBlock() {
            if (!state.inCodeBlock) return;
            var hasLinenos = state.codeParams.linenos;
            var hasHl = state.codeParams.hlLines && state.codeParams.hlLines.length > 0;
            var langAttr = state.codeLang ? ' data-lang="' + escapeHtml(state.codeLang) + '"' : '';

            if (hasLinenos || hasHl) {
                output.push('<div class="md-code-block-wrapper"' + langAttr + '><table class="md-code-table"><tbody>');
                for (var j = 0; j < state.codeBuffer.length; j++) {
                    var lineNum = j + 1;
                    var rawLine = state.codeBuffer[j];
                    var safeLine = escapeHtml(self.unmaskEscapes(rawLine));
                    if (safeLine.length === 0) safeLine = ' '; 
                    var isHl = hasHl && state.codeParams.hlLines.indexOf(lineNum) !== -1;
                    var rowClass = isHl ? ' class="md-code-hl"' : '';
                    output.push('<tr' + rowClass + '>');
                    if (hasLinenos) output.push('<td class="md-code-number-col">' + lineNum + '</td>');
                    output.push('<td class="md-code-content-col"><span class="md-code-row">' + safeLine + '</span></td>');
                    output.push('</tr>');
                }
                output.push('</tbody></table></div>');
            } else {
                var rawCode = state.codeBuffer.join('\n');
                var safeCode = escapeHtml(self.unmaskEscapes(rawCode));
                var langClass = state.codeLang ? ' class="lang-' + state.codeLang + '"' : '';
                output.push('<pre' + langAttr + '><code' + langClass + '>' + safeCode + '</code></pre>');
            }
            state.inCodeBlock = false; state.codeBuffer = []; state.codeParams = {}; state.codeLang = ''; state.codeFenceLen = 0;
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            var codeStartMatch = !state.inCodeBlock ? line.match(this.rules.codeBlockStart) : null;
            if (codeStartMatch) {
                closeParagraph(); closeAllBlock();
                state.inCodeBlock = true;
                state.codeFenceLen = codeStartMatch[1].length; 
                state.codeLang = codeStartMatch[2] || '';
                var paramsStr = codeStartMatch[3] || '';
                state.codeParams = { linenos: false, hlLines: [] };
                if (paramsStr.indexOf('linenos=on') !== -1 || paramsStr.indexOf('linenos=true') !== -1) { state.codeParams.linenos = true; }
                var hlMatch = paramsStr.match(/hl_lines=\[([\d,\s]+)\]/);
                if (hlMatch) {
                    var nums = hlMatch[1].split(',');
                    for (var n = 0; n < nums.length; n++) { var num = parseInt(nums[n].trim(), 10); if (!isNaN(num)) state.codeParams.hlLines.push(num); }
                }
                state.codeBuffer = []; continue;
            }

            if (state.inCodeBlock) {
                var endMatch = trimmed.match(/^(`{3,})\s*$/);
                if (endMatch && endMatch[1].length >= state.codeFenceLen) { closeCodeBlock(); } 
                else { state.codeBuffer.push(line); }
                continue;
            }

            if (this.rules.toc.test(trimmed)) { closeAllBlock(); output.push('<!--TOC_PLACEHOLDER-->'); continue; }
            var fnMatch = line.match(this.rules.footnoteDef);
            if (fnMatch) { closeAllBlock(); var fnId = fnMatch[1]; this.footnotes[fnId] = fnMatch[2]; if (this.footnoteOrder.indexOf(fnId) === -1) { this.footnoteOrder.push(fnId); } continue; }
            if (trimmed.length === 0) { closeAllBlock(); continue; }
            
            var headerMatch = line.match(/^(#{1,6})\s+(.*)/);
            if (headerMatch) { 
                closeAllBlock(); 
                var level = headerMatch[1].length; 
                var hParsed = parseAttributes(headerMatch[2]);
                var text = parseInline(hParsed.text); 
                var hid = hParsed.id ? hParsed.id : this.generateId(hParsed.text);
                var hAttrStr = hParsed.attrStr;
                if (!hParsed.id) { hAttrStr += ' id="' + hid + '"'; }
                this.tocData.push({ level: level, id: hid, text: text }); 
                output.push('<h' + level + hAttrStr + '>' + text + '</h' + level + '>'); 
                continue; 
            }

            if (trimmed.match(/^(\*{3,}|-{3,}|_{3,})$/) && !this.rules.tableSeparator.test(trimmed)) { closeAllBlock(); output.push('<hr>'); continue; }

            var quoteMatch = line.match(/^((?:>\s?)+)(.*)/);
            if (quoteMatch) {
                closeParagraph(); closeList(); closeTable(); closeDefList();
                var quoteLevel = quoteMatch[1].replace(/[^>]/g, '').length;
                var content = quoteMatch[2]; 
                closeQuotes(quoteLevel);
                var justOpened = false;
                while (state.quoteStack.length < quoteLevel) { 
                    output.push('<blockquote>'); state.quoteStack.push('blockquote'); justOpened = true; 
                }
                var trimmedContent = content.trim();
                var calloutMatch = trimmedContent.match(this.rules.callout);
                if (calloutMatch && justOpened) {
                    output.pop(); state.quoteStack.pop(); 
                    var type = calloutMatch[1].toLowerCase(); 
                    var title = type.charAt(0).toUpperCase() + type.slice(1);
                    output.push('<div class="md-alert md-alert-' + type + '"><span class="md-alert-title">' + title + '</span>');
                    state.quoteStack.push('div');
                    var inlineText = calloutMatch[2];
                    if (inlineText && inlineText.trim().length > 0) { output.push(parseInline(inlineText) + '<br>'); }
                } else { 
                    if (content.trim().length > 0) { output.push(parseInline(content) + '<br>'); }
                }
                continue;
            } else { closeQuotes(0); }

            var listMatch = line.match(this.rules.list);
            if (listMatch) { closeParagraph(); closeTable(); closeDefList(); var indent = listMatch[1].length; var symbol = listMatch[2]; var listContent = listMatch[3]; var isUl = /[\*\-\+]/.test(symbol); var type = isUl ? 'ul' : 'ol'; if (state.listStack.length === 0) { output.push(isUl ? '<ul>' : '<ol>'); state.listStack.push({ type: type, indent: indent }); } else { var last = state.listStack[state.listStack.length - 1]; if (indent > last.indent) { output.push(isUl ? '<ul>' : '<ol>'); state.listStack.push({ type: type, indent: indent }); } else if (indent < last.indent) { closeList(indent); if (state.listStack.length === 0) { output.push(isUl ? '<ul>' : '<ol>'); state.listStack.push({ type: type, indent: indent }); } } else if (last.type !== type) { output.push(last.type === 'ul' ? '</ul>' : '</ol>'); output.push(isUl ? '<ul>' : '<ol>'); last.type = type; } } var taskMatch = listContent.match(this.rules.task); var prefix = '', liClass = ''; if (taskMatch) { var isChecked = taskMatch[1].toLowerCase() === 'x'; prefix = '<input type="checkbox" disabled' + (isChecked ? ' checked' : '') + '> '; listContent = taskMatch[2]; liClass = ' class="task-list-item"'; } output.push('<li' + liClass + '>' + prefix + parseInline(listContent) + '</li>'); continue; } else { closeList(); }
            var isTableRow = this.rules.tableRow.test(trimmed);
            var nextLine = (i < lines.length - 1) ? lines[i+1].trim() : '';
            var nextIsSep = this.rules.tableSeparator.test(nextLine);
            if (isTableRow) { closeParagraph(); closeList(); closeDefList(); if (!state.inTable && nextIsSep) { state.inTable = true; state.tableAlign = parseTableAlign(nextLine); output.push('<table><thead><tr>'); var cells = splitTableLine(trimmed); for (var c = 0; c < cells.length; c++) { var align = state.tableAlign[c] ? ' style="text-align:' + state.tableAlign[c] + '"' : ''; output.push('<th' + align + '>' + parseInline(cells[c].trim()) + '</th>'); } output.push('</tr></thead><tbody>'); i++; continue; } if (state.inTable) { if (this.rules.tableSeparator.test(trimmed)) continue; output.push('<tr>'); var cells = splitTableLine(trimmed); for (var c = 0; c < cells.length; c++) { var align = state.tableAlign[c] ? ' style="text-align:' + state.tableAlign[c] + '"' : ''; output.push('<td' + align + '>' + parseInline(cells[c].trim()) + '</td>'); } output.push('</tr>'); continue; } } else { closeTable(); }
            var isDd = this.rules.def.test(trimmed);
            var nextIsDd = this.rules.def.test(nextLine);
            if (isDd || nextIsDd) { closeParagraph(); if (!state.inDefList) { output.push('<dl>'); state.inDefList = true; } if (isDd) { var ddContent = trimmed.match(this.rules.def)[1]; output.push('<dd>' + parseInline(ddContent) + '</dd>'); } else { output.push('<dt>' + parseInline(line) + '</dt>'); } continue; } else { closeDefList(); }
            
            if (!state.inParagraph) { 
                var pParsed = parseAttributes(line);
                output.push('<p' + pParsed.attrStr + '>'); 
                state.inParagraph = true; 
                output.push(parseInline(pParsed.text)); 
            } else { 
                output.push('<br>' + parseInline(line)); 
            }
        }

        closeCodeBlock();
        closeAllBlock();

        if (this.footnoteOrder.length > 0) {
            output.push('<div class="md-footnotes"><ol>');
            for (var k = 0; k < this.footnoteOrder.length; k++) { var fid = this.footnoteOrder[k]; var fsid = encodeURIComponent(fid).replace(/%/g, '-'); output.push('<li id="fn-' + fsid + '">' + parseInline(this.footnotes[fid]) + ' <a href="#fnref-' + fsid + '" class="md-footnote-backref">&#8617;</a>' + '</li>'); } output.push('</ol></div>');
        }

        output.push('</div>');
        var html = output.join('');
        if (html.indexOf('<!--TOC_PLACEHOLDER-->') !== -1) {
            var tocHtml = '<div class="md-toc"><div class="md-toc-title">Table of Contents</div><ul class="md-toc-list">';
            if (this.tocData.length > 0) { for (var t = 0; t < this.tocData.length; t++) { var item = this.tocData[t]; var margin = (item.level - 1) * 20; tocHtml += '<li style="margin-left:' + margin + 'px"><a href="#' + item.id + '">' + item.text + '</a></li>'; } } tocHtml += '</ul></div>';
            html = html.replace('<!--TOC_PLACEHOLDER-->', tocHtml);
        }
        
        html = this.unmaskEscapes(html);
        html = this.renderMath(html);
        return html;
    };

    return new MDWOCAO();
}));
