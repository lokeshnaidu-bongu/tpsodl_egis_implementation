require.config({
    baseUrl: '../../',
    paths: {
        brandkit: 'components/brandkit/js/brandkit',
        jquery: 'components/jquery/jquery',
        'bootstrap/transition': 'components/bootstrap/js/transition',
        'bootstrap/affix': 'components/bootstrap/js/affix',
        'bootstrap/alert': 'components/bootstrap/js/alert',
        'bootstrap/button': 'components/bootstrap/js/button',
        'bootstrap/carousel': 'components/bootstrap/js/carousel',
        'bootstrap/collapse': 'components/bootstrap/js/collapse',
        'bootstrap/dropdown': 'components/bootstrap/js/dropdown',
        'bootstrap/modal': 'components/bootstrap/js/modal',
        'bootstrap/popover': 'components/bootstrap/js/popover',
        'bootstrap/scrollspy': 'components/bootstrap/js/scrollspy',
        'bootstrap/tab': 'components/bootstrap/js/tab',
        'bootstrap/tooltip': 'components/bootstrap/js/tooltip',
        'ge-bootstrap/accordion': 'js/ge-bootstrap/accordion',
        'ge-bootstrap/placeholder': 'js/ge-bootstrap/placeholder'
    }
});

require([
    'brandkit',
    'jquery',
    'bootstrap/tooltip',
    'bootstrap/transition',
    'bootstrap/affix',
    'bootstrap/alert',
    'bootstrap/button',
    'bootstrap/carousel',
    'bootstrap/collapse',
    'bootstrap/dropdown',
    'bootstrap/modal',
    'bootstrap/popover',
    'bootstrap/scrollspy',
    'bootstrap/tab',
    'ge-bootstrap/accordion',
    'ge-bootstrap/placeholder'
]);