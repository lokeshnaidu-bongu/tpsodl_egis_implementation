#!/bin/bash
# This is a template to create secrets for credentials:
# 1. emaps credential
# 2. postgres credential for bifrost
# 3. rabbitmq credential for bifrost
# 4. postgres credential for UAA
# 5. UAA admin password
# 6. DTR credential (obsolete)
# 7. Nexus credential
# 8. UAA client client_schedule credential
# 9. For UAA client for anonymous access
# 10. For UAA client for bifrost
# 11. For Magik session username/password
# 12. For Bifrost PKCE cookie
# 13. For Bifrost XSS cookie
# 14. For Kibana dashboard
# 15. For GSS Resource Key
# 16. For SOLR username/password

function generate-password {
  # generate a sufficient random string usable in a URL
  echo $(openssl rand -base64 8) | tr '/+' 'xx'
}

function request-password {
  read -s -p "Enter password for $1: " password_orig
  read -s -p "      Confirm password: " password_confirm
  if [[ ${password_orig} == ${password_confirm} ]]; then
    PASSWORD=${password_orig}
  else
    echo -e "\nPasswords don't match, try again."
    request-password "$1"
  fi
}

function usage {
  echo "generate-k8s-secrets.sh: Generate K8S secrets for GSS"
  echo ""
  echo "Usage:"
  echo "    -n|--namespace <namespace>    Use the specified namespace (default gss-prod)"
  echo "    -c|--clean                    Regenerate all secrets"
  echo "    -s|--sts <namespace>          Create STS namespace and secrets"
  echo "    -h|--help                     Give usage information"
  echo "    --no-logging                  Don't create logging namespace or secrets"
  echo "    -a|--additional-namespaces    A comma separated list of additional namespace that should be created, together with regsecret secret"
  echo ""
}

function delete-secret {
  if [ $(kubectl get secret $1 -n $2 --ignore-not-found=true | wc -l) != 0 ]; then
    kubectl delete secret $1 -n $2
  fi
}

while [[ $# -gt 0 ]]
do
  key="$1"

  case $key in
    -c|--clean)
      clean=true
      shift
      ;;
    -h|--help)
      usage
      exit
      ;;
    --no-logging)
      logs=false
      shift
      ;;
    -n|--namespace)
      namespace=$2
      shift
      shift
      ;;
    -a|--additional-namespaces)
      additional_namespaces=$2
      shift
      shift
      ;;
    -s|--sts)
      sts=true
      sts_namespace=$2
      shift
      shift
      ;;
    *)
      usage
      exit
  esac
done

namespace=${namespace:-gss-prod}
logging_namespace=logging

## add all namespaces together
IFS=',' read -r -a namespaces <<< "$additional_namespaces"
namespaces+=( "$namespace" )
if [ "$logs" != "false" ]; then
  namespaces+=( "$logging_namespace" )
fi

if [ "$sts" = "true" ]; then
  namespaces+=( "$sts_namespace" )
fi

## create namespaces
for name in "${namespaces[@]}"
do
  if [ $(kubectl get namespace | grep $name | wc -l) == 0 ]; then
    kubectl create namespace $name
  fi
done

show_generated=false

# 1. For emaps
SECRET=emaps-smtp-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  EMAPS_SMTP_USER=smtp-auth-user-optional
  EMAPS_SMTP_PASSWORD=$(generate-password)
    
  kubectl create secret generic $SECRET \
    --from-literal=user=$EMAPS_SMTP_USER \
    --from-literal=password=$EMAPS_SMTP_PASSWORD \
    -n $namespace

    show_generated=true
fi

# 2. For postgres credential for bifrost
SECRET=bifrost-postgres-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  POSTGRES_USER=bifrost_owner
  POSTGRES_PASSWORD=$(generate-password)
  POSTGRES_DB=bifrostdb
  POSTGRES_ADMIN_PASSWORD=$(generate-password)
  POSTGRES_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres-lb-service:5432/$POSTGRES_DB

  kubectl create secret generic $SECRET \
    --from-literal=dbuser=$POSTGRES_USER \
    --from-literal=dbname=$POSTGRES_DB \
    --from-literal=dbpass=$POSTGRES_PASSWORD \
    --from-literal=adminpass=$POSTGRES_ADMIN_PASSWORD \
    --from-literal=dburl=$POSTGRES_URL \
    -n $namespace

  show_generated=true
fi

# 3. For rabbitmq credential for bifrost
SECRET=bifrost-rabbitmq-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  RABBITMQ_ADMIN_USER=admin
  RABBITMQ_ADMIN_PASS=$(generate-password)
  RABBITMQ_AMQP_PATH=${RABBITMQ_ADMIN_USER}:${RABBITMQ_ADMIN_PASS}@rabbitmq-service:5672
  RABBITMQ_AMQP_URL=amqp://${RABBITMQ_AMQP_PATH}

  kubectl create secret generic $SECRET \
    --from-literal=rabbitmqadmin=$RABBITMQ_ADMIN_USER \
    --from-literal=rabbitmqadminsecret=$RABBITMQ_ADMIN_PASS \
    --from-literal=path=$RABBITMQ_AMQP_PATH \
    --from-literal=url=$RABBITMQ_AMQP_URL \
    -n $namespace
  
  show_generated=true
fi

# 4. For postgres credential for UAA
SECRET=uaa-postgresql-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  UAA_DB_NAME=uaadb
  UAA_DBUSER_NAME=uaa_owner
  UAA_DBUSER_PASSWORD=$(generate-password)
  UAA_DB_POSTGRES_PASSWORD=$(generate-password)

  kubectl create secret generic $SECRET \
    --from-literal=dbname=$UAA_DB_NAME \
    --from-literal=username=$UAA_DBUSER_NAME \
    --from-literal=password=$UAA_DBUSER_PASSWORD \
    --from-literal=adminpassword=$UAA_DB_POSTGRES_PASSWORD \
    -n $namespace

  show_generated=true
fi

# 5. For UAA admin password
SECRET=uaa-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  UAA_PASSWORD=$(generate-password)

  kubectl create secret generic $SECRET \
    --from-literal=uaapassword=$UAA_PASSWORD \
    -n $namespace

  show_generated=true
fi

# 6. For accessing DTR
# SECRET=regsecret
# if [ $(kubectl get secret $SECRET -n default --ignore-not-found=true | wc -l) == 0 ]; then

#   DTR_SERVER=https://dtr.predix.io
#   read -p "Enter username for $DTR_SERVER: " DTR_USER
#   read -p "Enter email address for $DTR_USER on $DTR_SERVER: " DTR_USER_EMAIL
#   read -s -p "Password for $DTR_USER on $DTR_SERVER: " DTR_PASSWORD

#   kubectl create secret docker-registry $SECRET \
#     --docker-server=$DTR_SERVER \
#     --docker-username=$DTR_USER \
#     --docker-password=$DTR_PASSWORD \
#     --docker-email=$DTR_USER_EMAIL \
#     --namespace=default

# fi 

# 7. For accessing Nexus
SECRET=regsecret
if [ $clean ]; then
  for name in "${namespaces[@]}"
  do
      delete-secret $SECRET $name
  done
fi

for name in "${namespaces[@]}"
do
  if [ $(kubectl get secret $SECRET -n $name --ignore-not-found=true | wc -l) == 0 ]; then
    HOSTNAME=$(hostname --long)
    DEFAULT_VALUE="https://pull.$HOSTNAME:30443"
    read -p "URL of Nexus [$DEFAULT_VALUE]: " NEXUS_SERVER
    if [ "$NEXUS_SERVER" == '' ]; then NEXUS_SERVER=$DEFAULT_VALUE; fi
    DEFAULT_VALUE="admin"
    read -p "Enter username for $NEXUS_SERVER [$DEFAULT_VALUE]: " NEXUS_USER
    if [ "$NEXUS_USER" == '' ]; then NEXUS_USER=$DEFAULT_VALUE; fi
    DEFAULT_VALUE="admin@example.com"
    read -p "Enter email address for $NEXUS_USER on $NEXUS_SERVER [$DEFAULT_VALUE]: " NEXUS_USER_EMAIL
    if [ "$NEXUS_USER_EMAIL" == '' ]; then NEXUS_USER_EMAIL=$DEFAULT_VALUE; fi
    request-password "${NEXUS_USER} on ${NEXUS_SERVER}"
    break
  fi
done

for name in "${namespaces[@]}"
do
  if [ $(kubectl get secret $SECRET -n $name --ignore-not-found=true | wc -l) == 0 ]; then
  kubectl create secret docker-registry $SECRET \
    --docker-server=$NEXUS_SERVER \
    --docker-username=$NEXUS_USER \
    --docker-password=$PASSWORD \
    --docker-email=$NEXUS_USER_EMAIL \
    --namespace=$name
  fi
done

# 8. For cronjobs to access UAA
SECRET=client-credential-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  UAA_CLIENT_SCHEDULE=client_schedule
  UAA_CLIENT_SCHEDULE_PASSWORD=$(generate-password)

  kubectl create secret generic $SECRET \
    --from-literal=username=$UAA_CLIENT_SCHEDULE \
    --from-literal=password=$UAA_CLIENT_SCHEDULE_PASSWORD \
    -n $namespace

    show_generated=true
fi

# 9. For UAA client for anonymous access
SECRET=anonymous-access-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  UAA_CLIENT_GUEST=client_guest
  UAA_CLIENT_GUEST_PASSWORD=$(generate-password)

  kubectl create secret generic $SECRET \
    --from-literal=user=$UAA_CLIENT_GUEST \
    --from-literal=password=$UAA_CLIENT_GUEST_PASSWORD \
    -n $namespace

    show_generated=true
fi

# 10. For UAA client for bifrost
SECRET=bifrost-uaa-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  UAA_BIFROST_CLIENT=gss_server_id
  UAA_BIFROST_CLIENT_PASSWORD=$(generate-password)

  kubectl create secret generic $SECRET \
    --from-literal=user=$UAA_BIFROST_CLIENT \
    --from-literal=password=$UAA_BIFROST_CLIENT_PASSWORD \
    -n $namespace

    show_generated=true
fi

# 11. For Magik session username/password
SECRET=magik-user-secret

create_sts_magik_secret=false
if [ "$sts" = "true" ] && [ $(kubectl get secret $SECRET -n $sts_namespace --ignore-not-found=true | wc -l) == 0 ]; then
  create_sts_magik_secret=true
fi

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $clean ] && [ "$sts" = "true" ]; then
  delete-secret $SECRET $sts_namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ] || [ "$create_sts_magik_secret" = "true" ]; then
  DEFAULT_VALUE="root"
  read -p "Enter username for magik sessions  [$DEFAULT_VALUE]: " MAGIK_SESSION_USER_NAME
  if [ "$MAGIK_SESSION_USER_NAME" == '' ]; then MAGIK_SESSION_USER_NAME=$DEFAULT_VALUE; fi
  request-password "magik sessions"

  kubectl create secret generic $SECRET \
  --from-literal=username=$MAGIK_SESSION_USER_NAME \
  --from-literal=password=$PASSWORD \
  --namespace=$namespace

  if [ "$sts" = "true" ]; then
    kubectl create secret generic $SECRET \
    --from-literal=username=$MAGIK_SESSION_USER_NAME \
    --from-literal=password=$PASSWORD \
    --namespace=$sts_namespace
  fi

fi

# 12. For Bifrost PKCE cookie
SECRET=bifrost-pkce-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then
  myos=$(uname)
  
  if [ "$myos" = "Darwin" ];
  then
    PKCE_KEY=$(cat /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  else
    PKCE_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  fi

  kubectl create secret generic $SECRET \
  --from-literal=key=$PKCE_KEY \
  --namespace=$namespace
fi

# 13. For Bifrost XSS cookie
SECRET=bifrost-xss-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then
  myos=$(uname)
  
  if [ "$myos" = "Darwin" ];
  then
    XSS_KEY=$(cat /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  else
    XSS_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  fi

  kubectl create secret generic $SECRET \
  --from-literal=key=$XSS_KEY \
  --namespace=$namespace
fi

# 14. For kibana username/password
if [ "$logs" != "false" ]; then
  SECRET=logging-auth

  if [ $clean ]; then
    delete-secret $SECRET $logging_namespace
  fi

  if [ $(kubectl get secret $SECRET -n $logging_namespace --ignore-not-found=true | wc -l) == 0 ]; then

    DEFAULT_VALUE="kibuser"
    read -p "Enter username for kibana  [$DEFAULT_VALUE]: " KIBANA_USER_NAME
    if [ "$KIBANA_USER_NAME" == '' ]; then KIBANA_USER_NAME=$DEFAULT_VALUE; fi
    request-password "kibana"

    # Satify nginx ingress requirement of user/pass against "auth" key
    # see https://github.com/kubernetes/ingress-nginx/blob/master/docs/examples/auth/basic/README.md
    kibana_user_pass=$KIBANA_USER_NAME:$(openssl passwd -apr1 "$PASSWORD")

    kubectl create secret generic $SECRET \
      --from-literal=auth=$kibana_user_pass \
      --namespace=$logging_namespace

  fi

fi

# 15. For GSS Resource Key
SECRET=gss-resource-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  myos=$(uname)

  if [ "$myos" = "Darwin" ];
  then
    GSS_RESOURCE_KEY=$(cat /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  else
    GSS_RESOURCE_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
  fi

  kubectl create secret generic $SECRET \
    --from-literal=key=$GSS_RESOURCE_KEY \
    --namespace=$namespace

  show_generated=true
fi

# 16. For SOLR username/password
SECRET=solr-secret

if [ $clean ]; then
  delete-secret $SECRET $namespace
fi

if [ $(kubectl get secret $SECRET -n $namespace --ignore-not-found=true | wc -l) == 0 ]; then

  SOLR_USERNAME=smallworld
  SOLR_PASSWORD=$(generate-password)

  kubectl create secret generic $SECRET \
    --from-literal=user=$SOLR_USERNAME \
    --from-literal=password=$SOLR_PASSWORD \
    -n $namespace

  show_generated=true
fi

# Show passwords
if [ $show_generated == true ]; then
  echo "Passwords have been generated as follows:"
  echo " "
  if [ "$EMAPS_SMTP_PASSWORD" != '' ]; then
    echo "EMAPS_SMTP_PASSWORD            $EMAPS_SMTP_PASSWORD"
  fi
  if [ "$POSTGRES_PASSWORD" != '' ]; then
    echo "POSTGRES_PASSWORD              $POSTGRES_PASSWORD"
  fi
  if [ "$POSTGRES_ADMIN_PASSWORD" != '' ]; then
    echo "POSTGRES_ADMIN_PASSWORD        $POSTGRES_ADMIN_PASSWORD"
  fi
  if [ "$RABBITMQ_ADMIN_PASS" != '' ]; then
    echo "RABBITMQ_ADMIN_PASS            $RABBITMQ_ADMIN_PASS"
  fi
  if [ "$UAA_DBUSER_PASSWORD" != '' ]; then
    echo "UAA_DBUSER_PASSWORD            $UAA_DBUSER_PASSWORD"
  fi
  if [ "$UAA_DB_POSTGRES_PASSWORD" != '' ]; then
    echo "UAA_DB_POSTGRES_PASSWORD       $UAA_DB_POSTGRES_PASSWORD"
  fi
  if [ "$UAA_PASSWORD" != '' ]; then
    echo "UAA_PASSWORD                   $UAA_PASSWORD"
  fi
  if [ "$UAA_CLIENT_SCHEDULE_PASSWORD" != '' ]; then
    echo "UAA_CLIENT_SCHEDULE_PASSWORD   $UAA_CLIENT_SCHEDULE_PASSWORD"
  fi
  if [ "$UAA_CLIENT_GUEST_PASSWORD" != '' ]; then
    echo "UAA_CLIENT_GUEST_PASSWORD      $UAA_CLIENT_GUEST_PASSWORD"
  fi
  if [ "$UAA_BIFROST_CLIENT_PASSWORD" != '' ]; then
    echo "UAA_BIFROST_CLIENT_PASSWORD    $UAA_BIFROST_CLIENT_PASSWORD"
  fi
  if [ "$PKCE_KEY" != '' ]; then
    echo "BIFROST_PKCE_KEY               $PKCE_KEY"
  fi 
  if [ "$XSS_KEY" != '' ]; then
    echo "BIFROST_XSS_KEY                $XSS_KEY"
  fi  
  if [ "$GSS_RESOURCE_KEY" != '' ]; then
    echo "GSS_RESOURCE_KEY               $GSS_RESOURCE_KEY"
  fi  
  if [ "$SOLR_PASSWORD" != '' ]; then
    echo "SOLR_PASSWORD                  $SOLR_PASSWORD"
  fi  

  echo " "
  echo "Please retain these values securely for reference."
fi
