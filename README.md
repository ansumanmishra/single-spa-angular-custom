# Getting Started With Schematics

This repository is a basic Schematic implementation that serves as a starting point to create and publish Schematics to NPM.

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with

```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!

To test in other projects locally

```bash
schematics ../single-spa-angular-custom/src/collection.json:single-spa-angular-custom --debug=false
```

For ng-add

```bash
schematics ../single-spa-angular-custom/src/collection.json:ng-add  --debug=false
```

--dry-run=false will also work
