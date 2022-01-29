import dedent from "dedent";
import fs from "fs";
import path from "path";
import { Node, Project, ts, Type } from "ts-morph";
import { config } from "./config";

const INTERNAL_METHODS = ["__onStart__", "__version__", "__help__"];

export async function build() {
  const project = new Project({
    compilerOptions: { outDir: "dist", declaration: true, strict: true },
  });

  project.addSourceFilesAtPaths("index.ts");
  const file = project.getSourceFile("index.ts");

  if (!file) {
    throw new Error(`index.js does not exsist`);
  }

  let functions = file.getFunctions().filter((fn) => {
    const name = fn.getName();
    return name && !INTERNAL_METHODS.includes(name);
  });

  const definitions: Record<
    string,
    {
      params: ParamItem[];
    }
  > = {};

  type ParamType = string | ParamItem;

  type ParamItem = {
    name: string;
    key?: string;
    index?: number;
    types?: ParamType[];
    object?: ParamItem[];
  };

  function buildParamTypes(
    type: Type<ts.Type>,
    extraInfo: {
      node?: Node<ts.Node>;
      key?: string;
      name?: string;
    }
  ): ParamItem {
    const { node, key } = extraInfo;
    const name = extraInfo.name ?? "";

    const types = (type.isUnion() ? type.getUnionTypes() : [type])
      .map((unionType) => {
        const unionTypeName = unionType.getText();

        if (unionType.isLiteral()) {
          return unionType.getApparentType().getText().toLowerCase();
        }

        switch (unionTypeName.toLowerCase()) {
          case "string":
          case "number":
          // case "bigint"
          case "boolean":
          case "null":
          case "undefined":
            // case "symbol":
            return unionTypeName;
        }

        // fall back to object
        if (node) {
          const properties = unionType.getProperties().map((t) => {
            return buildParamTypes(t.getTypeAtLocation(node), {
              name: `${name}.${t.getName()}`,
              key: t.getName(),
            });
          });
          const obj: ParamItem = {
            name,
            object: properties,
          };
          return obj;
        }

        // TODO: handle array type
      })
      .filter((value, index, array) => {
        return array.indexOf(value) === index;
      });

    const output: ParamItem = {
      name,
      key,
      types: types as ParamItem[],
    };

    return output;
  }

  for (let fn of functions) {
    let params = [];

    for (const param of fn.getParameters()) {
      params.push(
        buildParamTypes(param.getType(), {
          node: param,
          name: param.getName(),
        })
      );
    }

    const name = fn.getName();
    if (name) {
      definitions[name] = {
        params,
      };
    }
  }

  fs.writeFileSync(
    path.join(config.outputDir, "cli.json"),
    JSON.stringify(definitions, null, 2)
  );

  fs.writeFileSync(
    "cli.ts",
    dedent`
      #!/usr/bin/env node
      import { cli } from "./index";
      import { run } from "${config.packageName}";
      run(__dirname, cli);
    `
  );
}