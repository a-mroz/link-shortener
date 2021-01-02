# link-shortener

Pet application to play with AWS and NoSQL databases.

# Deployment and local run

The project uses [serverless](https://www.serverless.com/) framework for deployment and testing lambdas locally and it requires AWS account to be [configured](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/).

To test a function locally, but using remote dynamodb, you can run:

```bash
npx sls invoke local -f functionName --path path/to/request
```

For other things, like emulating AWS locally (using [serverless offline](https://github.com/dherault/serverless-offline) and [local dynamodb](https://github.com/99x/serverless-dynamodb-local)) or deployment, check out npm scripts.

# Generating shortlink

There are several ideas for that over the Internet.

## Hash-based

The idea is simple: calculate hash(url + timestamp), take the first 7 characters of its [Base62](https://en.wikipedia.org/wiki/Base62) representation and store it as a key. This gives us 62^7 (or 16^7 if we used hexadecimal representation instead) possibilities, which should be enough.

The hash can be e.g. md5, sha1, as we don't really need to care about security of these algorithms here.

We are adding timestamp (or some other salt) to the URL to generate different shortlinks for the same URLs submitted by different users.

The main issue with this approach is that we might have collisions, because of trunkating hash 7 characters. An idea to solve this would be to take some other part of the hash, when a collision occurs.

## Id-based

The idea is simple, again. Instead of calculating the hash, we could use an autoincrementing id and convert it to [Base62](https://en.wikipedia.org/wiki/Base62) number (potentially removing some easily-confused characters from the alphabet, like 0 and O, 1 and l). A string generated this way would be reversible - instead of storing generated values, we can simply store ids and convert incoming Base62 values to Base 10 ids and access them directly. The drawback is that it would be quite easy to guess what will be the next generated link and perform some crawling.

If this is undesirable, we could add some randomization part (e.g. salt, or use random values instead of monotonic ids) - in that case it might be necessary to store the calculated shortlink, as we might not be able to convert it to the decimal id (in case of using salt).

The main issue with this approach is that we're using distributed database (DynamoDB) which doesn't really have autoincrementing ids as it's an antipattern. We could potentially use an [Atomic Counter](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithItems.html#WorkingWithItems.AtomicCounters), but that's rather not something it is intended for. A better alternative would be to have an id generation service, like Twitter Snowflake.

Since this is a pet-project (and id generation is not its main concern) and we don't really need to care about scale as much as Twitter or [Instagram](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c), we should be fine with id-based solution, where id is generated as `current_timestamp + random_int(128)` (where `+` is concatenation) and is Base58 encoded (without `0, O, l, I` characters). If a collision ever occured, we can simply retry.
