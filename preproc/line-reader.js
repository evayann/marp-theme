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

