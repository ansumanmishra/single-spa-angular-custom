import { join, normalize } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';

export function _createTSConfigFile(project: any): Rule {
  return (host: Tree) => {
    const appRoot = join(normalize(project.root), '');
    const tsconfigFilePath = join(appRoot, 'tsconfig.app.json');
    const tsconfigLocalFilePath = join(appRoot, 'tsconfig.local.json');
    const tsconfigFileBuffer = host.read(tsconfigFilePath);

    if (!tsconfigFileBuffer) {
      throw new Error(`Could not find ${tsconfigFilePath}`);
    }

    const tsconfigLocalFileContent = tsconfigFileBuffer.toString();

    host.create(tsconfigLocalFilePath, tsconfigLocalFileContent);

    // Update tsconfig.app.local.json
    const tsconfigAppLocalContent = JSON.parse(
      host.read(tsconfigLocalFilePath)!.toString()
    );
    tsconfigAppLocalContent.files = ['src/main.ts', 'src/polyfills.ts'];
    host.overwrite(
      tsconfigLocalFilePath,
      JSON.stringify(tsconfigAppLocalContent, null, 2)
    );
  };
}
