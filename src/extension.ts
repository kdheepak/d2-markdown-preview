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
    // Generate a unique file name
    const now = `${Date.now()}`;
    const tmpInFile = `${os.tmpdir()}/d2-${now}.d2`;
    const tmpOutFile = `${os.tmpdir()}/d2-${now}.svg`;

    // Write to the temporary file
    fs.writeFileSync(tmpInFile, source, "utf8");

    execSync(`d2 ${tmpInFile} ${tmpOutFile}`, { stdio: "inherit" });
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

function renderD2Html(tokens: markdownIt.Token[], idx: number) {
  const viz = new D2Viz();
  const content = viz.renderString(tokens[idx].content);
  return content;
}

function d2MarkdownItPlugin(md: markdownIt) {
  md.core.ruler.push("d2", d2Worker);
  md.renderer.rules.d2 = renderD2Html;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('debugprint: Congratulations, your extension "d2-markdown-preview" is now active!');
  return {
    extendMarkdownIt(md: any) {
      const highlight = md.options.highlight;
      md.options.highlight = (code, lang) => {
        if (lang && lang.match(/\bd2\b/i)) {
          return `<div class="d2">${code}</div>`;
        }
        return highlight(code, lang);
      };
      return md;
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
