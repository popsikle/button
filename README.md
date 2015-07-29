Setup
==============
npm install


Running Local Dev
============================
The Dev API runs on port 3333, you can start it via
```NODE_ENV='dev' DEBUG=express:* node app.js```


API Endpoints and Methods
============================

/user/create
--------------------
POST (Create user)

params:
    + email
    + firstName
    + lastName

returns:
    user data on success (200)
    errors on param failure (400)
    jedi mind tricks on app failure (500)

/user/points
--------------------
GET (get points)
params:
    + email

returns:
    user current point value on success (200)
    errors on param failure (400)
    jedi mind tricks on app failure (500)


/transfer/record
--------------------
POST (Record a transfer)
params:
    + email
    + points

returns:
    user current point value on success (200)
    errors on param failure (400)
    jedi mind tricks on app failure (500)


/transfer/list
--------------------
GET (list all transfers)
params:
    + email

returns:
    user list object of transfers on success (200)
    errors on param failure (400)
    jedi mind tricks on app failure (500)


Running Local Tests
============================
npm test

I *dont* think these tests are actually functional right now however... they always pass even when they are not supposed to =(


Assumptions
============================
- POST data will be form encoded, which is somewhat silly because all return data is json parsable ;/
- Redis is avalable
- NODE_ENV is set properly if you actually want to run the app
- That the testing suite actually works... but im pretty sure it doesnt





