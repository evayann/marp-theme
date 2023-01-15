// import { IItem } from "./item/item.interface";
// import { items } from "./item/item.list";
// import { LineReader } from "./line-reader";

// export interface IToken {
//     parser: (token: any) => string,
//     data: any;
// }

export interface IDataTag {

}

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
            throw new Error(`Need to have ${stopToken} to close a ${caller}`);

        const item/*: IItem*/ = findItem(ln.line);
        contents.push({
            parser: item.parse,
            data: item.tokenize(ln)
        });

        ln.nextLine();
    }

    return contents;
}

const a = ".classe1, classe2 #id1, id2 {style1: a, style2: b}"

const b = a.replaceAll(' ', '');

console.log(a, b);

const CLASS_TAG = '.';
const ID_TAG = '#';
const STYLE_TAG = '{';
const ALL_DATA_TAG = [CLASS_TAG, ID_TAG, STYLE_TAG, '$'];

function otherDataTag(dataTag) {
    return ALL_DATA_TAG.filter(tag => tag !== dataTag);
}

function otherDataTagForRegex(dataTag) {
    const tags = otherDataTag(dataTag);
    return `(${tags.join('|')})`;
}

const CLASS_REGEX = new RegExp(`${CLASS_TAG}(.*?)${otherDataTagForRegex(CLASS_TAG)}`, 'm');

const getClasses = (x) => x.match(CLASS_REGEX);

console.log(getClasses(a));

function parseDataTag(dataTags/*: IDataTag*/)/*: string*/ {

}

function tokenizeDataTag(line/*: line*/)/*: IDataTag[]*/ {
    const classes = 
}

const items/*: IItem:[]*/ = getItems();

function findItem(line/*: string*/)/*: IItem*/ {
    return items.find((item) => item.check(line));
}

