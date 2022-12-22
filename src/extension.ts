"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import * as fs from "fs";
import { execSync } from "child_process";
import * as markdownIt from "markdown-it";

class D2Viz {
  renderString(source: string) {
    const now = `${Date.now()}`;
    const tmpInFile = `${os.tmpdir()}/d2-${now}.d2`;
    const tmpOutFile = `${os.tmpdir()}/d2-${now}.svg`;

    fs.writeFileSync(tmpInFile, source, "utf8");

    try {
      execSync(`d2 ${tmpInFile} ${tmpOutFile}`, {
        windowsHide: true,
      });
    } catch (err) {
      // @ts-ignore
      const s = err.stderr.toString();
      return `
      <pre>
      <code>
      ${s}
      </code>
      </pre>
      `;
    }
    const contents = fs.readFileSync(tmpOutFile, "utf8");
    return contents;
  }
}

function d2Worker(state: any) {
  const viz = new D2Viz();
  for (let i = 0; i < state.tokens.length; i++) {
    const token = state.tokens[i];
    if (token.type === "fence" && token.info === "d2") {
      token.type = "d2";
      token.tag = "img";
    }
  }
}

// @ts-ignore
function renderD2Html(tokens, idx) {
  const viz = new D2Viz();
  let token = tokens[idx];
  if (token.type !== "d2") {
    return token.content;
  }
  const content = viz.renderString(token.content);
  return content;
}

function d2MarkdownItPlugin(md: markdownIt) {
  md.core.ruler.push("d2", d2Worker);
  md.renderer.rules.d2 = renderD2Html;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('debugprint: Congratulations, your extension "d2-markdown-preview" is now active!');
  return {
    extendMarkdownIt(md: markdownIt) {
      return md.use(d2MarkdownItPlugin);
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
