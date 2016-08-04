// ==UserScript==
// @name         Add Apache Jira Fix Version to Pull Request page
// @namespace    https://github.com/mattyb149/userscripts
// @version      0.1.0
// @description  This userscript will enhance the GitHub ui in Apache GitHub repositories by displaying the fix version from the associated Jira
// @author       mattyb149
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.12.1/jquery.min.js
// @match        https://github.com/apache/*/pulls
// @grant      GM_xmlhttpRequest
// ==/UserScript==

// Pull request functionality
var processApacheGithubJiraUserscript = function() {
    var jsIssueTitles = $( ".Box-body li[id^='issue_'] a.Box-row-link" ).get();
    if (jsIssueTitles.length > 0) {
        var issueRegex = /^(\s*)(\[?([a-zA-Z]+[ -][0-9]+)\]?)/;
        for (var i = 0; i < jsIssueTitles.length; i++) {
            var jsIssueTitle = $(jsIssueTitles[i]).text();
            var replacedText = jsIssueTitle.replace(issueRegex, '');
            if (replacedText != jsIssueTitle) {
                var match = jsIssueTitle.match(issueRegex);
                var jiraCase = match[2].toUpperCase().replace(" ","-").replace("[","").replace("]","");
                var jiraApiUrl = "https://issues.apache.org/jira/rest/api/2/issue/"+jiraCase;
                if(jiraCase) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        context: {title: jsIssueTitle, case: jiraCase},
                        url: jiraApiUrl,
                        headers: {
                            "User-Agent": "Mozilla/5.0",    // If not specified, navigator.userAgent will be used.
                            "Accept": "application/json"            // If not specified, browser defaults will be used.
                        },
                        onload: function(response) {
                            var fv = JSON.parse(response.responseText).fields.fixVersions.map(function(x){return x.name;}).join(",");
                            if(fv) {
                                var link = document.createElement('a');
                                link.href='http://issues.apache.org/jira/browse/'+(response.context.case);
                                link.textContent = "["+fv+"]";
                                var selector = ".Box-body li[id^='issue_'] a.Box-row-link:contains('"+response.context.title.replace(new RegExp("'",'g'), "\\'")+"')"
                                var prLink = $(selector);
                                if(prLink) {
                                    $(link).insertBefore(prLink);
                                }
                            }
                        }, synchronous: true
                    });
                }
            }
        }
    }
};

processApacheGithubJiraUserscript();
$(document).on('pjax:complete', function() {
    processApacheGithubJiraUserscript();
});