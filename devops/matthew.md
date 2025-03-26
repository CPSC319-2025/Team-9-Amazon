Just writing some stuff here to document

Docker: build and run frontend and web server
Nginx: web server
Nextjs: frontend
AWS ECR: store instances
AWS Fargate: Deploy instances
AWS Route53: DNS management

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
* Serve frontend and backend over SSL

Still to do:
* Integration and NFR Testing: Write script to create 500 staff, some job postings, and 500 applicants that apply to those job postings


Later to do:
