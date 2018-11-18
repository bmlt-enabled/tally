<?php
/*******************************************************************************************/
/**
    \brief  BMLTTally is a utility app that quickly polls a list of Root Servers, and displays their
            information in the form of a table, and a map.
            
            This started life as a "quick n' dirty one-off," so it does not cleave to the standards
            of the rest of the BMLT project.
            
        This file is part of the Basic Meeting List Toolbox (BMLT).

        Find out more at: http://bmlt.magshare.org

        BMLT is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as
        published by the Free Software Foundation, either version 3
        of the License, or (at your option) any later version.

        BMLT is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
        See the GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this code.  If not, see <http://www.gnu.org/licenses/>.
*/
$url = isset ( $_GET["callURI"] ) ? $_GET["callURI"] : "";
$error_message = "";

define ( "__VERSION", "1.2.10" );

if ( isset ( $_GET["GetVersion"] ) )
    {
    die ( trim(call_curl ( $url . "client_interface/json/?switcher=GetServerInfo", FALSE, $error_message ), "[]") );
    }
if ( isset ( $_GET["GetCoverage"] ) )
    {
    die ( call_curl ( $url . "client_interface/json/?switcher=GetCoverageArea", FALSE, $error_message ) );
    }
elseif ( isset ( $_GET["GetMeetings"] ) )
    {
    die ( call_curl ( $url . "client_interface/json/?switcher=GetSearchResults", FALSE, $error_message ) );
    }
elseif ( $url )
    {
    die ( call_curl ( $url . "client_interface/json/?switcher=GetServiceBodies", FALSE, $error_message ) );
    }
else
    { ?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>BMLT Live Tally</title>
        <style type="text/css">
            html,
            body
            {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }
            
            div#tallyMan
            {
                font-family: Arial, Helvetica, sans-serif;
                text-align: center;
            }
            
            div#tallyMeter
            {
                text-align: left;
                height: 0.5em;
                margin-left: auto;
                margin-right:auto;
                width: 25%;
                border-radius: 0.25em;
                border:1px solid blue;
                background-color:#ccf;
            }
            
            div#tallyMeterFill
            {
                background-color:blue;
                width: 0px;
                height: 100%;
            }
            
            img.masthead,
            table#tallyHo,
            table#tallyLogTable
            {
                margin-left: auto;
                margin-right:auto;
            }
            
            table#tallyHo a,
            table#tallyHo a:visited
            {
                color: #36f;
                text-decoration: none;
            }
            
            table#tallyHo a:hover,
            table#tallyHo a:active
            {
                color: #f63;
                text-decoration: underline;
            }
            
            table#tallyHo td
            {
                padding: 0.25em;
                padding-left: 1em;
                padding-right: 1em;
            }
            
            table#tallyHo thead td
            {
                border: none;
                text-align: center;
                font-weight: bold;
                border-bottom: 2px solid #009;
            }
            
            table#tallyHo thead td.selected a,
            table#tallyHo thead td.selected a:visited
            {
                padding: 0.25em;
            	display:block;
            	width: 100%;
            	height: 100%;
            	background-color:blue;
            	color: white;
            }
            
            table#tallyHo thead td.selected.down a
            {
            	background-color:red;
            	color: white;
            }
            
            table#tallyHo tr.tallyTotal td
            {
                border: none;
                text-align: right;
                font-weight: bold;
                border-top: 2px solid #009;
            }
            
            table#tallyHo tbody td
            {
                text-align: right;
                padding-right: 1em;
            }
            
            table#tallyHo thead td
            {
                padding-right: 0;
            }
            
            table#tallyHo tbody tr.odd td
            {
                background-color: #eef;
            }
            
            table#tallyHo tbody td.tallyName,
            table#tallyHo tbody td.tallyVersion
            {
                text-align: left;
                padding-right: 0;
            }
            
            table#tallyHo tbody td.tallyVersion
            {
                padding-left: 1em;
            }
            
            table#tallyHo tbody td.tallySSL
            {
                text-align:center;
            }
            
            table#tallyHo tbody td.inValidSSL
            {
                color: red;
            }
            
            table#tallyHo tbody td.validSSL
            {
                color: #090;
                font-weight: bold;
            }
            
            table#tallyLogTable
            {
                margin-top: 1em;
                text-align: left;
                font-style: italic;
            }
            
            table#tallyLogTable td.in-progress-0
            {
                color: #c30;
            }
            
            table#tallyLogTable td.in-progress-1
            {
                color: #c60;
            }
            
            table#tallyLogTable td.in-progress-2
            {
                color: #cc0;
            }
            
            table#tallyLogTable td.in-progress-3
            {
                color: #0c0;
            }
            
            table#tallyHo tbody td.validServer
            {
                color: #090;
                font-weight: bold;
            }
            
            table#tallyHo tbody td.invalidServer
            {
                color: red;
            }
            
            p#tallyCo
            {
                display: table;
                margin-left:auto;
                margin-right:auto;
                padding: 0.5em;
                font-style: italic;
                font-weight: bold;
            }
            
            p#tallyMo
            {
                color: #090;
                font-weight: bold;
                font-style: italic;
            }
            
            input.showTableButton
            {
                margin-left:auto;
                margin-right:auto;
            }
            
            div#tallyMapButton
            {
                font-weight:bold;
                text-align:center;
            }
            
            div#tallyMap
            {
                width: 100%;
                height: 100%;
            }
            
            div.centerControlDiv
            {
                text-align:center;
                background-color: white;
                padding: 0.5em;
                box-shadow: 2px 2px 1px #888888;
            }
            
            div.centerControlDiv div
            {
                text-align:left;
            }
            
            div#tallyVersion
            {
                margin-top: 1em;
                text-align:center;
                font-style: italic;
                font-size: small;
            }
            
        </style>
        <link rel="shortcut icon" href="https://bmlt.magshare.net/wp-content/uploads/2014/11/FavIcon.png" type="image/x-icon" />
        <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=geometry&key=AIzaSyB4q4Cwwl7PvTdLSAyVy4oWOLt4l0yEuyM"></script>
    </head>
    <body>
        <div id="tallyMan">
            <a href="https://bmlt.magshare.net"><img class="masthead" src="https://bmlt.magshare.net/wp-content/uploads/2014/01/cropped-BMLT-Blog-Logo1.png" /></a>
            <h2>Tally of Known BMLT Root Servers</h2>
            <div id="tallyMeter">
                <div id="tallyMeterFill"></div>
            </div>
            <div id="tallyLegend" style="display: none">
                <p id="tallyMo">*Bold green version number indicates server is suitable to use the <a href="https://itunes.apple.com/us/app/na-meeting-list-administrator/id1198601446">NA Meeting List Administrator</a> app.</p>
                <p id="tallyMo2">Remember that the server must be <a href="https://letsencrypt.org">SSL/HTTPS</a>, in addition to <a href="https://bmlt.magshare.net/semantic/semantic-administration/">Semantic Administration being enabled</a>.</p>
                <p id="tallyMo3">If <strong>BOTH</strong> of these conditions are not met, then you cannot use the admin app.</p>
                <div id="tallyMapButton"><a href="javascript:tallyManTallyMan.displayTallyMap();">Display Coverage Map</a></div>
            </div>
            <table id="tallyLogTable" cellspacing="0" cellpadding="0" border="0" style="display:none"></table>
            <table id="tallyHo" cellspacing="0" cellpadding="0" border="0" style="display:none">
                <thead id="tallyHead">
                    <tr>
                        <td class="tallyName">Server Name</td>
                        <td id="tallySSL_Header"><a href="javascript:tallyManTallyMan.setSort('isSSL','tallySSL_Header');">Is SSL?</a></td>
                        <td id="tallyVersion_Header"><a href="javascript:tallyManTallyMan.setSort('versionInt','tallyVersion_Header');">Version*</a></td>
                        <td id="tallyRegion_Header"><a href="javascript:tallyManTallyMan.setSort('numRegions','tallyRegion_Header');">Number of Regions</a></td>
                        <td id="tallyArea_Header"><a href="javascript:tallyManTallyMan.setSort('numASCs','tallyArea_Header');">Number of Areas</a></td>
                        <td id="tallyMeeting_Header" class="selected"><a href="javascript:tallyManTallyMan.setSort('meetings.length','tallyMeeting_Header');">Number of Meetings</a></td>
                    </tr>
                </thead>
                <tbody id="tallyBody"></tbody>
            </table>
            <div id="tallyVersion"></div>
        </div>
        <div id="tallyMap" style="display: none"></div>
        <?php
            $sourceListJson = file_get_contents("rootServerList.json");
        ?>
        <script type="text/javascript" src="BMLTTally.js"></script>
        <script type="text/javascript"><?php echo "var tallyManTallyMan = new BMLTTally($sourceListJson,\"".__VERSION."\");" ?></script>
    </body>
</html>
<?php    }

/************************************************************************************//**
*   \brief This function gets the XML version resource from the Root Server, then       *
*   parses it to return only the version string itself.                                 *
*                                                                                       *   
*   \returns a string, containing the response. Empty if the call fails to get data.    *
****************************************************************************************/
function parse_version ( $in_uri )
{
    $data = call_curl ( $in_uri );
    $ret = '';
    
    if ( $data )
        {
        $info_file = new DOMDocument;
        if ( $info_file instanceof DOMDocument )
            {
            if ( @$info_file->loadXML ( $data ) )
                {
                $has_info = $info_file->getElementsByTagName ( "bmltInfo" );
                
                if ( ($has_info instanceof domnodelist) && $has_info->length )
                    {
                    $ret = trim ( $has_info->item(0)->nodeValue );
                    }
                }
            }
        }
        
    return $ret;
}

/************************************************************************************//**
*   \brief This is a function that returns the results of an HTTP call to a URI.        *
*   It is a lot more secure than file_get_contents, but does the same thing.            *
*                                                                                       *   
*   \returns a string, containing the response. Null if the call fails to get any data. *
****************************************************************************************/
function call_curl ( $in_uri,                ///< A string. The URI to call.
                     $in_post = false,       ///< If false, the transaction is a GET, not a POST. Default is true.
                     &$error_message = null, ///< A string. If provided, any error message will be placed here.
                     &$http_status = null    ///< Optional reference to a string. Returns the HTTP call status.
                    )
{
    $ret = null;
    // Make sure we don't give any false positives.
    if ( $error_message )
        {
        $error_message = null;
        }
    
    if ( !extension_loaded ( 'curl' ) ) // Must have cURL.
        {
        // If there is no error message variable passed, we die quietly.
        if ( isset ( $error_message ) )
            {
            $error_message = 'call_curl: The cURL extension is not available! This code will not work on this server!';
            }
        }
    else
        {
        // This gets the session as a cookie.
        if (isset ( $_COOKIE['PHPSESSID'] ) && $_COOKIE['PHPSESSID'] )
            {
            $strCookie = 'PHPSESSID=' . $_COOKIE['PHPSESSID'] . '; path=/';

            session_write_close();
            }

        // Create a new cURL resource.
        $resource = curl_init();
    
        if ( isset ( $strCookie ) && $strCookie )
            {
            curl_setopt ( $resource, CURLOPT_COOKIE, $strCookie );
            }
    
        // If we will be POSTing this transaction, we split up the URI.
        if ( $in_post )
            {
            $spli = explode ( "?", $in_uri, 2 );
            
            if ( is_array ( $spli ) && count ( $spli ) )
                {
                $in_uri = $spli[0];
                $in_params = $spli[1];
                // Convert query string into an array using parse_str(). parse_str() will decode values along the way.
                parse_str($in_params, $temp);
                
                // Now rebuild the query string using http_build_query(). It will re-encode values along the way.
                // It will also take original query string params that have no value and appends a "=" to them
                // thus giving them and empty value.
                $in_params = http_build_query($temp);
            
                curl_setopt ( $resource, CURLOPT_POST, true );
                curl_setopt ( $resource, CURLOPT_POSTFIELDS, $in_params );
                }
            }
        
        if ( isset ( $strCookie ) && $strCookie )
            {
            curl_setopt( $resource, CURLOPT_COOKIE, $strCookie );
            }

        // Set url to call.
        curl_setopt ( $resource, CURLOPT_URL, $in_uri );
        
        // Make curl_exec() function (see below) return requested content as a string (unless call fails).
        curl_setopt ( $resource, CURLOPT_RETURNTRANSFER, true );
        
        // By default, cURL prepends response headers to string returned from call to curl_exec().
        // You can control this with the below setting.
        // Setting it to false will remove headers from beginning of string.
        // If you WANT the headers, see the Yahoo documentation on how to parse with them from the string.
        curl_setopt ( $resource, CURLOPT_HEADER, false );
        
        // Allow  cURL to follow any 'location:' headers (redirection) sent by server (if needed set to true, else false- defaults to false anyway).
// Disabled, because some servers disable this for security reasons.
//          curl_setopt ( $resource, CURLOPT_FOLLOWLOCATION, true );
        
        // Set maximum times to allow redirection (use only if needed as per above setting. 3 is sort of arbitrary here).
        curl_setopt ( $resource, CURLOPT_MAXREDIRS, 3 );
        
        // Set connection timeout in seconds (very good idea).
        curl_setopt ( $resource, CURLOPT_CONNECTTIMEOUT, 10 );
        
        // Direct cURL to send request header to server allowing compressed content to be returned and decompressed automatically (use only if needed).
        curl_setopt ( $resource, CURLOPT_ENCODING, 'gzip,deflate' );
        
        // Pretend we're a browser, so that anti-cURL settings don't pooch us.
        curl_setopt ( $resource, CURLOPT_USERAGENT, "cURL Mozilla/5.0 (Windows NT 5.1; rv:21.0) Gecko/20130401 Firefox/21.0" ); 

        // Execute cURL call and return results in $content variable.
        $content = curl_exec ( $resource );
        
        // Check if curl_exec() call failed (returns false on failure) and handle failure.
        if ( $content === false )
            {
            // If there is no error message variable passed, we die quietly.
            if ( isset ( $error_message ) )
                {
                // Cram as much info into the error message as possible.
                $err_string = curl_error ( $resource );
                $err_num = curl_errno ( $resource );
                $error_message = "<pre>call_curl: curl failure calling '$in_uri'\nError String: '$err_string'\nError Number: $err_num</pre>";
                $ret = $error_message;
                }
            }
        else
            {
            // Do what you want with returned content (e.g. HTML, XML, etc) here or AFTER curl_close() call below as it is stored in the $content variable.
        
            // You MIGHT want to get the HTTP status code returned by server (e.g. 200, 400, 500).
            // If that is the case then this is how to do it.
            $http_status = curl_getinfo ($resource, CURLINFO_HTTP_CODE );
            }
        
        // Close cURL and free resource.
        curl_close ( $resource );
        
        // Maybe echo $contents of $content variable here.
        if ( $content !== false )
            {
            $ret = $content;
            }
        }
    
    return $ret;
}

?>