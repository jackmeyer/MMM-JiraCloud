const NodeHelper = require('node_helper');
const JiraApi = require('jira-client');


module.exports = NodeHelper.create({

  statusList: [],
  issueList: [],
  boardMapping: [],

  async socketNotificationReceived(notification, payload) {
    if (notification === 'CONFIG') {
      this.config = payload;
      //this.getIssuesForBoard();
      this.getBoard();
      //this.getStatuses();
      this.getBoardMapping();

      this.reloadInterval = setInterval(() => {
        //this.getIssuesForBoard();
        this.getBoard();
        //this.getStatuses();
        this.getBoardMapping();
      }, this.config.reloadInterval);
    };
  },

  async getStatuses() {   // **** used to get column titles
    try {
      var jira = new JiraApi({ protocol: 'https', host: this.config.host, username: this.config.username, password: this.config.password });

      this.statusList = await jira.listStatus(this.config.projectKey);
      await new Promise(r => setTimeout(r, 500));
      this.sendSocketNotification('BOARD_UPDATE', this.statusList);
    } catch (err) {
      console.error(err);
    }
  },

  async getBoard() {
    try {
      var jira = new JiraApi({ protocol: 'https', host: this.config.host, username: this.config.username, password: this.config.password });
      var board = await jira.getBoard(this.config.boardId);
      await new Promise(r => setTimeout(r, 500));
      this.sendSocketNotification('BOARD_INFO', board);
    } catch (err) {
      console.error(err);
    }
  },

  async getIssuesForBoard() {
    try {
      var jira = new JiraApi({ protocol: 'https', host: this.config.host, username: this.config.username, password: this.config.password });

      const issue = await jira.getIssuesForBoard(this.config.boardId);
      var issues = issue.issues;
      for (const x of issues) {
        var addIssue = { "key": x.key, "summary": x.fields.summary, "issueType": x.fields.issuetype.name, "issueIconUrl": x.fields.issuetype.iconUrl, "statusId": x.fields.status.id, "assignee": x.fields.assignee };
        this.issueList.push(addIssue);
      }
      await new Promise(r => setTimeout(r, 500));
      this.sendSocketNotification('ISSUES_UPDATE', this.issueList);
    } catch (err) {
      console.error(err);
    }
  },

  async getBoardMapping() {
    await this.getStatuses();
    await this.getIssuesForBoard();
    this.boardMapping.length = 0;
    for (const status of this.statusList) {
      var column = {id: status.id, name: status.name, issues: [] }
      for (const issue of this.issueList) {
        if(issue.statusId == status.id) {
          column.issues.push(issue);
        }
      }
      this.boardMapping.push(column);
    }
    this.boardMapping.sort((a, b) => a.id - b.id);
    await new Promise(r => setTimeout(r, 500));
    this.sendSocketNotification('BOARD_MAPPING', this.boardMapping)
    this.issueList.length = 0;
    
  }
})