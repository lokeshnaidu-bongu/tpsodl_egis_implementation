#!/bin/sh

if [ $# -eq 0 ]; then
  echo "Usage: $0 <config file>"
  exit 0
fi

configfile=$1

if [ ! -f $configfile ];
then
  exit 0
fi

uaac target http://uaa-service:8080/uaa

echo GSS_CALLBACK_URL=$GSS_CALLBACK_URL
echo GSS_LOGOUT_URL=$GSS_LOGOUT_URL
echo GSS_UNAUTHENTICATED_URL=$GSS_UNAUTHENTICATED_URL

if [ -z "$GSS_SERVER_SECRET" ]; then
    echo GSS_SERVER_SECRET not set
    exit 1;
fi

source $configfile

# gss_server_id, a special client for authorization_code grant type for end users.
uaac token client get admin -s $UAA_ADMIN_SECRET
if uaac client get gss_server_id; then
    operation="update"
    secret=""
else
    operation="add"
    secret="--secret ${GSS_SERVER_SECRET}"
fi

echo
echo uaac client $operation gss_server_id
uaac client $operation gss_server_id \
--name gss_server_id \
$secret \
--scope "$GSI_SCOPE" \
--authorities "$GSI_AUTHORITIES" \
--authorized_grant_types "$GSI_AUTHORIZED_GRANT_TYPES" \
--autoapprove "$GSI_AUTOAPPROVE" \
--access_token_validity $GSI_ACCESS_TOKEN_VALIDITY \
--redirect_uri "$GSI_REDIRECT_URI" \
--refresh-token-validity $GSI_REFRESH_TOKEN_VALIDITY

uaac token client get gss_server_id -s $GSS_SERVER_SECRET
uaac context gss_server_id
