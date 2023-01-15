// import { LineReader } from "../line-reader";
// import { parseTokens, tokenizeContent } from "../utils";
// import { IItem } from "./item.interface";

// interface IDiv {
//     type: string;
//     content: any[];
// }

const DIV_REGEX = /\.\.(?!grid)(.*)/;
const DIV_END = '..';

function isDiv(line/*: string*/)/*: boolean*/ {
    return DIV_REGEX.test(line);
}

function divTokenizer(ln/*: LineReader*/)/*: IDiv*/ {
    const divType = ln.line.match(DIV_REGEX)[1];
    const divContent = tokenizeContent(ln.nextLine(), DIV_END);
    return { type: divType, content: divContent };
}

function divParser(token/*: IDiv*/)/*: string*/ {
    const parsedContent = parseTokens(token.content);
    return `<div>\n\n${parsedContent}\n</div>`;
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
// import { parseTokens, tokenizeContent } from "../utils";
// import { IItem } from "./item.interface";

// interface ISection {
//     type: string;
//     sectionType: string;
//     isFirst: boolean;
// }

let isFirstSection = true;
const SECTION_REGEX = /(----?)(.*)/;

function isSection(line/*: string*/)/*: boolean*/ {
    return SECTION_REGEX.test(line);
}

function sectionTokenizer(ln/*: LineReader*/)/*: ISection*/ {
    const sectionType = ln.line.match(SECTION_REGEX)[1];
    const isFirst = isFirstSection;
    isFirstSection = false;
    return { type: sectionType, isFirst };
}

function sectionParser(token/*: ISection*/)/*: string*/ {
    return `${token.isFirst ? '' : token.type}`;
}

const section/*: IItem*/ = {
    check: isSection,
    parse: sectionParser,
    tokenize: sectionTokenizer
};

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

function improveMd(md/*: string*/)/*: string*/ {
    const ln = new LineReader(md);
    const tokens/*: any[]*/ = tokenizeContent(ln);
    console.log(tokens, parseTokens(tokens));
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

    static EOF = '! End of File !';

    constructor(content/*: string*/) {
        this.lines = content.split('\n');
        this.lines.push(LineReader.EOF);
        this.nextLine();
    }

    nextLine()/*: LineReader*/ {
        this.line = (this.lines.shift() ?? LineReader.EOF).trim();
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

function parseTokens(tokens/*: IToken[]*/)/*: string*/ {
    return tokens.map((token) => token.parser(token.data)).join('\n');
}

function tokenizeContent(
    ln/*: LineReader*/,
    stopToken/*: string*/ = LineReader.EOF
) {
    const contents/*: IToken[]*/ = [];
    const caller = 'todo rename !';
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

const items/*: IItem:[]*/ = getItems();

function findItem(line/*: string*/)/*: IItem*/ {
    return items.find((item) => item.check(line));
}

