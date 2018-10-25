function startFieldtrialGIS(jsonArray) {

    var filtered_data = [];
    jQuery('#status').html('');
    var fieldTrialName = '';
    var team = '';
    for (i = 0; i < jsonArray.length; i++) {
        for (j = 0; j < jsonArray[i]['data']['experimental_areas'].length; j++)
            if (jsonArray[i]['data']['experimental_areas'][j]['address'] != undefined) {
                fieldTrialName = jsonArray[i]['data']['so:name'];
                team = jsonArray[i]['data']['team'];
                if (jsonArray[i]['data']['experimental_areas'][j]['address']['address']['location']['centre'] != undefined) {
                    filtered_data.push(jsonArray[i]['data']['experimental_areas'][j]);
                }
            }
    }
    // removeTable();
    produceFieldtrialTable(filtered_data, fieldTrialName, team);
    displayFTLocations(filtered_data, fieldTrialName, team);
    // renderLegend();
}

function produceFieldtrialTable(data, fieldTrialName, team) {
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "columns": [
            {data: fieldTrialName, title: "Field Trial", "sDefaultContent": ""},
            {data: team, title: "Team", "sDefaultContent": ""},
            {data: "data.sowing_date", title: "Sowing Date", "sDefaultContent": ""},
            {data: "data.harvest_date", title: "Harvest Date", "sDefaultContent": ""},
            {
                title: "Address",
                "render": function (data, type, full, meta) {
                    var addressInfo = '';
                    if (full['address'] !== undefined && full['address']['address'] !== "undefined") {
                        if (full['address']['address']['Address'] !== undefined && full['address']['address']['Address'] !== "undefined") {
                            addressInfo = '<span class=\"newstyle_link\"> ' + full['address']['address']['Address']['name'] + '<br/>'
                                + full['address']['address']['Address']['addressLocality'] + '<br/>'
                                + full['address']['address']['Address']['addressCountry'] + '<br/>'
                                + full['address']['address']['Address']['postalCode'] + '</span>';
                        }
                    }
                    return addressInfo;
                }
            }
        ]

    });

    jQuery('#resultTable tbody').on('click', 'td', function () {
        var cellIdx = yrtable.cell(this).index();
        var rowIdx = cellIdx['row'];
        var json = yrtable.row(rowIdx).data();
            if (json['address'] != undefined) {
                if (json['address']['address']['location']['location'] != undefined) {
                    var la = json['address']['address']['location']['centre']['latitude'];
                    var lo = json['address']['address']['location']['centre']['longitude'];
                    map.setView([la, lo], 16, {animate: true});
                }
            }
        $(window).scrollTop($('#map').offset().top - 90);

    });

    jQuery('#resultTable').on('search.dt', function () {
        removePointers();
        var searchData = yrtable.rows({filter: 'applied'}).data().toArray();
        var search_data = [];
        for (i = 0; i < searchData.length; i++) {
            if (searchData[i]['address']['address'] != undefined) {
                if (searchData[i]['address']['address']['location']['centre'] != undefined) {
                    search_data.push(searchData[i]);
                }
            }
        }
        displayFTLocations(search_data, fieldTrialName, team);
    });


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

function removePointers() {
    map.removeLayer(markersGroup);
    // if (pie_view) {
    //     markersGroup = new L.MarkerClusterGroup({
    //         maxClusterRadius: 2 * 30,
    //         iconCreateFunction: defineClusterIcon
    //     });
    // }
    // else {
    markersGroup = new L.MarkerClusterGroup();
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


function displayFTLocations(array, fieldTrialName, team) {
    for (i = 0; i < array.length; i++) {
        var la = '';
        var lo = '';
        var country = '';
        var town = '';
        var name = '';


        la = array[i]['address']['address']['location']['centre']['latitude'];
        lo = array[i]['address']['address']['location']['centre']['longitude'];

        if (array[i]['address']['address']['Address'] != undefined) {
            if (array[i]['address']['address']['Address']['addressCountry'] != undefined) {
                country = array[i]['address']['address']['Address']['addressCountry'];
            }
            if (array[i]['address']['address']['Address']['addressLocality'] != undefined) {
                town = array[i]['address']['address']['Address']['addressLocality'];
            }
            if (array[i]['address']['address']['Address']['name'] != undefined) {
                name = array[i]['address']['address']['Address']['name'];
            }
        }
        var id = array[i]['_id']['$oid'];
        var popup_note = '<b>Field Trail Name: </b>' + fieldTrialName + '<br/>'
            + '<b>Team: </b>' + team + '<br/>'
            + '<b>Sowing Date: </b>' + array[i]['sowing_date'] + '<br/>'
            + '<b>Harvest Date: </b>' + array[i]['harvest_date'] + '<br/>'
            + '<u onclick="plot_colorbox(\'' + id + '\');" style="cursor: pointer;">Plots</u>'
        ;
        addPointer(la, lo, popup_note);
    }
    map.addLayer(markersGroup);


}

function plot_colorbox(id){
    var plot_data = "test";
    $.colorbox({width: "80%", html: plot_data});

}


function addPointer(la, lo, note) {

    var blueIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-blue.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var redIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-red.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greenIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-green.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var orangeIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-orange.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var yellowIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-yellow.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var violetIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-violet.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var greyIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-grey.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var blackIcon = new L.Icon({
        iconUrl: 'scripts/leaflet/images/marker-icon-2x-black.png',
        shadowUrl: 'scripts/leaflet/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    var markerLayer;
    // if (type === 'Breeder') {
    //     markerLayer = L.marker([la, lo], {icon: greenIcon}).bindPopup(note);
    // }
    // else {
        markerLayer = L.marker([la, lo]).bindPopup(note);
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
    jQuery('#legend').show();
    jQuery('#legend').html('');
    // if (pie_view) {
    var metajson = {
        "lookup": {
            "1": "Breeder",
            "2": "Donor"
        }
    };

    var data = d3.entries(metajson.lookup),
        legenddiv = d3.select('#legend');

    var heading = legenddiv.append('div')
        .classed('legendheading', true)
        .text("Marker types");

    var legenditems = legenddiv.selectAll('.legenditem')
        .data(data);

    legenditems
        .enter()
        .append('div')
        .attr('class', function (d) {
            return 'lengend-' + d.key;
        })
        .classed({'legenditem': true})
        .text(function (d) {
            return d.value;
        });
    // }
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

