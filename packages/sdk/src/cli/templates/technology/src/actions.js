const axios = require('axios');
const axiosHttp = require('axios/lib/adapters/http');

const client = axios.create({
  adapter: axiosHttp,
});

const JobStatus = {
  AWAITING: 'AWAITING',
  REQUESTED: 'REQUESTED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  KILLING: 'KILLING',
  KILLED: 'KILLED',
  FAILED: 'FAILED',
};

/**
 * Function to start the external job instance.
 *
 * It will be called first and once.
 *
 * @param {Object} params
 * @param {Object} params.connectionValues - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @return {Object} - the payload to be associated with the instance
 */
exports.start = async ({ connectionValues, parameters }) => {
  console.log('START:', parameters);
  const { data } = await client.post(`${connectionValues.url}/api/demo/datasets/${parameters.dataset}/start`);

  // You can return any payload you want to get in the stop and getStatus functions.
  return { customId: data.id };
};

/**
 * Function to stop the external job instance.
 *
 * It will be called if the end user is requesting it.
 *
 * @param {Object} params
 * @param {Object} params.connectionValues - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @param {Object} params.jobMetadata - Contains the payload returned by the start function.
 */
exports.stop = async ({ connectionValues, parameters, jobMetadata }) => {
  console.log('STOP:', jobMetadata);
  await client.post(`${connectionValues.url}/api/demo/datasets/${parameters.dataset}/stop`);
};

/**
 * Function to retrieve the external job instance status.
 *
 * It will be called at regular intervals, after the start.
 *
 * @param {Object} params
 * @param {Object} params.connectionValues - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @param {Object} params.jobMetadata - Contains the payload returned by the start function.
 * @return {string} - the status of the instance, one of JobStatus
 */
exports.getStatus = async ({ connectionValues, parameters, jobMetadata}) => {
  console.log('GET STATUS:', jobMetadata);
  const { data } = await client.get(`${connectionValues.url}/api/demo/datasets/${parameters.dataset}`);

  switch (data.status) {
    case 'IN_PROGRESS':
      return JobStatus.RUNNING;
    case 'STOPPED':
      return JobStatus.KILLED;
    default:
      return JobStatus.AWAITING;
  }
};

/**
 * Function to retrieve the external job instance logs.
 *
 * It will be called after the job is terminated, with failure or not.
 *
 * @param {Object} params
 * @param {Object} params.connectionValues - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @param {Object} params.jobMetadata - Contains the payload returned by the start function.
 * @return {Stream} - a stream of data for the logs
 */
exports.getLogs = async ({ connectionValues, parameters, jobMetadata}) => {
  console.log('GET LOG:', jobMetadata);
  const { data } = await client.get(
    `${connectionValues.url}/api/demo/datasets/${parameters.dataset}/logs`,
    {
      responseType: 'stream',
    }
  );

  return data;
};
