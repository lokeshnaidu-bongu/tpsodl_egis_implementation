#!/bin/sh
########################################################################
##
## TPSODL EIS Implementation Project
##
## Created By:  Sai Kumar Veturi, TCS
## Date: 18/11/2021
##
## Description:
## Customised the Asset Search Config File module Name
########################################################################
$SMALLWORLD_GIS/bin/share/runalias -j -Djava.awt.headless=true -a $SW_ALIAS_LOCATION $SW_GIS_ALIAS -login "$MAGIK_SESSION_USER_NAME"/"$MAGIK_SESSION_USER_PASSWORD" -application tpsodl_server_application