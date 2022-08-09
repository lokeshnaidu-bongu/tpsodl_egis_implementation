#!/bin/bash

## Script to create or delete repositories in ECR. Note, that deletion forcefully removes all images stored in the repository
## Usage:
## bash create-repositories.sh gss create
##

function usage {
    echo "create-repositories.sh: Use AWS CLI to create repositories in an ECR."
    echo ""
    echo "Usage:"
    echo "      -a|--action <action>                 [required]  Should be either create or delete"
    echo "      -p|--product <product>               [required]  Should be at least one from the following list, depending on the product for which you need to extract images:"
    echo "                                                       gss, mew, nig, eo, gas, me"
    echo "                                                       Example: -p <product1> -p <product2>"
    echo "      -r|--registry-name <registry>        [required]  The name of the ECR registry"
    echo "                                                       For example, the alpine repository would be created as '<registry>/pwr-smallworld/alpine'"
}

products=''
while [[ $# -gt 0 ]]
do
  	key="$1"
  	case $key in
    	-a|--action)
      		action=${2}
      		shift
      		shift
      		;;
    	-p|--product)
      		products+="${2} "
      		shift
      		shift
      		;;
    	-r|--repo-name)
      		registry_name=${2}
      		shift
      		shift
      		;;
    	*)
      	usage
      	exit
  	esac
done

echo "Products list: ${products}"

if [[ -z ${products} ]]; then
    echo "Must provide at least one product"
    exit 1
fi

if [[ -z ${registry_name} ]]; then
    echo "Registry name must be provided"
    exit 1
fi

if [ "$action" == "create" ]; then
    for prod in ${products[@]}
    do
        echo "Creating repositories for ${prod}"
        for repo in $(jq -c -r ".[\"$prod\"]" repositories.json | jq -c -r .[])
        do
            aws ecr create-repository --repository-name ${registry_name}/pwr-smallworld/${repo}
        done
    done
elif [ "$action" == "delete" ]; then
    for prod in ${products[@]}
    do
        echo "deleting repositories for ${prod}"
        for repo in $(jq -c -r ".[\"$prod\"]" repositories.json | jq -c -r .[])
        do
            aws ecr delete-repository --repository-name ${registry_name}/pwr-smallworld/${repo} --force
        done
    done
else
    echo "Invalid action provided. Only 'create' and 'delete' are supported"
    exit 1
fi 