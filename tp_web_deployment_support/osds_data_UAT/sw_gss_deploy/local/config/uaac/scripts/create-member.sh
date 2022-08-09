#!/bin/sh
# create uaa membership from data in the file provided in the first parameter
# the user can be an uaa user, or an external user that has been authenticated by uaa
# user name can contain space if it is from an external system like ldap
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
  var=`echo $line | awk -F "|" '{print "group=\""$1"\"", "user=\""$2"\""}'`
  eval $var

  if [ -z "$group" ] || [ -z "$user" ] || [ "$group" == "GROUP_NAME" ];
  then
    continue
  fi

  echo add user \"$user\" to group \"$group\"
  uaac member add $group $user
done
