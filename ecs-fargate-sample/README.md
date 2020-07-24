# ECS Fargate Sample

Sample using CloudFormation + ecs-cli + docker-compose

## Prerequisites

 * [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
 * [ECS CLI](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html)

## Create a VPC

Use [this stack](./stack/vpc-2azs.yaml) to create a VPC.

## Create a ECS Fargate Cluster

Use [this stack](./stack/ecs-fargate.yaml) to create a Cluster and an ALB.

Using CLI:

```bash
export ECS_STACK_NAME=ecs-fargate
export VPC_STACK_NAME=ecs-vpc
aws cloudformation create-stack \
--stack-name $ECS_STACK_NAME \
--capabilities CAPABILITY_NAMED_IAM \
--template-body file://$(realpath ./stacks/ecs-fargate.yml) \
--parameters ParameterKey=ParentVPCStack,ParameterValue=$VPC_STACK_NAME
```

## Configure ecs-cli

Configure your with your cluster and region.
The cluster name is created with the same name of your CloudFormation stack.

```bash
export ECS_CLUSTER_NAME=$ECS_STACK_NAME
```

Export region from AWS CLI configuration:

```bash
export AWS_REGION=$(aws configure get region)
```

Configure:

```bash
ecs-cli configure --cluster $ECS_CLUSTER_NAME --region $AWS_REGION --default-launch-type FARGATE
```

## Export ecs-params.yml env variables

Exporting variables from stack. Example:

```bash
export SUBNET_A=$(aws cloudformation describe-stacks --stack-name $VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SubnetAPublic'].OutputValue" --output text)

export SUBNET_B=$(aws cloudformation describe-stacks --stack-name $VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SubnetBPublic'].OutputValue" --output text)

export LB_SECURITY_GROUP=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerSecurityGroup'].OutputValue" --output text)

export LB_TARGET_GROUP=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerTargetGroup'].OutputValue" --output text)
```

## Create and run a service

```bash
ecs-cli compose service up  \
--target-group-arn $LB_TARGET_GROUP \
--container-name web \
--container-port 80
```