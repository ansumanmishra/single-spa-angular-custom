import { Rule, Tree } from '@angular-devkit/schematics';

export function _createLocalBuildProfile(
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
    const existingBuilder = buildLocalConfig.builder;

    if (existingBuilder !== '@angular-builders/custom-webpack:browser') {
      throw new Error(
        `Could not find single spa configured in this project. Run 'ng add single-spa-angular' before running this schematics`
      );
    }

    buildLocalConfig.builder = '@angular-devkit/build-angular:browser';

    buildLocalConfig.options.tsConfig = 'tsconfig.local.json';
    buildLocalConfig.options.main = 'src/main.ts';
    buildLocalConfig.configurations.production.outputHashing = 'all';

    delete buildLocalConfig.configurations.development.outputHashing;
    delete buildLocalConfig.options.customWebpackConfig;
    delete buildLocalConfig.options.deployUrl;

    const newTargetName = 'build-local';
    project.architect[newTargetName] = buildLocalConfig;

    host.overwrite('angular.json', JSON.stringify(workspaceConfig, null, 2));

    return host;
  };
}
