const axios = require('axios');
const axiosHttp = require('axios/lib/adapters/http');

const client = axios.create({
  adapter: axiosHttp,
});

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} params - Contains entity data including featuresValues.
 * @param {Object} params.connectionValues - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job that has already been filled
 * @return {Array<{id, label}>} - the array of id and label of the values
 */
exports.getDatasets = async ({ connectionValues, parameters }) => {
  const { data: datasets } = await client.get(`${connectionValues.url}/api/demo/datasets`);

  if (!datasets || !datasets.length) {
    return [];
  }

  return datasets.map(({ name, id }) => ({ id, label: name }));
};
