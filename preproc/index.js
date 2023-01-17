function improveMd(md/*: string*/)/*: string*/ {
    const ln = new LineReader(md);
    const tokens/*: any[]*/ = tokenizeContent(ln);
    // console.log(tokens, "===", parseTokens(tokens));
    return parseTokens(tokens);
}

module.exports = (markdown/*: string*/) => {
    return new Promise((resolve) => {
        return resolve(improveMd(markdown));
    });
};

