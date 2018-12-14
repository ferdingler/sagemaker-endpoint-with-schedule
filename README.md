## Cost Effective Image Classification on SageMaker

This sample project demonstrates a cost effective image classification endpoint in SageMaker. What makes it low cost
is the use of Elastic Inference (if needed) and lambda functions to stop and start the endpoint on a schedule. The use case is 
when you don't need the endpoint running at night or weekends for example. Stopping the SageMaker endpoint means you 
are not paying for the underlying ML instances. 


![Architecture](./arch.png)

```bash
.
├── README.md                   <-- This instructions file
├── package.sh                  <-- Run to package the Lambda functions
├── deploy.sh                   <-- Run to deploy the Lambda functions
├── lambda                      <-- Source code for a lambda function
│   ├── recognize.js            <-- Receives requests from API GW and invokes SageMaker
│   ├── cron.js                 <-- Functions to stop and start SageMaker endpoint
│   ├── customResource.js       <-- Function to create a SageMakerEndpointConfiguration that supports ElasticInference
│   ├── package.json            <-- NodeJS dependencies
└── template.yaml               <-- SAM template
```

## Requirements

* AWS CLI already configured with at least PowerUser permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* [Docker installed](https://www.docker.com/community-edition)

## Setup process

### Installing dependencies

```bash
cd lambda
npm install
cd ../
```

## Packaging and deployment

Firstly, we need an `S3 bucket` where we can upload our Lambda functions packaged as ZIP before we deploy anything - If you don't have a S3 bucket to store code artifacts then this is a good time to create one:

```bash
aws s3 mb s3://BUCKET_NAME
```

Next, modify the `package.sh` file to update it with the bucket you just created. Then you 
can run the package script. 

```bash
./package.sh
```

Next, the deploy command will create a CloudFormation Stack and deploy your SAM resources.

```bash
./deploy.sh
```

> **See [Serverless Application Model (SAM) HOWTO Guide](https://github.com/awslabs/serverless-application-model/blob/master/HOWTO.md) for more details in how to get started.**

## Elastic Inference

At the moment of writing this example, CloudFormation does not have support for adding ElasticInference acceleration to 
a SageMaker endpoint, so I had to write a Lambda-backed custom resource. The code for this is in `lambda/customResource.js`.