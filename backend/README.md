# RECRUIT Backend

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

# Database Information

The login credentials for the root user on the database are:
username: `bobj0n3s`
password: `1234Recruit!`
I'll get on better security measures later

You can login using:
```
mysql -u bobj0n3s -p -h db.dev.amazonpleaserecruit.me
```