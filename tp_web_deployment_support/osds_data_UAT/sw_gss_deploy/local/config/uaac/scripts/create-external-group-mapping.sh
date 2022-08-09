#!/bin/sh
# create external group mapping from data in the file provided in the first parameter
# external group name can contain space, as it is allowed in ldap
# delimiter is |

if [ $# -eq 0 ]; then
  echo "Usage: $0 <data file>"
  exit 0
fi

datafile=$1

if [ ! -f $datafile ];
then
  exit 0
fi

uaac target http://uaa-service:8080/uaa
uaac token client get admin -s $UAA_ADMIN_SECRET

IFS=$'\n'
for line in `cat $datafile`
do
  var=`echo $line | awk -F "|" '{print "uaa_group=\""$1"\"", "external_group=\""$2"\"", "origin=\""$3"\""}'`
  eval $var

  if [ -z "$uaa_group" ] || [ -z "$external_group" ] || [ "$external_group" == "EXTERNAL_GROUP_DN" ];
  then
    continue
  fi

  echo create group mappings for \"$uaa_group\" to \"$external_group\"
  uaac group map --name $uaa_group --origin $origin $external_group
done

echo list group mappings
uaac group mappings
