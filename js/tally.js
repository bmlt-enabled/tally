function Tally(config) {
    var self = this;

    this.aggregatorUrl = "https://aggregator.bmltenabled.org/";
    this.knownTotal = 72215;
    this.mapObject = null;
    // this controls whether or not results will be queried for map pins, useful for debugging non-map display elements
    this.nawsDataMap = config.nawsDataMap;
    this.mapLoad = true;
    this.mapMarkers = [];
    this.calculatedMarkers = [];
    this.whatADrag = false;
    this.inDraw = false;
    this.m_icon_image_single = new google.maps.MarkerImage("images/NAMarkerB.png", new google.maps.Size(22, 32), new google.maps.Point(0, 0), new google.maps.Point(12, 32));
    this.m_icon_image_multi = new google.maps.MarkerImage("images/NAMarkerR.png", new google.maps.Size(22, 32), new google.maps.Point(0, 0), new google.maps.Point(12, 32));
    this.m_icon_shadow = new google.maps.MarkerImage("images/NAMarkerS.png", new google.maps.Size(43, 32), new google.maps.Point(0, 0), new google.maps.Point(12, 32));
    this.meetings = [];
    this.meetingsCount = 0;
    this.groupsCount = 0;
    this.areasCount = 0;
    this.regionsCount = 0;
    this.zonesCount = 0;
    this.serversCount = 0;
    this.reports = {
        byRootServerVersions: {},
        venue_types: {
            in_person: 0,
            virtual: 0,
            temp_virtual: 0,
            hybrid: 0,
        }
    }

    document.getElementById('tallyKnownTotal').innerHTML = this.knownTotal;
    var template = Handlebars.compile(document.getElementById("tally-table-template").innerHTML);
    if (!self.nawsDataMap) {
        getJSON(self.aggregatorUrl + "main_server/api/v1/rootservers/").then(function (rawRoots) {
            const roots = rawRoots.map(rawRoot => {
                return {
                    id: rawRoot.id,
                    name: rawRoot.name,
                    root_server_url: rawRoot.url.replace(/\/$/, ""),
                    num_zones: rawRoot['statistics']['serviceBodies']['numZones'],
                    num_regions: rawRoot['statistics']['serviceBodies']['numRegions'],
                    num_areas: rawRoot['statistics']['serviceBodies']['numAreas'],
                    num_groups: rawRoot['statistics']['serviceBodies']['numGroups'],
                    num_meetings: rawRoot['statistics']['meetings']['numTotal'],
                    server_info: '[' + rawRoot.serverInfo + ']',
                };
            });

            for (var v = 0; v < virtual_roots.length; v++) {
                virtual_roots[v]['virtual'] = true;
                roots.push(virtual_roots[v]);
            }

            document.getElementById("tally").innerHTML = template(roots);
            self.getVirtualRootsDetails(roots);
            document.getElementById('tallyRootServerDataLoading').style.display = 'none';
            document.getElementById('tallyButtonLoading').style.display = 'block';
            self.serversCount = roots.length;

            for (var r = 0; r < roots.length; r++) {
                if (!roots[r].hasOwnProperty('virtual') || !roots[r]['virtual']) {
                    var version = JSON.parse(roots[r]['server_info'])[0]['version'];
                    if (self.reports.byRootServerVersions[version] == null) {
                        self.reports.byRootServerVersions[version] = 1
                    } else {
                        self.reports.byRootServerVersions[version] += 1
                    }

                    self.meetingsCount += roots[r]['num_meetings'];
                    self.groupsCount += roots[r]['num_groups'];
                    self.areasCount += roots[r]['num_areas'];
                    self.regionsCount += roots[r]['num_regions'];
                    self.zonesCount += roots[r]['num_zones'];

                    document.getElementById("tallyTotal").innerHTML = self.meetingsCount.toString();
                    document.getElementById("meetingsTotal").innerHTML = self.meetingsCount.toString();
                    document.getElementById("groupsTotal").innerHTML = self.groupsCount.toString();
                    document.getElementById("areasTotal").innerHTML = self.areasCount.toString();
                    document.getElementById("regionsTotal").innerHTML = self.regionsCount.toString();
                    document.getElementById("zonesTotal").innerHTML = self.zonesCount.toString();
                    document.getElementById("serversTotal").innerHTML = self.serversCount.toString();
                    document.getElementById('tallyServiceBodies').innerHTML = (self.areasCount + self.regionsCount + self.zonesCount).toString();
                    document.getElementById('tallyPctTotal').innerHTML = Math.floor((self.meetingsCount / self.knownTotal) * 100).toString();
                }
            }

            console.log(self.byRootServerVersions)
            var concurrentRequests = 4;
            var shardSize = 1000;
            var shards = Math.ceil(self.meetingsCount / shardSize);
            var pages = [];
            for (var x = 1; x <= shards; x++) {
                pages.push(x);
            }

            if (self.mapLoad) {
                const getMapData = function(n) {
                    const pageNums = pages.splice(0, pages.length >= n ? n : pages.length);
                    const promises = [];
                    for (const page of pageNums) {
                        promises.push(getJSON(self.aggregatorUrl + 'main_server/client_interface/json/?switcher=GetSearchResults&data_field_key=longitude,latitude,formats&page_num=' + page + '&page_size=' + shardSize));
                    }

                    RSVP.all(promises).then(function (meetings) {
                        for (var m = 0; m < meetings.length; m++) {
                            if (meetings[m].length > 0) {
                                self.meetings = self.meetings.concat(meetings[m]);
                                var meetings_data = meetings[m]
                                for (var z = 0; z < meetings_data.length; z++) {
                                    var formats = meetings_data[z]["formats"] != null ? meetings_data[z]["formats"].split(",") : []
                                    if (formats.includes("HY")) {
                                        self.reports.venue_types.hybrid++;
                                    } else if (formats.includes("VM") && formats.includes("TC")) {
                                        self.reports.venue_types.temp_virtual++;
                                    } else if (formats.includes("VM") && !formats.includes("TC")) {
                                        self.reports.venue_types.virtual++;
                                    } else {
                                        self.reports.venue_types.in_person++;
                                    }
                                }
                            }
                        }
    
                        if (pages.length === 0) {
                            var reportsTemplate = Handlebars.compile(document.getElementById("reports-table-template").innerHTML);
                            document.getElementById("tallyReportsTemplate").innerHTML = reportsTemplate(self.reports);
                            new Tablesort(document.getElementById('tallyRootServerVersionTable'), { descending: true });
                            new Tablesort(document.getElementById('meetingVenueReport'), { descending: true });
        
                            document.getElementById('tallyButtonLoading').style.display = 'none';
                            document.getElementById('tallyMapButton').style.display = 'inline';
                            document.getElementById('tallyReportsButton').style.display = 'inline';
                        } else {
                            getMapData(concurrentRequests);
                        }
                    });
                };

                getMapData(concurrentRequests);
            } else {
                document.getElementById('tallyButtonLoading').style.display = 'none';
            }
        });
    } else {
        getJSON("js/naws_meetings.json?v=" + (new Date().valueOf())).then(function(meetings) {
            self.meetings = meetings;
            document.getElementById('tallyButtonLoading').style.display = 'none';
            document.getElementById('tallyMapButton').style.display = 'inline';
            document.getElementById('tallyReportsButton').style.display = 'inline';
        });
    }
}

Tally.prototype.dataLoadingComplete = function () {
    this.tableRender();
};

Tally.prototype.tableRender = function () {
    new Tablesort(document.getElementById('tallyHo'), { descending: true });
};

Tally.prototype.getVirtualRootsDetails = function (roots) {
    for (var r = 0; r < roots.length; r++) {
        if (roots[r].hasOwnProperty('virtual') != null && roots[r]['virtual']) {
            getJSONP(roots[r]['root_server_url'] + 'client_interface/jsonp/?switcher=GetServiceBodies', roots[r], function(service_bodies) {
                /*<PAYLOAD>*/
                var regions = 0;
                var areas = 0;
                var zones = 0;

                for ( var i = 0; i < service_bodies.length; i++ ) {
                    if (service_bodies[i].type === 'ZF') {
                        zones++;
                    } if (service_bodies[i].type === 'RS') {
                        regions++;
                    } else {
                        areas++;
                    }
                }

                document.getElementById("tallyZones_Data_" + payload['id']).innerHTML = zones.toString();
                document.getElementById("tallyRegion_Data_" + payload['id']).innerHTML = regions.toString();
                document.getElementById("tallyArea_Data_" + payload['id']).innerHTML = areas.toString();

                getJSONP(payload['root_server_url'] + 'client_interface/jsonp/?switcher=GetServerInfo', payload, function(serverInfo) {
                    /*<PAYLOAD>*/
                    document.getElementById("tallyVersion_Data_" + payload['id']).innerHTML = serverInfo[0].version;
                    document.getElementById("tallySemanticAdmin_Data_" + payload['id']).innerHTML = serverInfo[0].semanticAdmin === "1" ? "Y" : "N";

                    getJSONP(payload['root_server_url'] + 'client_interface/jsonp/?switcher=GetSearchResults&data_field_key=id_bigint,meeting_name', payload, function (meetings) {
                        /*<PAYLOAD>*/
                        document.getElementById("tallyMeetings_Data_" + payload['id']).innerHTML = meetings.length;

                        var virtualGroupDistinction = [];

                        for (var i = 0; i < meetings.length; i++) {
                            var meetingName = meetings[i]['meeting_name'];
                            if (!virtualGroupDistinction.has(meetingName)) {
                                virtualGroupDistinction.push(meetingName);
                            }
                        }

                        document.getElementById("tallyGroups_Data_" + payload['id']).innerHTML = virtualGroupDistinction.length.toString();
                        tally.dataLoadingComplete();
                    });
                });
            })
        }
    }
};

Tally.prototype.setUpMapControls = function ( ) {
    if ( this.mapObject ) {
        var centerControlDiv = document.createElement ( 'div' );
        centerControlDiv.id = "centerControlDiv";
        centerControlDiv.className = "centerControlDiv";

        var toggleButton = document.createElement ( 'input' );
        toggleButton.type = 'button';
        toggleButton.value = "Show Table Display";
        toggleButton.className = "showTableButton";
        toggleButton.addEventListener ( 'click', this.showTable );
        centerControlDiv.appendChild ( toggleButton );

        this.mapObject.controls[google.maps.ControlPosition.TOP_CENTER].push ( centerControlDiv );
    }
};

Tally.prototype.showTable = function() {
    document.getElementById ( "tallyMap" ).style.display = 'none';
    document.getElementById ( "tallyMan" ).style.display = 'block';
    document.getElementById ( "tallyReports" ).style.display = 'none';
};

Tally.prototype.displayTallyMap = function() {
    document.getElementById ( "tallyMan" ).style.display = 'none';
    document.getElementById ( "tallyMap" ).style.display = 'block';
    document.getElementById ( "tallyReports" ).style.display = 'none';
    this.loadMap();
};

Tally.prototype.displayTallyReports = function() {
    document.getElementById ( "tallyMan" ).style.display = 'none';
    document.getElementById ( "tallyReports" ).style.display = 'block';
};

Tally.prototype.displayMeetingMarkers = function( meetings ) {
    if ( this.mapObject && this.mapObject.getBounds() ) {
        if ( !this.calculatedMarkers.length ) {
            this.calculatedMarkers = this.sMapOverlappingMarkers ( meetings );
        }

        while(this.mapMarkers.length) { this.mapMarkers.pop().setMap(null); }

        if ( !this.whatADrag && !this.inDraw ) {
            for ( var c = 0; this.calculatedMarkers && (c < this.calculatedMarkers.length); c++ ) {
                var objectItem = this.calculatedMarkers[c];
                var marker = this.displayMeetingMarkerInResults ( objectItem.matches );
                if ( marker ) {
                    this.mapMarkers.push(marker);
                }
            }
        }
    }
};

Tally.prototype.loadMap = function() {
    if ( !this.mapObject ) {
        var myOptions = {
            'center': new google.maps.LatLng ( 0, 0 ),
            'zoom': 3,
            'mapTypeId': google.maps.MapTypeId.ROADMAP,
            'mapTypeControlOptions': { 'style': google.maps.MapTypeControlStyle.DROPDOWN_MENU },
            'zoomControl': true,
            'mapTypeControl': true,
            'scaleControl' : true
        };

        myOptions.zoomControlOptions = { 'style': google.maps.ZoomControlStyle.LARGE };

        this.mapObject = new google.maps.Map ( document.getElementById ( "tallyMap" ), myOptions );

        if ( this.mapObject ) {
            google.maps.event.addListener(this.mapObject, 'zoom_changed', function(inEvent) { tally.recalculateOverlaps(); });
            google.maps.event.addListener(this.mapObject, 'bounds_changed', function(inEvent) { tally.redrawResultMapMarkers(); });
            google.maps.event.addListener(this.mapObject, 'dragstart', function(inEvent) { tally.whatADrag = true; });
            google.maps.event.addListener(this.mapObject, 'idle', function(inEvent) { tally.handleIdle(); });
            this.setUpMapControls();
        }
    }
};

Tally.prototype.handleIdle = function() {
    if ( this.mapObject && this.mapObject.getBounds() ) {
        if ( this.whatADrag ) {
            tally.whatADrag = false;
            this.redrawResultMapMarkers();
        }
    }

    tally.whatADrag = false;
};

Tally.prototype.recalculateOverlaps = function() {
    if ( this.mapObject && this.mapObject.getBounds() ) {
        this.calculatedMarkers = [];
        this.redrawResultMapMarkers();
    }
};

Tally.prototype.redrawResultMapMarkers = function() {
    this.displayMeetingMarkers(this.meetings);
};

Tally.prototype.sMapOverlappingMarkers = function (meetings) {
    var tolerance = 10;	/* This is how many pixels we allow. */
    var tmp = [];

    for ( var c = 0; c < meetings.length; c++ ) {
        tmp[c] = {};
        tmp[c].matched = false;
        tmp[c].matches = null;
        tmp[c].object = meetings[c];
        tmp[c].coords = this.sFromLatLngToPixel ( new google.maps.LatLng ( tmp[c].object.latitude, tmp[c].object.longitude ), this.mapObject );
    }

    for ( var c = 0; c < meetings.length; c++ ) {
        if ( !tmp[c].matched ) {
            tmp[c].matched = true;
            tmp[c].matches = new Array ( tmp[c].object );

            for ( var c2 = 0; c2 < meetings.length; c2++ ) {
                if ( !tmp[c2].matched && tmp[c] && tmp[c2] ) {
                    var outer_coords = tmp[c].coords;
                    var inner_coords = tmp[c2].coords;

                    if ( outer_coords && inner_coords ) {
                        var xmin = outer_coords.x - tolerance;
                        var xmax = outer_coords.x + tolerance;
                        var ymin = outer_coords.y - tolerance;
                        var ymax = outer_coords.y + tolerance;

                        /* We have an overlap. */
                        if ( (inner_coords.x >= xmin) && (inner_coords.x <= xmax) && (inner_coords.y >= ymin) && (inner_coords.y <= ymax) ) {
                            tmp[c].matches[tmp[c].matches.length] = tmp[c2].object;
                            tmp[c2].matched = true;
                        }
                    }
                }
            }
        }
    }

    var ret = Array ();

    for ( var d = 0; d < meetings.length; d++ ) {
        if ( tmp[d].matches ) {
            ret.push ( tmp[d] );
        }
    }

    return ret;
};

Tally.prototype.sFromLatLngToPixel = function (in_Latng) {
    var	ret = null;

    if ( this.mapObject ) {
        var	lat_lng_bounds = this.mapObject.getBounds();
        if ( lat_lng_bounds ) {
            // We measure the container div element.
            var	div = this.mapObject.getDiv();

            if ( div ) {
                var	pixel_width = div.offsetWidth;
                var	pixel_height = div.offsetHeight;
                var north_west_corner = new google.maps.LatLng ( lat_lng_bounds.getNorthEast().lat(), lat_lng_bounds.getSouthWest().lng() );
                var lng_width = lat_lng_bounds.getNorthEast().lng()-lat_lng_bounds.getSouthWest().lng();
                var	lat_height = lat_lng_bounds.getNorthEast().lat()-lat_lng_bounds.getSouthWest().lat();

                // We do this, so we have the largest values possible, to get the most accuracy.
                var	pixels_per_degree = (( pixel_width > pixel_height ) ? (pixel_width / lng_width) : (pixel_height / lat_height));

                // Figure out the offsets, in long/lat degrees.
                var	offset_vert = north_west_corner.lat() - in_Latng.lat();
                var	offset_horiz = in_Latng.lng() - north_west_corner.lng();

                ret = new google.maps.Point ( Math.round(offset_horiz * pixels_per_degree),  Math.round(offset_vert * pixels_per_degree) );
            }
        }
    }

    return ret;
};

Tally.prototype.displayMeetingMarkerInResults = function(in_mtg_obj_array) {
    if ( in_mtg_obj_array && in_mtg_obj_array.length ) {
        var bounds = this.mapObject.getBounds();
        var main_point = new google.maps.LatLng ( in_mtg_obj_array[0].latitude, in_mtg_obj_array[0].longitude );

        if ( bounds.contains ( main_point ) ) {
            var displayed_image = (in_mtg_obj_array.length === 1) ? this.m_icon_image_single : this.m_icon_image_multi;
            var zoom_marker_detail_level = 3;
            var new_marker = new google.maps.Marker (
                {
                    'position':     main_point,
                    'map':		    this.mapObject,
                    'shadow':		this.m_icon_shadow,
                    'icon':			displayed_image,
                    'clickable':    this.mapObject.getZoom() > zoom_marker_detail_level
                } );

            new_marker.meeting_id_array = [];
            new_marker.meeting_obj_array = in_mtg_obj_array;
            return new_marker;
        }
    }

    return null;
};

Handlebars.registerHelper('tlsEnabled', function(url) {
    return url.substring(0, 5) === 'https' ? "Y" : "N";
});

Handlebars.registerHelper('semanticAdminEnabled', function(root) {
    return JSON.parse(root['server_info'])[0]['semanticAdmin'] === '1' ? 'Y' : 'N'
});

Handlebars.registerHelper('googleApiKeyPresent', function(root) {
    return JSON.parse(root['server_info'])[0]['google_api_key'] != null ? 'Y' : 'N'
});

Handlebars.registerHelper('serverInfo', function(root, key) {
    return JSON.parse(root['server_info'])[0][key];
});

function getJSONP(url, payload, callback) {
    var functionName = 'jsonp_' + (new Date).getTime().toString() + '_' + Math.floor(Math.random() * 1000000).toString();
    var callbackScript = document.createElement('script');
    callbackScript.setAttribute('type', 'text/javascript');
    callbackScript.appendChild(document.createTextNode('self.' + functionName + ' = ' + callback.toString().replace('/*<PAYLOAD>*/', 'var payload = ' + JSON.stringify(payload))));
    document.getElementsByTagName('head').item(0).appendChild(callbackScript);

    var script = document.createElement('script');
    script.src = url + "&callback=" + functionName;
    document.getElementsByTagName('head')[0].appendChild(script);
}

function getJSON(url) {
    return new RSVP.Promise(function(resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.async = true;
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                try {
                    var data = JSON.parse(xmlhttp.responseText);
                } catch (err) {
                    reject(this);
                }

                resolve(data);
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    });
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

Array.prototype.getArrayItemByObjectKeyValue = function(key, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][key] === value) {
            return this[i];
        }
    }
};

Array.prototype.has = function(value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
            return true;
        }
    }

    return false;
};
