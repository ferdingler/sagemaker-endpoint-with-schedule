const AWS = require('aws-sdk');

const sageMaker = new AWS.SageMaker();
const endpointConfig = process.env['SAGE_MAKER_ENDPOINT_CONFIG'];
const endpointName = process.env['SAGE_MAKER_ENDPOINT'];

exports.startEndpoint = async () => {
  console.log('Creating endpoint with config', endpointName, endpointConfig);
  return sageMaker.createEndpoint({
    EndpointConfigName: endpointConfig,
    EndpointName: endpointName,
  }).promise();
};

exports.stopEndpoint = async () => {
  console.log('Deleting endpoint', endpointName);
  return sageMaker.deleteEndpoint({
    EndpointName: endpointName,
  }).promise();
};