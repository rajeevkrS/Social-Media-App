const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts'); //(npm install express-ejs-layouts)
const db = require('./config/mongoose');

//used for session cookie and authentication.
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
// Passport JWT for API Authentications
const PassportJWT = require('./config/passport-jwt-strategy');
// Passport Google for Sign-In/Sign-Up
const passportGoogle = require('./config/passport-google-oauth2-strategy');

// "connect-mongo library" required to store session info. to the database.
const MongoStore = require('connect-mongo');

// "connect-flash"
const flash = require('connect-flash');

// Middleware
const customMware = require('./config/middleware');

// setup the chat server to be used with Socket.io
const chatServer = require('http').Server(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);

chatServer.listen(5000);
console.log('Chat Server is listning on port 5000');


//middleware
app.use(express.urlencoded({extended: true}));


//setting up the "cookie-parser"
app.use(cookieParser());


//use static file 
app.use(express.static('./assets'));

//Making the uploads path available to the browser.
// directory of index joins with uploads folder.
app.use('/uploads', express.static(__dirname + '/uploads'));


//use express layout
app.use(expressLayouts);

// extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);


//setup the view engine .ejs
app.set('view engine', 'ejs');
app.set('views', './views');



//setup the express session
app.use(session({
    // Properties:
    name: 'codeial',
    // TODO later - change the secret before deployment in production mode
    secret: "something",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100) // Specifies the time in milliseconds
    },
    // "MongoStore" is used to store the session cookie in the db
    store: MongoStore.create(
        {
            mongoUrl: 'mongodb://127.0.0.1:27017/codeial_development',
            autoRemove: 'disabled'
        },
        function(err){
            console.log(err || 'connect-mongodb setup ok');
        }
    )
}));



//telling app to use passport
app.use(passport.initialize());
app.use(passport.session());

//setup the current user
app.use(passport.setAuthenticatedUser);

// telling app to use connect-flash
// so we need to put it after the session is being used because "flash" uses "session cookie".
app.use(flash());

// telling app to use middleware with setFlash
app.use(customMware.setFlash);

//use express router
app.use('/', require('./routes'));


app.listen(port, function(err){
    if(err){
        console.log(`Error in running the server ; ${err}`);
    }

    console.log(`Server is running on Port: ${port}`);
})



//Revison:

//First we created "index.js" and we require our "express library" and we ran our server on port 8000.
//Then we created different folders 
//In those one is "routes folder" : initially we were using "app.get(), app.post() and so on" now we moved on to "router.get() router.post()".
    //How did we do that?
    //First we created a route file called "index.js" which is basically the centralize part for all other routes. "It tells which path should go to which file".
    //Like for users it will go to the routes "users.js" and for "/", it just calls a "homeController" (it is collection of multiple functions which are exported and those functions are called actions) So "/" which the home page goes to "homeController.home".
    //It has a controller called "home_controller.js" where it has aexported home function which "renders a view using ejs view engine called home" which setup in main "index.js" : {  //setup the view engine .ejs  }. And it will look out inside views folder were different views placed.
//Next: So whenever we have long html/ejs code or we have redandent part of html code, we put them out into different smaller files called has "PARTIALS" and naming convention that we use is "_" underscore to placed before the name of the file like "_header.ejs , _footer.ejs".
//Layout: It is a wrapper of common part or common design which every page placed inside the layout.
//Static files: We setup our static files " app.use(express.static('./assets')); " which while finds in assets folder
    //So for layout we need separate styles for layout and separate style for sub-pages which are placed inside the wrapper, so that we use these two lines {  // extract style and scripts from sub pages into the layout  }.
    //Finally we placed "<%- style %> <%- script %>" in out "layout.ejs" file, so whatever styles and scripts to be extracted they are put into these positions.
//Finaly setup our database, where we have a "config folder" were I setup a file called "mongoose.js". It has access to mongoose library and i connected to database "mongoose.connect('mongodb://127.0.0.1/codeial_development');" and exported it and finally I access it in main "index.js" file "const db = require('./config/mongoose');"


// layout.ejs

//  My Controller is saying I want to render "user_profile.ejs" since my express layouts is being used by "app" it finds the layout which should be a wrapper covering my "user_profile.ejs", So my wrapper is renedered and this "layout.ejs" is rendered together with it the "user_profile.ejs" and it is sent to the browser. 

//  So combining "user_profile" and my "layout" filling the user profile in the place of body ( <%- body %> ) and it is send back to the browser 




//Cookies: 
//For reading and writing into cookies, we will be using library or package called "Cookie Parser"



//Passport Summary:

//We setup up passport authentication, the user is now getting an identity established on the server and that identity is saved into the session cookie using express-session and then it is being communicated to and from the browser to the server.


// we have created a local strategy from passport - for authentication we are using this part in "passport-local-strategy.js" ( // authentication: telling passport to use the local-strategy ). Whenever I am passing a "(new LocalStrategy)" it is using that strategy for authentication when email and password are automatically passed in considering " usernameField: "email" " usernameField to be the email field.
    // when we found the user we are returning the user in a "serializer formate" which is encrypted using my "express-session" ( "app.use(session())" ).
    // and "passport.deserializeUser" it used to find the which user is there.

//saveUninitialized : when their is a request which not initialized which means the user has not logged in(identity is not established) in that case i have setted it with "false" because i dont want to store extra data in the session cookie.

//resave: when the identity is established or some sort of data present in the session data(user's info.), if that is being stored in that case i have setted it with "false" because i do not want to save it again and again.





//Delete and Update Summary:

// First Deleting Posts and the associated comments with it: We found the post and comments with it using post controller action.
// Second we delete comments which was little tricky because we had to delete the comment and find the entry of comment in the array in the associated post and remove it from there, So we use "$pull".

// After that we just distributed our home page code into mutiple partials like "_post & _comment ejs" 

// Next, we created user profile pages to be edited (Update) if the same user is logged in user is allowed to edit its details and if another user is logged in, they can only view the profile.

// After that we just give some basic styling to out home page.




// Connect-Flash:

// we intalled the library(npm install connect-flash) and set it up to use after the session has pe used by an app then set app to use flash.
// Then we setup some flash messages in users controller, putting some messages in the req. "req.flash()" .
// And then pass on these req.flash messages and put them into their res. "res.redirect" to the ejs templates, we created a middleware.js which fetches everthing from "req.flash()" and put them into locals.
// And using the middleware just after the flash to use setFlash middleware from "middleware.js".
// And finally displayed those messages from "layout.ejs" by giving a checks

//Setted up "Noty Js cdn" to layout.ejs file to show the animated flash message


