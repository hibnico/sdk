const path = require('path');
const chalk = require('chalk');
const slugify = require('slugify');
const inquirer = require('inquirer');

const { version } = require('../../../package.json');
const isRoot = require('../validators/isRoot');
const output = require('../utils/output');
const copyTemplateFolder = require('../utils/copyTemplateFolder');
const { CONTEXT, TECHNOLOGY, CONNECTION_TYPE } = require('../constants');

const askTechnologyInfo = require('./init/askTechnologyInfo');
const askContextInfo = require('./init/askContextInfo');
const askConnectionTypeInfo = require('./init/askConnectionTypeInfo');
const askShouldCreateContext = require('./init/askShouldCreateContext');
const askFolderDestination = require('./init/askFolderDestination');

const TEMPLATE_FOLDER = '../templates';

const askType = async () => inquirer.prompt([
  {
    type: 'list',
    name: 'type',
    message: 'Choose the type of metadata to create',
    choices: ['technology', 'connection type'],
  },
]);

const createTechnology = async () => {
  // 1. Ask user

  const technoAnswers = await askTechnologyInfo();
  const shoudlCreateContext = await askShouldCreateContext();
  const contextAnswers = shoudlCreateContext ? await askContextInfo() : {};
  const folder = await askFolderDestination(technoAnswers.id);

  // 2. Generate files

  await copyTemplateFolder({
    src: path.resolve(__dirname, TEMPLATE_FOLDER, TECHNOLOGY.ID),
    dest: folder,
    variables: {
      ...technoAnswers,
      npmVersion: version,
      npmName: slugify(technoAnswers.id, { strict: true }),
    },
  });

  if (shoudlCreateContext) {
    const contextFolder = path.resolve(folder, contextAnswers.id);
    await copyTemplateFolder({
      src: path.resolve(__dirname, TEMPLATE_FOLDER, CONTEXT.ID),
      dest: contextFolder,
      variables: { ...contextAnswers },
    });
  }

  // 3. Output

  output.log(chalk`

{bold {green 🎉 ${technoAnswers.label} technology generated with success 🎉}}

New technology available in {italic ${folder}}
Inside that directory, you can run several commands:

  {cyan yarn start}
    Start the development server.

  {cyan yarn run build}
    Bundle the technology for the Saagie platform.

  {cyan yarn run new:context}
    Generate a new context.

We suggest that you begin by typing:

  {cyan cd} {italic ${folder}}
  {cyan yarn start}

  `);
};

const createContext = async () => {
  // 1. Ask user

  const contextAnswers = await askContextInfo();
  const folder = await askFolderDestination(contextAnswers.id);

  // 2. Generate files

  await copyTemplateFolder({
    src: path.resolve(__dirname, TEMPLATE_FOLDER, CONTEXT.ID),
    dest: folder,
    variables: { ...contextAnswers },
  });

  // 3. Output

  output.log(chalk`

{bold {green Context '${contextAnswers.label}' generated with success}}

New context available in {italic ${folder}}
  `);
};

const createConnectionType = async () => {
  // 1. Ask user

  const connectionAnswers = await askConnectionTypeInfo();
  const folder = await askFolderDestination(connectionAnswers.id);

  // 2. Generate files

  await copyTemplateFolder({
    src: path.resolve(__dirname, TEMPLATE_FOLDER, CONNECTION_TYPE.ID),
    dest: folder,
    variables: {
      ...connectionAnswers,
      npmVersion: version,
      npmName: slugify(connectionAnswers.id, { strict: true }),
    },
  });

  // 3. Output

  output.log(chalk`

{bold {green 🎉 ${connectionAnswers.label} connection type generated with success 🎉}}

New connection type available in {italic ${folder}}
  `);
};

module.exports = async () => {
  output.log(chalk`
{bold Saagie 📦 SDK - v${version}}
📚 {italic Full documentation:} {cyan http://go.saagie.com/sdk-docs}`); // TODO fix that link

  const isTechnoAlreadyExist = await isRoot();

  if (!isTechnoAlreadyExist) {
    const typeAnswer = await askType();
    if (typeAnswer.type === 'technology') {
      await createTechnology();
    } else {
      await createConnectionType();
    }
  } else {
    output.log(chalk`
ℹ️  {bold This folder already contains a technology.yaml file.}
    {cyan ↳ Technology creation skipped}`);
    await createContext();
  }
};
