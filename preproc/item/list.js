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

