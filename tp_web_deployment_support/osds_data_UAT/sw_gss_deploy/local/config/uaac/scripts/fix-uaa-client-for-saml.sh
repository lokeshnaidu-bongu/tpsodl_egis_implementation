#!/bin/sh
# show identity providers
#

uaac target http://uaa-service:8080/uaa
uaac token client get admin -s $UAA_ADMIN_SECRET

echo show all identity providers
uaac curl /identity-providers?rawConfig=true

client_id=gss_server_id
client_secret=$GSS_SERVER_SECRET
echo update uaa client $client_id for samlProvider
payload='{ "client_id" : "'"$client_id"'", "client_secret" : "'"$client_secret"'", "allowedproviders" : ["samlProvider"]}'
uaac curl -XPUT -H "Accept: application/json" -H "Content-Type: application/json" -d "$payload" /oauth/clients/$client_id
uaac client get gss_server_id

echo show SP metadata
uaac curl /saml/metadata
