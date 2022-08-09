#!/bin/bash

# 01:   Help function
function usage {
  echo ""
  echo "Prepares environment for Nexus deployment"
  echo "It also provides functionality to create a tls secret from a certificate/key pair"
  echo "and label specific worker nodes on which HTTPS Nexus should be deployed."
  echo ""
  echo "Usage:"
  echo "  --create-tls-secret         If this flag is used, a nexus-tls secret will be created in \$namespace, from"
  echo "                              --ssl-cert and --ssl-key flags"
  echo ""
  echo "  --ssl-key <key_file>        Specify the file which contains the private key that will be used to create nexus-tls secret."
  echo "                              Required if using the flag --create-tls-secret"
  echo ""
  echo "  --ssl-cert <key_file>       Specify the file which contains the certificate that will be used to create nexus-tls secret"
  echo "                              Required if using the flag --create-tls-secret"
  echo ""
  echo "  -n|--namespace <namespace>  Namespace in which the nexus-tls should be created. The namespace has to already exist"
  echo "                              and it should have a regsecret in it. This can be done by running the generate-k8s-secrets.sh script."
  echo "                              Defaults to \"nexus\""
  echo ""
  echo "  -l|--label-nodes <nodes>    Adds a label node-role.kubernetes.io/nexus=true to any worker nodes mentioned in a comma"
  echo "                              sepparated string"
  echo ""
  echo "  -h|--help                   Give usage information"
  echo ""
}

# 03:   Handle given options
while [[ $# -gt 0 ]]
do
  key="$1"

  case $key in
    --create-tls-secret)
      create_tls_secret="true"
      shift
      ;;  
    --ssl-key)
      key_file=$2
      shift
      shift
      ;;
    --ssl-cert)
      crt_file=$2
      shift
      shift
      ;;
    -n|--namespace)
      namespace=$2
      shift
      shift
      ;;
    -l|--label-nodes)
      label_nodes=$2
      shift
      shift
      ;;
    -h|--help)
      usage
      exit
      ;;
    *)
      usage
      exit
  esac
done

namespace=${namespace:-"nexus"}

# 03:   Create TLS secret 
if [ "$create_tls_secret" == "true" ]; then
  # Ensure options required for creating secret have been provided
  if [ -z "$key_file" ] || [ -z "$crt_file" ]; then
    echo "ERROR: Both options --ssl-key and --ssl-cert must be set when creating TLS secret"
    exit 1
  fi
  
  # Ensure specified certificate/key exist
  if  [ ! -f $key_file ]; then 
    echo "The SSL key file $key_file does not exist!"
    exit 1
  elif  [ ! -f $crt_file ]; then 
    echo "The SSL certificate file $crt_file does not exist!"
    exit 1
  fi

  # Create nexus-tls secret
  echo "## Creating secret nexus-tls in \"$namespace\" namespace"
  echo "##    Using Key:  $key_file"
  echo "##    Using cert: $crt_file"
  secret_name=nexus-tls

  kubectl create secret tls $secret_name --key ${key_file} --cert ${crt_file} --namespace $namespace -o yaml --dry-run | kubectl apply -f -
fi

# 04:   Label Nodes
if [ ! -z $label_nodes ]; then
  echo "## Labeling nodes"
  IFS=',' read -r -a nodes <<< "$label_nodes"
  for node in ${nodes[@]}
  do
    echo "##    Adding label node-role.kubernetes.io/nexus=true to node: \"$node\""
    kubectl label nodes $node node-role.kubernetes.io/nexus=true
  done
else
  echo "## Skipping step to label nodes: No nodes provided"
fi