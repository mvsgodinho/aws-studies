# ECS Fargate Sample

Sample using CloudFormation + ecs-cli + docker-compose

## Prerequisites

 * [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
 * [ECS CLI](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html)

## Create a VPC

Use [this stack](./stack/vpc-2azs.yaml) to create a VPC.

## Create a ECS Fargate Cluster

Use [this stack](./stack/ecs-fargate.yaml) to create a Cluster and an ALB.

## Configure ecs-cli

Export the Cluster name from your stack:

```bash
export ECS_STACK_NAME=ecs-fargate
export ECS_CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='Cluster'].OutputValue" --output text)
```

Export region from AWS CLI configuration:

```bash
export AWS_REGION=$(aws configure get region)
```

Configure your with your cluster and region:

```bash
ecs-cli configure --cluster $ECS_CLUSTER_NAME --region $AWS_REGION --default-launch-type FARGATE
```

## Export ecs-params.yml env variables

Exporting variables from stack:

```bash
export VPC_STACK_NAME=ecs-vpc

export SUBNET_A=$(aws cloudformation describe-stacks --stack-name $VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SubnetAPublic'].OutputValue" --output text)

export SUBNET_B=$(aws cloudformation describe-stacks --stack-name $VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SubnetBPublic'].OutputValue" --output text)

export LB_SECURITY_GROUP=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerSecurityGroup'].OutputValue" --output text)

export LB_TARGET_GROUP=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='TargetGroup'].OutputValue" --output text)
```

## Create and run a service

```bash
ecs-cli compose service up  \
--target-group-arn $LB_TARGET_GROUP \
--container-name web \
--container-port 80
```