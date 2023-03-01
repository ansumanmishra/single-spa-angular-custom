# Single SPA Angular Custom

After adding single spa angular (ng add single-spa-angular) schematics in any angular application, the application does not work without single spa container anymore. This schematics helps in creating a new profile in `angular.json` which fixes the application in standalone mode.

### Installing

First run the `single-spa-angular` schematics (Skip this step if single spa angular schematic is already added)

```bash
ng add single-spa-angular
```

After it's successfully done execute:

```bash
ng add single-spa-angular-custom
```

If Angular cli is not installed gloablly

```bash
npx ng add single-spa-angular-custom
```

It adds the following scrips to `package.json`

```bash
"start": "ng run <project name>:serve-local --port 4300", // You will be prompted to enter the port while running the schematics
"build": "ng run <project name>:build-local",
```

Now run `npm start`. You should be able to run your application locally without Single spa container

```bash
http://localhost:4300
```
