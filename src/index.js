import app from './app';

//Starting server
app.listen(app.get('port'), function () {
    console.log("Server on port ", app.get('port'));
});