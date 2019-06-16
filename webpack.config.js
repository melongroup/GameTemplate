const path = require('path');
const ts = require('typescript');
const { isImportDeclaration, isExportDeclaration, isStringLiteral } = require('tsutils/typeguard/node');

function getCustomTransformers() {
    return { before: [stripJsExt] }

    function stripJsExt(context) {
        return sourceFile => visitNode(sourceFile);

        function visitNode(node) {
            if ((isImportDeclaration(node) || isExportDeclaration(node)) &&
                node.moduleSpecifier && isStringLiteral(node.moduleSpecifier)) {
                const targetModule = node.moduleSpecifier.text;
                if (targetModule.endsWith('.js')) {
                    const newTarget = targetModule.slice(0, targetModule.length - 3);
                    return isImportDeclaration(node) ?
                        ts.updateImportDeclaration(
                            node,
                            node.decorators,
                            node.modifiers,
                            node.importClause,
                            ts.createLiteral(newTarget)
                        ) :
                        ts.updateExportDeclaration(
                            node,
                            node.decorators,
                            node.modifiers,
                            node.exportClause,
                            ts.createLiteral(newTarget)
                        );
                }
            }
            return ts.visitEachChild(node, visitNode, context);
        }
    }
}


module.exports = {
    entry: './src/Main.ts',
    // devtool: 'inline-source-map',
    mode:"development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: { getCustomTransformers }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    }
};