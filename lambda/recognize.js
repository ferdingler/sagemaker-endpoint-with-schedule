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

exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));
  const { imageUrl } = JSON.parse(event.body);
  if (!imageUrl) {
    console.log('No imageUrl found on payload ');
    return {
      statusCode: 400,
      body: 'No imageUrl key found on payload'
    };
  }

  const image = await loadImageFromUrl(imageUrl);
  if (!image) {
    console.log('Unable to download image from URL');
    return {
      statusCode: 400,
      body: 'Unable to download image from URL'
    };
  }

  const inference = await invokeSageMaker(image);
  if (!inference) {
    return {
      statusCode: 500,
      body: 'SageMaker model was not able to classify the image',
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(inference),
  };
};
