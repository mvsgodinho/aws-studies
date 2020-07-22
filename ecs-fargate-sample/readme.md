1) Create VPC

export VPC_STACK_NAME=ecs-vpc

2) Create ECS Cluster

export ECS_STACK_NAME=ecs-fargate

3) Configure ecs-cli

export ECS_CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='Cluster'].OutputValue" --output text)

ecs-cli configure --cluster $ECS_CLUSTER_NAME --region sa-east-1 --default-launch-type FARGATE

4) Update ecs-params.yml

5) Create and run Service

export SUBNET_A=$(aws cloudformation describe-stacks --stack-name $VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SubnetAPublic'].OutputValue" --output text)

export SUBNET_B=$(aws cloudformation describe-stacks --stack-name $VPC_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SubnetBPublic'].OutputValue" --output text)

export LB_SECURITY_GROUP=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerSecurityGroup'].OutputValue" --output text)

export LB_TARGET_GROUP=$(aws cloudformation describe-stacks --stack-name $ECS_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='TargetGroup'].OutputValue" --output text)

ecs-cli compose service up  \
--target-group-arn $LB_TARGET_GROUP \
--container-name web \
--container-port 80