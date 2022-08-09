#!/usr/bin/env bash
#  files will be written to:
#  Key:        $OUTPUT/ca/private/$K8SHOST.key.pem
#  Cert:       $OUTPUT/ca/certs/$K8SHOST.cert.pem
#  CA cert:    $OUTPUT/ca/$K8SHOST-ca.cert.pem

function usage {
  echo "Creates Cert Key and CA for given Host and adds them to local_dir_mount_path/ssl"
  echo "Uses the following values from the given input manifest:"
  echo "  K8SHOST               [required]"
  echo "  DOCKER_REGISTRY       [required]"
  echo "  local_dir_mount_path  [required] value provided in -l flag takes precedence"
  echo "  KIBANA_HOST           [optional] defaults to kibana.\$K8SHOST"
  echo ""
  echo "Usage:"
  echo "  -i|--input <input_manifest>   Specify which manifest to drive creation of scripts with.  Manifest requires K8SHOST set. Defaults to 'pdc_input_manifest.yaml'"
  echo ""
  echo "  -d|--dns <additional_dns>     Specify additional DNS names to include in the generated certificate"
  echo "                                Example: -d <dns1> -d <dns2> -d <dns3>"
  echo ""
  echo "  -h|--help                     Give usage information"
  echo ""
}

additional_dns_count=5
additional_dns_values=''

while [[ $# -gt 0 ]]
do
  key="$1"

  case $key in
    -i|--input)
      input_manifest=$2
      shift
      shift
      ;;
    -d|--dns)
      additional_dns_count=$((additional_dns_count + 1))
      additional_dns_values="$additional_dns_values
      DNS.$additional_dns_count=$2"
      echo $additional_dns_values
      shift
      shift
      ;;
    -h|--help)
      usage
      exit
      ;;
    # This flag is for developer use only, so is not listed in usage
    -l|--local-dir-mount-path)
      LOCAL_DATA=$2
      shift
      shift
      ;;
    *)
      usage
      exit
  esac
done

set -e

function create_directories() {
  sudo mkdir -p "${LOCAL_DATA}/ssl/cert"
  sudo mkdir -p "${LOCAL_DATA}/ssl/ca"
}

function create_pod_directories() {
  mkdir -p "$OUTPUT/ca/private"
  mkdir -p "$OUTPUT/ca/certs"
}

function generate_openssl_config() {
  # We don't specify nsCertType, keyUsage or extendedKeyUsage so that certs
  # generated can be used for both clients and servers

  cat > "$OPENSSL_CONFIG" <<EOF
[ ca ]
default_ca = CA_default

[ CA_default ]
dir = $OUTPUT/ca

certificate = \$dir/ca.cert.pem
private_key = \$dir/private/ca.key.pem
database = \$dir/index.txt
new_certs_dir = \$dir/certs
serial = \$dir/serial

default_crl_days = 7
default_days = 1825
default_md = sha256

policy = ca_policy
x509_extensions = certificate_extensions

[ ca_policy ]
commonName = supplied
stateOrProvinceName = optional
countryName = optional
emailAddress = optional
organizationName = optional
organizationalUnitName = optional
domainComponent = optional

[ req ]
default_bits = 4096
default_md = sha256
prompt = yes
distinguished_name = req_distinguished_name
x509_extensions = req_ca_extensions

[ req_distinguished_name ]
countryName = Country Name (2 letter code)
stateOrProvinceName = State or Province Name
localityName = Locality Name
0.organizationName = Organization Name
organizationalUnitName = Organizational Unit Name
commonName = Common Name
emailAddress = Email Address

[ req_ca_extensions ]
basicConstraints = CA:true
keyUsage = keyCertSign, cRLSign

[ server_cert ]
basicConstraints = CA:FALSE
nsComment = "OpenSSL Generated Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
subjectAltName = @alt_names

[alt_names]
DNS.1=$K8SHOST
DNS.2=$NEXUS_HOST
DNS.3=$NEXUS_PULL_HOST
DNS.4=$NEXUS_PUSH_HOST
DNS.5=$KIBANA_HOST
$ADDITIONAL_DNS_VALS
EOF
  : > "$OUTPUT/ca/index.txt"
  echo 1000 > "$OUTPUT/ca/serial"
}

function generate_root_ca_key() {
  echo -n "Generating CA key and cert... "
  echo ""

  local ca_pvt_key="$OUTPUT/ca/private/ca.key.pem"
  # Create Private Key for CA
  openssl genrsa -aes256 -out "$ca_pvt_key" -passout "pass:$CA_PASS" 4096

  local ca_cert="$OUTPUT/ca/ca.cert.pem"

  # Create Certificate Authority (CA)
  openssl req -config "$OPENSSL_CONFIG" \
    -key "$ca_pvt_key" \
    -new -x509 -days 7300 -sha256 -extensions req_ca_extensions \
    -out "$ca_cert" \
    -passin "pass:$CA_PASS" \
    -subj "/C=UK/ST=Cambridgeshire/L=Cambridge/O=Smallworld/CN=GE Smallworld Test" \
    -batch

  echo ""
  echo "Done"
  echo "   Written CA private key to $ca_pvt_key"
  echo "   Written CA cert to $ca_cert"
}

function create_private_key_and_cert_for_cn() {
  echo -n "Generating Server cert and key for $K8SHOST..."

  local server_name="$OUTPUT/ca/private/$K8SHOST"
  local server_private_key="$server_name.key.pem"
  # Create Private Key for Certificate
  openssl genrsa -out "$server_private_key" 2048

  local server_csr="$server_name.csr.pem"
  # Create Certificate Signing Request (CSR)
  openssl req -config "$OPENSSL_CONFIG" \
    -key "$server_private_key" \
    -new -sha256 -out "$server_csr" \
    -subj "/C=UK/ST=Cambridgeshire/L=Cambridge/O=Smallworld/CN=$K8SHOST" \
    -batch

  echo ""

  local server_cert="$OUTPUT/ca/certs/$K8SHOST.cert.pem"

  # Create Certificate
  openssl ca -config "$OPENSSL_CONFIG" \
    -extensions server_cert -days 3750 -notext -md sha256 \
    -in "$server_csr" \
    -out "$server_cert" \
    -passin "pass:$CA_PASS" -batch
    
  echo ""

  echo "Done"
  echo "    Written Server private key to $server_private_key"
  echo "    Written Server cert to $server_cert"
}

function copy_files() {
  echo "copy files to mapped volume ssl"

  cp $OUTPUT/ca/private/$K8SHOST.key.pem /etc/nginx/ssl/cert/ssl.key.pem
  cp $OUTPUT/ca/certs/$K8SHOST.cert.pem /etc/nginx/ssl/cert/ssl.cert.pem
  cp $OUTPUT/ca/ca.cert.pem /etc/nginx/ssl/ca/ca.cert.pem

  chmod +r /etc/nginx/ssl/cert/ssl.key.pem

  echo "Remove temporary ssl directory"
  rm -Rf $OUTPUT
}

function generate_certs_in_container() {
  input_manifest=${input_manifest:-pdc_input_manifest.yaml}

  K8SHOST=`grep -w K8SHOST ${input_manifest} | cut -f2 -d"'" | cut -f1 -d"'"`
  DOCKER_REGISTRY=`grep -w DOCKER_REGISTRY ${input_manifest} | cut -f2 -d"'" | cut -f1 -d"'"`

  gss_manifest_start=`grep "\- id: 'gss'" ${input_manifest} -n | cut -f1 -d:`

  if [[ -z $LOCAL_DATA ]]; then
    local_data_lines=`grep "local_dir_mount_path:" ${input_manifest} -n | cut -f1 -d:`
    for local_line in ${local_data_lines}; do
      if [[ ${local_line} -gt ${gss_manifest_start} ]]; then
        export LOCAL_DATA=`sed "${local_line}q;d" ${input_manifest} | cut -f2 -d"'" | cut -f1 -d"'"`
        break
      fi
    done
  fi

  KIBANA_HOST=`grep -w KIBANA_HOST ${input_manifest} | cut -f2 -d"'" | cut -f1 -d"'"`

  KIBANA_HOST=${KIBANA_HOST:-kibana.$K8SHOST}

  echo "K8SHOST: $K8SHOST"
  echo "DOCKER_REGISTRY: $DOCKER_REGISTRY"
  echo "local_dir_mount_path: $LOCAL_DATA"
  echo "KIBANA_HOST: ${KIBANA_HOST}"
  echo $additional_dns_values


  create_directories

  SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

  echo_and_run sudo docker run --user 0 \
  --entrypoint=/bin/bash \
  -v ${LOCAL_DATA}/ssl:/etc/nginx/ssl \
  -v $SCRIPTS_DIR:/etc/nginx/script \
  -e K8SHOST=$K8SHOST \
  -e KIBANA_HOST=$KIBANA_HOST \
  -e ADDITIONAL_DNS_VALS="$additional_dns_values" \
  -e RUNNING_IN_CONTAINER=true \
  ${DOCKER_REGISTRY}/pwr-smallworld/nginx-ingress-controller:0.41.2 /etc/nginx/script/generate-demo-certificates.sh
}

echo_and_run() { echo "$*" ; "$@" ; }

RUNNING_IN_CONTAINER=${RUNNING_IN_CONTAINER:-false}


# First time the script is run it will start a docker container and run itself inside
if [ "$RUNNING_IN_CONTAINER" == "false" ];
then
  generate_certs_in_container
else
  NEXUS_HOST=nexus.$K8SHOST
  NEXUS_PULL_HOST=pull.$K8SHOST
  NEXUS_PUSH_HOST=push.$K8SHOST

  echo "generating certificates"
  OUTPUT=$(pwd)/tmp
  OPENSSL_CONFIG="$OUTPUT/ca/openssl.cnf"
  CA_PASS=$(openssl rand -hex 32)

  create_pod_directories
  generate_openssl_config
  generate_root_ca_key
  create_private_key_and_cert_for_cn
  copy_files
fi