#!/bin/bash

function usage {
    echo "setup_deploy.sh: Prepare environment for GSS deploy using bsfdeploy"
    echo ""
    echo "Usage:"
    echo "      -c|--certificates                                  [optional]  Create demo certificates (defaults to false)"
    echo "      -d|--dns <additional_dns>                          [optional]  Specify additional DNS names to include in the generated certificate"
    echo "                                                                     Example: -d <dns1> -d <dns2> -d <dns3>"
    echo "                                                                     Only to be used with the -c|--certificates flag"
    echo "      -h|--help                                          [optional]  Give usage information"
    echo "      -i|--input-manifest <path to input manifest>       [optional]  The input manifest used for deployment (defaults to pdi_input_manifest.yaml)"
    echo "      -k|--kubeconfig <path to kubeconfig>               [required]  Location of kubeconfig file in deployment environment"
    echo ""
}

additional_dns=''

while [[ $# -gt 0 ]]
do
  key="$1"

  case $key in
    -c|--certificates)
      CREATE_DEMO_CERTS=true
      shift
      ;;
    -d|--dns)
	    additional_dns+=' -d '
      additional_dns+=${2}
      shift
      shift
      ;;
    -h|--help)
      usage
      exit
      ;;
    -i|--input-manifest)
      INPUT_MANIFEST=$2
      shift
      shift
      ;;
    -k|--kubeconfig)
      LOCAL_KUBECONFIG=$2
      shift
      shift
      ;;
    # This flag is for developer use only, so is not listed in usage
    -l|--local-dir-mount-path)
      LOCAL_DATA=$2
      shift
      shift
      ;;

    # This flag is for developer use only, so is not listed in usage
    -f|--fetch-config)
      fetch_config=true
      shift
      ;;
    *)
      usage
      exit
  esac
done

if [[ -z $LOCAL_KUBECONFIG ]]; then
  echo "local kubeconfig not provided with -k flag"
  exit 1
fi

if [[ -z ${fetch_config} ]]; then
  fetch_config=false
fi

INPUT_MANIFEST=${INPUT_MANIFEST:-pdi_input_manifest.yaml}
CREATE_DEMO_CERTS=${CREATE_DEMO_CERTS:-false}

# Check for mandatory variables in input manifest
mandatory_vars=()
mandatory_vars+=(K8SHOST)
mandatory_vars+=(MESSAGES_DIR_PATH)
mandatory_vars+=(DOCKER_REGISTRY)
mandatory_vars+=(ACE_DIR_PATH)

missing_vars=()
for var in "${mandatory_vars[@]}"
do
    line=$(grep -w ${var} ${INPUT_MANIFEST} | cut -f1 -d":")
    value=$(grep -w ${var} ${INPUT_MANIFEST} | cut -f2 -d"'" | cut -f1 -d"'")
    if [[ ${line} =~ "#" ]] || [[ ${#value} == 0 ]]; then 
        missing_vars+=(${var})
    fi
done

if [[ ${#missing_vars[@]} != 0 ]]; then
    for var in "${missing_vars[@]}"
    do
        echo "error: ${var} not provided in ${INPUT_MANIFEST}"
    done
    exit 1
fi

# Create OSDS directories
if [[ -z $LOCAL_DATA ]]; then
  gss_manifest_start=`grep "\- id: 'gss'" ${INPUT_MANIFEST} -n | cut -f1 -d:`
  local_data_lines=`grep "local_dir_mount_path:" ${INPUT_MANIFEST} -n | cut -f1 -d:`
  for local_line in ${local_data_lines}; do
    if [[ ${local_line} -gt ${gss_manifest_start} ]]; then
        LOCAL_DATA=`sed "${local_line}q;d" ${INPUT_MANIFEST} | cut -f2 -d"'" | cut -f1 -d"'"`
        break
    fi
  done
fi

export LOCAL_DATA=$LOCAL_DATA

if [[ -z ${LOCAL_DATA} ]]; then
    echo "local_dir_mount_path not provided for GSS, cannot proceed."
    exit 1
fi
echo "PDI data will be mounted from ${LOCAL_DATA}"

sudo mkdir -p ${LOCAL_DATA}/ca_certificates
sudo mkdir -p ${LOCAL_DATA}/ssl/ca
sudo mkdir -p ${LOCAL_DATA}/ssl/cert
sudo mkdir -p ${LOCAL_DATA}/kubeconfig
sudo cp ${LOCAL_KUBECONFIG} ${LOCAL_DATA}/kubeconfig/config
sudo chmod 600 ${LOCAL_DATA}/kubeconfig/config 

if [ -d ../dev_scripts ]; then
	image_lines=`grep "image:" ${INPUT_MANIFEST} -n| cut -f1 -d:`
  for line in ${image_lines}; do
      if [[ ${line} -gt ${gss_manifest_start} ]]; then
		    export PRODUCT_PDI=`sed "${line}q;d" ${INPUT_MANIFEST} | cut -f3 -d"/" | cut -f1 -d"'"`
	    fi
	done
  if [[ -z ${PRODUCT_PDI} ]]; then
    echo "Error: PDI name not specified in input manifest, cannot proceed"
    exit 1
	fi
  source ../dev_scripts/setup_deploy_dev_additions.sh ${INPUT_MANIFEST} ${PRODUCT_PDI} ${fetch_config}
fi

if [[ "${CREATE_DEMO_CERTS}" == "true" ]]; then
    bash generate-demo-certificates.sh -i ${INPUT_MANIFEST} ${additional_dns} -l ${LOCAL_DATA}
fi

sudo chown -R $USER ${LOCAL_DATA}
