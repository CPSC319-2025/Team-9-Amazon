# RECRUITE Backend

## Dev Set up
Install dependencies:
```bash
npm install
```

Create a .env file by copying the Env template:
```bash
cp .env.template .env
```

Run dev environment:
```bash
npm run dev
```

## Docker (Deployment) Instructions
Deployment tooling has been moved to the `devops` directory
In case of having unkilled containers, and wanting to clean all of existing containers:

Mac:
```bash
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
```