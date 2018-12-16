const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');
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

const sendResponse = async (event, context, status, physicalResourceId, err, data) => {
  const json = JSON.stringify({
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    PhysicalResourceId: physicalResourceId || context.logStreamName,
    Status: status,
    Reason: "See details in CloudWatch Log: " + context.logStreamName,
    Data: data || { 'Message': status }
  });

  console.log("RESPONSE: ", json);
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: "PUT",
    headers: {
      "content-type": "",
      "content-length": json.length
    }
  };

  const request = https.request(options, response => {
    console.log("STATUS: " + response.statusCode);
    console.log("HEADERS: " + JSON.stringify(response.headers));
    context.done();
  });

  request.on("error", error => {
    console.log("sendResponse rrror: ", error);
    context.done();
  });

  request.write(json);
  request.end();
};

exports.handler = async (event, context) => {
  console.log('event', JSON.stringify(event));
  const { RequestType } = event;

  try {
    if (RequestType === 'Delete') {
      await deleteEndpointConfig(event);
      return sendResponse(event, context, "SUCCESS");
    }

    if (RequestType === 'Create') {
      const result = await createEndpointConfig(event);
      return sendResponse(event, context, "SUCCESS", { Id: result.EndpointConfigArn });
    }
  } catch(err) {
    return sendResponse(event, context, "FAILED");
  }

  return sendResponse(event, context, "SUCCESS");
};
