define({
  root: {
    addressSearch: 'Address Search',
    addressSearchBoxHint: 'Address search',
    addressSearchLabel: 'Address Search',
    assetSearch: 'Asset Search',
    assetSearchBoxHint: 'Asset search',
    assetSearchError: 'Something went wrong retrieving the Asset',
    assetSearchLabel: 'Asset Search',
    breakpoint: 'Breakpoint',
    documentHeader: 'EO Web',
    documentPoweredBy: 'powered by',
    documentSubHeader: 'GE',
    documentTitle: 'EO Web',
    layers: 'Layers',
    lastEquipment: 'Last Equipment',
    map_visualization: {},
    controls: {
      map_view: 'Map',
      connectivity: 'Connectivity',
      sketching: 'Sketch',
      plotting: 'Plot'
    },
    map_location: {
      popoverTitle: 'Location information',
      coordNearestObjects: 'Nearest objects',
      coordOverlappingAreas: 'Overlapping areas',
      gps: 'GPS coordinates',
      lon: 'longitude',
      lat: 'latitude',
      requestFaild: 'Error by requesting GSS server',
      addressTitle: 'Location address',
      address: 'Address'
    },
    object_details: {
      nothingSelected: 'No object selected yet.',
      eoSpecialisedInfo: {
        title: 'Specialised information based on collection type',
        noSpecialisedInfo: 'Object does not have specialised information.',
        flowDirection: {
          forward_flow_direction: 'Normal',
          backward_flow_direction: 'Normal',
          bi_flow_direction: 'Bi-directional',
          unknown_flow_direction: 'Unknown'
        }
      },
      eoGenericInfo: {
        title: 'Generic details',
        associated_documents: 'Associated documents',
        circuits: 'Circuits',
        equipment: 'Equipment',
        gps_position: 'GPS position',
        isolating_assets: 'Isolating assets',
        originating_substations: 'Originating substations',
        structures: 'Structures',
        associated_documents_popover: 'Copy (Ctrl+C) selected text.<br>Open a new browser <a href="#" onclick="window.open(\'about:blank\')">tab</a>.<br>Paste (Ctrl+V) the text as an URL address.',

      },
      eoLocationInfo: {
        objectInfoTitle: 'Location information',
        noDataMessage: 'Object does not have location information.'
      },
      eoPhaseInfo: {
        objectInfoTitle: 'Asset view',
        noDataMessage: 'Object does not have phase information.',
        specification: 'Specification and phases'
      }
    },
    sketching: {
      RedlineInfoBean: {
        ed_guy: 'Down Guy',
        manhole: 'Manhole',
        pole: 'Pole',
        ed_ug_splice: 'Connector Point',
        eo_energy_storage_battery: 'Energy Storage',
        eo_circuit_breaker_closed: 'Circuit Breaker',
        ed_elbow_closed: 'Elbow',
        fuse_closed: 'Fuse',
        ed_open_point_closed: 'Open Point',
        ed_recloser_black_closed: 'Reclosed',
        ed_sect_gray_closed: 'Sectionalizer',
        ng_switch_closed: 'Switch',
        streetlight2: 'Street Light',
        oh_transformer_ex: 'Overhead Power Transformer',
        eo_ug_transformer_black: 'Underground Power Transforme',
        ed_step_transformer_1ph_existing: 'Step Power Transformer',
        es_sub_tran_ba_con_2_wind_none: 'Substation Power Transformer',
        eo_service_point: 'Service Point'
      }
    }
  }
});
