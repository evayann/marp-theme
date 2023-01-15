// interface IVanila {
//     content: string;
// }

function isVanila(line/*: string*/)/*: boolean*/ {
    return true;
}

function vanilaTokenizer(ln/*: LineReader*/)/*: IVanila*/ {
    return { content: ln.line };
}

function vanilaParser(token/*: IVanila*/)/*: string*/ {
    return token.content;
}

const vanila/*: IItem*/ = {
    check: isVanila,
    tokenize: vanilaTokenizer,
    parse: vanilaParser
};

