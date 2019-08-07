import debug = require("debug");
import express = require("express");
import path = require("path");

import dataRouter from "./routes/dataRouter";
import routes from "./routes/index";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/data", dataRouter);

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use((err: any, req, res, next) => {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err,
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {},
    });
});

app.set("port", process.env.PORT || 3000);

const server = app.listen(app.get("port"), () => {
    debug("Express server listening on port " + server.address().port);
});
