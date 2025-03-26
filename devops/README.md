# DevOps Tool

This repository contains a Python script `devopsTool.py` that helps automate various DevOps tasks.

## Prerequisites

- Python 3.11.5
- Required Python packages (listed in `requirements.txt`). You can install by using:
    ```sh
    pip install -r requirements.txt
    ```
- For pushing and deploying, you must have the AWS CLI installed and be logged in

## Usage

To use the `devopsTool.py` script, run the following command:
```sh
python devopsTool.py
```
It will show you the list of available commands.

### Options

- `-h`, `--help`: Show the help message and exit.
- `-c`, `--config`: Specify the path to the configuration file.
- `-v`, `--verbose`: Enable verbose mode.

# Setup
Deployment infrastructure is done purely through AWS. The current setup uses Matthew's personal AWS account, and incurs about $94 monthly (I need to get that down). Here are the resources needed to deploy our application.

### Devops Tool
The utiltiy file `devopsTool.py` (instructions above) is a script I wrote to help automate deployment. To use it, here are a few parameters you need to ensure match your setup (they are defined at the top of the file):
* `cluster_name`: Name of your cluster in ECS
* `aws_region`: Name of your AWS region
* `ecr_repository_frontend/ecr_repository_backend`: Names of your ECR for frontend/backend
* `fronted_service_name/backend_service_name` Name of your services for ECS

### Docker
Our frontend and backend are dockerized. The Dockerfiles respective are in the `frontend` and `backend` directories. You can use `devopsTool.py` to build, run, and deploy the containers.

### AWS Elastic Container Registry (ECR)
We use AWS ECR to store the docker images for our frontend and backend. You can use `devopsTool.py` to push the images to ECR.

### AWS Elastic Container Service (ECS)
We use AWS ECS to host our deployed frontend and backend containers. It would be too lengthy to outline all the instructions here, but the broad strokes are:
* Define 2 tasks (one for frontend and one for backend). These tasks will deploy the latest docker image from ECR (frontend and backend respectively)
* Define 2 services (one for frontend and one for backend). Each service should be associated with the tasks you defined above. The services ensure there is 1 instance of frontend/backend container running at all times

### AWS Application Load Balancers (ALB)
Create an AWS load balancer, which will direct frontend traffic (eg. host `amazonpleaserecruit.me`) to the frontend container, and backend traffic (eg. host `api.dev.amazonpleaserecruit.me`) to the backend container.

### AWS Route 53
We use AWS Route 53 to manage our DNS records. Direct traffic for all appropriate endpoints (eg. `amazonpleaserecruit.me`) to the application load balancer defined above.

### AWS Relational Database Service (RDS)
We use AWS RDS to set up a MySQL database. Cheapest configurations, with 5Gb of storage. For convenience, we route `db.dev.amazonpleaserecruit.me` to the database.

### AWS Secure Storage Solution (s3)
We use AWS S3 to store and fetch uploaded resumes. The bucket is `recruit-store/resumes`

### AWS Identity and Access Management (IAM)
We use AWS IAM to provision AWS accounts for team members, as well as an account that the backend can sign in to (needed to access S3)

### AWS Certificate Manager (ACM)
We use AWS ACM to obtain SSL certificates for our domain. We modified our application load balancer to utilize SSL termination, such that externally we communicate only through HTTPS, but internally we use HTTP.

### Other
* In `backend/.env`, make sure your `AWS_ACCESS_KEY` credentials are accurate for your account


# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.