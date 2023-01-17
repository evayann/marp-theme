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

// import { IItem } from "./item.interface";
// import { LineReader } from "../line-reader";

// interface IImage {
//     link: string;
// }

const IMG_REGEX = /@img\((.*)\)/;

function isImage(line/*: string*/)/*: boolean*/ {
    return IMG_REGEX.test(line);
}

function imageTokenizer(ln/*: LineReader*/)/*: IImage*/ {
    return { link: ln.line.match(IMG_REGEX)[1] };
}

function imageParser(token/*: IImage*/)/*: string*/ {
    return `<img src="${token.link}" alt="Image ${token.link} not found !"/>`;
}

const image/*: IItem*/ = {
    check: isImage,
    parse: imageParser,
    tokenize: imageTokenizer
};

// import { LineReader } from "../line-reader";

// export interface IItem {
//     check: (line: string) => boolean;
//     tokenize: (ln: LineReader) => any;
//     parse: (token: any) => string;
// }// import { IItem } from "./item.interface";
// import { section } from "./section";
// import { div } from "./div";
// import { image } from "./image";
// import { vanila } from "./vanila";

// Order sensitive
// First match in list is take
function getItems()/*: IItem[]*/ {
    return [
        image,
        section,
        div,
        vanila,
    ];
}

// import { LineReader } from "../line-reader";
// import { parseStyle, tokenizeStyle, parseDataTagAsMd, tokenizeDataTag } from "../utils";
// import { IItem } from "./item.interface";

// interface ISection {
//     type: string;
//     sectionType: string;
//     isFirst: boolean;
//     dataTag: IDataTag;
// }

let isFirstSection = true;
const SECTION_REGEX = /(----?)(.*)/;

function isSection(line/*: string*/)/*: boolean*/ {
    return SECTION_REGEX.test(line);
}

function sectionTokenizer(ln/*: LineReader*/)/*: ISection*/ {
    const sectionType = ln.line.match(SECTION_REGEX)[1];
    const dataTag = ln.line.match(SECTION_REGEX)[2];
    const isFirst = isFirstSection;
    isFirstSection = false;
    return { type: sectionType, isFirst, dataTag: tokenizeDataTag(dataTag) };
}

function sectionParser(token/*: ISection*/)/*: string*/ {
    return `${token.isFirst ? '' : token.type}${parseDataTagAsMd('slide', token.dataTag)}`;
}

const section/*: IItem*/ = {
    check: isSection,
    parse: sectionParser,
    tokenize: sectionTokenizer
};

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

function improveMd(md/*: string*/)/*: string*/ {
    const ln = new LineReader(md);
    const tokens/*: any[]*/ = tokenizeContent(ln);
    // console.log(tokens, "===", parseTokens(tokens));
    return parseTokens(tokens);
}

module.exports = (markdown/*: string*/) => {
    return new Promise((resolve) => {
        return resolve(improveMd(markdown));
    });
};

class LineReader {
    // lines: string[];
    // line!: string;
    // lineNumber!: number;

    static EOF = '! End of File !';

    constructor(content/*: string*/) {
        this.lineNumber = -1;
        this.lines = content.split('\n');
        this.nextLine();
    }

    nextLine()/*: LineReader*/ {
        this.line = (this.lines.shift() ?? LineReader.EOF).trim();
        this.lineNumber++;
        return this;
    }
}

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
//     fragmentId?: number;
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
const FRAGMENT_REGEX = /fragment-(\d+)/;

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

function tokenizeDataTag(line/*: string*/)/*: IDataTag[]*/ {
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

const items/*: IItem:[]*/ = getItems();

function findItem(line/*: string*/)/*: IItem*/ {
    return items.find((item) => item.check(line));
}

