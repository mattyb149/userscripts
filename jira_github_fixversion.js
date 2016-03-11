// ==UserScript==
// @name         Add Apache Jira Fix Version to Pull Request page
// @namespace    https://github.com/mattyb149/userscripts
// @version      0.0.1
// @description  This userscript will enhance the GitHub ui in Apache GitHub repositories by displaying the fix version from the associated Jira
// @author       mattyb149
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.12.1/jquery.min.js
// @match        https://github.com/apache/*/pulls
// @grant      GM_xmlhttpRequest
// ==/UserScript==

// Pull request functionality
var processApacheGithubJiraUserscript = function() {
    var jsIssueTitles = document.getElementsByClassName('issue-title');
    if (jsIssueTitles.length > 0) {
        var issueRegex = /^(\s*)(\[?([a-zA-Z]+[ -][0-9]+)\]?)/;
        for (var i = 0; i < jsIssueTitles.length; i++) {
            var jsIssueTitle = jsIssueTitles[i];
            var replacedText = jsIssueTitle.textContent.replace(issueRegex, '');
            if (replacedText != jsIssueTitle.textContent) {
                var match = jsIssueTitle.textContent.match(issueRegex);
                var jiraCase = match[2].toUpperCase().replace(" ","-");
                var jiraApiUrl = "https://issues.apache.org/jira/rest/api/2/issue/"+jiraCase;
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
                            var prLink = $(response.context.title).children("a.issue-title-link");
                            //alert($(prLink).html());
                            $(link).insertBefore(prLink);    
                        }
                    }, synchronous: true
                });
            }
        }
    }
};

processApacheGithubJiraUserscript();
$(document).on('pjax:complete', function() {
    processApacheGithubJiraUserscript();
});