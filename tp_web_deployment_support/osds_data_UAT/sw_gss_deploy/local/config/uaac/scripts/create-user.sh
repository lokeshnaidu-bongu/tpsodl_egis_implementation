#!/bin/sh
# create uaa users from data in the ../data/create-user file
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
  var=`echo $line | awk -F "|" '{print "user=\""$1"\"", "secret="$2, "email="$3}'`
  eval $var

  if [ -z "$user" ] || [ -z "$secret" ] || [ -z "$email" ] || [ "$user" == "USER_NAME" ];
  then
    continue
  fi

  echo create user \"$user\"
  uaac user add $user -p $secret --emails $email
done
