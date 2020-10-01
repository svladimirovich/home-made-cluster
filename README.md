# Home made NodeJS Cluster
Experimental environment with workers processing tasks queue that is based on Redis.

Current solution does not guarantee 'at least once' task processing because there is no acknowledge mechanism for popped tasks from the queue. You may implement it for sports, or just to better appreciate existense of tools like RabbitMQ.

### If you have Docker (with docker-compose) client installed you can run the whole thing with:
```
> docker-compose up
```

Or you can each service separately by following the instructions below:
### 1. To run Redis server:
```
> docker run -p 6379:6379 redis
```
or you can install it and run directly if you wish

### 2. To build and run workers:
```
> cd worker
/worker> npm install 
...
/worker> npm start
```
create as many instances as you like.

### 3. To run monitor API:
```
> cd monitor-api
/monitor-api> npm install
...
/monitor-api> npm start
```

### 4. To run monitor UI:
```
> cd monitor
/monitor> npm install
...
/monitor> npm start
```