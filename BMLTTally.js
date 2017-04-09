/********************************************************************************************//**
*                                         MAIN FUNCTION                                         *
************************************************************************************************/

function BMLTTally(inSourceList) {
    this.tallyManTotal = 0;
    this.tallyDone = 0;
    this.tallyLogRows = Array();
    this.sourceList = inSourceList;
    this.mapObject = null;
    this.mapMarkers = [];
    this.allMeetings = [];
    this.calculatedMarkers = [];
    this.whatADrag = false;
    this.inDraw = false;

	/// These describe the regular NA meeting icon
	this.m_icon_image_single = new google.maps.MarkerImage ( "images/NAMarkerB.png", new google.maps.Size(22, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	this.m_icon_image_multi = new google.maps.MarkerImage ( "images/NAMarkerR.png", new google.maps.Size(22, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	this.m_icon_shadow = new google.maps.MarkerImage( "images/NAMarkerS.png", new google.maps.Size(43, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );

    /****************************************************************************************//**
    *   \brief MAIN CONTEXT                                                                     *
    ********************************************************************************************/
    this.start_tally();
};

BMLTTally.prototype.tallyManTotal;
BMLTTally.prototype.tallyDone;
BMLTTally.prototype.tallyLogRows;
BMLTTally.prototype.sourceList;
BMLTTally.prototype.mapObject;
BMLTTally.prototype.mapMarkers;
BMLTTally.prototype.calculatedMarkers;
BMLTTally.prototype.allMeetings;
BMLTTally.prototype.m_icon_image_single;
BMLTTally.prototype.m_icon_image_multi;
BMLTTally.prototype.m_icon_shadow;
BMLTTally.prototype.whatADrag;
 
/****************************************************************************************//**
*   \brief Increments the tally meter.                                                      *
********************************************************************************************/
BMLTTally.prototype.incrementTallyMeter = function ( ) {
    var tallyMeter = document.getElementById ( "tallyMeter" );
    var tallyMeterFill = document.getElementById ( "tallyMeterFill" );
    var percentage = this.tallyDone / this.tallyManTotal;
    tallyMeterFill.style.width = (percentage * 100).toString() + "%";
    if ( this.tallyDone == this.tallyManTotal ) {
        for ( var i = 0; i < this.sourceList.length; i++ ) {
            var source = this.sourceList[i];
            if ( source ) {
                var meetings = source.meetings;
                for ( var c = i; c < meetings.length; c++ ) {
                    this.allMeetings.push(meetings[c]);
                };
            };
        };
        
        this.displayResults ( );
    };
    this.updateTallyLog();
};
    
/****************************************************************************************//**
*   \brief Updates the log of events.                                                      *
********************************************************************************************/
BMLTTally.prototype.updateTallyLog = function ( ) {
    for ( var i = 0; i < this.sourceList.length; i++ ) {
        var tallyTable = document.getElementById ( 'tallyLogTable' );
        var sourceObject = this.sourceList[i];
        if ( this.tallyLogRows.length < (i + 1) ) {
            var tableRow = document.createElement ( 'tr' );
            if ( i % 2 ) {
                tableRow.className = 'odd';
            };
            this.tallyLogRows[i] = document.createElement ( 'td' );
            tableRow.appendChild(this.tallyLogRows[i]);
            tallyTable.appendChild(tableRow);
        };
        
        if ( !sourceObject.stage ) {
            sourceObject.stage = 0;
        };
        
        var innerElement = '';
        this.tallyLogRows[i].className = 'in-progress-' + sourceObject.stage.toString();
        
        switch ( sourceObject.stage ) {
            case 0:
                innerElement = sourceObject.name + ' -Fetching Service Bodies.';
                break;
            
            case 1:
                innerElement = sourceObject.name + ' -Fetching Server Version.';
                break;
            
            case 2:
                innerElement = sourceObject.name + ' -Fetching Meetings.';
                break;
                
            default:
                innerElement = sourceObject.name + ' -Done.';
                break;
        };
        
        this.tallyLogRows[i].innerHTML = innerElement;
    };
        
};

/****************************************************************************************//**
*   \brief Increments the tally meter.                                                      *
********************************************************************************************/
BMLTTally.prototype.displayResults = function ( ) {
    /****************************************************************************************//**
    *   \brief Sorting Handler.                                                                 *
    ********************************************************************************************/
    sortResults = function ( a, b ) {
        var ret = (a.meetings.length - b.meetings.length);
        if ( 0 == ret ) {
            ret = a.numRegions - b.numRegions;
            if ( 0 == ret ) {
                ret = a.numASCs - b.numASCs;
            };
        };
        
        return -ret;
    };

    var tallyTable = document.getElementById ( 'tallyLogTable' );
    var tableContainer = document.getElementById ( 'tallyHo' );
    var tableBody = document.getElementById ( 'tallyBody' );
    tableBody.innerHTML = '';
    var tallyMeter = document.getElementById ( "tallyMeter" );
    tallyMeter.style.display = 'none';
    tallyTable.innerHTML = '';
    
    this.sourceList.sort ( sortResults );
    
    var totalRegions = 0;
    var totalAreas = 0;
    
    for ( var i = 0; i < this.sourceList.length; i++ ) {
        var sourceObject = this.sourceList[i];
        
        totalRegions += sourceObject.numRegions;
        totalAreas += sourceObject.numASCs;
        
        var tableRow = document.createElement ( 'tr' );
        
        if ( i % 2 ) {
            tableRow.className = 'odd';
        };
        
        var tableAnchor = document.createElement ( 'a' );
        tableAnchor.href = sourceObject.rootURL;
        tableAnchor.className = 'tallyClick';
        tableAnchor.target = "_blank";
        tableAnchor.appendChild ( document.createTextNode ( sourceObject.name ) );

        var tableCellName = document.createElement ( 'td' );
        tableCellName.className = 'tallyName';
        tableCellName.appendChild ( tableAnchor );
        
        var semURL = sourceObject.semanticURL;
        
        if ( !semURL ) {
            semURL = sourceObject.rootURL.toString() + "/semantic";
        };
        
        var semanticAnchor = document.createElement ( 'a' );
        semanticAnchor.href = semURL.toString();
        semanticAnchor.className = 'tallySemanticClick';
        semanticAnchor.target = "_blank";
        semanticAnchor.appendChild ( document.createTextNode ( 'Semantic Workshop Link' ) );

        tableCellName.appendChild ( document.createTextNode ( ' (' ) );
        tableCellName.appendChild ( semanticAnchor );
        tableCellName.appendChild ( document.createTextNode ( ')' ) );
        
        tableRow.appendChild ( tableCellName );
        
        var tableCellSSL = document.createElement ( 'td' );
        tableCellSSL.className = 'tallySSL' + ((sourceObject.rootURL.toString().substring(0, 5) === 'https') ? ' validSSL' : ' inValidSSL');
        tableCellSSL.appendChild ( document.createTextNode ( (sourceObject.rootURL.toString().substring(0, 5) === 'https') ? "YES" : "NO" ) );
        tableRow.appendChild ( tableCellSSL );
        
        var tableCellVersion = document.createElement ( 'td' );

        var serverVersion = parseInt ( sourceObject.versionInt );
        
        if ( (sourceObject.rootURL.toString().substring(0, 5) === 'https') && (serverVersion >= 2008012) ) {
            tableCellVersion.className = 'tallyVersion validServer';
        } else {
            tableCellVersion.className = 'tallyVersion';
        };
        tableCellVersion.appendChild ( document.createTextNode ( sourceObject.serverVersion.toString() ) );
        tableRow.appendChild ( tableCellVersion );
        
        var tableCellRegions = document.createElement ( 'td' );
        tableCellRegions.className = 'tallyRegion';
        tableCellRegions.appendChild ( document.createTextNode ( sourceObject.numRegions.toString() ) );
        tableRow.appendChild ( tableCellRegions );
        
        var tableCellAreas = document.createElement ( 'td' );
        tableCellAreas.className = 'tallyArea';
        tableCellAreas.appendChild ( document.createTextNode ( sourceObject.numASCs.toString() ) );
        tableRow.appendChild ( tableCellAreas );
        
        var tableCellMeetings = document.createElement ( 'td' );
        tableCellMeetings.className = 'tallyMeeting';
        tableCellMeetings.appendChild ( document.createTextNode ( sourceObject.meetings.length.toString() ) );
        tableRow.appendChild ( tableCellMeetings );
        
        tableBody.appendChild ( tableRow );
    };
    
    var totalRow = document.createElement ( 'tr' );
    
    totalRow.className = 'tallyTotal';

    var tableCellName = document.createElement ( 'td' );
    tableCellName.className = 'tallyName';
    tableCellName.colSpan = '3';
    tableCellName.appendChild ( document.createTextNode ( 'TOTAL' ) );
    totalRow.appendChild ( tableCellName );
    
    var tableCellRegions = document.createElement ( 'td' );
    tableCellRegions.className = 'tallyRegion';
    tableCellRegions.appendChild ( document.createTextNode ( totalRegions.toString() ) );
    totalRow.appendChild ( tableCellRegions );
    
    var tableCellAreas = document.createElement ( 'td' );
    tableCellAreas.className = 'tallyArea';
    tableCellAreas.appendChild ( document.createTextNode ( totalAreas.toString() ) );
    totalRow.appendChild ( tableCellAreas );
    
    var tableCellMeetings = document.createElement ( 'td' );
    tableCellMeetings.className = 'tallyMeeting';
    tableCellMeetings.appendChild ( document.createTextNode ( this.allMeetings.length.toString() ) );
    totalRow.appendChild ( tableCellMeetings );
    
    tableBody.appendChild ( totalRow );
        
    tableContainer.style.display = 'table';
    
    document.getElementById ( "tallyLegend" ).style.display = 'block';
};

/****************************************************************************************//**
*   \brief AJAX callback for Meetings                                                 *
********************************************************************************************/
BMLTTally.prototype.ajax_callback_meetings = function ( in_req,        ///< The HTTPRequest object for this call.
                                                        in_extra_data  ///< Any refCon that was attached.  
                                                        ) {
    var responseText = in_req.responseText;
    var source = in_req.extra_data;
    var context = source.context;
    eval('var results = ' + responseText + ';' );
    source.meetings = Array();
    if ( results && results.length ) {
        for ( var i = 0; i < results.length; i++ ) {
            results[i].source = source;
            };
        source.meetings = results;
        };
    
    source.stage = 3;
    context.tallyDone++;
    context.incrementTallyMeter();
};

/****************************************************************************************//**
*   \brief AJAX callback for The Version                                                 *
********************************************************************************************/
BMLTTally.prototype.ajax_callback_version = function (  in_req,        ///< The HTTPRequest object for this call.
                                                        in_extra_data  ///< Any refCon that was attached.  
                                                        ) {
    var responseText = in_req.responseText;
    var source = in_req.extra_data;
    var context = source.context;
    eval('source.serverVersion = \'' + responseText.toString() + '\';' );
    var versionArray = source.serverVersion.split('.');
    source.versionInt = (parseInt ( versionArray[0] ) * 1000000) + (parseInt ( versionArray[1] ) * 1000) + parseInt ( versionArray[2] );
    source.stage = 2;
    context.tallyDone++;
    context.incrementTallyMeter();

    var uri = "index.php?GetMeetings&callURI=" + encodeURIComponent ( source.rootURL );
    Simple_AjaxRequest ( uri, context.ajax_callback_meetings, 'GET', source );
};

/****************************************************************************************//**
*   \brief AJAX callback for Service bodies                                                 *
********************************************************************************************/
BMLTTally.prototype.ajax_callback_services = function ( in_req,        ///< The HTTPRequest object for this call.
                                                        in_extra_data  ///< Any refCon that was attached.  
                                                        ) {
    var responseText = in_req.responseText;
    var source = in_req.extra_data;
    var context = source.context;
    eval('var serviceBodies = ' + responseText + ';' );
    var regions = 0;
    var areas = 0;

    for ( var i = 0; i < serviceBodies.length; i++ ) {
        var serviceBody = serviceBodies[i];
    
        if ( serviceBody.type == 'RS' ) {
            regions++;
        } else {
            areas++;
        };
    };

    source.numRegions = regions;
    source.numASCs = areas;
    source.stage = 1;
    context.tallyDone++;
    context.incrementTallyMeter();

    var uri = "index.php?GetVersion&callURI=" + encodeURIComponent ( source.rootURL );
    Simple_AjaxRequest ( uri, context.ajax_callback_version, 'GET', source );
};

/****************************************************************************************//**
*   \brief Start your engines                                                               *
********************************************************************************************/
BMLTTally.prototype.start_tally = function() {
    var tableContainer = document.getElementById ( 'tallyHo' );
    tableContainer.style.display = 'none';
    
    var count = this.sourceList.length;
    this.tallyManTotal = count * 3;
    this.incrementTallyMeter();
    document.getElementById ( "tallyMeter" ).style.display = 'block';
    document.getElementById ( "tallyLogTable" ).style.display = 'table';

    for ( var i = 0; i < count; i++ ) {
        var source = this.sourceList[i];
        if ( source.rootURL ) {
            source.stage = 0;
            var uri = "index.php?callURI=" + encodeURIComponent ( source.rootURL );
            source.context = this;
            Simple_AjaxRequest ( uri, this.ajax_callback_services, 'GET', source );
        };
    };
};
    
/********************************************************************************************//**
*   \brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.displayTallyMap = function() {
        document.getElementById ( "tallyMan" ).style.display = 'none';
        document.getElementById ( "tallyMap" ).style.display = 'block';
        this.loadMap();
};

/********************************************************************************************//**
*   \brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.loadMap = function() {
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
            google.maps.event.addListener(this.mapObject, 'zoom_changed', function(inEvent) { tallyManTallyMan.recalculateOverlaps(); });
            google.maps.event.addListener(this.mapObject, 'bounds_changed', function(inEvent) { tallyManTallyMan.redrawResultMapMarkers(); });
            google.maps.event.addListener(this.mapObject, 'dragstart', function(inEvent) { tallyManTallyMan.whatADrag = true; });
            google.maps.event.addListener(this.mapObject, 'idle', function(inEvent) { tallyManTallyMan.handleIdle(); });
        };
    };
};
    
/********************************************************************************************//**
*	\brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.handleIdle = function() {
    if ( this.mapObject && this.mapObject.getBounds() ) {
        if ( this.whatADrag ) {
            tallyManTallyMan.whatADrag = false;
            this.redrawResultMapMarkers();
            };
        };
            
    tallyManTallyMan.whatADrag = false;
};
    
/********************************************************************************************//**
*	\brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.recalculateOverlaps = function() {
    if ( this.mapObject && this.mapObject.getBounds() ) {
        this.calculatedMarkers = [];
        this.redrawResultMapMarkers();
        };
};
    
/********************************************************************************************//**
*	\brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.redrawResultMapMarkers = function() {
    if ( this.mapObject && this.mapObject.getBounds() ) {
        if ( !this.calculatedMarkers.length ) {
            this.calculatedMarkers = this.sMapOverlappingMarkers ( this.allMeetings, this.mapObject );
            };
        
        while(this.mapMarkers.length) { this.mapMarkers.pop().setMap(null); }

        if ( !this.whatADrag && !this.inDraw ) {
            for ( var c = 0; this.calculatedMarkers && (c < this.calculatedMarkers.length); c++ ) {
                var objectItem = this.calculatedMarkers[c];
                var matchesWeDontNeedNoSteenkinMatches = objectItem.matches;
                var marker = this.displayMeetingMarkerInResults ( matchesWeDontNeedNoSteenkinMatches );
                if ( marker ) {
                    this.mapMarkers.push(marker);
                    };
                };
            };
        };
};

/********************************************************************************************//**
*   \brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.sMapOverlappingMarkers = function ( in_meeting_array
									                    ) {
    var tolerance = 10;	/* This is how many pixels we allow. */
    var tmp = new Array;

    for ( var c = 0; c < in_meeting_array.length; c++ ) {
        tmp[c] = new Object;
        tmp[c].matched = false;
        tmp[c].matches = null;
        tmp[c].object = in_meeting_array[c];
        tmp[c].coords = this.sFromLatLngToPixel ( new google.maps.LatLng ( tmp[c].object.latitude, tmp[c].object.longitude ), this.mapObject );
        };
    
    for ( var c = 0; c < in_meeting_array.length; c++ ) {
        if ( false == tmp[c].matched ) {
            tmp[c].matched = true;
            tmp[c].matches = new Array ( tmp[c].object );

            for ( var c2 = 0; c2 < in_meeting_array.length; c2++ ) {
                if ( false == tmp[c2].matched && tmp[c] && tmp[c2] ) {
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
                            };
                        };
                    };
                };
            };
        };

    var ret = Array ();
    
    for ( var c = 0; c < in_meeting_array.length; c++ ) {
        if ( tmp[c].matches ) {
            ret.push ( tmp[c] );
            };
    };
    
    return ret;
};
    
/********************************************************************************************//**
*	\brief This takes a latitude/longitude location, and returns an x/y pixel location for it.  *
*																						        *
*	\returns a Google Maps API V3 Point, with the pixel coordinates (top, left origin).	        *
************************************************************************************************/
BMLTTally.prototype.sFromLatLngToPixel = function ( in_Latng
                                                    ) {
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
                };
            };
        };

    return ret;
};

/********************************************************************************************//**
*	\brief                                                                                      *
************************************************************************************************/
BMLTTally.prototype.displayMeetingMarkerInResults = function(   in_mtg_obj_array
                                                                ) {
    if ( in_mtg_obj_array && in_mtg_obj_array.length ) {
        var bounds = this.mapObject.getBounds();
		var main_point = new google.maps.LatLng ( in_mtg_obj_array[0].latitude, in_mtg_obj_array[0].longitude );

        if ( bounds.contains ( main_point ) ) {
            var displayed_image = (in_mtg_obj_array.length == 1) ? this.m_icon_image_single : this.m_icon_image_multi;
            
            var marker_html = '';
            
            if ( this.mapObject.getZoom() > 8 ) {
		        marker_html = '<div><dl>';
                };
        
            var new_marker = new google.maps.Marker (
                                                        {
                                                        'position':     main_point,
                                                        'map':		    this.mapObject,
                                                        'shadow':		this.m_icon_shadow,
                                                        'icon':			displayed_image,
                                                        'clickable':    this.mapObject.getZoom() > 8
                                                        } );
        
            var id = this.m_uid;
            new_marker.meeting_id_array = new Array;
            new_marker.meeting_obj_array = in_mtg_obj_array;
        
            // We save all the meetings represented by this marker.
            for ( var c = 0; c < in_mtg_obj_array.length; c++ ) {
                if ( marker_html ) {
                    var weekdays = ['ERROR', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		            marker_html += '<dt><strong>';
		            marker_html += in_mtg_obj_array[c]['meeting_name'];
		            marker_html += '</strong></dt>';
		            marker_html += '<dd><em>';
		            marker_html += weekdays[parseInt ( in_mtg_obj_array[c]['weekday_tinyint'] )];
		            var time = in_mtg_obj_array[c]['start_time'].toString().split(':');
		            var hour = parseInt ( time[0] );
		            var minute = parseInt ( time[1] );
		            var pm = 'AM';
		            if ( hour >= 12 ) {
		                pm = 'PM';
		                
		                if ( hour > 12 ) {
		                    hour -= 12;
		                    };
		                };
		            
		            hour = hour.toString();
		            minute = (minute > 9) ? minute.toString() : ('0' + minute.toString());
		            marker_html += ' ' + hour + ':' + minute + ' ' + pm;
		            marker_html += '</em></dd>';
		            var source = in_mtg_obj_array[c].source;
		            if ( source ) {
		                var url = source.semanticURL;
		                
		                if ( !url ) {
		                    url = source.rootURL + 'semantic';
		                    };
		                    
                        marker_html += '<dd><em><a href="' + url + '">';
                        marker_html += source.name;
                        marker_html += '</a></em></dd>';
                        };
                    };
                
                new_marker.meeting_id_array[c] = in_mtg_obj_array[c]['id_bigint'];
                };

            if ( marker_html ) {
		        marker_html += '</dl></div>';
                var infowindow = new google.maps.InfoWindow ( { content: marker_html });
                new_marker.addListener ( 'click', function() { infowindow.open ( this.mapObject, new_marker ); });
                };
                
            return new_marker;
            };
        };
        
    return null;
};

/********************************************************************************************//**
*                                       AJAX HANDLER                                            *
************************************************************************************************/

/********************************************************************************************//**
*   \brief A simple, generic AJAX request function.                                             *
*                                                                                               *
*   \returns a new XMLHTTPRequest object.                                                       *
************************************************************************************************/
    
function Simple_AjaxRequest (   url,        ///< The URI to be called
                                callback,   ///< The success callback
                                method,     ///< The method ('get' or 'post')
                                extra_data  ///< If supplied, extra data to be delivered to the callback.
                                )
{
    /****************************************************************************************//**
    *   \brief Create a generic XMLHTTPObject.                                                  *
    *                                                                                           *
    *   This will account for the various flavors imposed by different browsers.                *
    *                                                                                           *
    *   \returns a new XMLHTTPRequest object.                                                   *
    ********************************************************************************************/
    
    function createXMLHTTPObject()
    {
        var XMLHttpArray = [
            function() {return new XMLHttpRequest()},
            function() {return new ActiveXObject("Msxml2.XMLHTTP")},
            function() {return new ActiveXObject("Msxml2.XMLHTTP")},
            function() {return new ActiveXObject("Microsoft.XMLHTTP")}
            ];
            
        var xmlhttp = false;
        
        for ( var i=0; i < XMLHttpArray.length; i++ )
            {
            try
                {
                xmlhttp = XMLHttpArray[i]();
                }
            catch(e)
                {
                continue;
                };
            break;
            };
        
        return xmlhttp;
    };
    
    var req = createXMLHTTPObject();
    req.finalCallback = callback;
    var sVars = null;
    method = method.toString().toUpperCase();
    var drupal_kludge = '';
    
    // Split the URL up, if this is a POST.
    if ( method == "POST" )
        {
        var rmatch = /^([^\?]*)\?(.*)$/.exec ( url );
        url = rmatch[1];
        sVars = rmatch[2];
        // This horrible, horrible kludge, is because Drupal insists on having its q parameter in the GET list only.
        var rmatch_kludge = /(q=admin\/settings\/bmlt)&?(.*)/.exec ( rmatch[2] );
        if ( rmatch_kludge && rmatch_kludge[1] )
            {
            url += '?'+rmatch_kludge[1];
            sVars = rmatch_kludge[2];
            };
        };
    if ( extra_data )
        {
        req.extra_data = extra_data;
        };
    req.open ( method, url, true );
	if ( method == "POST" )
        {
        req.setRequestHeader("Method", "POST "+url+" HTTP/1.1");
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        };
    req.onreadystatechange = function ( )
        {
        if ( req.readyState != 4 ) return;
        if( req.status != 200 ) return;
        callback ( req, req.extra_data );
        req = null;
        };
    req.send ( sVars );
    
    return req;
};
