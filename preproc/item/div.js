// import { LineReader } from "../line-reader";
// import { parseTokens, tokenizeContent } from "../utils";
// import { IItem } from "./item.interface";

// interface IDiv {
//     type: string;
//     content: any[];
//     dataTag: IDataTag;
// }

const DIV_REGEX = /^==(.*)$/;
const DIV_END = '==';

function isDiv(line/*: string*/)/*: boolean*/ {
    return DIV_REGEX.test(line);
}

function divTokenizer(ln/*: LineReader*/)/*: IDiv*/ {
    const divType = ln.line.match(DIV_REGEX)[1];
    const divContent = tokenizeContent(ln.nextLine(), DIV_END, 'div');
    return { type: divType, content: divContent };
}

function divParser(token/*: IDiv*/)/*: string*/ {
    const parsedContent = parseTokens(token.content);
    return `<div>\n\n${parsedContent}\n</div>`;
}

const div/*: IItem*/ = {
    check: isDiv,
    parse: divParser,
    tokenize: divTokenizer
};

