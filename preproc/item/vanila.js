// interface IVanila {
//     content: string;
//     dataTag?: IDataTag;
// }

function isVanila(line/*: string*/)/*: boolean*/ {
    return true;
}

function vanilaTokenizer(ln/*: LineReader*/)/*: IVanila*/ {
    const { lineWithoutComment, dataTag } = tokenizeDataTagInComment(ln.line);
    return { content: lineWithoutComment, dataTag };
}

function vanilaParser(token/*: IVanila*/)/*: string*/ {
    return `${token.content}${token.dataTag ? parseDataTagAsMd('element', token.dataTag) : ''}`;
}

const vanila/*: IItem*/ = {
    check: isVanila,
    tokenize: vanilaTokenizer,
    parse: vanilaParser
};

