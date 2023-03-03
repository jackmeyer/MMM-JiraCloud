/* Magic Mirror
 * Module: MMM-JiraCloud
 *
 * By jackmeyer
 * MIT Licensed.
 */

Module.register('MMM-JiraCloud', {

    defaults: {
        reloadInterval: 1000 * 60 * 30, //every 30 seconds
        size: 'small',
        showAssigneeName: false,
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.sendSocketNotification('CONFIG', this.config);
    },

    suspend() {
        this.sendSocketNotification('SUSPEND', this.config);
    },

    resume() {
        this.sendSocketNotification('CONFIG', this.config);
    },

    socketNotificationReceived(notification, payload) {
        if(notification === 'BOARD_UPDATE') {
            this.statusList = payload;
            //console.log(payload);
        }
        else if(notification === 'ISSUES_UPDATE') {
            this.issueList = payload;
            console.log(payload);
        } 
        else if(notification === 'BOARD_INFO') {
            this.boardInfo = payload;
            //console.log(payload);
        }
        else if(notification === 'BOARD_MAPPING') {
            this.boardMapping = payload;
            console.log(payload);
        }
        this.updateDom();
    },

    getTemplate() {
        return `${this.name}.njk`;
    },

    getStyles() {
        return ['MMM-JiraCloud.css'];
    },

    getTemplateData() {
        return {
            statusList: this.statusList,
            issueList: this.issueList,
            boardInfo: this.boardInfo,
            boardMapping: this.boardMapping,
        };
    },
})