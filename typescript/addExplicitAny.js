// A node script to convert all implicit any types in your project to explicit any types

// add jscodeshift
// npm install -g jscodeshift`
// or
// npm install --save-dev jscodeshift

// run `jscodeshift -t ./addExplicitAny.js <folder>` replacing "<folder>" with whatever folder you have your files in to explicitly type with any, for example: "src"

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Traverse the AST and find all variable declarations without a type annotation
  root
    .find(j.VariableDeclarator)
    .filter((path) => {
      const { node } = path;
      return node.id.typeAnnotation == null;
    })
    .forEach((path) => {
      const { node } = path;
      const varName = node.id.name;
      const varInit = node.init;

      // Check if the variable is implicitly any
      if (
        varInit &&
        varInit.type === "Identifier" &&
        varInit.name === "undefined"
      ) {
        node.id.typeAnnotation = j.typeAnnotation(j.anyTypeAnnotation());
      }
    });

  // Traverse the AST and find all function parameters without a type annotation
  root.find(j.FunctionDeclaration).forEach((path) => {
    path.node.params.forEach((param) => {
      if (param.typeAnnotation == null) {
        param.typeAnnotation = j.typeAnnotation(j.anyTypeAnnotation());
      }
    });
  });

  root.find(j.ArrowFunctionExpression).forEach((path) => {
    path.node.params.forEach((param) => {
      if (param.typeAnnotation == null) {
        param.typeAnnotation = j.typeAnnotation(j.anyTypeAnnotation());
      }
    });
  });

  // Traverse the AST and find all function return types without a type annotation
  root
    .find(j.FunctionDeclaration)
    .filter((path) => path.node.returnType == null)
    .forEach((path) => {
      path.node.returnType = j.typeAnnotation(j.anyTypeAnnotation());
    });

  root
    .find(j.ArrowFunctionExpression)
    .filter((path) => path.node.returnType == null)
    .forEach((path) => {
      path.node.returnType = j.typeAnnotation(j.anyTypeAnnotation());
    });

  return root.toSource();
};
