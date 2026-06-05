# MongoDB Atlas Setup Guide

This document outlines the steps to set up MongoDB Atlas for the School Management application.

## Prerequisites
1. A MongoDB Atlas account ([Register here](https://www.mongodb.com/cloud/atlas/register))
2. A registered AWS account (if peering is needed).

## Step-by-Step Setup

### 1. Create a Project
1. Log into your MongoDB Atlas console.
2. Click on **New Project**.
3. Name your project `School-Management` and click **Next**.
4. Add team members if necessary and click **Create Project**.

### 2. Build a Cluster
1. Within your project, click **Build a Database**.
2. Choose your cluster type. For production, **Dedicated** (M10 or higher) is recommended.
3. Select your Cloud Provider & Region.
   - Choose AWS to minimize latency if your ECS/EKS clusters are hosted on AWS.
   - Select the same region as your application servers (e.g., `us-east-1`).
4. Configure cluster tier (e.g., M10) and additional settings as needed.
5. Click **Create Cluster**.

### 3. Setup Database Access
1. In the left-hand navigation menu, click **Database Access** under Security.
2. Click **Add New Database User**.
3. Select **Password** as the authentication method.
4. Enter a username (e.g., `app_user`) and a secure password. Make sure to save this password in your secrets manager (e.g., AWS Secrets Manager).
5. Under Database User Privileges, select **Read and write to any database** (or restrict it to a specific database `school-management`).
6. Click **Add User**.

### 4. Setup Network Access
1. In the left-hand navigation menu, click **Network Access** under Security.
2. Click **Add IP Address**.
3. **For VPC Peering (Recommended for Production)**:
   - Instead of whitelisting IPs, configure a Network Peering connection under the **Network Access -> Peering** tab between your AWS VPC and MongoDB Atlas VPC.
4. **For IP Whitelisting**:
   - If not using VPC peering, add the NAT Gateway IPs of your EKS/ECS clusters.

### 5. Get the Connection String
1. Go back to **Databases** under Deployment.
2. Click **Connect** on your cluster.
3. Select **Connect your application**.
4. Choose Node.js and the appropriate version.
5. Copy the connection string. It will look something like:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<username>` and `<password>` with the credentials you created in Step 3.
7. Add the database name (e.g., `school-management`) before the `?` query parameters:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/school-management?retryWrites=true&w=majority`

### 6. Configure Application
1. Provide the connection string to your backend application via the `MONGODB_URI` environment variable.
2. Update your AWS Parameter Store or Kubernetes Secrets with this URI.
