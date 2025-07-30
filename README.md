# NexGen-Quillix

## Starting Backend Data
- Open PowerShell
 Directory : \NexGen-Quillix\backend>
-  Create the Virtual Environment
```bash
python -m venv venv
```
This creates a new folder named venv/ in your project directory.
-  Activate the Virtual Environment
  ```bash
  .\venv\Scripts\Activate.ps1
```
  ```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
- Press A - stands for "Yes to All"
- Install Your Dependencies
```bash
  pip install -r requirements.txt
```
- Run FastAPI Server
```bash
  uvicorn main:app --reload
```
- This starts your FastAPI server at: http://127.0.0.1:8000
- Deactivate When Done
```bash
  deactivate
```

## Image Reference:
<img width="1466" height="1002" alt="image" src="https://github.com/user-attachments/assets/806ec34d-7d78-473c-be5d-631e3de51def" />
<img width="1462" height="918" alt="image" src="https://github.com/user-attachments/assets/ef00fb4c-5265-4941-abd4-69ecf250febb" />

