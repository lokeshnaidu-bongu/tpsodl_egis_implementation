#!/bin/sh
########################################################################
##
## TPSODL EIS Implementation Project
##
## Created By:  Sai Kumar Veturi, TCS
## Date: 21/12/2021
##
## Description:
## Calls the custom TPSODL EO Web SSP Session for Creating Solr Index
########################################################################
$SMALLWORLD_GIS/bin/share/runalias -j -Djava.awt.headless=true -j -Dmagik.command=\"load_file\(\'/Smallworld/populate_solr_index.magik\'\)\" -a $SMALLWORLD_GIS/../tpsodl_eo/TPSODLElectricOfficeWeb/config/gis_aliases tpsodl_eo_web_vertx_open -login "$MAGIK_SESSION_USER_NAME"/"$MAGIK_SESSION_USER_PASSWORD" -application tpsodl_server_application -cli