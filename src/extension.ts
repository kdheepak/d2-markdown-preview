"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import * as fs from "fs";
import * as markdownIt from "markdown-it";

function d2MarkdownItPlugin(md: markdownIt) {
  const defaultRenderer = md.renderer.rules.fence;
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    console.log("debugprint:", tokens);

    const token = tokens[idx];

    if (token.info === "d2") {
      const code = token.content.trim();
      return defaultRenderer(tokens, idx, options, env, self);
    } else {
      return defaultRenderer(tokens, idx, options, env, self);
    }
  };
}

export function activate(context: vscode.ExtensionContext) {
  console.log('debugprint: Congratulations, your extension "d2-markdown-preview" is now active!');
  return {
    extendMarkdownIt(md: any) {
      return md.use(d2MarkdownItPlugin);
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
