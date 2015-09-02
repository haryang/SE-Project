npm install

Please follow the instructions on the video to intall MongoDB on windows (assume you have a windows laptop/desktop computer):
https://youtu.be/sBdaRlgb4N8
Command line used to start MongoDB for testing: mongod

Download and install Node.js:
https://nodejs.org/download
In the app folder, open Command Prompt and type in "node server.js" to start node server for your testing.


Open register page:
http://localhost:1337/register
Open login page:
http://localhost:1337

How to find data or drop user table:
use Quiz //switch to db "Quiz"
db.usermodels.find()
db.usermodels.drop()