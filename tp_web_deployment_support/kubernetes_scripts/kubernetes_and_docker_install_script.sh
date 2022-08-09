#
#Script to install Kubernetes and Docker on linux machines
#

echo "Disabling swap..."
# Disable swap
sudo swapoff -a
sudo sed -i '/ swap /s/^/#/g' /etc/fstab

echo "Installing dependencies for docker and installing br_netfilter..."
# Dependendant modules for docker and br_netfilter
subscription-manager repos --enable=rhel-7-server-extras-rpms
sudo modprobe br_netfilter

echo "Setting SELinux in permissive mode..."
# Set SELinux in permissive mode (effectively disabling it)
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

echo "Disabling Firewal..."
# Disable firewall
systemctl stop firewalld && systemctl disable firewalld

echo "Letting iptables see bridged traffic..."
#Letting iptables see bridged traffic
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system

echo "Adding the docker repository..."
# Add the Docker rpm repo from docker
cat <<EOF > /etc/yum.repos.d/docker.repo
[docker-ce-stable]
name=Docker CE Stable - x86_64
baseurl=https://download.docker.com/linux/centos/7/x86_64/stable
enabled=1
gpgcheck=1
gpgkey=https://download.docker.com/linux/centos/gpg
EOF

 
echo "Adding the Kubernetes repo..."
# Add the Kubernetes rpm repo from google
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF

echo "Installing docker and kubernetes..."
# Install docker and kubernetes
# Install docker dependencies and useful utilities
yum install -y \
    yum-utils \
    socat \
    device-mapper-persistent-data \
    lvm2 \
	containerd.io-1.2.13 \
	docker-ce-19.03.11 \
	docker-ce-cli-19.03.11 \
	nfs-utils \
	cifs-utils

yum install kubelet-1.21.1-0 kubeadm-1.21.1-0 kubectl-1.21.1-0 -y --disableexcludes=kubernetes

echo "Creating directory for docker daemon..."
#Create directory for docker daemon
mkdir /etc/docker

echo "Setting up Docker daemon.json..."
# Setup Docker daemon.json
cat > /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
EOF

echo "Creating docker service directory..."
# Create docker service directory
mkdir -p /etc/systemd/system/docker.service.d

echo "Restarting, enabling kubelet and docker..."
# Restart, enable kubelet and docker
systemctl daemon-reload

systemctl enable kubelet &&  systemctl start kubelet
systemctl enable docker &&  systemctl start docker

echo "Setup Run Successfully, check for errors in the above log and restart server"

# init 6 run this manually after script run 