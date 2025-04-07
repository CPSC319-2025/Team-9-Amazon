# DevOps Tool

This file contains instructions on how to deploy our web application. I wrote a python script in this directory called `devopsTool.py` that helps automate various DevOps tasks.

## Tool Usage (`devlopsTool.py`)

### Prerequisites
- Python 3.11.5
- Required Python packages (listed in `requirements.txt`). You can install by using:
    ```sh
    pip install -r requirements.txt
    ```
- For pushing and deploying, you must have the AWS CLI installed and be logged in

### Configuration
In the tool, there are few parameters you need to configure (make sure these match up with your AWS resources):
* `cluster_name`: Name of your cluster in ECS
* `aws_region`: Name of your AWS region
* `ecr_repository_frontend/ecr_repository_backend`: Names of your ECR for frontend/backend
* `fronted_service_name/backend_service_name` Name of your services for ECS

### Usage
To use the `devopsTool.py` script, run the following command:
```sh
python devopsTool.py
```
It will show you the list of available commands.

# Deployment Instructions
Deployment infrastructure is done purely through AWS. The current setup uses Matthew's personal AWS account, and incurs about $94 monthly (I need to get that down). I will outline deployment instructions for 3 different configurations: development, minimal deployment setup, full deployment setup.

## Common Setup
This section contains details that you will need to do for any of the deployment setups.

### Database setup
You need to set up a MySQL database, with username and password authentication. For our purposes, we deployed our database using AWS RDS with 50Gb of storage. Ensure the database has a public IP address. You will need to update the configuration in `backend/src/database/config/config.json` to match your setup:

name | description
--- | ---
`username` | The username to authenticate into your database
`password` | The password to authenticate into your database
`database` | The name of your database
`host`     | The IP address of your database
`dialect`  | This should be "mysql"

After setting up your database, you will need to run migrations and seeding on the database. Instructions for this can be found in `backend/README.md`. At the time of writing, the command for migrating up is:
```
npm run migrate:up
```
The command for seeding is:
```
npm run seed -- --seed database/seeders/manual_data
```

### AWS Secure Storage Solution (s3)
We use AWS S3 to store and fetch uploaded resumes. Your bucket should be named `recruit-store`, and it should container one folder `resumes` (this is specified in `backend/src/common/utils/awsTools.ts`). This bucket does not need public access.

### AWS authentication
To ensure the backend is authorized to access s3 resources, you need to specify AWS login credentials in `backend/.env`:
| name | description |
| --- | --- |
| AWS_ACCESS_KEY_ID | The access key id associated with your AWS account |
| AWS_SECRET_ACCESS_KEY | The secret access key associated with your AWS account |



## Development Setup
Running our application in development is very simple. Open up two terminals:
* In one termincal `cd` into the `frontend` folder, then run `npm install` and `npm run dev`
* In the other termincal `cd` into the `backend` folder, then run `npm install` and `npm run dev`

This should run the frontend and backend. You can access the frontend by using a web browser to visit `localhost:5173`



## Minimal Deployment Setup
This section will contain instructions on how to deploy the application so that it is available on the web. Note that due to CORS restrictions, you will need to control a domain (eg. `myDomain.com`) in order to connect the frontend and backend together. 

### AWS Route 53
We use AWS Route 53 to manage our DNS records. This is used to direct traffic for all appropriate endpoints (eg. `amazonpleaserecruit.me`). After you have deployed your frontend and backend containers, you should create:
* DNS record for your frontend (eg. An "A record" pointing `myDomain.com` to the IP address of your frontend container)
* DNS record for your backend (eg. An "A record" pointing `api.myDomain.com` to the IP address of your backend container)

We will get the IP addresses after we have deployed our containers (in the ECS section below)

### Configuration
In order to connect the frontend to the backend, you need to specify the backend's URL in `frontend/.env.production`. There should be a field called `VITE_BACKEND_URL`, set this to be the URL that is connected to your backend (eg. `api.myDomain.com`).

Additionally, we need to configure CORS for the backend to allow traffic from the frontend. You can do this in `backend/.env`. There should be a variable `CORS_ORIGIN`, which is a space-seperated string of all allowed CORS origins. Include the domain for your frontend here. Here is an example of what that might look like:
* `"http://localhost:5173 https://*.amazonpleaserecruit.me https://amazonpleaserecruit.me"`

(Note that in the above string, if you do not have `https` set up for your domain, you should use `http` instead.)

### AWS Elastic Container Registry (ECR)
We use AWS ECR to store the docker images for our frontend and backend. You will need tto create 2 ECR buckets, one to store your frontend images (`recruit-frontend`), and one to store your backend images (`recruit-backend`). You can use `devopsTool.py` to push the images to ECR.

### Docker
Our frontend and backend are dockerized. The Dockerfiles respective are in the `frontend` and `backend` directories. You can use `devopsTool.py` to build, the container and push it to ECR. In case you want to do this manually, here are the steps for the frontend (run these from the `devops` folder) (the steps for backend are the same, just replace "frontend" with "backend"):

Command | Description
--- | ---
`docker build -t recruit-frontend:latest -f ../frontend/Dockerfile ../frontend` | Build the docker image
`aws ecr get-login-password --region ca-central-1` | Authenticate the AWS CLI. Make sure the region matches with your account
`docker login --username AWS --password-stdin ECR_URI.amazonaws.com` | Authenticate docker,ensure the ECR_URI matches with your account setup
`docker tag recruit-frontend:latest ECR_URI.amazonaws.com/cpsc319/recruit/frontend:latest` | Tag the latest docker image. Ensure that the ECR_URI matchhes with your ECR setup
`docker push ECR_URI.amazonaws.com/cpsc319/recruit/frontend:latest` | Push the docker image to ECR. Make sure ECR_URI matches with your account setup


### AWS Elastic Container Service (ECS)
We use AWS ECS to host our deployed frontend and backend containers. It would be too lengthy to outline all the instructions here, but the broad strokes are:
* Define 2 tasks (one for frontend and one for backend). These tasks will deploy the latest docker image from ECR (frontend and backend respectively)
Ensure that both containers have public IP address. The frontend/backend DNS records in AWS Route53 should point to these containers.

### Done!
You should now be able to access your application on any web browser through your domain name (eg. `myDomain.com`)


## Full Deployment Setup
This section details our full deployment setup. This section assumes you have completed all the steps in the "Minimal Deployment Setup" section (above). We will extend it to automate parts of the deployment process.

### AWS Elastic Container Service (ECS)
We can create services to ensure that we don't have to manually manage our ECS instances.
* Define 2 services (one for frontend and one for backend). Each service should be associated with the tasks you defined above. The services ensure there is 1 instance of frontend/backend container running at all times

### AWS Application Load Balancers (ALB)
Create an AWS load balancer, which will direct frontend traffic (eg. host `amazonpleaserecruit.me`) to the frontend container, and backend traffic (eg. host `api.dev.amazonpleaserecruit.me`) to the backend container.

### AWS Route 53
Instead of directing traffic to static IP addresses, we can route traffic to the ALBs defined above. This means we don't have to update the DNS records every time we make a new deployment.

### AWS Identity and Access Management (IAM)
We use AWS IAM to provision AWS accounts for team members, as well as an account that the backend can sign in to (needed to access S3)

### AWS Certificate Manager (ACM)
We use AWS ACM to obtain SSL certificates for our domain. We modified our application load balancer to utilize SSL termination, such that externally we communicate only through HTTPS, but internally we use HTTP.

# Environment Configuration (Development, Test, Staging, and Production)
The primary way in which we separate our environments is by having different databases. Instructions on how to set up a database are detailed above ("Database Setup"). I will detail how to set up a database for the test environment. The process for staging and production are identical.

1. Get terminal access to your database. Create a new database called "myTestDb"
2. Modify `backend/src/database/config/config.json` to point to this database, migrate and seed this database (instructions included in "Database Setup" section)

Since the `config.json` is pointing to the test database, Running your application now will use the test database (test environment).


# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.