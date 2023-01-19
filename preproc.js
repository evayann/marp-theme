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
// }// Order sensitive
// First match in list is take
function getItems()/*: IItem[]*/ {
    return [
        image,
        section,
        list,
        div,
        vanila
    ];
}

function resetAll()/*: void*/ {
    resetList();
    resetSection();
}
// interface IList {
//     childs: (IListItem | IList)[];
//     level: number;
//     parent?: IList;
// }

// interface IListItem {
//     content: string;
//     dataTag: IDataTag;
// }

let currentList = null;
const LIST_REGEX = /^(\s*)[-+*]\s(.*)$/;

function resetList()/*: void*/ {
    currentList = null;
}

function isList(line/*: string*/)/*: boolean*/ {
    return LIST_REGEX.test(line);
}

function listTokenizer(ln/*: LineReader*/)/*: IList*/ {
    const matches = ln.line.match(LIST_REGEX);

    const level = matches[1].length / 2;
    const content = matches[2];

    const { lineWithoutComment, dataTag } = tokenizeDataTagInComment(ln.line);
    const clearLine = lineWithoutComment.replace(/-[ ]*/, '');

    const listItem = { content: clearLine, dataTag };

    if (!currentList) {
        currentList = { parent: null, level: 0, childs: [listItem] };
        return currentList;
    }

    if (currentList.level === level) {
        currentList.childs.push(listItem);
        return;
    }

    if (currentList.level < level) {
        const subList = { parent: currentList, level, childs: [listItem] };
        currentList.childs.push(subList);
        currentList = subList;
    }
    else { // currentList.level > level
        currentList = currentList.parent;
        currentList.childs.push(listItem);
    }

}

function listParser(token/*: IList*/)/*: string*/ {
    function parseChilds(childs/*: (IListItem | IList)[]*/)/*: string*/ {
        return childs.map(child => {
            if (child.childs) { // Is IList
                return listParser(child);
            }
            return `<li ${parseDataTagAsHtml(child.dataTag)}> ${child.content} </li>`;
        }).join('\n');
    };
    return `<ul>\n ${parseChilds(token.childs)} \n</ul>`;
}

const list/*: IItem*/ = {
    check: isList,
    parse: listParser,
    tokenize: listTokenizer
};

// interface ISection {
//     type: string;
//     sectionType: string;
//     isFirst: boolean;
//     dataTag: IDataTag;
// }

let isFirstSection = true;
const SECTION_REGEX = /(----?)(.*)/;

function resetSection()/*: void*/ {
    isFirstSection = true;
}

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

function improveMd(md/*: string*/)/*: string*/ {
    resetAll();
    const ln = new LineReader(md);
    const tokens/*: any[]*/ = tokenizeContent(ln);
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
        this.line = this.lines.shift() ?? LineReader.EOF;
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

