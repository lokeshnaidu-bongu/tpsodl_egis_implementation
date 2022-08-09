FROM pull.dc-gisuat-webm1:30443/pwr-smallworld/eo-web:SW528-PROD-1
COPY LAYERED_PRODUCTS /Smallworld/smallworld_registry/
COPY --chown=sw-cloud-user:root tpsodl_eo /Smallworld/tpsodl_eo
COPY --chown=sw-cloud-user:root tp_cstm_product /Smallworld/tp_cstm_product
COPY --chown=sw-cloud-user:root land_office /Smallworld/land_office
COPY start.sh /Smallworld/
COPY populate_solr_index.sh /Smallworld/
COPY populate_solr_index.magik /Smallworld/
USER sw-cloud-user
CMD ["/bin/sh", "/Smallworld/start.sh"]
