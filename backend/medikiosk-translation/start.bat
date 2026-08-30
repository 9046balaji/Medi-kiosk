@echo off
echo Starting MediKiosk IndicTrans2 Translation Server using Conda 'attendance' environment...
call C:\ProgramData\anaconda3\Scripts\activate.bat C:\ProgramData\anaconda3\envs\attendance
python main.py
pause
