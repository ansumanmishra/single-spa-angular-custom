import { Rule, Tree } from '@angular-devkit/schematics';

export function _createLocalServeProfile(
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
    const existingBuilder = serveLocalConfig.builder;

    if (existingBuilder !== '@angular-builders/custom-webpack:dev-server') {
      throw new Error(
        `Could not find single spa configured in this project. Run 'ng add single-spa-angular' before running this schematics`
      );
    }

    serveLocalConfig.builder = '@angular-devkit/build-angular:dev-server';
    serveLocalConfig.configurations.production.browserTarget = `${projectName}:build-local:production`;
    serveLocalConfig.configurations.development.browserTarget = `${projectName}:build-local:development`;

    const newTargetName = 'serve-local';
    project.architect[newTargetName] = serveLocalConfig;

    host.overwrite('angular.json', JSON.stringify(workspaceConfig, null, 2));

    return host;
  };
}
