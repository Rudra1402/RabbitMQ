## RabbitMQ with Node.js

### 📚 Steps to Pull Docker Image
We Need Docker Desktop (Running State). Now, Open the Terminal. [ Note: RabbitMQ Image Used `rabbitmq:management` ]

**Step 1 | Pull the Docker Image**
```
docker pull rabbitmq:management
```
**Step 2 | Run the Container**
```
docker run -d --name rmq-local -p 5672:5672 -p 15672:15672 rabbitmq:management
```
**Step 3 (Optional) | Check the RabbitMQ Version**
```
docker exec rmq-local rabbitmqctl version
```
