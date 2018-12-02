# mantis-api

```bash
.
├── README.md                   <-- This instructions file
├── package.sh                  <-- Run to package the Lambda functions
├── deploy.sh                   <-- Run to deploy the Lambda functions
├── lambda                      <-- Source code for a lambda function
│   ├── recognize.js            <-- Lambda to invoke SageMaker
│   ├── cron.js                 <-- Lambdas to stop and start SageMaker endpoint
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

### Local development

**Invoking functions locally through local API Gateway**

```bash
sam local start-api
```

If the previous command ran successfully you should now be able to hit the following local endpoint to invoke your function `http://localhost:3000/recognize`
with the following payload:

```javascript
{
  "imageUrl": "https://lorempixel.com/800/600"
}
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