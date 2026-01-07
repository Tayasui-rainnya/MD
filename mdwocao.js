/**
 * MDWOCAO.js V37 (Async Worker Edition)
 * MD!WOCAO!这玩意真好用！
 * 
 * Features:
 * - ES5 Compatible.
 * - Single File (Inline Web Worker using Blob).
 * - Async Parsing to prevent UI blocking.
 * - Scrollbar Fix, Indentation Fix, Language Labels.
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

    // Emoji Map
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

    function MDWOCAO() {
        this.escapeStore = [];
        this.mathStore = []; 
        this.codeGuardStore = [];
        this.footnotes = {};
        this.footnoteOrder = [];
        this.tocData = [];
        this.slugs = {};
        
        this.rules = {
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

        // Async Worker State
        this.worker = null;
        this.msgId = 0;
        this.callbacks = {};
    }

    // --- Static Utility: Debounce ---
    MDWOCAO.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // --- Core Parsing Helpers ---

    function escapeHtml(text) {
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
    
    function parseAttributes(text) {
        var match = text.match(/^(.*)\s*\{([^}]+)\}\s*$/);
        
        if (!match) {
            return { text: text, attrStr: '', id: null };
        }

        var content = match[1];
        var attrBlock = match[2];
        var id = null;
        var classes = [];
        var otherAttrs = [];

        attrBlock = attrBlock.replace(/([a-zA-Z0-9_-]+)=(['"])((?:(?!\2).)*)\2/g, function(m, key, quote, val) {
            otherAttrs.push(key + '="' + val + '"');
            return '';
        });

        attrBlock = attrBlock.replace(/#([a-zA-Z0-9_-]+)/g, function(m, v) {
            id = v; 
            return '';
        });

        attrBlock = attrBlock.replace(/\.([a-zA-Z0-9_-]+)/g, function(m, v) {
            classes.push(v); 
            return '';
        });

        var finalParts = [];
        if (id) finalParts.push('id="' + id + '"');
        if (classes.length) finalParts.push('class="' + classes.join(' ') + '"');
        if (otherAttrs.length) finalParts.push(otherAttrs.join(' '));

        return { 
            text: content, 
            attrStr: finalParts.length ? ' ' + finalParts.join(' ') : '',
            id: id
        };
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

        // 1. Block Math: $$...$$ (Allows newlines)
        text = text.replace(/(^|[^\\])\$\$([\s\S]*?)\$\$/g, function(match, prefix, content) {
            var raw = "$$" + content + "$$";
            var index = self.mathStore.push({ text: content, display: true, raw: raw }) - 1;
            return prefix + '@@@MATH:' + index + '@@@';
        });

        // 2. Inline Math: $...$ (Strictly NO newlines)
        text = text.replace(/(^|[^\\])\$((?:[^\\$\r\n]|\\.)+?)\$/g, function(match, prefix, content) {
            var raw = "$" + content + "$";
            var index = self.mathStore.push({ text: content, display: false, raw: raw }) - 1;
            return prefix + '@@@MATH:' + index + '@@@';
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
                    return window.katex.renderToString(item.text, { 
                        displayMode: item.display, 
                        throwOnError: true 
                    });
                } catch (e) {
                    return escapeHtml(item.raw);
                }
            } else {
                return escapeHtml(item.raw);
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

    function parseInline(text, options) {
        if (!text) return '';
        options = options || {};

        if (text.indexOf('[') === -1 && 
            text.indexOf(':') === -1 && 
            text.indexOf('<') === -1 && 
            text.indexOf('=') === -1 && 
            text.indexOf('`') === -1 && 
            text.indexOf('*') === -1 && 
            text.indexOf('_') === -1 && 
            text.indexOf('~') === -1 && 
            text.indexOf('^') === -1) {
            return text;
        }
        
        if (text.indexOf(':') !== -1) {
            text = text.replace(/:([a-z0-9_\-\+]+):/g, function(match, name) {
                return EMOJI_MAP[name] || match;
            });
        }

        if (text.indexOf('<') !== -1) {
            text = text.replace(/<kbd>(.*?)<\/kbd>/gi, function(match, content) { return '<kbd>' + escapeHtml(content) + '</kbd>'; });
        }
        if (text.indexOf('=') !== -1) {
            text = text.replace(/==(.*?)==/g, '<mark>$1</mark>');
        }

        if (text.indexOf('[') !== -1) {
            text = text.replace(/\[\^([^\]]+)\]/g, function(match, id) { 
                var sid = encodeURIComponent(id).replace(/%/g, '-'); 
                return '<sup id="fnref-' + sid + '"><a href="#fn-' + sid + '" class="md-footnote-ref">' + escapeHtml(id) + '</a></sup>'; 
            });

            text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" loading="lazy">');

            text = text.replace(/\[(.*?)\]\((.*?)\)/g, function(match, txt, url) {
                var target = options.openLinksInNewTab !== false ? ' target="_blank" rel="noopener noreferrer"' : '';
                return '<a href="' + url + '"' + target + '>' + txt + '</a>';
            });
        }

        if (text.indexOf('`') !== -1) {
            text = text.replace(/`([^`]+)`/g, function(match, code) { return '<code>' + escapeHtml(code) + '</code>'; });
        }

        if (text.indexOf('*') !== -1 || text.indexOf('_') !== -1) {
            text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
            text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
        }
        if (text.indexOf('~') !== -1) text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
        if (text.indexOf('^') !== -1) text = text.replace(/\^([^\^]+)\^/g, '<sup>$1</sup>');
        if (text.indexOf('~') !== -1) text = text.replace(/~([^~]+)~/g, '<sub>$1</sub>');

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

    // --- Sync Parsing ---

    MDWOCAO.prototype.parse = function (markdown, options) {
        if (!markdown) return '';

        var defaultOptions = {
            openLinksInNewTab: true,
            defaultLinenos: false
        };
        options = options || {};
        for (var key in defaultOptions) {
            if (options[key] === undefined) options[key] = defaultOptions[key];
        }

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
        var state = { 
            inCodeBlock: false, codeLang: '', codeParams: {}, codeBuffer: [], codeFenceLen: 0, 
            inParagraph: false, 
            inTable: false, tableAlign: [], 
            inDefList: false, 
            listStack: [], 
            quoteStack: [] 
        };

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
                if (last.indent > targetIndent) { 
                    output.push(last.type === 'ul' ? '</ul>' : '</ol>'); 
                    state.listStack.pop(); 
                } else { 
                    break; 
                }
            }
        }
        
        function closeTable() { if (state.inTable) { output.push('</tbody></table>'); state.inTable = false; state.tableAlign = []; } }
        function closeDefList() { if (state.inDefList) { output.push('</dl>'); state.inDefList = false; } }
        function closeAllBlock() { closeParagraph(); closeList(); closeQuotes(0); closeTable(); closeDefList(); }

        var self = this;
        function closeCodeBlock() {
            if (!state.inCodeBlock) return;
            var hasLinenos = state.codeParams.linenos || options.defaultLinenos;
            var hasHl = state.codeParams.hlLines && state.codeParams.hlLines.length > 0;
            
            var langLabel = '';
            if (state.codeLang) {
                langLabel = '<div class="md-code-lang-tag" style="position:absolute; top:0; right:0; padding:2px 8px; font-size:12px; color:#666; background:rgba(0,0,0,0.05); border-bottom-left-radius:4px; user-select:none; pointer-events:none;">' + escapeHtml(state.codeLang) + '</div>';
            }

            output.push('<div class="md-code-block-wrapper" style="position:relative;">');
            output.push(langLabel);

            if (hasLinenos || hasHl) {
                output.push('<div style="overflow-x: auto;">');
                output.push('<table class="md-code-table"><tbody>');
                for (var j = 0; j < state.codeBuffer.length; j++) {
                    var lineNum = j + 1;
                    var rawLine = state.codeBuffer[j];
                    var safeLine = escapeHtml(self.unmaskEscapes(rawLine));
                    if (safeLine.length === 0) safeLine = ' '; 
                    var isHl = hasHl && state.codeParams.hlLines.indexOf(lineNum) !== -1;
                    var rowClass = isHl ? ' class="md-code-hl"' : '';
                    output.push('<tr' + rowClass + '>');
                    if (hasLinenos) {
                        output.push('<td class="md-code-number-col" style="min-width:3ch;text-align:right;padding-left:8px;padding-right:8px;user-select:none;">' + lineNum + '</td>');
                    }
                    output.push('<td class="md-code-content-col"><span class="md-code-row" style="white-space: pre;">' + safeLine + '</span></td>');
                    output.push('</tr>');
                }
                output.push('</tbody></table>');
                output.push('</div>'); 
            } else {
                var rawCode = state.codeBuffer.join('\n');
                var safeCode = escapeHtml(self.unmaskEscapes(rawCode));
                var langClass = state.codeLang ? ' class="lang-' + state.codeLang + '"' : '';
                output.push('<pre><code' + langClass + '>' + safeCode + '</code></pre>');
            }
            
            output.push('</div>');
            
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
            if (fnMatch) { 
                closeAllBlock(); 
                var fnId = fnMatch[1]; 
                this.footnotes[fnId] = fnMatch[2]; 
                if (this.footnoteOrder.indexOf(fnId) === -1) { this.footnoteOrder.push(fnId); } 
                continue; 
            }
            
            if (trimmed.length === 0) { closeAllBlock(); continue; }
            
            var headerMatch = line.match(/^(#{1,6})\s+(.*)/);
            if (headerMatch) { 
                closeAllBlock(); 
                var level = headerMatch[1].length; 
                var hParsed = parseAttributes(headerMatch[2]);
                var text = parseInline(hParsed.text, options); 
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
                    if (inlineText && inlineText.trim().length > 0) { output.push(parseInline(inlineText, options) + '<br>'); }
                } else { 
                    if (content.trim().length > 0) { output.push(parseInline(content, options) + '<br>'); }
                }
                continue;
            } else { closeQuotes(0); }

            var listMatch = line.match(this.rules.list);
            if (listMatch) {
                closeParagraph(); closeTable(); closeDefList();
                var indent = listMatch[1].length;
                var symbol = listMatch[2];
                var listContent = listMatch[3];
                var isUl = /[\*\-\+]/.test(symbol);
                var listType = isUl ? 'ul' : 'ol';
                
                if (state.listStack.length === 0) {
                    output.push(isUl ? '<ul>' : '<ol>');
                    state.listStack.push({ type: listType, indent: indent });
                } else {
                    var last = state.listStack[state.listStack.length - 1];
                    if (indent > last.indent) {
                        output.push(isUl ? '<ul>' : '<ol>');
                        state.listStack.push({ type: listType, indent: indent });
                    } else if (indent < last.indent) {
                        closeList(indent);
                        if (state.listStack.length === 0) {
                            output.push(isUl ? '<ul>' : '<ol>');
                            state.listStack.push({ type: listType, indent: indent });
                        }
                    } else if (last.type !== listType) {
                        output.push(last.type === 'ul' ? '</ul>' : '</ol>');
                        output.push(isUl ? '<ul>' : '<ol>');
                        last.type = listType;
                    }
                }
                
                var taskMatch = listContent.match(this.rules.task);
                var prefix = '', liClass = '';
                if (taskMatch) {
                    var isChecked = taskMatch[1].toLowerCase() === 'x';
                    prefix = '<input type="checkbox" disabled' + (isChecked ? ' checked' : '') + '> ';
                    listContent = taskMatch[2];
                    liClass = ' class="task-list-item"';
                }
                output.push('<li' + liClass + '>' + prefix + parseInline(listContent, options) + '</li>');
                continue;
            } else { closeList(); }

            var isTableRow = this.rules.tableRow.test(trimmed);
            var nextLine = (i < lines.length - 1) ? lines[i+1].trim() : '';
            var nextIsSep = this.rules.tableSeparator.test(nextLine);
            
            if (isTableRow) {
                closeParagraph(); closeList(); closeDefList();
                if (!state.inTable && nextIsSep) {
                    state.inTable = true;
                    state.tableAlign = parseTableAlign(nextLine);
                    output.push('<table><thead><tr>');
                    var cells = splitTableLine(trimmed);
                    for (var c = 0; c < cells.length; c++) {
                        var align = state.tableAlign[c] ? ' style="text-align:' + state.tableAlign[c] + '"' : '';
                        output.push('<th' + align + '>' + parseInline(cells[c].trim(), options) + '</th>');
                    }
                    output.push('</tr></thead><tbody>');
                    i++; 
                    continue;
                }
                if (state.inTable) {
                    if (this.rules.tableSeparator.test(trimmed)) continue;
                    output.push('<tr>');
                    var cells = splitTableLine(trimmed);
                    for (var c = 0; c < cells.length; c++) {
                        var align = state.tableAlign[c] ? ' style="text-align:' + state.tableAlign[c] + '"' : '';
                        output.push('<td' + align + '>' + parseInline(cells[c].trim(), options) + '</td>');
                    }
                    output.push('</tr>');
                    continue;
                }
            } else { closeTable(); }

            var isDd = this.rules.def.test(trimmed);
            var nextIsDd = this.rules.def.test(nextLine);
            if (isDd || nextIsDd) {
                closeParagraph();
                if (!state.inDefList) { output.push('<dl>'); state.inDefList = true; }
                if (isDd) {
                    var ddContent = trimmed.match(this.rules.def)[1];
                    output.push('<dd>' + parseInline(ddContent, options) + '</dd>');
                } else {
                    output.push('<dt>' + parseInline(line, options) + '</dt>');
                }
                continue;
            } else { closeDefList(); }
            
            if (!state.inParagraph) { 
                var pParsed = parseAttributes(line);
                output.push('<p' + pParsed.attrStr + '>'); 
                state.inParagraph = true; 
                output.push(parseInline(pParsed.text, options)); 
            } else { 
                output.push('<br>' + parseInline(line, options)); 
            }
        }

        closeCodeBlock();
        closeAllBlock();

        if (this.footnoteOrder.length > 0) {
            output.push('<div class="md-footnotes"><ol>');
            for (var k = 0; k < this.footnoteOrder.length; k++) { 
                var fid = this.footnoteOrder[k]; 
                var fsid = encodeURIComponent(fid).replace(/%/g, '-'); 
                output.push('<li id="fn-' + fsid + '">' + parseInline(this.footnotes[fid], options) + ' <a href="#fnref-' + fsid + '" class="md-footnote-backref">&#8617;</a>' + '</li>'); 
            } 
            output.push('</ol></div>');
        }

        output.push('</div>');
        var html = output.join('');
        
        if (html.indexOf('<!--TOC_PLACEHOLDER-->') !== -1) {
            var tocHtml = '<div class="md-toc"><div class="md-toc-title">Table of Contents</div><ul class="md-toc-list">';
            if (this.tocData.length > 0) { 
                for (var t = 0; t < this.tocData.length; t++) { 
                    var item = this.tocData[t]; 
                    var margin = (item.level - 1) * 20; 
                    tocHtml += '<li style="margin-left:' + margin + 'px"><a href="#' + item.id + '">' + item.text + '</a></li>'; 
                } 
            } 
            tocHtml += '</ul></div>';
            html = html.replace('<!--TOC_PLACEHOLDER-->', tocHtml);
        }
        
        html = this.renderMath(html);
        html = this.unmaskEscapes(html);
        return html;
    };

    // --- Async Parsing (Inline Web Worker) ---
    
    // Initialize the worker using a Blob URL containing the factory code.
    MDWOCAO.prototype._initWorker = function() {
        if (this.worker) return;
        
        // We get the source of the factory function and execute it inside the worker context.
        var factorySource = factory.toString();
        // The worker needs to run the factory, get the Constructor, and set up the listener.
        var blobContent = "'use strict'; (" + factorySource + ")(self);";
        
        try {
            var blob = new Blob([blobContent], { type: 'application/javascript' });
            var url = URL.createObjectURL(blob);
            this.worker = new Worker(url);
            
            var self = this;
            this.worker.onmessage = function(e) {
                var data = e.data;
                if (data && data.id && self.callbacks[data.id]) {
                    self.callbacks[data.id](data.html);
                    delete self.callbacks[data.id];
                }
            };
        } catch (e) {
            console.error("MDWOCAO: Failed to create Web Worker.", e);
            this.worker = null;
        }
    };

    /**
     * Async Parse Method.
     * Uses Web Worker if available, falls back to sync parse.
     * @param {string} markdown
     * @param {object} options
     * @param {function} callback - function(html)
     */
    MDWOCAO.prototype.parseAsync = function(markdown, options, callback) {
        // Fallback for missing Blob/Worker support or if user didn't provide callback
        if (typeof window === 'undefined' || typeof Worker === 'undefined' || typeof Blob === 'undefined' || !callback) {
            var result = this.parse(markdown, options);
            if (callback) callback(result);
            return;
        }

        if (!this.worker) {
            this._initWorker();
        }

        if (this.worker) {
            this.msgId++;
            var currentId = 'msg_' + this.msgId;
            this.callbacks[currentId] = callback;
            this.worker.postMessage({
                id: currentId,
                content: markdown,
                options: options || {}
            });
        } else {
            // If worker initialization failed, fallback to sync
            callback(this.parse(markdown, options));
        }
    };

    MDWOCAO.prototype.terminate = function() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    };

    // --- Worker Internal Logic ---
    // This block only runs when the factory is executed inside the Worker context.
    if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof window === 'undefined') {
        var workerParser = new MDWOCAO();
        self.onmessage = function(e) {
            var data = e.data;
            if (data && data.content !== undefined) {
                var html = workerParser.parse(data.content, data.options);
                self.postMessage({ id: data.id, html: html });
            }
        };
    }

    return MDWOCAO;
}));