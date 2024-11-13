const responseHandler = (res, success = true, message = '', data = null, statusCode = 200) => {
    res.status(statusCode).json({
        success,
        message,
        data
    });
};

module.exports = responseHandler;