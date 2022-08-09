#!/bin/sh
# the starting point
# must create members after groups and users are created.

sh create-gss-server-id.sh ../data/gss_server_id.cfg

sh create-client.sh ../data/default-clients
sh create-client.sh ../data/create-client
sh create-group.sh ../data/create-group
sh create-user.sh ../data/create-user
sh create-member.sh ../data/create-member

if [ -f "create-external-group-mapping.sh" ];
then
  sh create-external-group-mapping.sh ../data/create-external-group-mapping
fi

if [ -f "fix-uaa-client-for-saml.sh" ];
then
  sh fix-uaa-client-for-saml.sh
fi

exit 0
