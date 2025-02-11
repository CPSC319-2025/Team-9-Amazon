# RECRUITE Backend

## Dev Set up
Install dependencies:
```bash
npm install
```
Run dev environment:
```bash
npm run dev
```

## Docker (Deployment) Instructions
Build:
```bash
docker build -t backend-app .   
```

Run the container:

In Development:
```bash
docker run --rm -it -p 3001:3001 backend-app
```

In production:
```bash
docker run -p 3001:3001 backend-app
```


In case of having unkilled containers, and wanting to clean all of existing containers:

Mac:
```bash
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
```