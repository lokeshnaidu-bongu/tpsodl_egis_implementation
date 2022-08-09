SET APP_DIR=D:\tpsodl_eo
SET CORE_DIR=D:\EO_528\core
call %APP_DIR%\tp_layered_products\config\environment.bat
SET GIS_COMMAND=%CORE_DIR%\bin\x86\runalias.exe -a %APP_DIR%\tp_layered_products\config\gis_aliases tp_open -cli
SET SESSION=%CORE_DIR%\bin\x86\gis.exe -a %APP_DIR%\tp_layered_products\config\gis_aliases tp_emacs -f auto-gis
call %SESSION%