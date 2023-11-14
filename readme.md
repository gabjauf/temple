# ⛪ Temple

Experimenting with templating for code generation
- Composability: import other template modules, either a directory or a remote archive
- Any language: generate in any language
- Declarative: specify the input as JSON schemas and templates as EJS formats
- Testable: write tests on what you generate. No more breaking templates.
- Made to embrace project scaffolding AND regular code regeneration when spec changed (see OpenApi generation)

To confirm
- Safe: validation upfront and safe code (javascript) execution

## ⚠️ Security warning

Current version is unstable and you should consider the following:
- Security was not tested yet, so do not use with uncontrolled templates
- At the current stage of the project, it is not guaranteed that the safe javascript execution can be attained

## Usage

As of now, it is too early to put the tool on npm.
To use it you need to

- Clone this repo
- `npm i`
- `npm build`
- `npm link`
- Command should now be available as `temple`

## Creating a template

Templates are a directory with the following files / folders:

- config.json => contains the shema of the inputs, eventually some imports. May contain the prompting instruction but as of now, it is unstable.
- Template directory => contains all the templated files with the expected structure. File names can be templated as well with between "$$" notation. Syntax is in the `src/filename-grammar.ohm`file and is mostly javascript like.
- Components directory => contains partials

As of now, the format of templated files is `ejs` but it may change in the future.

## Ideal worklow

Right now, what we mostly see is either:
- Project scaffolding generation (yeoman, create-react-app)
- Component generation (angular cli)
- Mutable generation tools (hygen)

The issue of these means that code generation is not part of the development experience, which means we keep making things again and againg manually. Mutability of the generated files is also a problem, it means that:
- Regeneration will erase your modifications
- If regeneration takes mutated data in account, it means that complexity is added to the system to determine what has changed or not.

An ideal workflow would be:
- Create configuration file for template
- Generate code with config file as input and the template
- Spec changed ? Modify the file, regenerate the code and make adjustments to the code that imports if necessary.

## Roadmap
- [x] Generate base project
- [x] OpenApi Fastify middleware generator
- [x] Import from another template
- [ ] Safety with isolated-vm
- [ ] Type checking ?
- [ ] OpenApi Elysia middleware generator
- [ ] OpenApi Prisma generator for CRUD like apps (feasible ?)
- [ ] Better EJS syntax (hate it, made for HTML)
