# AirQualityExpressServer
[Express](https://expressjs.com/)-based web server that exposes air quality observations from the [Obelisk](https://obelisk.ilabt.imec.be/api/v1/docs/) platform as Linked Data documents, using a geospatial fragmentation based on tiles.    
The server uses an NGINX proxy and cache to store requested data fragments, speeding up the process.

## Install it

Clone this repository and run `npm install`.

## Running the server

* First create a file called `ObeliskLogin.json` in the root folder containing the following structure:

``` json
{
  "ObeliskClientId": "xxxxx",
  "ObeliskClientSecret": "yyyyyyy"
}
```

​	Replace the values with your Obelisk credentials. See [here](https://obelisk.ilabt.imec.be/api/v1/docs/getting-started/request-access/) to request new credentials.

* Compile the project running `npm run build`. 
* Finally run `docker-compose up` to start the server.

## Use it

Once the server is running you can query the data using the following template:

```
http://localhost:5000/data/14/{x}/{y}{?page,aggrMethod,aggrPeriod}
```

Where `x` and `y` are the coordinates of a certain tile and `page` is an ISO date that determines the day the air quality measurements were taken. 
`aggrMethod` and `aggrPeriod` define the used aggregation method and time interval for the aggregation respectively.
 Types for `aggrMethod` currently are `average` and `median`. Types for `aggrPeriod` are `min`, `hour` and `day`.
 If these two parameters are undefined, the raw data is queried.
For example:

```
http://localhost:5000/data/14/8392/5467?page=2019-08-06T00:00:00.000Z&aggrMethod=median&aggrPeriod=hour
```



