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

