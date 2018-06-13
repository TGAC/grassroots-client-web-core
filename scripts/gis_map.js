function startGIS(jsonArray) {

    var filtered_data_donor = [];
    var filtered_data_breeder = [];
    jQuery('#status').html('');
    for (i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i]['data']['BreederAddress'] != undefined) {
            if (jsonArray[i]['data']['BreederAddress']['location']['location'] != undefined) {
                filtered_data_breeder.push(jsonArray[i]);
            }
        }
        if (jsonArray[i]['data']['DonorAddress'] != undefined) {
            if (jsonArray[i]['data']['DonorAddress']['location']['location'] != undefined) {
                filtered_data_donor.push(jsonArray[i]);
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
            {data: "data.dwc:recordNumber", title: "Record Number", "sDefaultContent": ""},
            {data: "data.accession", title: "Accession", "sDefaultContent": ""},
            {data: "data.ploidy", title: "Ploidy", "sDefaultContent": ""},
            {data: "data.dwc:scientificName", title: "Scientific Name", "sDefaultContent": ""},
            {data: "data.dwc:genus", title: "Genus", "sDefaultContent": ""},
            {data: "data.dwc:year", title: "Year", "sDefaultContent": ""},
            {data: "data.dwc:vernacularName", title: "Vernacular Name", "sDefaultContent": ""},
            {
                title: "Donor",
                "render": function (data, type, full, meta) {
                    var donorInfo = '';
                    if (full['data']['DonorAddress'] !== undefined && full['data']['DonorAddress'] !== "undefined") {
                        if (full['data']['DonorAddress']['Address'] !== undefined && full['data']['DonorAddress']['Address'] !== "undefined") {
                            donorInfo = full['data']['DonorAddress']['Address']['name'] + '<br/>'
                                + full['data']['DonorAddress']['Address']['addressLocality'] + '<br/>'
                                + full['data']['DonorAddress']['Address']['addressCountry'] + '<br/>'
                                + full['data']['DonorAddress']['Address']['postalCode'];
                        }
                    }
                    return donorInfo;
                }
            },
            {
                title: "Breeder",
                "render": function (data, type, full, meta) {
                    var breederInfo = '';
                    if (full['data']['BreederAddress'] !== undefined && full['data']['BreederAddress'] !== "undefined") {
                        if (full['data']['DonorAddress']['Address'] !== undefined && full['data']['DonorAddress']['Address'] !== "undefined") {
                            breederInfo = full['data']['BreederAddress']['Address']['name'] + '<br/>'
                                + full['data']['BreederAddress']['Address']['addressLocality'] + '<br/>'
                                + full['data']['BreederAddress']['Address']['addressCountry'] + '<br/>'
                                + full['data']['BreederAddress']['Address']['postalCode'];
                        }
                    }
                    return breederInfo;
                }
            },

            {
                title: "Order",
                "render": function (data, type, full, meta) {
                    if (full['data']['order_link'] !== undefined) {
                        return '<a target="_blank" href="' + full['data']['order_link']['url'] + '">Order</a>';
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

//
// jQuery.fn.dataTableExt.afnFiltering.push(
//     function (oSettings, aData, iDataIndex) {
//         var dateStart = datemin;
//         var dateEnd = datemax;
//
//         var evalDate = Date.parse(aData[5]);
//
//         if (((evalDate >= dateStart && evalDate <= dateEnd) || (evalDate >= dateStart && dateEnd == 0)
//                 || (evalDate >= dateEnd && dateStart == 0)) || (dateStart == 0 && dateEnd == 0)) {
//             return true;
//         }
//         else {
//             return false;
//         }
//
//     });

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


        var popup_note = '<b>Record Number: </b>' + array[i]['data']['dwc:recordNumber'] + '<br/>'
            + '<b>Accession: </b>' + array[i]['data']['accession'] + '<br/>'
            + '<b>Genus: </b>' + array[i]['data']['dwc:genus'] + '<br/>'
            + '<b>Scientific Name: </b>' + array[i]['data']['dwc:scientificName'] + '<br/>'
            + '<b>Year: </b>' + array[i]['data']['dwc:year'] + '<br/>'
            + '<b>Vernacular Name: </b>' + array[i]['data']['dwc:vernacularName'] + '<br/>'
            + '<b>Ploidy: </b>' + array[i]['data']['ploidy'] + '<br/>'
            + '<b>Organisation: </b>' + name + '<br/>'
            + '<b>Country: </b>' + country + '<br/>'
            + '<b>Town: </b>' + town + '<br/>'
            + '<a target="_blank" href="' + array[i]['data']['order_link']['url'] + '"> Order from SeedStor</a><br/>'
        ;

        if (type === 'donor') {
            la = array[i]['data']['DonorAddress']['location']['location']['latitude'];
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
            popup_note = '<h5> Donor Information</h5>' + popup_note;
        } else if (type === 'breeder') {
            la = array[i]['data']['BreederAddress']['location']['location']['latitude'];
            lo = array[i]['data']['BreederAddress']['location']['location']['longitude'];
            title = 'Breeder Address';

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
            popup_note = '<h5> Breeder Information</h5>' + popup_note;

        }
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
    // if (type === 'breeder') {
    //     markerLayer = L.marker([la, lo], {title: title, icon: greenIcon}).bindPopup(note);
    // }
    // else {
    markerLayer = L.marker([la, lo], {title: title}).bindPopup(note);
    // }
    // markers.push(markerLayer);
    markersGroup.addLayer(markerLayer);

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