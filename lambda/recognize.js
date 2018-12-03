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
  return (imageResponse)? imageResponse.data : null;
};

const invokeSageMaker = async (payload) => {
  const inference = await sageMaker.invokeEndpoint({
    Body: payload,
    EndpointName: sageMakerEndpoint,
    ContentType: 'application/x-image',
  }).promise();

  if (!inference.Body)
    return null;

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

const builResponse = (statusCode, body) => {
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
  if (!imageUrl) {
    console.log('No imageUrl found on payload ');
    return builResponse(400, 'No imageUrl key found on payload');
  }

  const image = await loadImageFromUrl(imageUrl);
  if (!image) {
    console.log('Unable to download image from URL');
    return builResponse(400, 'Unable to download image from URL');
  }

  const inference = await invokeSageMaker(image);
  if (!inference) {
    return builResponse(500, 'SageMaker model was not able to classify the image');
  }

  return builResponse(200, JSON.stringify(inference));
};
