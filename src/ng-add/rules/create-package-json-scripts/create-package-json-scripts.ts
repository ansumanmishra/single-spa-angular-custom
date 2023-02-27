import { join, normalize } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';
import { SchemaOptions } from '../../schema-options';

export function _addPackageJsonScripts(
  projectName: string,
  options: SchemaOptions
): Rule {
  return (tree: Tree) => {
    const packageJsonPath = join(normalize('package.json'));
    const packageJsonBuffer = tree.read(packageJsonPath);

    if (!packageJsonBuffer) {
      throw new Error(`Could not find ${packageJsonPath}`);
    }

    const packageJson = JSON.parse(packageJsonBuffer.toString());
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts.start = `ng run ${projectName}:serve-local --port ${options.port}`;
    packageJson.scripts.build = `ng run ${projectName}:build-local`;

    const updatedPackageJson = JSON.stringify(packageJson, null, 2);

    tree.overwrite(packageJsonPath, updatedPackageJson);
  };
}
