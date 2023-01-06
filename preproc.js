const MD = 'markdown';

const DIV_START = /\.\.(?!grid)(.*)/;
const DIV_END = '..';
const DIV = 'div';

const GRID_START = /..grid-[0-9]+x[0-9]+/;
const GRID_END = '..';
const GRID = 'grid';

const IMG_REGEX = /@img\((.*)\)/;
const IMG = 'image';

const VANILA = 'vanila';

class Tokenizer {
    constructor(string) {
        this.initTokenization(string);

        this.tokens = this.tokenize();
    }

    tokenize() {
        return { type: MD, content: this.tokenizeContent(MD) };
    }

    tokenizeContent(caller, stopToken = undefined) {
        const contents = [];

        while (this.nextToken !== stopToken) {
            if (this.nextToken === undefined && stopToken !== undefined)
                throw new Error(`Need to have ${stopToken} to close a ${caller}`);

            if (IMG_REGEX.test(this.nextToken)) contents.push(this.tokenizeImage());
            else if (GRID_START.test(this.nextToken))
                contents.push(this.tokenizeGrid());
            else if (DIV_START.test(this.nextToken))
                contents.push(this.tokenizeDiv());
            else contents.push(this.tokenizeVanila());

            this.consumeToken();
        }

        return contents;
    }

    tokenizeDiv() {
        const divType = this.nextToken.match(DIV_START)[1];
        this.consumeToken();
        const divContent = this.tokenizeContent(DIV, DIV_END);
        return { type: DIV, div: divType, content: divContent };
    }

    tokenizeGrid() {
        const size = this.nextToken.replace('..grid-', '').split('x');
        this.consumeToken();
        const gridContent = this.tokenizeContent(GRID, GRID_END);
        return { type: GRID, size, content: gridContent };
    }

    tokenizeImage() {
        return { type: IMG, link: this.nextToken.match(IMG_REGEX)[1] };
    }

    tokenizeVanila() {
        return { type: VANILA, value: this.nextToken };
    }

    initTokenization(string) {
        this.lines = string.split('\n');
        this.consumeToken();
    }

    consumeToken() {
        this.nextToken = this.lines.shift()?.trim();
    }
}

function parse(md) {
    return parseTokens(md.content);
}

function parseTokens(tokens) {
    return tokens.map((token) => parseToken(token).trim()).join('\n');
}

function parseToken(token) {
    if (token.type === VANILA) return token.value;
    else if (token.type === IMG) return parseImage(token.link);
    else if (token.type === DIV)
        return divWrapper(token.content, { classes: token.div });
    else if (token.type === GRID) return parseGrid(token.content, token.size);
}

function parseImage(link) {
    return `<img src="${link}" alt="Image ${link} not found !"/>`;
}

function parseGrid(tokens, size) {
    const [nbRows, nbColums] = size;
    return divWrapper(tokens, {
        classes: 'grid',
        style: {
            display: 'grid',
            'grid-template-rows': `repeat(${nbRows}, 1fr)`,
            'grid-template-columns': `repeat(${nbColums}, 1fr)`,
        },
    });
}

function divWrapper(tokens, { classes = undefined, style = undefined } = {}) {
    const classesTag =
        classes !== undefined ? `class="${computeClasses(classes)}"` : '';
    const styleTag = style !== undefined ? `style="${computeStyle(style)}"` : '';
    const parsedContent = parseTokens(tokens);
    return `<div ${classesTag} ${styleTag}>\n\n${parsedContent}\n</div>`;
}

function computeClasses(classes) {
    return Array.isArray(classes) ? classes.join(', ') : classes;
}

function computeStyle(style) {
    return Object.entries(style)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
}

module.exports = (markdown, options) => {
    return new Promise((resolve, reject) => {
        const tokenizer = new Tokenizer(markdown);
        return resolve(parse(tokenizer.tokens));
    });
};
