# Utility file to generate fake emails

from faker import Faker

fake = Faker()

# Generate random emails
n_emails = 500
emails = [fake.email() for _ in range(n_emails)]

# Write emails to a file
fileName = "sample_emails.txt"
with open(fileName, "w") as file:
    for email in emails:
        file.write("'" + email + "', \n")

print('${n_emails} random emails have been written to ${fileName}')