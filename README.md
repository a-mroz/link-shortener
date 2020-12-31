# link-shortener

Pet application to play with AWS and NoSQL databases.

# Deployment and local run

The project uses [serverless](https://www.serverless.com/) framework for deployment and testing lambdas locally and it requires AWS account to be [configured](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

To test a function locally, but using remote dynamodb, you can run:

```bash
npx sls invoke local -f functionName --path path/to/request
```

For other things, like emulating AWS locally (using [serverless offline](https://github.com/dherault/serverless-offline) and [local dynamodb](https://github.com/99x/serverless-dynamodb-local)) or deployment, check out npm scripts.
