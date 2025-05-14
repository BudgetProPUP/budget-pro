# BudgetPro Backend (Django)

This is the backend for the MAP Active Philippines Budgeting System. It is powered by **Django + PostgreSQL**, and uses **python-dotenv** for environment variable management.

---## 
## 
## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/BudgetProPUP/budget-pro.git
cd budget-pro/backend
```
### 2. Create a virtual environment
```bash
python -m venv venv
# Mac: source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```
Make sure (venv) is in your terminal prompt. Use the command below to check if you are in the virtual environment.
```bash
where python  # On Windows
which python  # On Linux/Mac
```
### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create a `.env` file
Create a .env file in the root of the backend directory and add your environment variables following the .env.example template:
```bash
cp .env.example .env
```
Then edit the `.env` file to set your environment variables. Make sure to set the `SECRET_KEY` and `DATABASE_URL` variables.

```bash
SECRET_KEY=your_django_secret_key_here
DEBUG=True
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```
### 5. PostgreSQL Database Setup
Installation
Windows

-Download the installer from PostgreSQL official website
Run the installer and follow the setup wizard
Add PostgreSQL bin directory to your system PATH:

-Right-click on "This PC" or "My Computer" → Properties → Advanced system settings → Environment Variables
Edit the PATH variable and add: C:\Program Files\PostgreSQL\<version>\bin
Verify installation by opening Command Prompt and typing: psql --version

- Open pgAdmin and create your account (take note of your username and password), and create the database (take note of the name).

# Django .env
Add the following to your .env (if not copied from .env.example):
```bash
# Django settings
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True

# PostgreSQL DB connection
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
DJANGO_SUPERUSER_USERNAME=your-superuser-username
DJANGO_SUPERUSER_EMAIL=your-superuser-email
DJANGO_SUPERUSER_PASSWORD=your-superuser-password

# Email settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=your-email@example.com

## Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173

## Django Database Commands
bash# Make migrations
python manage.py makemigrations

## Apply migrations
python manage.py migrate

## Show migrations status
python manage.py showmigrations

## Create a new app
python manage.py startapp app_name

## Create a superuser
python manage.py createsuperuser

## Reset database
python manage.py flush

## Reset migrations for a specific app
python manage.py migrate app_name zero

## Shell with Django context
python manage.py shell

## Run Django development server
python manage.py runserver
```
## Run migrations and start development server:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend (Vite)
npm run dev
```

## Access the application:
Access the application:
```bash
Frontend: http://localhost:5173
Backend API: http://localhost:8000
Django Admin: http://localhost:8000/admin

```
# Django Database Commands:
```bash
## Make migrations
python manage.py makemigrations

## Apply migrations
python manage.py migrate

## Show migrations status
python manage.py showmigrations

## Create a new app
python manage.py startapp app_name

## Create a superuser
python manage.py createsuperuser

## Reset database
python manage.py flush

## Reset migrations for a specific app
python manage.py migrate app_name zero

## Shell with Django context
python manage.py shell

## Run Django development server
python manage.py runserver
```

### 6. Create a superuser (optional)
```bash
python manage.py createsuperuser
```
### Make sure the React and Django server are both running if you want to test integration

# Using API docs for testing
## 1.) After running python manage.py runserver, go to
```bash
(http://127.0.0.1:8000/api/docs/)
```
## 2.) Check out the different api endpoints

## 3.) In authentication, go to /api/auth/login/

## 4.) Click 'Try it out' and change the request body with actual accounts ( You can check for accounts in the database, with Django shell, or checking the comprehensive_seeder.py for the accounts and password )

## 5.) Scroll down, and copy the access token (excluding the quotation marks)

## 6.) Scroll up, click the Authorize button, paste in the access token, and click Authorize

## 7.) Endpoints that need authorized accounts can access it now.

## 8.) You can see the example responses, and request headers on those with POST methods.


### 7. Important Reminders

- Make sure to set the `DEBUG` variable to `False` in production.
- Always activate your virtual environment before running any Django commands.
- After installing new packages, make sure to update the `requirements.txt` file:
```bash
pip freeze > requirements.txt
```
- Use `python manage.py shell` to access the Django shell for testing and debugging.
- Do not commit your `.env` and `venv` folder to the repository. Add them to your `.gitignore` file:
```bash
# .gitignore 
venv/
.env
```
### 8. Github Reminders
- In Github, options or arguments modify the git commands
Example:
-a	All (e.g., stage all changes)	git add -a
-m	Message (for commits)	git commit -m "Fix bug"
-b	Create and checkout a branch	git checkout -b feature-x
-d	Delete (e.g., a branch)	git branch -d old-branch
-f	Force (overwrite)	git push -f
-p	Patch (interactive staging)	git add -p
- In Github, never push directly to the main branch. Always create a new branch for your changes and create a pull request for review before merging into the main branch.
- In Github, always use descriptive and atomic commit messages (one logical change per commit). 

- Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. This helps in generating changelogs and understanding the history of the project.

Example format:
<type>(<scope>): <subject>  # Header (required)
<blank line>
<body>                     # Description (optional)
<blank line>
<footer>                   # Metadata (e.g., issue tracking)

Common Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
- test: Adding missing or correcting existing tests
- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)

Example:
```bash
chore(backend): reorganize config files and update requirements

- Moved .env files to /capstone directory  
- Updated Django dependencies in requirements.txt  
- Revised backend README for clarity

Refs: #123  (GitHub issue)
```

- In Github, always use the following format for pull request titles:
```bash
[feature] - [description]
```

- In Github, always pull before pushing to avoid merge conflicts:
```bash
git pull origin main
```
- In Github, always resolve merge conflicts before pushing your changes.
- In Github, to undo mistakes, use the following commands:
```bash
git reset HEAD~1  # Undo last commit but keep changes in the working directory
git checkout -- <file>  # Undo changes in a file
git reset --hard HEAD~1  # Undo last commit and discard changes in the working directory
git stash  # Temporarily save changes in the working directory
git reset --soft HEAD~1  # Undo last commit and keep changes in the staging area
```
- In Github, never commit secrets. Use environment variables instead. Use the `python-dotenv` package to load environment variables from a `.env` file.





