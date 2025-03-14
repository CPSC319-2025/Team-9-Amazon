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
backend_service_name = "recruit-backend-service"
ecr_repository_backend = "cpsc319/recruit/backend"

def run_command(command):
    # print(command)
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
    while True:
        print("This is the RECRUIT devops tool:")
        print("")
        print("Frontend:")
        print("f1. Build")
        print("f2. Run")
        print("f3. Push")
        print("f4. Deploy")
        print("f5. Build, Push, Deploy")
        print("")
        print("Backend:")
        print("b1. Build")
        print("b2. Run")
        print("b3. Push")
        print("b4. Deploy")
        print("b5. Build, Push, Deploy")
        print("")
        print("0. exit")
        print("")
        user_input = input("Enter your choice: ").strip().lower()
        
        if user_input == 'f1':
            docker_build(image_name=frontend_image_name, context="../frontend")
        elif user_input == 'f2':
            docker_run(image_name=frontend_image_name, container_name="recruit-frontend-container", port_mapping="80:80")
        elif user_input == "f3":
            docker_push(frontend_image_name, ecr_repository_frontend, get_aws_account_id(), aws_region)
        elif user_input == "f4":
            update_ecs_service(frontend_service_name)
        elif user_input == "f5":
            docker_build(image_name=frontend_image_name, context="../frontend")
            docker_push(frontend_image_name, ecr_repository_frontend, get_aws_account_id(), aws_region)
            update_ecs_service(frontend_service_name)
        
        elif user_input == 'b1':
            docker_build(image_name=backend_image_name, context="../backend")
        elif user_input == 'b2':
            docker_run(image_name=backend_image_name, container_name="recruit-backend-container", port_mapping="3001:3001")
        elif user_input == "b3":
            docker_push(backend_image_name, ecr_repository_backend, get_aws_account_id(), aws_region)
        elif user_input == "b4":
            update_ecs_service(backend_service_name)
        elif user_input == "b5":
            docker_build(image_name=backend_image_name, context="../backend")
            docker_push(backend_image_name, ecr_repository_backend, get_aws_account_id(), aws_region)
            update_ecs_service(backend_service_name)
        elif user_input == '0':
            print("Exiting the program.")
            break
        else:
            print("Invalid option. Please try again.")


if __name__ == "__main__":
    main()