# EKS Fargate Sample

## Prerequisites

 * [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
 * [Install eksctl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html#eksctl-prereqs)
 * [Install kubectl](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html#eksctl-kubectl)

## Create a EKS Fargate Cluster

```bash
export AWS_REGION=us-west-2
export CLUSTER_NAME=dev
eksctl create cluster \
--name $CLUSTER_NAME \
--version 1.17 \
--region $AWS_REGION \
--fargate
```

Cluster provisioning usually takes between 10 and 15 minutes. When your cluster is ready, test that your kubectl configuration is correct.

```bash
kubectl get svc
```

## Install ALB Ingress Controller

### Create an IAM OIDC provider and associate it with your cluster.

```bash
eksctl utils associate-iam-oidc-provider \
--region $AWS_REGION \
--cluster $CLUSTER_NAME \
--approve
```

### Create an IAM policy called ALBIngressControllerIAMPolicy.

```bash
curl -o alb-ingress-iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/iam-policy.json

aws iam create-policy \
--policy-name ALBIngressControllerIAMPolicy \
--policy-document file://alb-ingress-iam-policy.json
```

### Create a Kubernetes service account named alb-ingress-controller in the kube-system namespace.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/rbac-role.yaml
```
### Create an IAM role for the ALB Ingress Controller and attach the role to the service account created in the previous step.

```bash
export AWS_ACCOUNT=$(aws sts get-caller-identity --query 'Account' --output text)

eksctl create iamserviceaccount \
--region $AWS_REGION \
--name alb-ingress-controller \
--namespace kube-system \
--cluster $CLUSTER_NAME \
--attach-policy-arn arn:aws:iam::${AWS_ACCOUNT}:policy/ALBIngressControllerIAMPolicy \
--override-existing-serviceaccounts \
--approve
```

### Deploy the ALB Ingress Controller with the following command.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/alb-ingress-controller.yaml
```

### Update the ALB Ingress Controller deployment manifest.

```bash
kubectl edit deployment.apps/alb-ingress-controller -n kube-system
```

Add a line for the cluster name after the --ingress-class=alb line. 
If you're running the ALB Ingress Controller on Fargate, then you must also add the lines for the VPC ID, and AWS Region name of your cluster. 

```yaml
    spec:
      containers:
      - args:
        - --ingress-class=alb
        - --cluster-name=dev
        - --aws-region=us-west-2
        - --aws-vpc-id=vpc-XXXXX
```

Once you've added the appropriate lines, save and close the file.

Confirm that the ALB Ingress Controller is **Running** with the following command.

```bash
kubectl get pods -n kube-system
```

## Deploy a Sample App

### Create a Fargate profile that includes the sample application's namespace.

```bash
eksctl create fargateprofile \
--cluster $CLUSTER_NAME \
--region $AWS_REGION \
--name alb-sample-app \
--namespace 2048-game
```

### Apply sample manifest files. 

```bash
kubectl apply -f ./sample-app/sample-namespace.yaml
kubectl apply -f ./sample-app/sample-deployment.yaml
kubectl apply -f ./sample-app/sample-service.yaml
kubectl apply -f ./sample-app/sample-ingress.yaml
```

### Verify that the Ingress resource was created.

```bash
kubectl get ingress/2048-ingress -n 2048-game
```
Output:
```bash
2048-ingress     *       example-2048game-2048ingr-6fa0-352729433.region-code.elb.amazonaws.com   80      24h
```

Open a browser and navigate to the **ADDRESS URL** from the previous command output to see the sample application.

If your Ingress has not been created after several minutes, run the following command to view the Ingress controller logs. These logs may contain error messages that can help you diagnose any issues with your deployment.

```bash
kubectl logs -n kube-system   deployment.apps/alb-ingress-controller
```