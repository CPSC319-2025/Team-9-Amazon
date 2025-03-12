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

## Database Login

The login credentials for the root user on the database are:
username: `bobj0n3s`
password: `1234Recruit!`

You can login using:
```
mysql -u bobj0n3s -p -h db.dev.amazonpleaserecruit.me
```

## Database Migration

In order migrate up, run:
```
npm run migrate:up
```

In order to migrate down, run:
```
npm run migrate:down
```

If you only want to migrate up/down to a specific migration, you can use the following (example):
```
npm run migrate:up -- --to="2 Migrate Staff.ts"
```
You can find the list of all migrations under `./src/database/migrations`

## Database Seeding (Sample Data)

We can seed the database (fill it with sample data). The seeder files are defined under `database/seeders`. You can run all the seeder, using:
```
npm run seed:all
```

Here's an example of how you can run a specific seeder file:
```
npm run seed -- --seed database/seeders/manual_data
```

If you want to remove all the seeded data, you can run:
```
npm run seed:undo:all
```

Here's an example of how you can remove seed data from a specific seeder file. By default (if you don't provide a seed file name), this will undo the latest seed:
```
npm run seed:undo -- --seed database/seeders/manual_data
```