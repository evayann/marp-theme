// import { IItem } from "./item/item.interface";
// import { items } from "./item/item.list";
// import { LineReader } from "./line-reader";

// export interface IToken {
//     parser: (token: any) => string,
//     data: any;
// }

// export interface IDataTag {
//     classes: string;
//     styles: string;
//     id: string;
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
        contents.push({
            parser: item.parse,
            data: item.tokenize(ln)
        });

        ln.nextLine();
    }

    return contents;
}

const WORDS_REGEX = '([\\w\\d ,-]+)';
const CLASS_REGEX = new RegExp(`\.${WORDS_REGEX}`);
const STYLE_REGEX = new RegExp(`{${WORDS_REGEX}}`);
const ID_REGEX = new RegExp(`#${WORDS_REGEX}`);

function parseDataTagAsHtml(dataTags/*: IDataTag*/)/*: string*/ {
    const classes = `class="${dataTags.classes}"`;
    const styles = `style="${dataTags.styles}"`;
    const id = `id="${dataTags.id}"`;
    return [classes, styles, id].filter(v => !v.includes('undefined')).join(' ');
}

function parseDataTagAsMd(type/*: string*/, dataTags/*: IDataTag*/)/*: string */ {
    const htmlDataTag = parseDataTagAsHtml(dataTags);

    return htmlDataTag !== '' ? `\n<!-- .${type}: ${htmlDataTag} -->` : '';
}

function tokenizeDataTag(line/*: line*/)/*: IDataTag[]*/ {
    const classesMatch = line.match(CLASS_REGEX);
    const stylesMatch = line.match(STYLE_REGEX);
    const idMatch = line.match(ID_REGEX);
    return {
        classes: classesMatch ? classesMatch[1] : undefined,
        stylesMatch: stylesMatch ? stylesMatch[1] : undefined,
        idMatch: idMatch ? idMatch[1] : undefined,
    };
}

const items/*: IItem:[]*/ = getItems();

function findItem(line/*: string*/)/*: IItem*/ {
    return items.find((item) => item.check(line));
}

