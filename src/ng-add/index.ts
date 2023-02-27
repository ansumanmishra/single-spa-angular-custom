import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { _createLocalBuildProfile } from './rules/create-local-build-profile/create-local-build-profile';
import { _createLocalServeProfile } from './rules/create-local-serve-profile/create-local-serve-profile';
import { _addPackageJsonScripts } from './rules/create-package-json-scripts/create-package-json-scripts';
import { _createTSConfigFile } from './rules/create-tsconfig-file/create-tsconfig-file';
import { SchemaOptions } from './schema-options';

export function singleSpaAngularCustom(options: SchemaOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfigBuffer = tree.read('angular.json');
    if (!workspaceConfigBuffer) {
      throw new Error('Could not find angular.json');
    }

    const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
    const projectName = options.project || workspaceConfig.defaultProject;

    const project = workspaceConfig.projects[projectName];
    if (!project) {
      throw new Error(
        `Could not find project '${options.project}' in angular.json`
      );
    }

    return chain([
      _createLocalServeProfile(project, options, workspaceConfig, projectName),
      _createLocalBuildProfile(project, options, workspaceConfig),
      _createTSConfigFile(project),
      _addPackageJsonScripts(projectName, options),
    ])(tree, _context);
  };
}
