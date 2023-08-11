import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

function convertirACamelCase(texto: string): string {
  return texto
    .trim()
    .split(/\s+/)
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    )
    .join("");
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "rapid-react-component.crearComponenteReact",
    async (uri: vscode.Uri) => {
      const nombreComponente = await vscode.window.showInputBox({
        prompt: "Nombre del componente?",
      });
      if (!nombreComponente) return;

      const nombreComponenteCamelCase = convertirACamelCase(nombreComponente);

      const nombreComponenteCapitalizado =
        nombreComponenteCamelCase.charAt(0).toUpperCase() +
        nombreComponenteCamelCase.slice(1);
      const nombreComponenteMinuscula = nombreComponenteCamelCase.toLowerCase();

      const lenguaje = await vscode.window.showQuickPick(
        ["TypeScript (recomendado)", "JavaScript"],
        { placeHolder: "¿Qué lenguaje deseas?" }
      );
      if (!lenguaje) return;

      const extension =
        lenguaje === "TypeScript (recomendado)" ? ".tsx" : ".jsx";

      const tipoCSS = await vscode.window.showQuickPick(
        ["Styled-Components", "CSS Modules", "CSS nativo"],
        { placeHolder: "¿Qué tipo de archivo de CSS deseas?" }
      );
      if (!tipoCSS) return;

      const tieneTest = await vscode.window.showQuickPick(
        ["Sí (recomendado)", "No"],
        { placeHolder: "¿Quieres archivos de test?" }
      );
      if (!tieneTest) return;

      const estiloExtension =
        lenguaje === "TypeScript (recomendado)" ? "ts" : "js";

      let importStyles = "";
      let className = "";
      let contenidoStyles = "";

      switch (tipoCSS) {
        case "Styled-Components":
          importStyles = `import {StyledDiv} from './${nombreComponenteMinuscula}.styles.${estiloExtension}';\n`;
          contenidoStyles =
            'import styled from "styled-components";\n\nexport const StyledDiv = styled.div``;\n';
          className = "StyledDiv";
          break;
        case "CSS Modules":
          importStyles = `import styles from './${nombreComponenteMinuscula}.module.css';\n`;
          className = `div className={styles.${nombreComponenteMinuscula}}`;
          contenidoStyles = `.${nombreComponenteMinuscula} {\n\n}\n`;
          break;
        case "CSS nativo":
          importStyles = `import './${nombreComponenteMinuscula}.css';\n`;
          className = `div className="${nombreComponenteMinuscula}"`;
          contenidoStyles = `.${nombreComponenteMinuscula} {\n\n}\n`;
          break;
      }

      const contenidoComponente = `${importStyles}
const ${nombreComponenteCapitalizado} = () => {
    return (
        <${className}>${nombreComponenteCapitalizado}</${
        className.split(" ")[0]
      }>
    )
}
export default ${nombreComponenteCapitalizado}
`;

      const directorioComponente = path.join(
        uri.fsPath,
        nombreComponenteCapitalizado
      );
      if (!fs.existsSync(directorioComponente)) {
        fs.mkdirSync(directorioComponente);
      }

      fs.writeFileSync(
        path.join(
          directorioComponente,
          `${nombreComponenteCapitalizado}${extension}`
        ),
        contenidoComponente
      );

      if (tipoCSS === "Styled-Components") {
        fs.writeFileSync(
          path.join(
            directorioComponente,
            `${nombreComponenteMinuscula}.styles.${estiloExtension}`
          ),
          contenidoStyles
        );
      } else if (tipoCSS === "CSS Modules") {
        fs.writeFileSync(
          path.join(
            directorioComponente,
            `${nombreComponenteMinuscula}.module.css`
          ),
          contenidoStyles
        );
      } else {
        fs.writeFileSync(
          path.join(directorioComponente, `${nombreComponenteMinuscula}.css`),
          contenidoStyles
        );
      }

      if (tieneTest === "Sí (recomendado)") {
        fs.writeFileSync(
          path.join(
            directorioComponente,
            `${nombreComponenteCapitalizado}.test${extension}`
          ),
          ""
        );
      }
      const uriArchivoComponente = vscode.Uri.file(
        path.join(
          directorioComponente,
          `${nombreComponenteCapitalizado}${extension}`
        )
      );
      vscode.window.showTextDocument(uriArchivoComponente);
    }
  );

  context.subscriptions.push(disposable);
}
