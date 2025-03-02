import argparse
import subprocess
import sys
import boto3

ecs_client = boto3.client('ecs')
ecr_client = boto3.client('ecr')
cluster_name = "DevCluster"
aws_region = "ca-central-1"

frontend_image_name = "recruit-frontend"
frontend_service_name = "recruit-frontend-service"
ecr_repository_frontend = "cpsc319/recruit/frontend"

backend_image_name = "recruit-backend"
ecr_repository_backend = "cpsc319/recruit/backend"

def run_command(command):
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    while True:
        output = process.stdout.readline()
        stderr_output = process.stderr.readline()
        if output == "" and stderr_output == "" and process.poll() is not None:
            break
        if output:
            print(output.strip())
        if stderr_output:
            print(stderr_output.strip(), file=sys.stderr)

    process.wait()
    if process.returncode != 0:
        sys.exit(process.returncode)

def get_aws_account_id():
    try:
        sts_client = boto3.client("sts")
        account_id = sts_client.get_caller_identity()["Account"]
        return account_id
    except Exception as e:
        print(f"Error retrieving AWS account ID: {e}", file=sys.stderr)
        sys.exit(1)

def update_ecs_service(service_name):
    command = f"aws ecs update-service --cluster {cluster_name} --service {service_name} --force-new-deployment"
    run_command(command)

def docker_build(image_name, context="."):
    dockerfile = context + "/Dockerfile"
    command = f"docker build -t {image_name}:latest -f {dockerfile} {context}"
    run_command(command)

def docker_run(image_name, container_name, port_mapping):
    port_option = f"-p {port_mapping}" if port_mapping else ""
    name_option = f"--name {container_name}" if container_name else ""
    command = f"docker run --rm {name_option} {port_option} -d {image_name}"
    run_command(command)

def docker_push(image_name, repository_name, aws_account_id, region):
    repository = f"{aws_account_id}.dkr.ecr.{region}.amazonaws.com/{repository_name}:latest"
    login_command = f"aws ecr get-login-password --region {region} | docker login --username AWS --password-stdin {aws_account_id}.dkr.ecr.{region}.amazonaws.com"
    tag_command = f"docker tag {image_name}:latest {repository}"
    push_command = f"docker push {repository}"
    
    run_command(login_command)
    run_command(tag_command)
    run_command(push_command)


def main():
    parser = argparse.ArgumentParser(description="Devops CLI tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    build_frontend_parser = subparsers.add_parser("build-frontend", help="Build frontend image")
    run_frontend_parser = subparsers.add_parser("run-frontend", help="Run latest frontend image")
    run_frontend_parser.add_argument("--container-name", help="Name of the Docker container", default="recruit-frontend-container")
    push_frontend_parser = subparsers.add_parser("push-frontend", help="Push latest frontend Docker image to AWS ECR")
    deploy_frontend_parser = subparsers.add_parser("deploy-frontend", help="Deploy latest frontend, from ECR to Fargate")

    build_backend_parser = subparsers.add_parser("build-backend", help="Build backend image")
    run_backend_parser = subparsers.add_parser("run-backend", help="Run latest backend image")
    run_backend_parser.add_argument("--container-name", help="Name of the Docker container", default="recruit-backend-container")
    push_backend_parser = subparsers.add_parser("push-backend", help="Push latest backend Docker image to AWS ECR")
    
    args = parser.parse_args()
    
    if args.command == "build-frontend":
        docker_build(image_name=frontend_image_name, context="../frontend")
    elif args.command == "run-frontend":
        docker_run(image_name=frontend_image_name, container_name=args.container_name, port_mapping="80:80")
    elif args.command == "push-frontend":
        docker_push(frontend_image_name, ecr_repository_frontend, get_aws_account_id(), aws_region)
    elif args.command == "deploy-frontend":
        update_ecs_service(frontend_service_name)
    
    elif args.command == "build-backend":
        docker_build(image_name=backend_image_name, context="../backend")
    elif args.command == "run-backend":
        docker_run(image_name=backend_image_name, container_name=args.container_name, port_mapping="3001:3001")
    elif args.command == "push-backend":
        docker_push(backend_image_name, ecr_repository_backend, get_aws_account_id(), aws_region)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()