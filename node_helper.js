const NodeHelper = require('node_helper');
const JiraApi = require('jira-client');


var jira = new JiraApi({
    protocol: 'https',
    host: 'jiramagicmirror.atlassian.net',
    username: 'meyer.jackc@gmail.com',
    password: 'ATATT3xFfGF0S8Ye4xjNrX492MYEey3EXLa7SdUfRg5PB3HSPZimu18N-LzuAn8UKew6lCRfRtkXnBDA6NUGRI4ZXNyBPoiHl8eu4bJAEuYi0uHqzPbaLdXZEqvyVTVeD7SlDcClLmpBwNGza37fyiFNVzRdDtbuUmc6Hra4PwxTCtfDEvmh_Vo=39868048'
});

module.exports = NodeHelper.create({

    async socketNotificationReceived(notification, payload) {
        if (notification === 'CONFIG') {
            this.config = payload;

            this.getStatuses();
            this.getIssuesForBoard();

            this.reloadInterval = setInterval(() => {
                this.getStatuses();
                this.getIssuesForBoard();
            }, this.config.reloadInterval);
        };
    },

    async getStatuses() {   // **** used to get column titles
        try {
          var statusList = await jira.listStatus(this.config.projectKey);
          console.log(statusList);
          this.sendSocketNotification('BOARD_UPDATE', statusList);
        } catch (err) {
          console.error(err);
        }
      },

      async getIssuesForBoard() {
        var issueList = [];
        try {
          const issue = await jira.getIssuesForBoard(this.config.boardId);
          var issues = issue.issues;
          for(const x of issues) {
              var addIssue = {"key": x.key, "summary": x.fields.summary, "issueType": x.fields.issuetype.name, "issueIconUrl": x.fields.issuetype.iconUrl, "statusId": x.fields.status.id, "assignee": x.fields.assignee?.displayName };
              issueList.push(addIssue);
          }
          this.sendSocketNotification('ISSUES_UPDATE', issueList);
        } catch (err) {
          console.error(err);
        }
      }

})