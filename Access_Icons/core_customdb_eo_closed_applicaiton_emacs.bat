call E:\EO_52_10\core\config\environment.bat
SET GIS_COMMAND=E:\EO_52_10\core\bin\x86\runalias.exe -a E:\EO_52_10\tpsodl_eo\tp_db_creation\Access_Icons\gis_aliases eo -cli -login root
REM  -application swaf_fme_application
SET SESSION=E:\EO_52_10\core\bin\x86\gis.exe -a E:\EO_52_10\tpsodl_eo\tp_db_creation\Access_Icons\gis_aliases tp_emacs -f auto-gis
call %SESSION%