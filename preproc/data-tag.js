// export interface IDataTag {
//     classes?: string;
//     styles?: string;
//     id?: string;
//     fragmentId?: number;
// }

// export interface IClassesComputed {
//     classes: string[];
//     styles: Record<string, string>;
//     fragmentId: number;
// }

const EMPTY_DATA_TAG = {
    classes: undefined,
    styles: undefined,
    id: undefined,
    fragmentId: undefined
};

const EMPTY_CLASSES = {
    classes: undefined,
    styles: undefined,
    fragmentId: undefined,
};

const WORDS_REGEX = '([\\w\\d ,-]+)';
const CLASS_REGEX = new RegExp(`\\.${WORDS_REGEX}`);
const STYLE_REGEX = new RegExp(`{([\\w\\d ,-]+:)}`);
const ID_REGEX = new RegExp(`#${WORDS_REGEX}`);
const FRAGMENT_REGEX = /fragment-(\d+)/;
const GRID_REGEX = /grid-(\d+)x(\d+)/;
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

function tokenizeDataTag(line/*: string*/)/*: IDataTag*/ {
    const classesMatch = line.match(CLASS_REGEX);
    const { classes, styles, fragmentId } = classesMatch ? extractSpecialClasses(classesMatch[1].replaceAll(',', ' ')) : { ...EMPTY_CLASSES };
    const stylesMatch = line.match(STYLE_REGEX);
    const inlineStyles = stylesMatch ? stylesMatch[1] : {}
    const idMatch = line.match(ID_REGEX);
    return {
        classes,
        fragmentId,
        styles: stylesToString({ ...inlineStyles, ...styles }),
        id: getMatch(idMatch),
    };
}

function stylesToString(object/*: Record<string, string>*/)/*: string*/ {
    return Object.entries(object).map(([key, value]) => `${key}: ${value};`).join(' ');
}

function extractSpecialClasses(classesString/*: string*/)/*: IClassesComputed*/ {
    const classesList = classesString.split(' ');
    let fragment = extractFragment(classesList);
    let grid = extractGrid(fragment.classes);
    const classes = grid.classes;
    const styles = grid.styles;
    return {
        classes,
        styles,
        fragmentId: fragment.id,
    }
}

function extractFragment(classes/*: string[]*/)/*: { classes: string[], id: number } */ {
    const fragmentClass = classes.find(c => FRAGMENT_REGEX.test(c));
    if (!fragmentClass) return { classes, fragmentId: undefined };

    const classesWithoutFragmentId = classes.filter(c => !c.match(FRAGMENT_REGEX));
    classesWithoutFragmentId.push("fragment");
    const fragmentId = +fragmentClass.match(FRAGMENT_REGEX)[1];
    return { classes: classesWithoutFragmentId, id: fragmentId };
}

function extractGrid(classes/*: string[]*/)/*: { classes: string[], styles: any } */ {
    const gridClass = classes.find(c => GRID_REGEX.test(c));
    if (!gridClass) return { classes, styles: undefined };

    const classesWithoutGrid = classes.filter(c => !c.match(GRID_REGEX));
    // classesWithoutGrid.push('grid')
    const row = +gridClass.match(GRID_REGEX)[1];
    const column = +gridClass.match(GRID_REGEX)[2];
    const styles = {
        display: 'grid',
        'grid-template-rows': `repeat(${row}, 1fr)`,
        'grid-template-columns': `repeat(${column}, 1fr)`,
    };

    return {
        styles,
        classes: classesWithoutGrid,
    };
}