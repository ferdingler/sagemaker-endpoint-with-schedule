const AWS = require('aws-sdk');
const SageMaker = new AWS.SageMaker();

const createEndpointConfig = async (event) => {
  const {
    EndpointConfigName,
    InitialInstanceCount,
    InstanceType,
    ModelName,
    VariantName,
    AcceleratorType,
    InitialVariantWeight
  } = event.ResourceProperties;

  return SageMaker.createEndpointConfig({
    EndpointConfigName,
    ProductionVariants: [{
      InitialInstanceCount: parseInt(InitialInstanceCount),
      InstanceType,
      ModelName,
      VariantName,
      AcceleratorType,
      InitialVariantWeight: parseFloat(InitialVariantWeight),
    }],
  }).promise();
};

const deleteEndpointConfig = async (event) => {
  return SageMaker.deleteEndpointConfig({
    EndpointConfigName: event.ResourceProperties.EndpointConfigName,
  }).promise;
};

exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));
  const { RequestType } = event;
  if (RequestType === 'Update') {
    // Need to handle how to update endpoint config
    return true;
  }

  if (RequestType === 'Delete') {
    return deleteEndpointConfig(event);
  }

  return createEndpointConfig(event);
};
