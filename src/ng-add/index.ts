import { join, normalize } from '@angular-devkit/core';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';

interface SchemaOptions {
  project: string;
  port: number;
}

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
      _addPackageJsonScripts(projectName),
    ]);
  };
}

function _createLocalServeProfile(
  project: any,
  options: any,
  workspaceConfig: any,
  projectName: string
): Rule {
  return (host: Tree) => {
    const serveConfig = project.architect?.serve;
    if (!serveConfig) {
      throw new Error(
        `Could not find 'serve' configuration in project '${options.project}' in angular.json`
      );
    }

    const serveLocalConfig = JSON.parse(JSON.stringify(serveConfig));
    serveLocalConfig.builder = '@angular-devkit/build-angular:dev-server';
    serveLocalConfig.configurations.production.browserTarget = `${projectName}:build-local:production`;
    serveLocalConfig.configurations.development.browserTarget = `${projectName}:build-local:development`;

    const newTargetName = 'serve-local';
    project.architect[newTargetName] = serveLocalConfig;

    host.overwrite('angular.json', JSON.stringify(workspaceConfig, null, 2));

    return host;
  };
}

function _createLocalBuildProfile(
  project: any,
  options: any,
  workspaceConfig: any
): Rule {
  return (host: Tree) => {
    const buildConfig = project.architect?.build;
    if (!buildConfig) {
      throw new Error(
        `Could not find 'build' configuration in project '${options.project}' in angular.json`
      );
    }

    const buildLocalConfig = JSON.parse(JSON.stringify(buildConfig));
    buildLocalConfig.builder = '@angular-devkit/build-angular:browser';

    buildLocalConfig.options.tsConfig = 'tsconfig.local.json';
    buildLocalConfig.options.main = 'src/main.ts';
    delete buildLocalConfig.options.customWebpackConfig;
    delete buildLocalConfig.options.deployUrl;

    const newTargetName = 'build-local';
    project.architect[newTargetName] = buildLocalConfig;

    host.overwrite('angular.json', JSON.stringify(workspaceConfig, null, 2));

    return host;
  };
}

function _createTSConfigFile(project: any): Rule {
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

function _addPackageJsonScripts(projectName: string): Rule {
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

    packageJson.scripts.start = `ng run ${projectName}:serve-local --port 4200`;
    packageJson.scripts.build = `ng run ${projectName}:build-local`;

    const updatedPackageJson = JSON.stringify(packageJson, null, 2);

    tree.overwrite(packageJsonPath, updatedPackageJson);
  };
}
