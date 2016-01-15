@echo off
color 97
cls
echo ***************IMPORTANT***************
echo ***************************************
echo YOU MUST NOW CLOSE foobar2000 MANUALLY 
echo BEFORE YOU PRESS ANY KEY TO CONTINUE
pause > NUL
cls
echo working....
%1 %2 <%3
start foobar2000