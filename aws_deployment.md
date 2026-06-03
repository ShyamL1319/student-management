# End-to-End AWS Production Deployment Guide

This document outlines the step-by-step process for deploying the Student Management application from a local environment to a production environment on AWS. It covers Secrets Management, Infrastructure Setup, CI/CD configuration, and specific instructions for both ECS (Elastic Container Service) and EKS (Elastic Kubernetes Service) deployments.

---

## Prerequisites

- **AWS Account:** Active AWS account with permissions to manage ECR, ECS/EKS, IAM, and Systems Manager (SSM) or Secrets Manager.
- **MongoDB Atlas:** A production database cluster (see `infrastructure/mongo/atlas-setup.md`).
- **GitHub Repository:** Administrator access to configure Actions Secrets.
- **Tools:** AWS CLI, Docker, and `kubectl` (if using EKS) installed locally.

---

## Step 1: Manage Environment Secrets

The application requires secure environment variables (e.g., `MONGODB_URI`, `JWT_SECRET`). How you store these depends on your deployment target.

### For ECS (Fargate)
ECS uses AWS Systems Manager (SSM) Parameter Store or AWS Secrets Manager to inject secrets into containers at runtime.
1. Go to **AWS Systems Manager > Parameter Store**.
2. Click **Create parameter**.
3. Create a parameter named `MONGODB_URI`.
   - **Type:** SecureString
   - **Value:** Your MongoDB Atlas connection string.
4. Note the ARN of the parameter (e.g., `arn:aws:ssm:REGION:ACCOUNT_ID:parameter/MONGODB_URI`).

### For EKS (Kubernetes)
EKS relies on Kubernetes Secrets to inject environment variables.
1. Connect to your EKS cluster using the AWS CLI:
   ```bash
   aws eks update-kubeconfig --region <REGION> --name <CLUSTER_NAME>
   ```
2. Create the namespace:
   ```bash
   kubectl create namespace student-management
   ```
3. Create the Kubernetes secret:
   ```bash
   kubectl create secret generic backend-secrets \
     --namespace student-management \
     --from-literal=MONGODB_URI="mongodb+srv://<user>:<pass>@cluster.mongodb.net/student_management" \
     --from-literal=JWT_SECRET="your-production-jwt-secret"
   ```

---

## Step 2: Set Up Amazon ECR (Elastic Container Registry)

Before deploying, you must create registries to host your Docker images.

1. Open the **Amazon ECR** console.
2. Click **Create repository**.
3. Create two private repositories:
   - `student-management-backend`
   - `student-management-frontend`
4. Note your AWS Account ID and the AWS Region. Your repository URIs will look like:
   `<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/student-management-...`

---

## Step 3: Configure CI/CD with GitHub Actions

The application includes a workflow at `.github/workflows/deploy.yml` that automatically builds and pushes Docker images to ECR when code is pushed to the `main` branch.

### 1. Set GitHub Secrets
Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions** and add the following repository secrets:
- `AWS_ACCESS_KEY_ID`: IAM user access key (needs ECR push permissions).
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key.
- `AWS_REGION`: Your target AWS region (e.g., `us-east-1`).

### 2. Verify Pipeline Execution
When you push to `main`, GitHub Actions will:
1. Build and test the Node.js application.
2. Log into Amazon ECR.
3. Build the `backend/Dockerfile.prod` and `frontend/Dockerfile.prod` images.
4. Push both images to ECR, tagged with `latest` and the specific Git commit SHA.

*(Note: To automatically update ECS or EKS after the push, you will need to add an update step to the `deploy.yml` workflow, such as `aws ecs update-service --force-new-deployment` for ECS, or a `kubectl rollout restart` for EKS).*

---

## Step 4: Deploy the Application

Choose **one** of the following deployment strategies based on your infrastructure preference.

### Strategy A: Deploy to ECS (Fargate)
Use the configuration located at `infrastructure/aws/ecs/task-definition.json`.

1. **Update Task Definition:**
   - Open `infrastructure/aws/ecs/task-definition.json`.
   - Replace all instances of `ACCOUNT_ID` and `REGION` with your actual AWS details.
   - Ensure the `executionRoleArn` has permissions to read the SSM Parameter Store.
2. **Register the Task Definition:**
   ```bash
   aws ecs register-task-definition --cli-input-json file://infrastructure/aws/ecs/task-definition.json
   ```
3. **Create the ECS Cluster and Service:**
   - In the ECS Console, create a new Fargate cluster named `student-management-cluster`.
   - Create a new Service within this cluster, selecting the `student-management` task definition.
   - Configure a target group and Application Load Balancer (ALB) to route port `80` traffic to the `frontend` container.
   - (Optional but recommended) Route API paths (e.g., `/api/*`) via the ALB to the `backend` container on port `3000`.

### Strategy B: Deploy to EKS (Kubernetes)
Use the configuration located at `infrastructure/aws/eks/deployment.yaml`.

1. **Update Deployment Manifest:**
   - Open `infrastructure/aws/eks/deployment.yaml`.
   - Replace `ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com` with your exact ECR URI for both the backend and frontend containers.
2. **Apply the Manifest:**
   ```bash
   kubectl apply -f infrastructure/aws/eks/deployment.yaml
   ```
3. **Expose the Frontend:**
   The `deployment.yaml` creates a LoadBalancer service for the frontend. To get the DNS name of the ALB provisioned by AWS:
   ```bash
   kubectl get svc frontend-service -n student-management
   ```
   Navigate to the `EXTERNAL-IP` provided to view the application.

---

## Step 5: Post-Deployment Verification & Seeding

1. **Database Access:** 
   Ensure your ECS Tasks or EKS Worker Nodes have network access to MongoDB Atlas. Refer to `infrastructure/mongo/atlas-setup.md` to configure VPC Peering or whitelist your NAT Gateway IP addresses.
2. **Seeding Initial Data:**
   If this is a fresh production database, you need to create the Super Admin. Connect to the backend container shell and run the seeder:
   - **EKS:** `kubectl exec -it <backend-pod-name> -n student-management -- sh -c "node seed.js"`
   - **ECS:** Use ECS Exec to connect to the container and run `node seed.js`.
3. **Verify Health:** 
   Check CloudWatch Logs (`/ecs/student-management-backend`) or Kubernetes logs (`kubectl logs -l app=backend -n student-management`) to ensure the server connected to MongoDB successfully and is listening on port 3000.
