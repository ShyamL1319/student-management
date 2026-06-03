# End-to-End GCP Production Deployment Guide

This document outlines the step-by-step process for deploying the Student Management application from a local environment to a production environment on Google Cloud Platform (GCP). It covers Secrets Management, Infrastructure Setup, CI/CD configuration, and specific instructions for Cloud Run (Serverless) and GKE (Google Kubernetes Engine).

---

## Prerequisites

- **GCP Account:** Active GCP account with a created Project and billing enabled.
- **APIs Enabled:** Enable the following APIs in your GCP Project:
  - Cloud Run API
  - Kubernetes Engine API (if using GKE)
  - Artifact Registry API
  - Secret Manager API
  - Compute Engine API
- **MongoDB Atlas:** A production database cluster hosted on GCP or AWS (see `infrastructure/mongo/atlas-setup.md`).
- **Tools:** `gcloud` CLI, Docker, and `kubectl` (if using GKE) installed locally.

---

## Step 1: Manage Environment Secrets (Secret Manager)

The application requires secure environment variables (e.g., `MONGODB_URI`, `JWT_SECRET`). On GCP, you should use **Secret Manager**.

1. Go to **Security > Secret Manager** in the GCP Console.
2. Click **Create Secret**.
3. Create a secret named `MONGODB_URI`:
   - **Secret value:** Your MongoDB Atlas connection string (e.g., `mongodb+srv://<user>:<pass>@cluster.mongodb.net/student_management`).
4. Create another secret named `JWT_SECRET`:
   - **Secret value:** Your production JWT secret string.
5. Note the Resource IDs (e.g., `projects/YOUR_PROJECT_ID/secrets/MONGODB_URI/versions/1`).

---

## Step 2: Set Up Artifact Registry (Docker Images)

Artifact Registry is GCP's equivalent to AWS ECR. You need to create a repository to hold your Docker images.

1. Go to **Artifact Registry** in the GCP Console.
2. Click **Create Repository**.
3. Configuration:
   - **Name:** `student-management-repo`
   - **Format:** Docker
   - **Location Type:** Region (e.g., `us-central1`)
4. Note the repository path. It will look like:
   `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/student-management-repo`

---

## Step 3: Configure CI/CD with GitHub Actions

To deploy automatically from GitHub to GCP, you should configure Workload Identity Federation (recommended) or use a Service Account JSON key.

### 1. Set up GCP Service Account
1. Create a Service Account in GCP (e.g., `github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com`).
2. Grant it the following roles:
   - **Artifact Registry Writer**
   - **Cloud Run Admin** (If deploying to Cloud Run)
   - **Kubernetes Engine Developer** (If deploying to GKE)
   - **Service Account User**

### 2. Set GitHub Secrets
In your GitHub repository, add the following secrets:
- `GCP_CREDENTIALS`: The base64-encoded JSON key of your service account (if not using Workload Identity Federation).
- `GCP_PROJECT`: Your GCP Project ID.

*(Note: You will need to duplicate and modify your `.github/workflows/deploy.yml` to use `google-github-actions/auth` and `google-github-actions/setup-gcloud` instead of the AWS actions, and push images to your Artifact Registry path).*

---

## Step 4: Deploy the Application

Choose **one** of the following deployment strategies. **Cloud Run** is highly recommended for its simplicity and scale-to-zero capabilities.

### Strategy A: Deploy to Cloud Run (Serverless Container - Recommended)

Cloud Run is the easiest way to run the backend and frontend Docker containers without managing infrastructure.

1. **Deploy the Backend:**
   ```bash
   gcloud run deploy student-management-backend \
     --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/student-management-repo/backend:latest \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000 \
     --set-secrets="MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest"
   ```
   *(Note: The Service Account running the Cloud Run revision must have the **Secret Manager Secret Accessor** role).*

2. **Deploy the Frontend:**
   Make sure your frontend's `VITE_API_URL` environment variable during the build phase points to the Cloud Run URL generated for the backend.
   ```bash
   gcloud run deploy student-management-frontend \
     --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/student-management-repo/frontend:latest \
     --region us-central1 \
     --allow-unauthenticated \
     --port 80
   ```

### Strategy B: Deploy to GKE (Google Kubernetes Engine)

If you prefer Kubernetes (similar to EKS on AWS), use GKE.

1. **Create a GKE Cluster:**
   ```bash
   gcloud container clusters create student-management-cluster \
     --region us-central1 \
     --num-nodes 2
   ```
2. **Connect `kubectl` to GKE:**
   ```bash
   gcloud container clusters get-credentials student-management-cluster --region us-central1
   ```
3. **Configure Kubernetes Secrets:**
   ```bash
   kubectl create namespace student-management
   kubectl create secret generic backend-secrets \
     --namespace student-management \
     --from-literal=MONGODB_URI="mongodb+srv://<user>:<pass>@cluster.mongodb.net/student_management" \
     --from-literal=JWT_SECRET="your-production-jwt-secret"
   ```
4. **Apply Deployment Manifests:**
   Update your existing `infrastructure/aws/eks/deployment.yaml` file:
   - Change the `image:` fields to point to your GCP Artifact Registry: `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/student-management-repo/backend:latest`
   ```bash
   kubectl apply -f infrastructure/aws/eks/deployment.yaml
   ```

---

## Step 5: Post-Deployment Verification & Seeding

1. **Database Access (VPC Peering):**
   If you created your MongoDB Atlas cluster on GCP, configure a Network Peering connection from Atlas to your GCP VPC under the **Network Access -> Peering** tab in Atlas. Otherwise, whitelist the NAT IP of your Cloud Run/GKE setup.
2. **Seeding Initial Data:**
   You must create the Super Admin user for the fresh production database.
   - **For GKE:**
     ```bash
     kubectl exec -it <backend-pod-name> -n student-management -- sh -c "node seed.js"
     ```
   - **For Cloud Run:**
     Create a temporary Cloud Run Job to execute the seed script:
     ```bash
     gcloud run jobs create seed-db \
       --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/student-management-repo/backend:latest \
       --command="node","seed.js" \
       --set-secrets="MONGODB_URI=MONGODB_URI:latest"
     
     gcloud run jobs execute seed-db
     ```
3. **Verify Health:**
   - **Cloud Run:** Navigate to the URLs provided by the `gcloud run deploy` commands. View logs via the GCP Cloud Run Console.
   - **GKE:** Obtain the external IP of the frontend service:
     ```bash
     kubectl get svc frontend-service -n student-management
     ```
