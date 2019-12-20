import unified from "unified";
import markdown from "remark-parse";

const questionType = "question";
const conditionType = "condition";
const printType = "print";

function survey() {
  const {
    blockMethods,
    blockTokenizers,
    inlineMethods,
    inlineTokenizers
  } = this.Parser.prototype;
  blockMethods.splice(blockMethods.indexOf("setextHeading"), 1);
  blockTokenizers.question = tokenizeQuestion;
  blockTokenizers.condition = tokenizeCondition;
  blockMethods.splice(
    blockMethods.indexOf("paragraph"),
    0,
    questionType,
    conditionType
  );
  inlineTokenizers.print = tokenizePrint;
  inlineMethods.splice(inlineMethods.indexOf("text"), 0, printType);
  return transformer;
}

function transformer(tree) {
  const pagebreakType = "thematicBreak";
  const { children } = tree;
  let len = children.length;
  let node, qst, cond;
  let page = { type: "page", children: [] };
  const pages = [];
  for (let i = 0; i < len; i++) {
    node = children[i];
    if (node.type === questionType) {
      qst = node;
    } else if (node.type === conditionType) {
      cond = node;
    } else {
      if (qst) {
        node[questionType] = qst;
        qst = null;
      }
      if (cond) {
        node[conditionType] = cond;
        cond = null;
      }
      if (node.type === pagebreakType) {
        pages.push(page);
        page = { ...node, type: "page", children: [] };
      } else {
        page.children.push(node);
      }
    }
  }
  pages.push(page);
  return pages;
}

function tokenizeQuestion(eat, value, silent) {
  const match = /^\? *(\w[\w]*) *(.*)/.exec(value);
  if (match) {
    if (silent) {
      return true;
    }
    return eat(match[0])({
      type: questionType,
      name: match[1],
      params: parseAttrs(match[2])
    });
  }
}

const attrsRx = /((\w+) *= *"([^"]*))|((\w+) *= *([^ ]+))|(\w+)/g;
function parseAttrs(str) {
  const attrs = {};
  let m;
  do {
    m = attrsRx.exec(str);
    if (m) attrs[m[2] || m[5] || m[7]] = m[7] ? true : m[3] || m[6];
  } while (m);
  return attrs;
}

function tokenizeCondition(eat, value, silent) {
  const match = /^@ *(.*)/.exec(value);
  if (match) {
    if (silent) {
      return true;
    }
    return eat(match[0])({
      type: conditionType,
      expr: match[1]
    });
  }
}

function tokenizePrint(eat, value, silent) {
  const match = /^\{(.*)\}/.exec(value);
  if (match) {
    if (silent) {
      return true;
    }
    return eat(match[0])({
      type: printType,
      expr: match[1]
    });
  }
}
tokenizePrint.notInLink = true;
tokenizePrint.locator = function(value, fromIndex) {
  return value.indexOf("{", fromIndex);
};

const p = unified()
  .use({ settings: { position: false } })
  .use(markdown)
  .use(survey);

export default function(md) {
  return p.run(p.parse(md));
}
