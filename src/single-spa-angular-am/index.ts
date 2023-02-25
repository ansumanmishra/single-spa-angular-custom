import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';

export function singleSpaAngularAm(options: any): Rule {
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
      _createLocalBuildProfile(project, options, workspaceConfig),
      _createLocalServeProfile(project, options, workspaceConfig),
    ]);
  };
}

function _createLocalServeProfile(
  project: any,
  options: any,
  workspaceConfig: any
) {
  return (host: Tree) => {
    const serveConfig = project.architect?.serve;
    if (!serveConfig) {
      throw new Error(
        `Could not find 'serve' configuration in project '${options.project}' in angular.json`
      );
    }

    const serveLocalConfig = JSON.parse(JSON.stringify(serveConfig));
    serveLocalConfig.configurations.production.browserTarget =
      'single-spa-angular-am-testing:build-local:production';
    serveLocalConfig.configurations.development.browserTarget =
      'single-spa-angular-am-testing:build-local:development';

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
) {
  return (host: Tree) => {
    const buildConfig = project.architect?.build;
    if (!buildConfig) {
      throw new Error(
        `Could not find 'build' configuration in project '${options.project}' in angular.json`
      );
    }

    const buildLocalConfig = JSON.parse(JSON.stringify(buildConfig));
    buildLocalConfig.options.tsConfig = 'tsconfig.local.json';

    const newTargetName = 'build-local';
    project.architect[newTargetName] = buildLocalConfig;

    host.overwrite('angular.json', JSON.stringify(workspaceConfig, null, 2));

    return host;
  };
}
