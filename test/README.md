# Testing Utilities

## Integration testing

### Load testing
This script is used to test our nonfunctional requirement of supporting 500 users. You can run the load testing file with:
```
tsx load_test.ts
```
This tool will do the following:
* Send requests to the API to create sample staff
* Send requests to the API to create sample criteria
* Send requests to the API to create sample job postings
* Send requests to the API to create applicants for job postings

The tool also allows use to delete this sample data