# PE-JS

A Typescript implementation of the DIF Presentation Exchange specification.

## Running the test/build scripts
This project has been created using:
* `yarn` version 1.22.5
* `node` version 12.22.1

### Install
```shell
yarn install
```
### Build
```shell
yarn build
```
### Test
The test command runs:
* `eslint`
* `prettier`
* `unit`

You can also run only a single section of these tests, using for example `yarn test:unit`.
```shell
yarn test
```

### Utility scripts
There are several other utility scripts that help with development.

* `yarn fix` - runs `eslint --fix` as well as `prettier` to fix code style
* `yarn cov` - generates code coverage report

