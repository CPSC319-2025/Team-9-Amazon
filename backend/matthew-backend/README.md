## Deployment Instructions

You can build and run the development backend with the following commands:

Ensure you are in the directory `backend/matthew-backend`
```
docker build -t matthew-backend:latest -f ./Dockerfile .
docker run --rm -p 3001:3001 matthew-backend
```