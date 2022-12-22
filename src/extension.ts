"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import * as fs from "fs";
import { execSync } from "child_process";
import * as markdownIt from "markdown-it";
import MarkdownIt = require("markdown-it");

class D2Viz {
  renderString(source: string, layout: string, theme: number) {
    const now = `${Date.now()}`;
    const tmpInFile = `${os.tmpdir()}/d2-${now}.d2`;
    const tmpOutFile = `${os.tmpdir()}/d2-${now}.svg`;
    fs.writeFileSync(tmpInFile, source, "utf8");

    try {
      execSync(`d2 --theme=${theme} --layout=${layout} ${tmpInFile} ${tmpOutFile}`, {
        windowsHide: true,
      });
    } catch (err) {
      // @ts-ignore
      const s = err.stderr.toString();
      return `<pre><code>${s}</code></pre>`;
    }
    const contents = fs.readFileSync(tmpOutFile, "utf8");
    return contents;
  }
}

function d2Worker(state: any) {
  const viz = new D2Viz();
  for (let i = 0; i < state.tokens.length; i++) {
    const token = state.tokens[i];
    if (isD2Image(token)) {
      token.type = "d2";
      token.tag = "img";
    }
  }
}

// @ts-ignore
function isD2Image(token: MarkdownIt.Token): boolean {
  if (token.type !== "fence") {
    return false;
  }
  let info = token.info.split(" ")[0];
  return info === "d2";
}

// @ts-ignore
function renderD2Html(tokens, idx) {
  const viz = new D2Viz();
  let token = tokens[idx];
  if (token.type !== "d2") {
    return token.content;
  }
  let layout = "elk";
  let theme = 0;
  if (token.info.split(" ").length !== 1) {
    for (const elem of token.info.split(" ")) {
      if (elem === "d2") {
        continue;
      }
      if (elem.startsWith("layout")) {
        layout = elem.split("=")[1];
      }
      if (elem.startsWith("theme")) {
        theme = parseInt(elem.split("=")[1]);
      }
    }
  }
  if (layout === null || layout === undefined) {
    layout = "elk";
  }
  if (Number.isNaN(theme) || theme === undefined || theme === null) {
    theme = 0;
  }
  const content = viz.renderString(token.content, layout, theme);
  return content;
}

function d2MarkdownItPlugin(md: markdownIt) {
  md.core.ruler.push("d2", d2Worker);
  md.renderer.rules.d2 = renderD2Html;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "d2-markdown-preview" is now active!');
  return {
    extendMarkdownIt(md: markdownIt) {
      return md.use(d2MarkdownItPlugin);
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
