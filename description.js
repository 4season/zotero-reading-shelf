// SPDX-License-Identifier: AGPL-3.0-only
function createDescriptionRenderer(markdownit, getKatex) {
  const md = markdownit({ html: false, breaks: true });
  md.disable("image");
  md.validateLink = url => /^https?:\/\//i.test(url);

  function escaped(text, at) {
    let index = at;
    while (index > 0 && text[index - 1] === "\\") index--;
    return (at - index) % 2 === 1;
  }

  md.inline.ruler.before("escape", "sl_math_inline", (state, silent) => {
    const { src, pos, posMax } = state;
    const dollars = src[pos] === "$" && src[pos + 1] !== "$";
    if (!dollars && !src.startsWith("\\(", pos)) return false;
    const start = pos + (dollars ? 1 : 2);
    if (dollars && /\s/.test(src[start] ?? " ")) return false;
    const close = dollars ? "$" : "\\)";
    let end = src.indexOf(close, start);
    while (end >= 0 && end < posMax) {
      if (!escaped(src, end)) {
        // A closing dollar next to a digit is commonly the next currency amount.
        if (dollars && (/\s/.test(src[end - 1]) || /[0-9$]/.test(src[end + 1] ?? ""))) return false;
        const body = src.slice(start, end);
        if (!body.trim() || body.includes("\n")) return false;
        if (!silent) state.push("sl_math_inline", "", 0).content = body;
        state.pos = end + close.length;
        return true;
      }
      end = src.indexOf(close, end + close.length);
    }
    return false;
  });

  md.block.ruler.before("fence", "sl_math_block", (state, startLine, endLine, silent) => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const lineText = line => state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line]).trimEnd();
    const first = lineText(startLine);
    const opener = first.startsWith("$$") ? "$$" : first.startsWith("\\[") ? "\\[" : null;
    if (!opener) return false;
    const close = opener === "$$" ? "$$" : "\\]";
    const parts = [];
    for (let line = startLine; line < endLine; line++) {
      if (line > startLine && lineText(line) && state.sCount[line] < state.blkIndent) return false;
      const text = line === startLine ? first.slice(opener.length) : lineText(line);
      const closeAt = text.length - close.length;
      if (text.endsWith(close) && !escaped(text, closeAt)) {
        parts.push(text.slice(0, closeAt));
        const body = parts.join("\n").trim();
        if (!body) return false;
        if (silent) return true;
        const token = state.push("sl_math_block", "", 0);
        token.content = body;
        token.map = [startLine, line + 1];
        state.line = line + 1;
        return true;
      }
      parts.push(text);
    }
    return false;
  }, { alt: ["paragraph", "blockquote", "list"] });

  const math = (tex, displayMode) => {
    if (tex.length <= 4096) {
      const katex = getKatex();
      try {
        return katex.renderToString(tex, {
          output: "mathml",
          displayMode,
          trust: false,
          maxExpand: 256,
          maxSize: 20
        });
      } catch (error) {
        if (!(error instanceof katex.ParseError)) throw error;
      }
    }
    return '<code class="sl-math-source">' + md.utils.escapeHtml(tex) + '</code>';
  };
  md.renderer.rules.sl_math_inline = (tokens, i) => math(tokens[i].content, false);
  md.renderer.rules.sl_math_block = (tokens, i) => '<div class="sl-math-block">' + math(tokens[i].content, true) + '</div>\n';
  return text => md.render(text);
}
