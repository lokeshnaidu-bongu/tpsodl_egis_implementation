SET TP_CUSTOM_CONFIG_DIR=\\dc-gisprd-clsfs\tpsodl_eo_v1\tpsodl_layered_products\config\
CALL %TP_CUSTOM_CONFIG_DIR%editable_environment.bat
CALL %SMALLWORLD_GIS%\config\environment.bat

REM Override any of these with local repositories if their products should be loaded locally 
SET SW_ELECTRIC_OFFICE_DIR=%SMALLWORLD_GIS%\..\electric_office
SET SW_DM_DIR=%SMALLWORLD_GIS%\..\design_manager
SET SW_COMMON_OFFICE_DIR=%SMALLWORLD_GIS%\..\sw_common_office
SET SW_EMBED_FONTS=true


REM This variable is set because in smallworld registry, should not register this product so have to set this environment variable.
SET TP_LAYERED_PRODUCT_DIR=%TP_CUSTOM_CONFIG_DIR%..\..\tpsodl_layered_products
SET TP_SAMPLE_INPUT=%TP_LAYERED_PRODUCT_DIR%\modules\custom_modules\tp_input_samples
SET TP_CUSTOMIZATION_PRODUCT_DIR=%TP_CUSTOM_CONFIG_DIR%..\..\tp_customized_products
REM SW_DB_CONTEXT_DIR=%TP_CUSTOM_CONFIG_DIR%..\..\db_context