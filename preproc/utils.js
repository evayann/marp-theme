// import { IItem } from "./item/item.interface";
// import { items } from "./item/item.list";
// import { LineReader } from "./line-reader";

// export interface IToken {
//     parser: (token: any) => string,
//     data: any;
// }

function parseTokens(tokens/*: IToken[]*/)/*: string*/ {
    return tokens.map((token) => token.parser(token.data)).join('\n');
}

function tokenizeContent(
    ln/*: LineReader*/,
    stopToken/*: string*/ = LineReader.EOF,
    caller/*: string*/ = 'Markdown'
) {
    const contents/*: IToken[]*/ = [];

    while (ln.line !== stopToken) {
        if (ln.line === LineReader.EOF && stopToken !== LineReader.EOF)
            throw new Error(`Need to have ${stopToken} to close a ${caller} on line : ${ln.lineNumber}`);

        const item/*: IItem*/ = findItem(ln.line);
        const data = item.tokenize(ln);

        if (data) {
            contents.push({ parser: item.parse, data });
        }

        ln.nextLine();
    }

    return contents;
}

const items/*: IItem:[]*/ = getItems();

function findItem(line/*: string*/)/*: IItem*/ {
    return items.find((item) => item.check(line));
}

