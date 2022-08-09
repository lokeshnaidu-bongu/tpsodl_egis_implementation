sudo update-ca-trust force-enable
sudo cp /var/nfsshare/ssl/ca/ca.cert.pem /etc/pki/ca-trust/source/anchors/
sudo update-ca-trust extract
sudo systemctl daemon-reload && systemctl restart docker