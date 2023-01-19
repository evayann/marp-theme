// import { IItem } from "./item/item.interface";
// import { items } from "./item/item.list";
// import { LineReader } from "./line-reader";

// export interface IToken {
//     parser: (token: any) => string,
//     data: any;
// }

// export interface IDataTag {
//     classes?: string;
//     styles?: string;
//     id?: string;
//     fragmentId?: number;
// }


const EMPTY_DATA_TAG = {
    classes: undefined,
    styles: undefined,
    id: undefined,
    fragmentId: undefined
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

const WORDS_REGEX = '([\\w\\d ,-]+)';
const CLASS_REGEX = new RegExp(`\.${WORDS_REGEX}`);
const STYLE_REGEX = new RegExp(`{${WORDS_REGEX}}`);
const ID_REGEX = new RegExp(`#${WORDS_REGEX}`);
const FRAGMENT_REGEX = /fragment-(\d+)/;
const LINE_COMMENT_REGEX = /\/\/(.*)/;

function parseDataTagAsHtml(dataTags/*: IDataTag*/)/*: string*/ {
    const classes = `class="${dataTags.classes}"`;
    const fragmentId = `data-fragment-index="${dataTags.fragmentId}"`;
    const styles = `style="${dataTags.styles}"`;
    const id = `id="${dataTags.id}"`;
    return [classes, fragmentId, styles, id].filter(v => !v.includes('undefined')).join(' ');
}

function parseDataTagAsMd(type/*: string*/, dataTags/*: IDataTag*/)/*: string */ {
    const htmlDataTag = parseDataTagAsHtml(dataTags);

    return htmlDataTag !== '' ? `\n<!-- .${type}: ${htmlDataTag} -->` : '';
}

function getMatch(match/*: RegExpMatch*/)/*: string | undefined */ {
    return match ? match[1].replaceAll(',', ' ') : undefined
}

function extractFragmentClass(classes/*: string*/)/*{classes: string[], fragmentId: number | undefined}*/ {
    const classesList = classes.split(' ');
    const fragmentClass = classesList.find(c => FRAGMENT_REGEX.test(c));
    if (!fragmentClass) return { classes, fragmentId: undefined };

    const classesWithoutFragmentId = classesList.filter(c => !c.match(FRAGMENT_REGEX));
    classesWithoutFragmentId.push("fragment");
    const newClasses = classesWithoutFragmentId.join(' ');
    const fragmentId = +fragmentClass.match(FRAGMENT_REGEX)[1];
    return { classes: newClasses, fragmentId };
}

function tokenizeDataTag(line/*: string*/)/*: IDataTag*/ {
    const classesMatch = line.match(CLASS_REGEX);
    const { classes, fragmentId } = classesMatch ? extractFragmentClass(classesMatch[1].replaceAll(',', ' ')) : { classes: undefined, fragmentId: undefined };
    const stylesMatch = line.match(STYLE_REGEX);
    const idMatch = line.match(ID_REGEX);
    return {
        classes,
        fragmentId,
        stylesMatch: getMatch(stylesMatch),
        idMatch: getMatch(idMatch),
    };
}

function tokenizeDataTagInComment(line/*: string*/)/*: { lineWithoutComment: string; dataTag: IDataTag; }*/ {
    if (!LINE_COMMENT_REGEX.test(line))
        return {
            lineWithoutComment: line,
            dataTag: { ...EMPTY_DATA_TAG }
        };

    const comment = line.match(LINE_COMMENT_REGEX)[1];
    return {
        lineWithoutComment: line.replace(`//${comment}`, ''),
        dataTag: tokenizeDataTag(comment)
    };

}

const items/*: IItem:[]*/ = getItems();

function findItem(line/*: string*/)/*: IItem*/ {
    return items.find((item) => item.check(line));
}

