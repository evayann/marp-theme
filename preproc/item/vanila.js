// interface IVanila {
//     content: string;
//     dataTag?: IDataTag;
// }

const LINE_COMMENT_REGEX = /\/\/(.*)/;

function isVanila(line/*: string*/)/*: boolean*/ {
    return true;
}

function vanilaTokenizer(ln/*: LineReader*/)/*: IVanila*/ {
    if (!LINE_COMMENT_REGEX.test(ln.line))
        return { content: ln.line };

    let comment = ln.line.match(LINE_COMMENT_REGEX)[1];
    let dataTag = tokenizeDataTag(comment);
    const lineWithoutComment = ln.line.replace(`//${comment}`, '');
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

