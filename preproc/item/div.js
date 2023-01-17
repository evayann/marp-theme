// interface IDiv {
//     content: any[];
//     dataTag: IDataTag;
// }

const DIV_REGEX = /^\/\/(.*)$/;
const DIV_END = '//';

function isDiv(line/*: string*/)/*: boolean*/ {
    return DIV_REGEX.test(line);
}

function divTokenizer(ln/*: LineReader*/)/*: IDiv*/ {
    const dataTag = tokenizeDataTag(ln.line);
    const divContent = tokenizeContent(ln.nextLine(), DIV_END, 'div');
    return { content: divContent, dataTag };
}

function divParser(token/*: IDiv*/)/*: string*/ {
    const parsedContent = parseTokens(token.content);
    return `<div ${parseDataTagAsHtml(token.dataTag)}>\n\n${parsedContent}\n</div>`;
}

const div/*: IItem*/ = {
    check: isDiv,
    parse: divParser,
    tokenize: divTokenizer
};

