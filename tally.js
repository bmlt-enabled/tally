function Tally(sources) {
    var self = this;
    this.sources = sources;
    var template = Handlebars.compile(document.getElementById("tally-table-template").innerHTML);
    document.getElementById("tally").innerHTML = template(sources);
    var max = sources.length;
    for (var i = 0; i < max; i++) {
        document.getElementById("tallySSL_Data_" + sources[i].id).innerHTML = sources[i].rootURL.substring(0, 5) === 'https' ? "Y" : "N";
        $.getJSON(sources[i].rootURL + 'client_interface/jsonp/?switcher=GetServiceBodies&callback=?', { id: sources[i]['id'] }, function(service_bodies) {
            var qs = getUrlVars(this.url);
            var regions = 0;
            var areas = 0;

            for ( var i = 0; i < service_bodies.length; i++ ) {
                service_bodies[i].type === 'RS' ? regions++ : areas++;
            }

            document.getElementById("tallyRegion_Data_" + qs['id']).innerHTML = regions.toString();
            document.getElementById("tallyArea_Data_" + qs['id']).innerHTML = areas.toString();

            $.getJSON(self.getSourceUrl(qs['id']) + 'client_interface/jsonp/?switcher=GetServerInfo&callback=?', { id: qs['id'] }, function(serverInfo) {
                var qs = getUrlVars(this.url);
                document.getElementById("tallyVersion_Data_" + qs['id']).innerHTML = serverInfo[0].version;
                document.getElementById("tallySemanticAdmin_Data_" + qs['id']).innerHTML = serverInfo[0].semanticAdmin === "1" ? "Y" : "N";

                //$.getJSON(source.rootURL + 'client_interface/jsonp/?switcher=GetCoverageArea&callback=?', function(data) {
                    /*source.coverageArea = {};

                    source.coverageArea.ne_corner = new google.maps.LatLng ( parseFloat ( coverageAreaRaw[0].nw_corner_latitude ), parseFloat ( coverageAreaRaw[0].se_corner_longitude ) );
                    source.coverageArea.sw_corner = new google.maps.LatLng ( parseFloat ( coverageAreaRaw[0].se_corner_latitude ), parseFloat ( coverageAreaRaw[0].nw_corner_longitude ) );*/

                    $.getJSON(self.getSourceUrl(qs['id']) + 'client_interface/jsonp/?switcher=GetSearchResults&callback=?', { id: qs['id'] }, function (meetings) {
                        var qs = getUrlVars(this.url);

                        document.getElementById("tallyMeetings_Data_" + qs['id']).innerHTML = meetings.length;
                    });
                //});
            });
        });
    }
}

function getUrlVars(url)
{
    var vars = {}, hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }

    return vars;
}

Tally.prototype.getSourceUrl = function(id) {
    return this.sources.getArrayItemByObjectKeyValue('id', id)['rootURL'];
}


Array.prototype.getArrayItemByObjectKeyValue = function(key, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][key] === value) {
            return this[i];
        }
    }
}