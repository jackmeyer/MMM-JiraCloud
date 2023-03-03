const NodeHelper = require('node_helper');
const JiraApi = require('jira-client');


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
          var jira = new JiraApi({protocol: 'https', host: this.config.host, username: this.config.username, password: this.config.password});

          var statusList = await jira.listStatus(this.config.projectKey);
          console.log(statusList);
          this.sendSocketNotification('BOARD_UPDATE', statusList);
        } catch (err) {
          console.error(err);
        }
      },

      async getBoard() {
        try {
          var jira = new JiraApi({protocol: 'https', host: this.config.host, username: this.config.username, password: this.config.password});
          var board = await jira.getBoard(this.config.boardId);
          console.log(board);
          this.sendSocketNotification('BOARD_INFO', board);
        } catch (err) {
          console.error(err);
        }
      },

      async getIssuesForBoard() {
        try {
          var issueList = [];
          var jira = new JiraApi({protocol: 'https', host: this.config.host, username: this.config.username, password: this.config.password});
          
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