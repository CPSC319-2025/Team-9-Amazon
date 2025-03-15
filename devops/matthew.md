Just writing some stuff here to document

Docker: build and run frontend and web server
Nginx: web server
Nextjs: frontend
AWS ECR: store instances
AWS Fargate: Deploy instances
AWS Route53: DNS management

Build frontend:
docker build -t matthew-frontend:latest -f ./Dockerfile .
docker run --rm -p 3000:3000 matthew-frontend

Nginx:
docker build -t matthew-nginx:latest -f ./Dockerfile .
docker run --rm -p 80:80 matthew-nginx

What I've accomplished:
* I can build a docker container that serves nextjs app
* I can build a docker container that runs nginx
* I can upload nextjs image to AWS ECR
* I can run the nextjs container using AWS Fargate, and connect to it
* I can build express backend docker image, upload to AWS ECR, and deploy it to AWS Fargate
* I can route traffic from dev.amazonpleaserecruit.me to our frontend and backend
* I spun up MySQL database using AWS RDS, which can be accessed through db.dev.amazonpleaserecruit.me. We will use password authentication for now
* Set up Sequelize infrastructure for our project. This includes database reads, writes, migrations, and seeding
* Set up application load balancers to route traffic for frontend and backend
* Set up s3 storage buckets for storing application resumes, and set up utility functions to upload/download resources from s3

Still to do:
* Create seeder to generate sample data (Faker)
* Get SSL certificate


Later to do:
