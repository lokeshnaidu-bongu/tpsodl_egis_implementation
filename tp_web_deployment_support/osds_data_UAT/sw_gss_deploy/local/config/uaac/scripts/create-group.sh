#!/bin/sh
# create uaa groups from data in the file provided in the first parameter
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
  var=`echo $line | awk -F "|" '{print "group=\""$1"\""}'`
  eval $var

  if [ -z "$group" ] || [ "$group" == "GROUP_NAME" ];
  then
    continue
  fi

  echo create group \"$group\"
  uaac group add $group
done
