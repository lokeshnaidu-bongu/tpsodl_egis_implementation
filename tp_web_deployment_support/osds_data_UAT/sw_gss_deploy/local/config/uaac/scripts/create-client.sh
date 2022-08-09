#!/bin/sh
# create uaa clients from data in the file provided in the first parameter
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

IFS=$'\n'
for line in `cat $datafile`
do
  var=`echo $line | awk -F "|" '{print "name=\""$1"\"", "secret="$2, "scopes=\""$3"\"", "authorities=\""$4"\"", "granttypes=\""$5"\""}'`
  eval $var
  # We can have clients where scopes and authorities are empty.
  # Every client should have granttypes non-empty.
  if [ -z "$name" ] || [ -z "$secret" ] || [ -z "$granttypes" ] || [ "$name" == "CLIENT_NAME" ];
  then
    continue
  fi

  uaac token client get admin -s $UAA_ADMIN_SECRET
  if uaac client get $name; then
    operation="update"
    secret_option=""
    secret_parameter=""
  else
    operation="add"
    secret_option="--secret"
    secret_parameter="$secret"
  fi

  echo
  echo uaac client $operation $name
  uaac client $operation $name \
    $secret_option $secret_parameter \
    --name $name \
    --scope "$scopes" \
    --authorities "$authorities" \
    --authorized_grant_types "$granttypes"

  uaac token client get $name -s $secret
  uaac context $name
done

