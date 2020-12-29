# link-shortener

Pet application to play with AWS and NoSQL databases.

# Deployment and local run

The project uses [serverless](https://www.serverless.com/) framework for deployment and testing lambdas locally and it requires AWS account to be [configured](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

To test a function locally, you can run:

```bash
npx sls invoke local -f functionName
```

If you want to emulate AWS locally, you can use [serverless offline](https://github.com/dherault/serverless-offline):

```bash
npx sls offline
```

To deploy, you can run
```bash
npx sls deploy
```
