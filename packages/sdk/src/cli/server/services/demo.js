const express = require('express');

const STATUS = {
  STOPPED: 'STOPPED',
  IN_PROGRESS: 'IN_PROGRESS',
};

const datasets = [
  {
    id: '1', name: 'First Dataset', status: undefined, logs: [],
  },
  {
    id: '2', name: 'Second Dataset', status: undefined, logs: [],
  },
  {
    id: '3', name: 'Third Dataset', status: undefined, logs: [],
  },
  {
    id: '4', name: 'Fourth Dataset', status: undefined, logs: [],
  },
  {
    id: '5', name: 'Fifth Dataset with a very long name containing spaces. Helpful to check the behavior of the Select Box input type.', status: undefined, logs: [],
  },
];

const logs = [
  'Cleaning workspace',
  'Installing dependencies',
  'Fetching data',
  'Working good',
  'Hello World',
];

const demoApp = express();

demoApp.get('/datasets', (req, res) => {
  res.send(datasets);
});

const getData = (id) => datasets[datasets.findIndex((dataset) => dataset.id === id)];

demoApp.post('/datasets/:id/start', (req, res) => {
  const selectedDataset = getData(req.params.id);
  if (selectedDataset) {
    selectedDataset.status = STATUS.IN_PROGRESS;
    res.send(selectedDataset);
  } else {
    res.sendStatus(404);
  }
});

demoApp.post('/datasets/:id/stop', (req, res) => {
  const selectedDataset = getData(req.params.id);
  if (selectedDataset) {
    selectedDataset.status = STATUS.STOPPED;
    res.send(selectedDataset);
  } else {
    res.sendStatus(404);
  }
});

demoApp.get('/datasets/:id/logs', (req, res) => {
  const selectedDataset = getData(req.params.id);
  if (selectedDataset) {
    const randomLogsIndex = Math.floor(Math.random() * logs.length);

    // Push a new log in the logs array for the example. Each request will create
    // a new object.
    selectedDataset.logs.push({
      // eslint-disable-next-line security/detect-object-injection
      log: `[LOGS] Log for the dataset ${selectedDataset.id}: ${logs[randomLogsIndex]}`,
      output: randomLogsIndex % 2 === 0 ? 'stdout' : 'stderr',
      time: (new Date()).toISOString(),
    });

    res.send({
      logs: selectedDataset.logs,
    });
  } else {
    res.sendStatus(404);
  }
});

demoApp.get('/datasets/:id', (req, res) => {
  const selectedDataset = getData(req.params.id);
  if (selectedDataset) {
    res.send(selectedDataset);
  } else {
    res.sendStatus(404);
  }
});

module.exports = demoApp;
