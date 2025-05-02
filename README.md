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
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
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
### 5. Create the database
Make sure you have PostgreSQL installed and running, and created a new PostgreSQL database. Update your .env file with the correct database name, user, and password.

## Run migrations:
```bash
python manage.py migrate
```
### 6. Create a superuser (optional)
```bash
python manage.py createsuperuser
```
### 7. Run the server
```bash
python manage.py runserver
```
### 8. Important Reminders
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
### 9. Github Reminders
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



