1. Drop your previous Quiz database:
Open command prompt in this folder
>mongo
>use Quiz
>db.dropDatabase()
>exit

2. Use the new one in "Quiz" folder:
>mongorestore -d Quiz Quiz\

3. Install one dependency for nodejs:
Go to your project folder and open command prompt here
>npm install
