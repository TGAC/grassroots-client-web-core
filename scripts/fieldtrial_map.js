var plotsHTMLArray = {};
var global_width = 0;
var global_height = 0;
var colorJSON = {};

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
    createPlotsHTML(filtered_data);
    // renderLegend();
}

function produceFieldtrialTable(data, fieldTrialName, team) {
    yrtable = jQuery('#resultTable').DataTable({
        data: data,
        "columns": [
            {
                title: "Field Trial",
                "render": function (data, type, full, meta) {
                    return fieldTrialName;
                }
            },
            {
                title: "Team",
                "render": function (data, type, full, meta) {
                    return team;
                }
            },
            {
                title: "Sowing Date",
                "render": function (data, type, full, meta) {
                    if (full['sowing_date'] != undefined) {
                        return full['sowing_date'];
                    }
                    else {
                        return '';
                    }
                }
            },
            {
                title: "Harvest Date",
                "render": function (data, type, full, meta) {
                    if (full['harvest_date'] != undefined) {
                        return full['harvest_date'];
                    }
                    else {
                        return '';
                    }
                }
            },
            {
                title: "Plots",
                "render": function (data, type, full, meta) {
                    if (full['_id'] != undefined) {
                        var id = full['_id']['$oid'];
                        return '<u class="newstyle_link" onclick="plot_colorbox(\'' + id + '\');" style="cursor: pointer;">Plot</u>';
                    }
                    else {
                        return '';
                    }
                }
            },
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
            + '<u class=\"newstyle_link\" onclick="plot_colorbox(\'' + id + '\');" style="cursor: pointer;">Plots</u>'
        ;
        addPointer(la, lo, popup_note);
    }
    map.addLayer(markersGroup);


}

function plot_colorbox(id) {
    var plot_data = plotsHTMLArray[id];
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

function createPlotsHTML(array) {
    for (i = 0; i < array.length; i++) {
        var expAreaId = array[i]['_id']['$oid'];
        var plots = array[i]['plots'];
        var htmlarray = [];

        var row = 1;
        var column = 1;

        for (j = 0; j < plots.length; j++) {

            if (plots[j]['row_index'] === row) {
                if (plots[j]['column_index'] === column) {
                    htmlarray.push(formatPlot(plots[j]));
                    column++;
                }
            } else if (plots[j]['row_index'] > row) {
                htmlarray.push('</tr><tr>');
                htmlarray.push(formatPlot(plots[j]));
                row++;
                column = 2;
            }
        }
        plotsHTMLArray[expAreaId] = '<div id="plot"><table class="table row flex-column-reverse flex-lg-row"  style="margin:20px;"><tr>' + htmlarray.join("") + '</tr></table></div>';
    }
}

function formatPlot(plot) {
    var accession = "";
    for (r = 0; r < plot['rows'].length; r++) {
        accession += " " + plot['rows'][r]['material_s']['accession'];
    }

    // return '<td>' + accession + '</td>';
    var replicate_index = plot['replicate_index'];
    var color;
    if (colorJSON[replicate_index]==undefined){
       color = getRandomColor();
       colorJSON[replicate_index] = color;
    } else {
        color = colorJSON[replicate_index];
    }

    return '<td bgcolor="' + color + '">' + replicate_index+ '/' + accession + '</td>';
}



function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
var stringToColor = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}