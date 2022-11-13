class Line {
    constructor(line) {
        this.l = line;
    }

    // compute(currentLevel) {
    //     if (this.isHeader) {
    //         return this.getSection(currentLevel);
    //     }
    //     else if (this.isSplit) {
    //         return this.closeSection(currentLevel);
    //     }
    //     else if (this.isClass) {
    //         return this.output(currentLevel, this.class);
    //     }
    //     else if (this.isEndClass) {
    //         return this.output(currentLevel, this.endClass);
    //     }
    //     else {
    //         return this.output(currentLevel, this.l);
    //     }
    // }

    //#region Section
    getSection(level) {
        const l = this.headerLevel;
        return this.output(l, l > level ? `<div class="section-${l}">\n\n${this.l}` : `${this.l}\n\n</div>`);
    }

    closeSection(level) {
        if (level === 0)
            return this.output(0, this.l);

        let close = "";
        for (let i = level - 1; i--;)
            close += "</div>\n";
        return this.output(0, `${close}</div>\n\n${this.l}\n`);
    }
    //#endregion

    //#region Header
    get isHeader() {
        return /^#/.test(this.l);
    }

    get headerLevel() {
        return this.nbOcurrences("#");
    }
    //#endregion

    //#region Split
    get isSplit() {
        return /^---/.test(this.l);
    }
    //#endregion Split

    //#region Class
    get isClass() {
        return /^\.\./.test(this.l);
    }

    get class() {
        const list = this.l.substring(2).trim();
        return `<div class="${list}">\n`;
    }

    get isEndClass() {
        return /^\/\.\./.test(this.l);
    }

    get endClass() {
        return "\n</div>";
    }
    //#endregion

    //#region private
    nbOcurrences(pattern) {
        return (this.l.match(new RegExp(pattern, "g")) || []).length;
    }

    output(level, string) {
        return [level, string];
    }
    //#endregion
}

class Parser {
    constructor(md) {
        this.md = md;
    }

    parse() {
        let currentLevel = 0;
        const lines = md.split("\n");
        const parseLines = lines.map(line => {
            const l = new Line(line);
            const [level, text] = l.compute(currentLevel);
            currentLevel = level;
            return text;
        });

        let parsedMd = openSlide();
        return parsedMd;
    }

    compute(currentLevel, l) {
        if (l.isHeader) {
            return l.getSection(currentLevel);
        }
        else if (l.isSplit) {
            return l.closeSection(currentLevel);
        }
        else if (l.isClass) {
            return l.output(currentLevel, l.class);
        }
        else if (this.isEndClass) {
            return l.output(currentLevel, l.endClass);
        }
        else {
            return l.output(currentLevel, l.l);
        }
    }
}

module.exports = (markdown, options) => {
    return new Promise((resolve, reject) => {
        let currentLevel = 0;
        const parse = md =>
        md
        .split('\n')
        .map((line) => {
            const l = new Line(line);
            const [level, text] = l.compute(currentLevel);
            currentLevel = level;
            return text;
        })
        .join('\n');

        console.log(parse(markdown));
        return resolve(parse(markdown));
    });
  };