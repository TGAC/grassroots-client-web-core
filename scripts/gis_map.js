function startGISPage(jsonArray) {

    var filtered_data_donor = [];
    var filtered_data_breeder = [];
    jQuery('#status').html('');
    for (i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i]['data']['BreederAddress'] != undefined) {
            if (jsonArray[i]['data']['BreederAddress']['location']['location'] != undefined) {
                filtered_data_breeder.push(json.data[i]);
            }
        }
        if (jsonArray[i]['data']['DonorAddress'] != undefined) {
            if (jsonArray[i]['data']['DonorAddress']['location']['location'] != undefined) {
                filtered_data_donor.push(json.data[i]);
            }
        }
    }
    produceTable(jsonArray);
    displayYRLocations_new(filtered_data_breeder, 'breeder');
    displayYRLocations_new(filtered_data_donor, 'donor');
    // renderLegend();
}

function produceTable(data) {
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "columns": [
            {data: "data.accession", title: "Accession", "sDefaultContent": ""},
            {data: "data.DonorAddress.Address.addressCountry", title: "Donor Country", "sDefaultContent": ""},
            {data: "data.ploidy", title: "Ploidy", "sDefaultContent": ""},
            {data: "data.dwc:scientificName", title: "Scientific Name", "sDefaultContent": ""},
            {data: "data.", title: "", "sDefaultContent": ""},
            {data: "data.", title: "", "sDefaultContent": ""},
            {data: "data.", title: "", "sDefaultContent": ""},
            {data: "data.", title: "", "sDefaultContent": ""},
            {data: "data.sample.Host", title: "Host", "sDefaultContent": ""},

            {
                title: "Donor",
                "render": function (data, type, full, meta) {
                    if (full['data']['DonorAddress'] != undefined) {
                        return ['data']['DonorAddress']['Address']['name'] + '<br/>'
                            + ['data']['DonorAddress']['Address']['addressLocality'] + '<br/>'
                            + ['data']['DonorAddress']['Address']['addressCountry'] + '<br/>'
                            + ['data']['DonorAddress']['Address']['postalCode'];
                    }
                    else {
                        return '';
                    }
                }
            },
            {
                title: "Breeder",
                "render": function (data, type, full, meta) {
                    if (full['data']['BreederAddress'] != undefined) {
                        return ['data']['BreederAddress']['Address']['name'] + '<br/>'
                            + ['data']['BreederAddress']['Address']['addressLocality'] + '<br/>'
                            + ['data']['BreederAddress']['Address']['addressCountry'] + '<br/>'
                            + ['data']['BreederAddress']['Address']['postalCode'];
                    }
                    else {
                        return '';
                    }
                }
            },

            {
                title: "Order",
                "render": function (data, type, full, meta) {
                    if (full['data']['order_link']['url'] != undefined) {
                        return '<a href="' + full['data']['order_link']['url'] + '">Order</a>';
                    }
                    else {
                        return '';
                    }
                }
            }
        ]

    });

    // jQuery('#resultTable tbody').on('click', 'tr', function () {
    //     var data = yrtable.row(this).data();
    //     var la = data['data']['sample']['location']['location']['latitude'];
    //     var lo = data['data']['sample']['location']['location']['longitude'];
    //     map.setView([la, lo], 16, {animate: true});
    // });
    //
    // jQuery('#resultTable').on('search.dt', function () {
    //     removePointers();
    //     var filteredData = yrtable.rows({filter: 'applied'}).data().toArray();
    //     displayYRLocations_new(filteredData);
    // });


    // jQuery("#slider").bind("valuesChanging", function (e, data) {
    //     datemin = Date.parse(data.values.min);
    //     datemax = Date.parse(data.values.max);
    //
    //     yrtable.draw();
    // });
    //
    // if (!isCompany) {
    //     yrtable.column(13).visible(false);
    // }
}

jQuery.fn.dataTableExt.afnFiltering.push(
    function (oSettings, aData, iDataIndex) {
        var dateStart = datemin;
        var dateEnd = datemax;

        var evalDate = Date.parse(aData[5]);

        if (((evalDate >= dateStart && evalDate <= dateEnd) || (evalDate >= dateStart && dateEnd == 0)
                || (evalDate >= dateEnd && dateStart == 0)) || (dateStart == 0 && dateEnd == 0)) {
            return true;
        }
        else {
            return false;
        }

    });

function ukcpvs_only() {
    var column = yrtable.column(2);
    column.search('^((?!Unknown).)*$', true, false).draw();
}

function ukcpvs_and_all() {
    var column = yrtable.column(2);
    column.search('').draw();
}

function genotype_view() {
    pie_view = true;
    renderLegend();
    var column = yrtable.column(8);
    column.search('^\\d|\\d-\\d|Mixed$', true, false).draw();
}

function normal_view() {
    pie_view = false;
    renderLegend();
    var column = yrtable.column(8);
    column.search('').draw();
}

function displayYRLocations_new(array, type) {
    for (i = 0; i < array.length; i++) {
        var la = '';
        var lo = '';
        var title = '';
        var country = '';
        var town = '';
        var name = '';
        if (type == 'donor') {
            la = array[i][['data']['DonorAddress']['location']['location']['latitude'];
            lo = array[i]['data']['DonorAddress']['location']['location']['longitude'];
            title = 'Donor Address';

            if (array[i]['data']['DonorAddress']['Address'] != undefined) {
                if (array[i]['data']['DonorAddress']['Address']['addressCountry'] != undefined) {
                    country = array[i]['data']['DonorAddress']['Address']['addressCountry'];
                }
                if (array[i]['data']['DonorAddress']['Address']['addressLocality'] != undefined) {
                    town = array[i]['data']['DonorAddress']['Address']['addressLocality'];
                }
                if (array[i]['data']['DonorAddress']['Address']['name'] != undefined) {
                    name = array[i]['data']['DonorAddress']['Address']['name'];
                }
            }
        } else if (type == 'breeder'){
            la = array[i][['data']['BreederAddress']['location']['location']['latitude'];
            lo = array[i]['data']['BreederAddress']['location']['location']['longitude'];
            title = 'Donor Address';

            if (array[i]['data']['BreederAddress']['Address'] != undefined) {
                if (array[i]['data']['BreederAddress']['Address']['addressCountry'] != undefined) {
                    country = array[i]['data']['BreederAddress']['Address']['addressCountry'];
                }
                if (array[i]['data']['BreederAddress']['Address']['addressLocality'] != undefined) {
                    town = array[i]['data']['BreederAddress']['Address']['addressLocality'];
                }
                if (array[i]['data']['BreederAddress']['Address']['name'] != undefined) {
                    name = array[i]['data']['BreederAddress']['Address']['name'];
                }
            }

        }
        var popup_note = '<b>Ploidy: </b>' + array[i]['data']['ploidy'] + '<br/>'
            + '<b>Accession: </b>' + array[i]['data']['accession'] + '<br/>'
            + '<b>Genus: </b>' + array[i]['data']['dwc:genus'] + '<br/>'
            + '<b>Scientific Name: </b>' + array[i]['data']['dwc:scientificName'] + '<br/>'
            + '<b>Year: </b>' + array[i]['data']['dwc:year'] + '<br/>'
            + '<b>Vernacular Name: </b>' + array[i]['data']['dwc:vernacularName'] + '<br/>'
            + '<b>Record Number: </b>' + array[i]['data']['dwc:recordNumber'] + '<br/>'
            + '<b>Organisation: </b>' + name + '<br/>'
            + '<b>Country: </b>' + country + '<br/>'
            + '<b>Town: </b>' + town + '<br/>'
            + '<a href="' + array[i]['data']['order_link']['url'] + '"> Order from SeedStor</a><br/>'
        ;
        addPointer(la, lo, title, popup_note, type);
    }
    map.addLayer(markersGroup);


}

function addPointer(la, lo, title, note, type) {
    // var myClass = 'marker category-' + geno;
    // var myIcon = L.divIcon({
    //     className: myClass,
    //     iconSize: null
    // });
    var markerLayer;
    if (type == 'breeder') {
        markerLayer = L.marker([la, lo], {title: title, icon: greenIcon}).bindPopup(note);
    }
    else {
        markerLayer = L.marker([la, lo], {title: title}).bindPopup(note);
    }
    //markers.push(markerLayer);
    markersGroup.addLayer(markerLayer);

}

function removePointers() {
    map.removeLayer(markersGroup);
    if (pie_view) {
        markersGroup = new L.MarkerClusterGroup({
            maxClusterRadius: 2 * 30,
            iconCreateFunction: defineClusterIcon
        });
    }
    else {
        markersGroup = new L.MarkerClusterGroup();
    }
}

function removeTable() {
    jQuery('#resultTable').dataTable().fnDestroy();
    jQuery('#tableWrapper').html('<table id="resultTable"></table>');
}

function popup(msg) {
    L.popup()
        .setLatLng([52.621615, 8.219])
        .setContent(msg)
        .openOn(map);
}

function mapFitBounds(list) {
    map.fitBounds(list);
}

function randomNumberFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

var rmax = 30;

function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers(),
        n = children.length, //Get number of markers in cluster
        strokeWidth = 1, //Set clusterpie stroke width
        r = rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0), //Calculate clusterpie radius...
        iconDim = (r + strokeWidth) * 2, //...and divIcon dimensions (leaflet really want to know the size)
        data = d3.nest() //Build a dataset for the pie chart
            .key(function (d) {
                return d.options.title;
            })
            .entries(children, d3.map),
        //bake some svg markup
        html = bakeThePie({
            data: data,
            valueFunc: function (d) {
                return d.values.length;
            },
            strokeWidth: 1,
            outerRadius: r,
            innerRadius: r - 10,
            pieClass: 'cluster-pie',
            pieLabel: n,
            pieLabelClass: 'marker-cluster-pie-label',
            pathClassFunc: function (d) {
                return "pie-" + d.data.key;
            }
//                    ,
//                    pathTitleFunc: function (d) {
//                        return "path title";
//                    }
        }),
        //Create a new divIcon and assign the svg markup to the html property
        myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
}

function bakeThePie(options) {
    var data = options.data,
        valueFunc = options.valueFunc,
        r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
        rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
        strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
        pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () {
            return '';
        }, //Class for each path
//                pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () {
//                    return '';
//                }, //Title for each path
        pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', //Class for the whole pie
        pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
        pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label',//Class for the pie label

        origo = (r + strokeWidth), //Center coordinate
        w = origo * 2, //width and height of the svg element
        h = w,
        donut = d3.layout.pie(),
        arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);

    //Create an svg element
    var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
    //Create the pie chart
    var vis = d3.select(svg)
        .data([data])
        .attr('class', pieClass)
        .attr('width', w)
        .attr('height', h);

    var arcs = vis.selectAll('g.arc')
        .data(donut.value(valueFunc))
        .enter().append('svg:g')
        .attr('class', 'arc')
        .attr('transform', 'translate(' + origo + ',' + origo + ')');

    arcs.append('svg:path')
        .attr('class', pathClassFunc)
        .attr('stroke-width', strokeWidth)
        .attr('d', arc)
//                .append('svg:title')
//                .text(pathTitleFunc)
    ;
    vis.append('text')
        .attr('x', origo)
        .attr('y', origo)
        .attr('class', pieLabelClass)
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .text(pieLabel);
    return serializeXmlNode(svg);
}

function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    }
    else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}

function renderLegend() {
    jQuery('#legend').html('');
    if (pie_view) {
        var metajson = {
            "lookup": {
                "1": "Genetic group 1",
                "2": "Genetic group 2",
                "3": "Genetic group 3",
                "4": "Genetic group 4",
                "5": "Genetic group 5",
                "6": "Genetic group 6",
                "7": "Genetic group 7",
                //"1-4": "Genetic group 1-4",
                "1-5": "Genetic group 1-5",
                "4-6": "Genetic group 4-6",
                "4-1": "Genetic group 4-1",
                //"5-1": "Genetic group 5-1",
                "Mixed": "Genetic group mixed"
            }
        };

        var data = d3.entries(metajson.lookup),
            legenddiv = d3.select('#legend');

        var heading = legenddiv.append('div')
            .classed('legendheading', true)
            .text("Genotype");

        var legenditems = legenddiv.selectAll('.legenditem')
            .data(data);

        legenditems
            .enter()
            .append('div')
            .attr('class', function (d) {
                return 'category-' + d.key;
            })
            .classed({'legenditem': true})
            .text(function (d) {
                return d.value;
            });
    }
}


function checkFileBox(div_id) {
    if (document.getElementById(div_id).checked) {
        bam_list.push(div_id);
        console.log("add:" + div_id);
    } else {
        bam_list.splice(bam_list.indexOf(div_id), 1);
        console.log("remove:" + div_id);
    }

}

var blueIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-blue.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-red.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var greenIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-green.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var orangeIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-orange.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var yellowIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-yellow.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var violetIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-violet.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var greyIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-grey.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var blackIcon = new L.Icon({
    iconUrl: 'scripts/leaflet/image/marker-icon-2x-black.png',
    shadowUrl: 'scripts/leaflet/image/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});