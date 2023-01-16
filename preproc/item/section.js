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
    return `${token.isFirst ? '' : token.type} \n${parseDataTagAsMd('slide', token.dataTag)}`;
}

const section/*: IItem*/ = {
    check: isSection,
    parse: sectionParser,
    tokenize: sectionTokenizer
};

