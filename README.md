# NexGen-Quillix


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
