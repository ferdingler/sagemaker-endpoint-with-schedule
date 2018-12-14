sam deploy --template-file ./packaged.yaml \
--stack-name fdingler-sagemaker \
--parameter-overrides ModelLocation=s3://fdingler-image-classification/DEMO-imageclassification/output/DEMO-imageclassification-2018-11-30-04-27-35/output/model.tar.gz \
--capabilities CAPABILITY_IAM