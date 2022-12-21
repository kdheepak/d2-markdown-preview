// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import MarkdownIt = require("markdown-it");

interface Attributes {
  [key: string]: string;
}

function _buildD2Attrs(fenceAttrs: string, tokenAttrs: [string, string][] | null): Attributes {
  const attrs: Attributes = {};

  const regexValidation = /^\s*\w+\s*=/;
  if (regexValidation.test(fenceAttrs)) {
    const regexKeyValue = /(\w+)\s*=\s*("([^"]*)"|'([^']*)'|([^"'\s]*))/g;
    let match: RegExpExecArray | null = null;

    while ((match = regexKeyValue.exec(fenceAttrs)) !== null) {
      attrs[match[1].toLowerCase()] = match[2].replace(/^("|')(.*)\1$/, "$2");
    }
  }

  tokenAttrs?.forEach((e) => {
    attrs[e[0].toLowerCase()] = e[1];
  });

  return attrs;
}

export function matchD2Token(
  tokenInfo: string,
  tokenAttrs: [string, string][] | null,
): Attributes | null {
  const regexCurlyBrackets = /^\s*(d2)\s*((\{)([^`~]*)(\})\s*)?$/i;
  const regexSingleMark = /^\s*(d2)\s*((:|\?)([^`~]*))?$/i;

  const match = tokenInfo.match(regexCurlyBrackets) ?? tokenInfo.match(regexSingleMark);

  return match !== null ? _buildD2Attrs(match[4], tokenAttrs) : null;
}

export function activate(context: vscode.ExtensionContext) {
  return {
    extendMarkdownIt(md: MarkdownIt) {
      const highlight = md.options.highlight;
      md.options.highlight = (code: any, lang: any) => {
        if (lang && lang.match(/\bd2\b/i)) {
          return `<div class="d2">${code}</div>`;
        }
        return highlight(code, lang);
      };
      return md;
    },
  };
}

// This method is called when your extension is deactivated
export function deactivate() {}
