# Database Instructions

## Database Setup

The login credentials for the root user on the database are:
username: `bobj0n3s`
password: `1234Recruit!`
I'll get on better security measures later

This command will run `setup.sql` on the database:
```
mysql -u bobj0n3s -p -h recruit-dev.c7wsa48a6mzl.ca-central-1.rds.amazonaws.com < setup.sql
```

Note that the endpoint can change if we restart the database instance. 