## Deployment Instructions

You can build and run the development frontend with the following commands:

Ensure you are in the directory `frontend/test-frontend`
```
docker build -t matthew-frontend:latest -f ./Dockerfile .
docker run --rm -p 3000:3000 matthew-frontend
```