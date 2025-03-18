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
Much of the infrastructure for deployment has been done by me. For the purposes of this course, I will outline what resources we used for deployment.

### Docker

### AWS Route 53

### AWS Application Load Balancers

### AWS Elastic Container Registry (ECR)

### AWS Elastic Container Service ECS

### AWS Relational Database Service (RDS)

### AWS Secure Storage Solution (s3)

### AWS Identity and Access Management (IAM)

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.