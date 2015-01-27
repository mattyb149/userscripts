// ==UserScript==
// @name         Brosander's Pentaho Github Userscript
// @namespace    https://github.com/brosander/userscripts
// @version      0.0.4
// @description  This userscript will enhance the github ui in pentaho repositories
// @author       brosander
// @match        https://github.com/pentaho/*
// @grant        none
// ==/UserScript==

// Pull request functionality
var processPentahoUserscript = function() {
    if (window.location.href.match(/^https?:\/\/github\.com\/pentaho\/.*\/pull\/[0-9]+\/?.*$/)) {
        // Add link to jira case in pull request title (Thanks to Matty B for the idea, extension reference)
        var jsIssueTitles = document.getElementsByClassName('js-issue-title');
        if (jsIssueTitles.length > 0) {
            var issueRegex = /^(\s*)(\[?([A-Z]+-[0-9]+)\]?)/;
            for (var i = 0; i < jsIssueTitles.length; i++) {
                var jsIssueTitle = jsIssueTitles[i];
                var replacedText = jsIssueTitle.textContent.replace(issueRegex, '');
                if (replacedText != jsIssueTitle.textContent) {
                    var match = jsIssueTitle.textContent.match(issueRegex);
                    var link = document.createElement('a');
                    link.href = 'http://jira.pentaho.com/browse/' + match[3];
                    link.textContent = match[2];
                    jsIssueTitle.parentNode.insertBefore(link, jsIssueTitle);
                    if (match[1]) {
                        var span = jsIssueTitle.cloneNode(false);
                        span.textContent = match[2];
                        link.parentNode.insertBefore(span, link);
                    }
                    jsIssueTitle.textContent = replacedText;
                }
            }
        }
        
        // Change "Merged" icon to "S'merged" if the author self merged
        var headerUsernames = document.getElementsByClassName('pull-header-username');
        if (headerUsernames.length == 1) {
            var mergedDivs = document.getElementsByClassName('state-merged');
            if (mergedDivs.length == 1) {
                var mergerUsername = headerUsernames[0].textContent.trim();
                var mergedDiv = mergedDivs[0];
                var tableItemParent = mergedDiv.parentNode.parentNode;
                var tableItems = tableItemParent.getElementsByClassName('flex-table-item-primary');
                var smerge = false;
                if (tableItems.length == 1) {
                    var currentBranches = tableItems[0].getElementsByClassName('current-branch');
                    if (currentBranches.length == 2) {
                        var users = currentBranches[1].getElementsByClassName('user');
                        if (users.length == 1) {
                            var authorUsername = users[0].textContent.trim();
                            if (mergerUsername === authorUsername) {
                                mergedDiv.textContent = mergedDiv.textContent.replace('Merged', 'S\'merged');
                                mergedDiv.setAttribute('title', 'Author self-merged the pull request.');
                                smerge = true;
                            }
                        }
                    }
                }
                if (!smerge) {
                    var openedDivs = document.getElementsByClassName('timeline-comment-header');
                    if (openedDivs.length == 1) {
                        var openedTimes = openedDivs[0].getElementsByTagName('time');
                        if (openedTimes.length == 1) {
                            var closedDivs = document.getElementsByClassName('discussion-item-merged');
                            if (closedDivs.length == 1) {
                                var closedTimes = closedDivs[0].getElementsByTagName('time');
                                if (closedTimes.length == 1) {
                                    var openedTime = new Date(openedTimes[0].getAttribute('datetime'));
                                    var closedTime = new Date(closedTimes[0].getAttribute('datetime'));
                                    if (closedTime.getTime() - openedTime.getTime() < 300000) {
                                        mergedDiv.textContent = mergedDiv.textContent.replace('Merged', 'Stat-Pad');
                                        mergedDiv.setAttribute('title', 'Pull request was merged within 5 minutes of opening.');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    var links = document.getElementsByTagName("a");
    for (var i = 0, l = links.length; i < l; i++) {
        var link = links[i];
        if (link.textContent.trim() === 'pentaho-nbaker') {
            var clue = document.createElement('img');
            clue.src = 'https://raw.githubusercontent.com/brosander/userscripts/master/blues-clues-paw-th.png';
            clue.style.height = '24px';
            clue.style.width = '24px';
            link.appendChild(clue);
            link.style['max-width'] = '150px';
        }
    }
}

processPentahoUserscript();
$(document).on('pjax:complete', function() {
  processPentahoUserscript();
})
