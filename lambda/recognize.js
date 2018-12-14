const axios = require('axios');
const _ = require('lodash');
const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const { categories } = require('./categories');
const sageMaker = new AWS.SageMakerRuntime();
const sageMakerEndpoint = process.env['SAGE_MAKER_ENDPOINT'];


const loadImageFromUrl = async (url) => {
  const imageResponse = await axios({
    method: 'get',
    url: url,
    responseType: 'arraybuffer',
  });
  return (imageResponse)? imageResponse : null;
};

const invokeSageMaker = async (payload) => {
  console.log('Invoking SageMaker', sageMakerEndpoint);
  const inference = await sageMaker.invokeEndpoint({
    Body: payload.data,
    EndpointName: sageMakerEndpoint,
    ContentType: 'application/x-image',
  }).promise();

  if (!inference.Body)
    return null;

  console.log('SageMaker response', inference.Body);
  const classifications = JSON.parse(inference.Body.toString());
  const sorted = _.slice(classifications).sort((a, b) => b - a);
  const top = _.take(sorted, 5);
  return top.map(prob => {
    const index = classifications.indexOf(prob);
    return {
      name: categories[index],
      probability: prob,
    };
  });
};

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};

exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));
  const { imageUrl } = JSON.parse(event.body);
  let inference = null;

  if (!imageUrl) {
    console.log('No imageUrl found on payload ');
    return buildResponse(400, 'No imageUrl key found on payload');
  }

  const image = await loadImageFromUrl(imageUrl);
  if (!image) {
    console.log('Unable to download image from URL');
    return buildResponse(400, 'Unable to download image from URL');
  }

  try {
    inference = await invokeSageMaker(image);
  } catch (err) {
    console.log('Failed to run inference', err);
    return buildResponse(500, 'Failed to run inference')
  }

  return buildResponse(200, JSON.stringify(inference));
};
