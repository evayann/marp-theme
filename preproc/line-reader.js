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

