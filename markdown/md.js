class MarkdownText {
    constructor(text) {
        this.text = text;
        this.markdown = require('markdown').markdown
    }

    toParseTree() {
        this.tree = this.markdown.parse(this.text)
        return this
    }

    filterTags(tags) {
        exciseMarkdownTags(this.tree, tags)
        console.log("tree: ", this.tree);
        return this
    }

    toHtml() {
        return this.markdown.renderJsonML(this.markdown.toHTMLTree(this.tree))
    }
}



function exciseMarkdownTags(tree, tags) {
    for (let i = 0; i < tree.length; i++) {
        if (Array.isArray(tree[i])) {
            if (tags.includes(tree[i][0])) {
                tree.splice(i, 1)
            } else {
                exciseMarkdownTags(tree[i], tags)
            }
        }
    }
}

module.exports.parseMarkdown = function(text) {
    return new MarkdownText(text).toParseTree()
}
